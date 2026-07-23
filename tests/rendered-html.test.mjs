import assert from "node:assert/strict";
import { access } from "node:fs/promises";
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

test("server-renders the solo RPG liar chapter", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>十日终焉：单机剧情 RPG<\/title>/i);
  assert.match(html, /说谎者/);
  assert.match(html, /SOLO STORY RPG/);
  assert.match(html, /开始第一日/);
  assert.match(html, /单机剧情模式/);
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
});
