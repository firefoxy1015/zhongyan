import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders a playable liar game table", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>十日终焉：原著同人桌游<\/title>/i);
  assert.match(html, /女娲游戏/);
  assert.match(html, /说谎者/);
  assert.match(html, /INTERVIEW ROOM/);
  assert.match(html, /进入单人剧本/);
  assert.match(html, /创建\s*\/\s*加入真人房/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Building your site/i);
});

test("server-renders the online room lobby", async () => {
  const response = await render("/room");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /创建或加入面试房/);
  assert.match(html, /九人真实房间/);
});

test("removes the disposable starter preview", async () => {
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await access(new URL("../content/official-visual-reference.json", import.meta.url));
  await access(new URL("../content/visual-asset-manifest.json", import.meta.url));
  await access(new URL("../public/art/interview-room-v1.png", import.meta.url));
  await access(new URL("../public/art/liar-tableau-v1.png", import.meta.url));
  await access(new URL("../public/art/qixia-v1.png", import.meta.url));
  await access(new URL("../public/art/tiantian-v1.png", import.meta.url));
  await access(new URL("../public/art/xiaoran-v1.png", import.meta.url));
  await access(new URL("../public/art/zhaohaibo-v1.png", import.meta.url));
  await access(new URL("../public/art/hanyimo-v1.png", import.meta.url));
  await access(new URL("../public/art/zhangchenze-v1.png", import.meta.url));
  await access(new URL("../public/art/lishangwu-v1.png", import.meta.url));
  await access(new URL("../public/art/qiaojiajin-v1.png", import.meta.url));
  await access(new URL("../public/art/linqin-v1.png", import.meta.url));
  await access(new URL("../public/art/renyang-v1.png", import.meta.url));
});
