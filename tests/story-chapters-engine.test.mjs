import assert from "node:assert/strict";
import test from "node:test";

import { STORY_CHAPTERS } from "../app/lib/story-chapters/canon.ts";
import { initialStoryChapterState, sceneForState, storyChapterReducer } from "../app/lib/story-chapters/engine.ts";

function canonicalRun(chapterId) {
  const spec = STORY_CHAPTERS[chapterId];
  let state = initialStoryChapterState(chapterId);
  let guard = 0;
  while (state.status.kind !== "complete" && guard < 100) {
    guard += 1;
    const scene = sceneForState(state, spec);
    if (state.status.kind === "animating") {
      state = storyChapterReducer(state, { type: "ANIMATION_FINISHED", animationId: state.status.animationId });
      continue;
    }
    if (scene.puzzle && !state.solvedSceneIds.includes(scene.id)) {
      for (const observation of scene.observations) state = storyChapterReducer(state, { type: "OBSERVE", observationId: observation.id });
      for (const field of scene.puzzle.fields) state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: field.id, value: field.correctValue });
      state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
      continue;
    }
    state = storyChapterReducer(state, { type: "ADVANCE" });
  }
  assert.ok(guard < 100, `chapter ${chapterId} did not terminate`);
  return state;
}

test("completes all three canonical routes with the exact Dao ledgers", () => {
  assert.equal(canonicalRun(3).daoCount, 3);
  assert.equal(canonicalRun(4).daoCount, 5);
  assert.equal(canonicalRun(5).daoCount, 96);
});

test("reports field-specific errors before charging pressure", () => {
  let state = initialStoryChapterState(3);
  state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
  assert.ok(state.errors.every((error) => error.fieldId.startsWith("observation:")));
  assert.match(state.errors[0].message, /先检查/);
  assert.equal(state.pressure, 1);
});

test("keeps explicit lethal choices and restores their checkpoint", () => {
  for (const [chapterId, sceneId, fieldId, value, failureId] of [
    [3, "c3-store", "trade", "follow-alone", "clerk-room"],
    [4, "c4-deduction", "location", "sealed-can", "empty-warehouse"],
    [5, "c5-arena", "bear-response", "play-dead", "black-bear-feeding"],
  ]) {
    let state = initialStoryChapterState(chapterId);
    state = { ...state, sceneId, checkpointSceneId: sceneId };
    state = storyChapterReducer(state, { type: "SET_FIELD", fieldId, value });
    if (chapterId === 4) {
      state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: "wager", value: "life" });
    }
    state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
    assert.equal(state.status.kind, "death");
    assert.equal(state.status.failureId, failureId);
    assert.ok(state.status.reason.length > 10);
    state = storyChapterReducer(state, { type: "RETRY_CHECKPOINT" });
    assert.equal(state.status.kind, "playing");
    assert.equal(state.sceneId, sceneId);
  }
});

test("plays non-puzzle canon animations before entering the next scene", () => {
  let state = { ...initialStoryChapterState(3), sceneId: "c3-night", checkpointSceneId: "c3-night" };
  state = storyChapterReducer(state, { type: "ADVANCE" });
  assert.deepEqual(state.status, { kind: "animating", animationId: "c3-bell-sword" });
  state = storyChapterReducer(state, { type: "ANIMATION_FINISHED", animationId: "c3-bell-sword" });
  assert.equal(state.sceneId, "c3-sword");
});
