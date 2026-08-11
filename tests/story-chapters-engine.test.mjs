import assert from "node:assert/strict";
import test from "node:test";

import { STORY_CHAPTERS } from "../app/lib/story-chapters/canon.ts";
import {
  initialStoryChapterState,
  sanitizeStoryChapterState,
  sceneForState,
  storyChapterReducer,
} from "../app/lib/story-chapters/engine.ts";
import { STORY_CHAPTER_IDS } from "../app/lib/story-chapters/types.ts";

function canonicalRun(chapterId) {
  const spec = STORY_CHAPTERS[chapterId];
  let state = initialStoryChapterState(chapterId);
  let guard = 0;
  while (state.status.kind !== "complete" && guard < 200) {
    guard += 1;
    const scene = sceneForState(state, spec);
    if (state.status.kind === "animating") {
      state = storyChapterReducer(state, { type: "ANIMATION_FINISHED", animationId: state.status.animationId });
      continue;
    }
    if (scene.puzzle && !state.solvedSceneIds.includes(scene.id)) {
      for (const observation of scene.observations) {
        state = storyChapterReducer(state, { type: "OBSERVE", observationId: observation.id });
      }
      for (const field of scene.puzzle.fields) {
        state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: field.id, value: field.correctValue });
      }
      state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
      continue;
    }
    state = storyChapterReducer(state, { type: "ADVANCE" });
  }
  assert.ok(guard < 200, `chapter ${chapterId} did not terminate`);
  assert.equal(state.status.kind, "complete");
  return state;
}

test("completes chapters three through eight with exact separated Dao ledgers", () => {
  const expected = {
    3: { qixiaParty: 2, liZhang: 1, oldLu: 0, burned: 0 },
    4: { qixiaParty: 5, liZhang: 1, oldLu: 0, burned: 0 },
    5: { qixiaParty: 96, liZhang: 1, oldLu: 0, burned: 0 },
    6: { qixiaParty: 0, liZhang: 1, oldLu: 0, burned: 96 },
    7: { qixiaParty: 0, liZhang: 1, oldLu: 10, burned: 96 },
    8: { qixiaParty: 4, liZhang: 0, oldLu: 10, burned: 96 },
  };
  for (const chapterId of STORY_CHAPTER_IDS) {
    assert.deepEqual(canonicalRun(chapterId).daoLedger, expected[chapterId]);
  }
});

test("migrates schema-one saves and repairs completed ledgers to canon", () => {
  const migrated = sanitizeStoryChapterState({
    ...initialStoryChapterState(5),
    schemaVersion: 1,
    status: { kind: "complete" },
    daoCount: 5,
  }, 5);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.sceneId, STORY_CHAPTERS[5].scenes.at(-1).id);
  assert.deepEqual(migrated.daoLedger, STORY_CHAPTERS[5].completionDaoLedger);
});

test("reports field-specific errors before charging pressure", () => {
  let state = initialStoryChapterState(3);
  state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
  assert.ok(state.errors.every((error) => error.fieldId.startsWith("observation:")));
  assert.match(state.errors[0].message, /先检查/);
  assert.equal(state.pressure, 1);
  assert.equal(state.status.kind, "playing");
});

test("repeated mistakes still kill at the declared limit and preserve the last hint", () => {
  const spec = STORY_CHAPTERS[3];
  let state = initialStoryChapterState(3);
  for (let attempt = 0; attempt < spec.pressureLimit; attempt += 1) {
    state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
  }
  assert.equal(state.status.kind, "death");
  assert.equal(state.pressure, spec.pressureLimit);
  assert.ok(state.errors.length > 0);
  assert.match(state.status.reason, /最后一次错误：.*先检查/);
  state = storyChapterReducer(state, { type: "RETRY_CHECKPOINT" });
  assert.equal(state.status.kind, "playing");
  assert.equal(state.pressure, 0);
});

test("every explicit lethal choice restores its declared checkpoint", () => {
  let fatalCount = 0;
  for (const chapterId of STORY_CHAPTER_IDS) {
    for (const scene of STORY_CHAPTERS[chapterId].scenes) {
      for (const fatalRule of scene.puzzle?.fatalRules ?? []) {
        fatalCount += 1;
        let state = { ...initialStoryChapterState(chapterId), sceneId: scene.id, checkpointSceneId: scene.id };
        for (const observation of scene.observations) {
          state = storyChapterReducer(state, { type: "OBSERVE", observationId: observation.id });
        }
        for (const field of scene.puzzle.fields) {
          state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: field.id, value: field.correctValue });
        }
        for (const [fieldId, value] of Object.entries(fatalRule.when ?? {})) {
          state = storyChapterReducer(state, { type: "SET_FIELD", fieldId, value });
        }
        state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: fatalRule.fieldId, value: fatalRule.value });
        state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
        assert.equal(state.status.kind, "death", `${chapterId}/${scene.id}/${fatalRule.failureId}`);
        assert.equal(state.status.failureId, fatalRule.failureId);
        assert.ok(state.status.reason.length > 10);
        state = storyChapterReducer(state, { type: "RETRY_CHECKPOINT" });
        assert.equal(state.status.kind, "playing");
        assert.equal(state.sceneId, fatalRule.checkpointSceneId);
      }
    }
  }
  assert.ok(fatalCount >= 3);
});

test("every nonfatal wrong option returns its authored field hint", () => {
  for (const chapterId of STORY_CHAPTER_IDS) {
    for (const scene of STORY_CHAPTERS[chapterId].scenes) {
      if (!scene.puzzle) continue;
      for (const field of scene.puzzle.fields) {
        for (const option of field.options.filter((item) => item.value !== field.correctValue)) {
          const isFatal = scene.puzzle.fatalRules?.some((rule) => rule.fieldId === field.id && rule.value === option.value);
          if (isFatal) continue;
          let state = { ...initialStoryChapterState(chapterId), sceneId: scene.id, checkpointSceneId: scene.id };
          for (const observation of scene.observations) {
            state = storyChapterReducer(state, { type: "OBSERVE", observationId: observation.id });
          }
          for (const candidate of scene.puzzle.fields) {
            state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: candidate.id, value: candidate.correctValue });
          }
          state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: field.id, value: option.value });
          state = storyChapterReducer(state, { type: "SUBMIT_PUZZLE" });
          const error = state.errors.find((item) => item.fieldId === field.id);
          assert.equal(error?.message, field.wrongMessages[option.value], `${chapterId}/${scene.id}/${field.id}/${option.value}`);
        }
      }
    }
  }
});

test("plays non-puzzle canon animations before entering the next scene", () => {
  let state = { ...initialStoryChapterState(3), sceneId: "c3-night", checkpointSceneId: "c3-night" };
  state = storyChapterReducer(state, { type: "ADVANCE" });
  assert.deepEqual(state.status, { kind: "animating", animationId: "c3-bell-sword" });
  const staleTimerState = storyChapterReducer(state, { type: "ANIMATION_FINISHED", animationId: "c3-hook-trade" });
  assert.equal(staleTimerState, state);
  state = storyChapterReducer(state, { type: "ANIMATION_FINISHED", animationId: "c3-bell-sword" });
  assert.equal(state.sceneId, "c3-sword");
  state = storyChapterReducer(state, { type: "ANIMATION_FINISHED", animationId: "c3-bell-sword" });
  assert.equal(state.sceneId, "c3-sword");
});

test("rejects forged answer values and sanitizes unknown save data", () => {
  let state = initialStoryChapterState(6);
  state = storyChapterReducer(state, { type: "SET_FIELD", fieldId: "total", value: "9999" });
  assert.deepEqual(state.answers, {});

  const restored = sanitizeStoryChapterState({
    ...state,
    sceneId: "missing-scene",
    observedIds: ["forged"],
    answers: { total: "9999" },
    history: [{ id: 4, kind: "root", text: {} }],
  }, 6);
  assert.equal(restored.sceneId, STORY_CHAPTERS[6].scenes[0].id);
  assert.deepEqual(restored.answers, {});
  assert.deepEqual(restored.observedIds, []);
});

test("does not restore future scene progress or a future death checkpoint", () => {
  const spec = STORY_CHAPTERS[6];
  const entryScene = spec.scenes[0];
  const futureScene = spec.scenes.at(-1);
  const restored = sanitizeStoryChapterState({
    ...initialStoryChapterState(6),
    status: {
      kind: "death",
      failureId: "forged-future-checkpoint",
      reason: "corrupt save",
      checkpointSceneId: futureScene.id,
    },
    checkpointSceneId: futureScene.id,
    solvedSceneIds: [entryScene.id, futureScene.id],
    observedIds: [entryScene.observations[0].id, futureScene.observations[0].id],
  }, 6);

  assert.equal(restored.checkpointSceneId, entryScene.id);
  assert.deepEqual(restored.solvedSceneIds, [entryScene.id]);
  assert.deepEqual(restored.observedIds, [entryScene.observations[0].id]);
  const retried = storyChapterReducer(restored, { type: "RETRY_CHECKPOINT" });
  assert.equal(retried.sceneId, entryScene.id);
});

test("preserves a valid authored death checkpoint from the status payload", () => {
  const spec = STORY_CHAPTERS[6];
  const checkpoint = spec.scenes[0];
  const current = spec.scenes[1];
  const restored = sanitizeStoryChapterState({
    ...initialStoryChapterState(6),
    sceneId: current.id,
    checkpointSceneId: current.id,
    status: {
      kind: "death",
      failureId: "return-earlier",
      reason: "authored earlier checkpoint",
      checkpointSceneId: checkpoint.id,
    },
  }, 6);

  assert.equal(restored.checkpointSceneId, checkpoint.id);
  assert.equal(restored.status.kind, "death");
  assert.equal(restored.status.checkpointSceneId, checkpoint.id);
  assert.equal(storyChapterReducer(restored, { type: "RETRY_CHECKPOINT" }).sceneId, checkpoint.id);
});

test("restores an impossible max-pressure animation as a death", () => {
  const spec = STORY_CHAPTERS[3];
  const scene = spec.scenes[0];
  const restored = sanitizeStoryChapterState({
    ...initialStoryChapterState(3),
    pressure: spec.pressureLimit,
    solvedSceneIds: [scene.id],
    status: { kind: "animating", animationId: scene.animationId },
  }, 3);

  assert.equal(restored.status.kind, "death");
  assert.equal(restored.pressure, spec.pressureLimit);
});

test("RESTORE can cross a reused client route boundary", () => {
  const restored = storyChapterReducer(initialStoryChapterState(4), {
    type: "RESTORE",
    state: initialStoryChapterState(5),
  });
  assert.equal(restored.chapterId, 5);
  assert.equal(restored.sceneId, STORY_CHAPTERS[5].scenes[0].id);
});
