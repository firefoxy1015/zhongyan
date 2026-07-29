import assert from "node:assert/strict";
import test from "node:test";

import { chapterTwoReducer, initialChapterTwoState } from "../app/lib/chapter-two/engine.ts";
import {
  SOLO_SAVE_KEY,
  canEnterChapterTwo,
  loadSoloSave,
  markChapterOneComplete,
  saveChapterTwo,
} from "../app/lib/chapter-two/save.ts";

function storage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    values,
  };
}

test("does not unlock chapter two without a canonical first-chapter completion", () => {
  const local = storage();
  assert.equal(canEnterChapterTwo(local), false);
  markChapterOneComplete(local);
  assert.equal(canEnterChapterTwo(local), true);
});

test("ignores malformed saved data", () => {
  const local = storage();
  local.setItem(SOLO_SAVE_KEY, "not-json");
  assert.equal(loadSoloSave(local), null);
});

test("persists and restores chapter two state", () => {
  const local = storage();
  markChapterOneComplete(local);
  const state = chapterTwoReducer(initialChapterTwoState(), { type: "ENTER_CHAPTER" });
  saveChapterTwo(local, state);
  const restored = loadSoloSave(local);
  assert.equal(restored?.chapterTwo?.scene, "aftermath");
  assert.equal(restored?.completedChapters.includes(1), true);
});
