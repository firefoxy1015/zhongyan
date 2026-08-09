import assert from "node:assert/strict";
import test from "node:test";

import { STORY_CHAPTERS, STORY_PORTRAITS } from "../app/lib/story-chapters/canon.ts";
import { STORY_VOICE_LINES, STORY_VOICE_PROFILES } from "../app/lib/story-chapters/voice-lines.ts";

test("locks chapters three through five to the audited canon spans", () => {
  assert.deepEqual(STORY_CHAPTERS[3].source, { startLine: 3001, endLine: 4142, chapters: [22, 23, 24, 25, 26, 27, 28, 29] });
  assert.deepEqual(STORY_CHAPTERS[4].source, { startLine: 4143, endLine: 4986, chapters: [30, 31, 32, 33, 34, 35] });
  assert.deepEqual(STORY_CHAPTERS[5].source, { startLine: 4987, endLine: 6744, chapters: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48] });
});

test("preserves the decisive canon outcomes instead of inventing branches", () => {
  const chapterThree = JSON.stringify(STORY_CHAPTERS[3]);
  const chapterFour = JSON.stringify(STORY_CHAPTERS[4]);
  const chapterFive = JSON.stringify(STORY_CHAPTERS[5]);
  assert.match(chapterThree, /韩一墨被一把通体漆黑的巨剑钉在地面/);
  assert.match(chapterThree, /韩一墨此前认识七黑剑/);
  assert.match(chapterFour, /从她的上衣口袋取出目标/);
  assert.match(chapterFour, /张丽娟/);
  assert.match(chapterFive, /十九人通关/);
  assert.match(chapterFive, /净持有九十六颗/);
});

test("keeps every portrait and voice on a fixed versioned identity", () => {
  assert.equal(STORY_PORTRAITS.tiantian, "/art/tiantian-v2.png");
  assert.equal(STORY_PORTRAITS.qiao, "/art/qiaojiajin-v1.png");
  assert.match(STORY_VOICE_PROFILES.qixia.deliveryDirection, /男/);
  assert.match(STORY_VOICE_PROFILES.qiao.deliveryDirection, /香港普通话/);
  assert.match(STORY_VOICE_PROFILES.tiantian.deliveryDirection, /甜美/);
  assert.ok(STORY_VOICE_LINES.length >= 30);
  assert.equal(new Set(STORY_VOICE_LINES.map((line) => line.id)).size, STORY_VOICE_LINES.length);
});

test("gives every scene exact source coordinates and usable interaction", () => {
  for (const chapter of Object.values(STORY_CHAPTERS)) {
    for (const scene of chapter.scenes) {
      assert.ok(scene.sourceRef.lineStart >= chapter.source.startLine);
      assert.ok(scene.sourceRef.lineEnd <= chapter.source.endLine);
      assert.ok(scene.backgroundAsset.startsWith("/art/"));
      assert.ok(scene.puzzle || scene.canonicalEvent || scene.observations.length > 0);
      for (const observation of scene.observations) assert.ok(observation.sourceRef.lineStart <= observation.sourceRef.lineEnd);
      for (const line of scene.dialogue) assert.ok(line.sourceRef.lineStart <= line.sourceRef.lineEnd);
    }
  }
});
