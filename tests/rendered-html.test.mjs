import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/", env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    env,
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the solo liar investigation entry", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>十日终焉：单机剧情 RPG<\/title>/i);
  assert.match(html, /说谎者/);
  assert.match(html, /女娲游戏\s*\/\s*第一场/);
  assert.match(html, /九个人依次讲述最后发生的事/);
  assert.match(html, /翻开身份牌/);
  assert.match(html, /点此开启紧迫声场/);
  assert.match(html, /有且只有一个说谎者/);
  assert.doesNotMatch(html, /创建\s*\/\s*加入真人房/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Building your site/i);
});

test("online room is retained but not promoted by the solo entry", async () => {
  const response = await render("/room");
  assert.equal(response.status, 200);
});

test("self-hosted solo entry renders without Cloudflare bindings", async () => {
  const response = await render("/", undefined);
  assert.equal(response.status, 200);
});

test("keeps a clearly warned chapter debug portal on the homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(html, /测试人员调试入口/);
  assert.match(html, /普通用户请勿点击/);
  assert.match(html, /直接进入第一章/);
  assert.match(html, /直接进入第二章/);
  assert.match(pageSource, /markChapterOneComplete\(window\.localStorage\)/);
  assert.match(pageSource, /createFreshChapterTwoSave\(window\.localStorage\)/);
  assert.doesNotMatch(html, /假如我的下一个问题是你会不会拉下拉杆/);
});

test("server-renders the second chapter entry before the local solo save is hydrated", async () => {
  const response = await render("/chapter/2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /正在读取单机档案/);
});

test("ships the full first-trial visual set", async () => {
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await access(new URL("../content/official-visual-reference.json", import.meta.url));
  await access(new URL("../content/visual-asset-manifest.json", import.meta.url));

  const assets = [
    "interview-room-v1.png",
    "liar-tableau-v1.png",
    "qixia-v1.png",
    "tiantian-v2.png",
    "qiaojiajin-v1.png",
    "xiaoran-v1.png",
    "zhaohaibo-v1.png",
    "hanyimo-v1.png",
    "zhangchenze-v1.png",
    "lishangwu-v1.png",
    "linqin-v1.png",
    "renyang-v1.png",
  ];

  await Promise.all(assets.map((asset) => access(new URL(`../public/art/${asset}`, import.meta.url))));

  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const globalCss = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const voiceProfiles = await readFile(new URL("../app/lib/testimony-speech.ts", import.meta.url), "utf8");

  assert.match(pageSource, /fetchPriority="high"/);
  assert.match(pageSource, /height=\{activeVoice\.portraitHeight\}/);
  assert.match(pageSource, /width=\{activeVoice\.portraitWidth\}/);
  assert.match(globalCss, /\.witness-portrait\s*\{[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto;/);
  const portraitImageBlocks = [...globalCss.matchAll(/\.witness-portrait img\s*\{([^}]*)\}/g)];
  assert.ok(portraitImageBlocks.length >= 2);
  for (const [, block] of portraitImageBlocks) assert.doesNotMatch(block, /(?:^|\n)\s*height:\s*0;/);
  assert.equal((voiceProfiles.match(/portraitWidth:/g) ?? []).length, 9);
  assert.equal((voiceProfiles.match(/portraitHeight:/g) ?? []).length, 9);
});

test("explains the investigation order and action clock before play", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(pageSource, /60分钟内完成四步/);
  assert.match(pageSource, /观察房间里的六个发光点/);
  assert.match(pageSource, /它<strong>不会随现实时间流逝<\/strong>/);
  assert.match(pageSource, /错误追问.*\+3分钟/);
  assert.match(pageSource, /错误提交草稿.*\+4分钟并标错/);
  assert.match(pageSource, /此项错误/);
});
