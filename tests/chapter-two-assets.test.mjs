import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { ANIMATION_SPECS } from "../app/lib/chapter-two/animation.ts";
import { CHAPTER_TWO_ASSETS } from "../app/lib/chapter-two/assets.ts";
import {
  CHAPTER_TWO_BGM_ASSETS,
  CHAPTER_TWO_SFX_ASSETS,
} from "../app/lib/chapter-two/audio-assets.ts";
import {
  CHAPTER_TWO_VOICE_LINES,
  CHAPTER_TWO_VOICE_PROFILES,
  CHAPTER_TWO_VOICE_VERSIONS,
} from "../app/lib/chapter-two/voice-lines.ts";
import { CHAPTER_TWO_VOICE_ASSETS } from "../app/lib/chapter-two/voice-assets.ts";

const root = path.resolve(import.meta.dirname, "..");

function publicFile(src) {
  assert.match(src, /^\//, `asset path must be root-relative: ${src}`);
  return path.join(root, "public", ...src.slice(1).split("/"));
}

async function digest(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

function pngDimensions(buffer) {
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function dimensions(file) {
  const data = await readFile(file);
  if (file.endsWith(".png")) return pngDimensions(data);
  const viewBox = data.toString("utf8").match(/viewBox="0 0 (\d+) (\d+)"/);
  assert.ok(viewBox, `SVG has no numeric viewBox: ${file}`);
  return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
}

test("locks all 16 chapter-two visual assets to real files, hashes and dimensions", async () => {
  assert.equal(Object.keys(CHAPTER_TWO_ASSETS).length, 16);
  for (const asset of Object.values(CHAPTER_TWO_ASSETS)) {
    const file = publicFile(asset.src);
    assert.equal(await digest(file), asset.sha256, `${asset.id} hash drifted`);
    assert.deepEqual(await dimensions(file), { width: asset.width, height: asset.height });
    for (const edge of Object.values(asset.safeArea)) {
      assert.ok(edge >= 0 && edge <= 15, `${asset.id} has an invalid safe area`);
    }
  }
});

test("keeps the deterministic puzzle art at the canonical piece counts", async () => {
  const wedges = await readFile(publicFile(CHAPTER_TWO_ASSETS["table-wedges"].src), "utf8");
  const ceiling = await readFile(publicFile(CHAPTER_TWO_ASSETS["ceiling-nine-holes"].src), "utf8");
  const cone = await readFile(publicFile(CHAPTER_TWO_ASSETS["bamboo-cone"].src), "utf8");

  assert.equal(wedges.match(/<use href="#wedge"/g)?.length, 9);
  assert.equal(ceiling.match(/<rect x="\d+" y="\d+" width="150" height="100"/g)?.length, 9);
  const ribGroup = cone.match(/<g fill="none"[^>]*>([\s\S]*?)<\/g>/)?.[1] ?? "";
  assert.equal(ribGroup.match(/<path /g)?.length, 9);
});

test("locks three BGM and fourteen SFX files by content hash", async () => {
  assert.equal(Object.keys(CHAPTER_TWO_BGM_ASSETS).length, 3);
  assert.equal(Object.keys(CHAPTER_TWO_SFX_ASSETS).length, 14);
  for (const asset of [
    ...Object.values(CHAPTER_TWO_BGM_ASSETS),
    ...Object.values(CHAPTER_TWO_SFX_ASSETS),
  ]) {
    assert.equal(await digest(publicFile(asset.src)), asset.sha256);
    assert.ok(asset.durationMs > 0);
  }
});

test("locks every chapter-two line to one immutable local voice file", async () => {
  assert.equal(CHAPTER_TWO_VOICE_LINES.length, 23);
  assert.equal(Object.keys(CHAPTER_TWO_VOICE_ASSETS).length, CHAPTER_TWO_VOICE_LINES.length);
  assert.equal(new Set(CHAPTER_TWO_VOICE_LINES.map((line) => line.id)).size, 23);

  for (const line of CHAPTER_TWO_VOICE_LINES) {
    const asset = CHAPTER_TWO_VOICE_ASSETS[line.id];
    assert.ok(asset, `${line.id} has no locked voice`);
    assert.equal(asset.speakerId, line.speakerId);
    assert.equal(asset.voiceVersion, CHAPTER_TWO_VOICE_VERSIONS[line.speakerId]);
    assert.match(asset.src, /^\/audio\/chapter-02\/voice\/.+\.[a-f0-9]{12}\.mp3$/);
    assert.equal(await digest(publicFile(asset.src)), asset.sha256);
  }
});

test("preserves Qixia as male and Qiao Jiajin as the fixed Hong Kong Mandarin voice", () => {
  assert.equal(CHAPTER_TWO_VOICE_PROFILES.qixia.gender, "男");
  assert.match(CHAPTER_TWO_VOICE_PROFILES.qixia.deliveryDirection, /绝不使用女声/);
  assert.equal(CHAPTER_TWO_VOICE_VERSIONS.qixia, "qixia-locked-v2");

  assert.equal(CHAPTER_TWO_VOICE_PROFILES.qiao.gender, "男");
  assert.match(CHAPTER_TWO_VOICE_PROFILES.qiao.deliveryDirection, /香港普通话/);
  assert.equal(CHAPTER_TWO_VOICE_VERSIONS.qiao, "qiao-hk-clone-v1");
  for (const line of CHAPTER_TWO_VOICE_LINES.filter((item) => item.speakerId === "qiao")) {
    assert.equal(CHAPTER_TWO_VOICE_ASSETS[line.id]?.model, "speech-2.8");
  }
});

test("renders all fourteen planned animation IDs and never calls runtime TTS", async () => {
  const animationIds = Object.keys(ANIMATION_SPECS);
  assert.equal(animationIds.length, 14);
  const overlay = await readFile(path.join(root, "app/chapter/2/CinematicOverlay.tsx"), "utf8");
  const runtimeSources = await Promise.all([
    "app/chapter/2/ChapterTwoGame.tsx",
    "app/chapter/2/VoiceDock.tsx",
    "app/lib/chapter-two/audio.ts",
    "app/lib/chapter-two/voice-assets.ts",
    "app/lib/voice-assets.ts",
  ].map((file) => readFile(path.join(root, file), "utf8")));

  for (const animationId of animationIds) {
    assert.match(overlay, new RegExp(`case "${animationId}"`));
    assert.ok(ANIMATION_SPECS[animationId].durationMs >= 2000);
  }
  assert.match(overlay, /unoptimized/);
  assert.match(runtimeSources[0], /unoptimized/);
  assert.doesNotMatch(runtimeSources.join("\n"), /\/api\/voice|api\.lk888|https?:\/\/.+\.mp3/);
});
