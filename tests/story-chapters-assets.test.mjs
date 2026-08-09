import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { STORY_ANIMATIONS } from "../app/lib/story-chapters/animation.ts";
import { STORY_CHAPTERS } from "../app/lib/story-chapters/canon.ts";
import { STORY_VOICE_LINES } from "../app/lib/story-chapters/voice-lines.ts";

function diskUrl(publicPath) {
  return new URL(`../public${publicPath}`, import.meta.url);
}

test("locks every new image and local audio file by hash", async () => {
  const manifest = JSON.parse(await readFile(new URL("../content/chapter-03-05-asset-manifest.json", import.meta.url), "utf8"));
  assert.equal(Object.keys(manifest.art).length, 8);
  assert.equal(Object.keys(manifest.bgm).length, 3);
  assert.equal(Object.keys(manifest.sfx).length, 13);
  assert.equal(Object.keys(manifest.voices).length, STORY_VOICE_LINES.length);
  for (const group of [manifest.art, manifest.bgm, manifest.sfx, manifest.voices]) {
    for (const [publicPath, metadata] of Object.entries(group)) {
      const path = metadata.src ?? publicPath;
      const data = await readFile(diskUrl(path));
      assert.equal(createHash("sha256").update(data).digest("hex"), metadata.sha256, path);
    }
  }
});

test("maps every declared scene animation to an implementation", () => {
  const sceneAnimationIds = Object.values(STORY_CHAPTERS).flatMap((chapter) => chapter.scenes.map((scene) => scene.animationId).filter(Boolean));
  assert.ok(sceneAnimationIds.length >= 12);
  for (const animationId of sceneAnimationIds) assert.ok(STORY_ANIMATIONS[animationId], animationId);
});

test("renders decisive events with scene-specific motion instead of one placeholder", async () => {
  const css = await readFile(new URL("../app/chapter/story-chapter.module.css", import.meta.url), "utf8");
  for (const animationId of ["c3-bell-sword", "c4-warehouse-dark", "c4-zhuque-arrival", "c5-bear-gate", "c5-plate-formation", "c5-final-twenty", "c5-dao-settlement"]) {
    assert.match(css, new RegExp(`data-animation=\\"${animationId}\\"`));
  }
  for (const keyframe of ["swordDrop", "warehouseBlackout", "featherWarp", "gateRise", "plateRoll", "countdownPulse", "daoSpill"]) {
    assert.match(css, new RegExp(`@keyframes ${keyframe}`));
  }
});
