import assert from "node:assert/strict";
import test from "node:test";

import { SOLO_SAVE_KEY } from "../app/lib/chapter-two/save.ts";
import { initialStoryChapterState } from "../app/lib/story-chapters/engine.ts";
import { STORY_SAVE_KEY, canEnterStoryChapter, createFreshStoryChapterSave, loadStorySave, saveStoryChapter, unlockStoryChapterForTesting } from "../app/lib/story-chapters/save.ts";

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}

function legacySave(completedChapters = [1, 2]) {
  return {
    version: 2,
    updatedAt: new Date(0).toISOString(),
    completedChapters,
    activeChapter: 2,
    lockedAssetVersions: { portraits: "chapter-one-locked-v2", voices: "chapter-one-static-v2" },
  };
}

test("migrates chapter two completion into the portable v3 save", () => {
  const storage = new MemoryStorage();
  storage.setItem(SOLO_SAVE_KEY, JSON.stringify(legacySave()));
  assert.equal(canEnterStoryChapter(storage, 3), true);
  const state = createFreshStoryChapterSave(storage, 3);
  assert.equal(state.chapterId, 3);
  assert.deepEqual(loadStorySave(storage).completedChapters, [1, 2]);
});

test("merges later legacy progress even when a v3 save already exists", () => {
  const storage = new MemoryStorage();
  unlockStoryChapterForTesting(storage, 3);
  storage.setItem(SOLO_SAVE_KEY, JSON.stringify(legacySave()));
  assert.equal(canEnterStoryChapter(storage, 3), true);
});

test("unlocks debug chapters without writing answers", () => {
  const storage = new MemoryStorage();
  unlockStoryChapterForTesting(storage, 5);
  const save = loadStorySave(storage);
  assert.deepEqual(save.completedChapters, [1, 2, 3, 4]);
  assert.deepEqual(save.chapters[5].answers, {});
  assert.equal(canEnterStoryChapter(storage, 5), true);
});

test("debug entry resets a previously completed chapter instead of reopening stale settlement data", () => {
  const storage = new MemoryStorage();
  unlockStoryChapterForTesting(storage, 5);
  saveStoryChapter(storage, { ...initialStoryChapterState(5), status: { kind: "complete" }, daoCount: 5, answers: { stale: "answer" } });
  unlockStoryChapterForTesting(storage, 5);
  const state = loadStorySave(storage).chapters[5];
  assert.equal(state.status.kind, "playing");
  assert.equal(state.daoCount, 5);
  assert.deepEqual(state.answers, {});
});

test("marks a completed chapter and unlocks the next one", () => {
  const storage = new MemoryStorage();
  unlockStoryChapterForTesting(storage, 3);
  saveStoryChapter(storage, { ...initialStoryChapterState(3), status: { kind: "complete" } });
  assert.equal(canEnterStoryChapter(storage, 4), true);
  assert.ok(storage.getItem(STORY_SAVE_KEY));
});

test("fresh chapter entry replaces an existing completed destination save", () => {
  const storage = new MemoryStorage();
  unlockStoryChapterForTesting(storage, 5);
  saveStoryChapter(storage, { ...initialStoryChapterState(5), status: { kind: "complete" }, daoCount: 96 });
  const fresh = createFreshStoryChapterSave(storage, 5);
  const restored = loadStorySave(storage).chapters[5];
  assert.equal(fresh.status.kind, "playing");
  assert.equal(restored.status.kind, "playing");
  assert.equal(restored.sceneId, initialStoryChapterState(5).sceneId);
});
