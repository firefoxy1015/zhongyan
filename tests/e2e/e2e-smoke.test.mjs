import assert from "node:assert/strict";
import test from "node:test";

import { chromium } from "playwright";
import { STORY_CHAPTER_IDS } from "../../app/lib/story-chapters/types.ts";

const BASE_URL = new URL(process.env.E2E_BASE_URL ?? "http://127.0.0.1:4317");
const STORY_SAVE_PREFIX = "zhongyan:solo-save:v";
const LEGACY_SAVE_KEY = "zhongyan:solo-save:v2";
const CHAPTER_LABELS = new Map([
  [1, "一"],
  [2, "二"],
  [3, "三"],
  [4, "四"],
  [5, "五"],
  [6, "六"],
  [7, "七"],
  [8, "八"],
]);

async function launchSmokeBrowser() {
  const requested = process.env.E2E_BROWSER_CHANNEL?.trim();
  const candidates = requested
    ? [requested === "bundled" ? undefined : requested]
    : ["chrome", "msedge", undefined];
  const failures = [];

  for (const channel of candidates) {
    try {
      return await chromium.launch({
        channel,
        headless: process.env.E2E_HEADED !== "1",
      });
    } catch (error) {
      failures.push(`${channel ?? "bundled Chromium"}: ${error instanceof Error ? error.message.split("\n")[0] : error}`);
    }
  }

  throw new Error(`No Playwright-compatible browser could launch. Run \"npm run e2e:install\" or set E2E_BROWSER_CHANNEL. ${failures.join(" | ")}`);
}

function installDiagnostics(page) {
  const failures = [];
  const sameOrigin = (url) => {
    try {
      return new URL(url).origin === BASE_URL.origin;
    } catch {
      return false;
    }
  };

  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) => {
    const error = request.failure()?.errorText ?? "unknown request failure";
    if (error.includes("ERR_ABORTED")) return;
    if (sameOrigin(request.url())) failures.push(`requestfailed: ${request.method()} ${request.url()} (${error})`);
  });
  page.on("response", (response) => {
    if (response.status() < 400 || !sameOrigin(response.url()) || response.url().endsWith("/favicon.ico")) return;
    failures.push(`http-${response.status()}: ${response.request().method()} ${response.url()}`);
  });

  return {
    assertClean(label) {
      const current = failures.splice(0);
      assert.deepEqual(current, [], `${label} emitted browser/runtime failures`);
    },
  };
}

async function openHomepage(page) {
  await page.goto(new URL("/", BASE_URL).href, { waitUntil: "domcontentloaded" });
  await page.getByText("测试人员调试入口", { exact: true }).waitFor();
  await page.waitForLoadState("networkidle");
}

async function openDebugPortal(page) {
  const portal = page.locator("details.chapter-debug-portal");
  await portal.waitFor({ state: "visible" });
  if (!(await portal.evaluate((element) => element.open))) await portal.locator("summary").click();
  return portal;
}

async function waitForPlayingChapter(page, chapterId) {
  if (chapterId === 2) {
    await page.waitForFunction((key) => {
      try {
        return JSON.parse(localStorage.getItem(key) ?? "null")?.chapterTwo?.status?.kind === "playing";
      } catch {
        return false;
      }
    }, LEGACY_SAVE_KEY);
    return;
  }
  await page.getByText(`CHAPTER ${chapterId}`, { exact: true }).waitFor({ timeout: 20_000 });
  await page.waitForFunction((id) => {
    for (const key of Object.keys(localStorage).filter((item) => item.startsWith("zhongyan:solo-save:v"))) {
      try {
        const save = JSON.parse(localStorage.getItem(key) ?? "null");
        if (save?.chapters?.[String(id)]?.status?.kind === "playing") return true;
      } catch {
        // Ignore unrelated malformed local data and keep looking for the story envelope.
      }
    }
    return false;
  }, chapterId);
}

async function enterDebugChapter(page, chapterId) {
  await openHomepage(page);
  const portal = await openDebugPortal(page);
  const chapterLabel = CHAPTER_LABELS.get(chapterId);
  assert.ok(chapterLabel, `missing chapter label for ${chapterId}`);
  const button = portal.getByRole("button", { name: `直接进入第${chapterLabel}章`, exact: true });
  await button.waitFor({ state: "visible" });
  await button.click();
  await page.waitForURL((url) => url.pathname === `/chapter/${chapterId}`);
  await waitForPlayingChapter(page, chapterId);
}

async function mutateChapterToComplete(page, chapterId) {
  return page.evaluate(({ chapterId, prefix }) => {
    const candidates = Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .map((key) => {
        try {
          return { key, save: JSON.parse(localStorage.getItem(key) ?? "null") };
        } catch {
          return null;
        }
      })
      .filter((entry) => entry?.save?.chapters?.[String(chapterId)])
      .sort((left, right) => right.key.localeCompare(left.key));
    const selected = candidates[0];
    if (!selected) throw new Error(`No valid story save contains chapter ${chapterId}.`);

    const state = selected.save.chapters[String(chapterId)];
    const entrySceneId = state.sceneId;
    state.status = { kind: "complete" };
    selected.save.activeChapter = chapterId;
    selected.save.completedChapters = [...new Set([
      ...(Array.isArray(selected.save.completedChapters) ? selected.save.completedChapters : []),
      chapterId - 1,
      chapterId,
    ])];
    selected.save.updatedAt = new Date().toISOString();
    localStorage.setItem(selected.key, JSON.stringify(selected.save));
    return { key: selected.key, entrySceneId };
  }, { chapterId, prefix: STORY_SAVE_PREFIX });
}

async function mutateChapterTwoToComplete(page) {
  return page.evaluate((key) => {
    const save = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!save?.chapterTwo) throw new Error("No valid chapter two save exists.");
    save.chapterTwo.scene = "complete";
    save.chapterTwo.status = { kind: "complete" };
    save.completedChapters = [...new Set([...(save.completedChapters ?? []), 1, 2])];
    save.activeChapter = 2;
    save.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(save));
  }, LEGACY_SAVE_KEY);
}

async function readChapterState(page, chapterId) {
  return page.evaluate(({ chapterId, prefix }) => {
    for (const key of Object.keys(localStorage).filter((item) => item.startsWith(prefix)).sort().reverse()) {
      try {
        const save = JSON.parse(localStorage.getItem(key) ?? "null");
        const state = save?.chapters?.[String(chapterId)];
        if (state) return { key, state, completedChapters: save.completedChapters };
      } catch {
        // Keep looking for the current valid envelope.
      }
    }
    return null;
  }, { chapterId, prefix: STORY_SAVE_PREFIX });
}

async function assertNoHorizontalOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  assert.equal(metrics.viewport, 390, `${label} did not use the 390px acceptance viewport`);
  assert.ok(metrics.documentWidth <= metrics.viewport + 1, `${label} document overflows horizontally: ${JSON.stringify(metrics)}`);
  assert.ok(metrics.bodyWidth <= metrics.viewport + 1, `${label} body overflows horizontally: ${JSON.stringify(metrics)}`);
}

async function assertPortraitsAreContained(page, label) {
  const result = await page.evaluate(() => {
    const stage = document.querySelector("[class*='stage']")?.getBoundingClientRect();
    const portraits = [...document.querySelectorAll("[class*='portraits'] figure")].map((figure) => {
      const image = figure.querySelector("img");
      const box = figure.getBoundingClientRect();
      return {
        left: box.left,
        right: box.right,
        centerX: box.left + box.width / 2,
        naturalWidth: image?.naturalWidth ?? 0,
        naturalHeight: image?.naturalHeight ?? 0,
        objectFit: image ? getComputedStyle(image).objectFit : "missing",
      };
    });
    return { stage: stage ? { left: stage.left, right: stage.right } : null, portraits };
  });
  assert.ok(result.stage, `${label} has no stage`);
  assert.ok(result.portraits.length > 0, `${label} has no portraits`);
  for (const portrait of result.portraits) {
    assert.ok(portrait.naturalWidth > 0 && portrait.naturalHeight > 0, `${label} has an unloaded portrait`);
    assert.equal(portrait.objectFit, "contain", `${label} lets Next Image crop a portrait`);
    assert.ok(portrait.left >= result.stage.left - 1, `${label} clips a portrait on the left`);
    assert.ok(portrait.right <= result.stage.right + 1, `${label} clips a portrait on the right`);
  }
  const centers = result.portraits.map((portrait) => portrait.centerX).sort((left, right) => left - right);
  for (let index = 1; index < centers.length; index += 1) {
    assert.ok(centers[index] - centers[index - 1] >= 24, `${label} completely stacks two portraits`);
  }
}

async function assertFreshDestination(page, toChapter, staleDestination) {
  await page.waitForFunction((chapterId) => (
    location.pathname === `/chapter/${chapterId}`
    && location.search === ""
    && document.body.textContent?.includes(`CHAPTER ${chapterId}`)
  ), toChapter);
  await waitForPlayingChapter(page, toChapter);

  assert.equal(new URL(page.url()).search, "", `chapter ${toChapter} left the fresh query in the URL`);
  assert.equal(await page.getByText(`第${toChapter}章完成`, { exact: true }).count(), 0, `chapter ${toChapter} reopened the stale completion page`);
  const freshDestination = await readChapterState(page, toChapter);
  assert.ok(freshDestination, `chapter ${toChapter} was not written after fresh navigation`);
  assert.equal(freshDestination.state.status.kind, "playing");
  assert.equal(freshDestination.state.sceneId, staleDestination.entrySceneId, `chapter ${toChapter} did not restart at its first scene`);

  const observationButton = page.locator("button").filter({ hasText: "点击检查" }).first();
  await observationButton.waitFor({ state: "visible" });
  const observationsBefore = [...freshDestination.state.observedIds];
  await observationButton.click();
  await page.waitForFunction(({ chapterId, minimum, prefix }) => {
    for (const key of Object.keys(localStorage).filter((item) => item.startsWith(prefix))) {
      try {
        const save = JSON.parse(localStorage.getItem(key) ?? "null");
        if ((save?.chapters?.[String(chapterId)]?.observedIds?.length ?? 0) > minimum) return true;
      } catch {
        // Keep waiting for the React save effect.
      }
    }
    return false;
  }, { chapterId: toChapter, minimum: observationsBefore.length, prefix: STORY_SAVE_PREFIX });
  const persistedBeforeReload = await readChapterState(page, toChapter);

  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForPlayingChapter(page, toChapter);
  const persistedAfterReload = await readChapterState(page, toChapter);
  assert.deepEqual(persistedAfterReload.state.observedIds, persistedBeforeReload.state.observedIds, `chapter ${toChapter} lost observations on reload`);
  assert.equal(persistedAfterReload.state.sceneId, persistedBeforeReload.state.sceneId, `chapter ${toChapter} changed scene on reload`);
}

async function assertFreshTransition(page, fromChapter, toChapter) {
  await enterDebugChapter(page, toChapter);
  const staleDestination = await mutateChapterToComplete(page, toChapter);

  await enterDebugChapter(page, fromChapter);
  await mutateChapterToComplete(page, fromChapter);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText(`第${fromChapter}章完成`, { exact: true }).waitFor();

  const nextLink = page.getByRole("link", { name: `进入第${toChapter}章`, exact: true });
  await nextLink.waitFor({ state: "visible" });
  await nextLink.click();
  await assertFreshDestination(page, toChapter, staleDestination);
}

async function assertChapterTwoFreshTransition(page) {
  await enterDebugChapter(page, 3);
  const staleDestination = await mutateChapterToComplete(page, 3);

  await enterDebugChapter(page, 2);
  await mutateChapterTwoToComplete(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("p").filter({ hasText: "第二章完成" }).first().waitFor();

  const nextLink = page.getByRole("link", { name: "进入第三章：七黑剑", exact: true });
  await nextLink.waitFor({ state: "visible" });
  await nextLink.click();
  await assertFreshDestination(page, 3, staleDestination);
}

test("real-browser chapter transition and mobile smoke", { timeout: 240_000 }, async (t) => {
  const browser = await launchSmokeBrowser();
  const context = await browser.newContext({
    locale: "zh-CN",
    colorScheme: "dark",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  const diagnostics = installDiagnostics(page);

  try {
    await t.test("homepage exposes the warned chapter 3-8 debug controls", async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openHomepage(page);
      const portal = await openDebugPortal(page);
      await portal.getByText("普通用户请勿点击", { exact: true }).waitFor({ state: "visible" });
      for (const chapterId of STORY_CHAPTER_IDS) {
        const label = CHAPTER_LABELS.get(chapterId);
        assert.equal(await portal.getByRole("button", { name: `直接进入第${label}章`, exact: true }).isVisible(), true);
      }
      await assertNoHorizontalOverflow(page, "homepage debug portal");
      diagnostics.assertClean("homepage debug portal");
    });

    await t.test("chapter 2 to 3 clears a stale completed destination", async () => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await assertChapterTwoFreshTransition(page);
      diagnostics.assertClean("chapter 2 to 3 transition");
    });

    for (let index = 0; index < STORY_CHAPTER_IDS.length - 1; index += 1) {
      const fromChapter = STORY_CHAPTER_IDS[index];
      const toChapter = STORY_CHAPTER_IDS[index + 1];
      await t.test(`chapter ${fromChapter} to ${toChapter} clears a stale completed destination`, async () => {
        await assertFreshTransition(page, fromChapter, toChapter);
        diagnostics.assertClean(`chapter ${fromChapter} to ${toChapter} transition`);
      });
    }

    await t.test("all shared story chapters fit a 390px viewport", async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const chapterId of STORY_CHAPTER_IDS) {
        await enterDebugChapter(page, chapterId);
        await assertNoHorizontalOverflow(page, `chapter ${chapterId}`);
        await assertPortraitsAreContained(page, `chapter ${chapterId}`);
      }
      diagnostics.assertClean("390px chapter sweep");
    });
  } finally {
    await context.close();
    await browser.close();
  }
});
