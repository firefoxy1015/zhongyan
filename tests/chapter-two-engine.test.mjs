import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_RESCUE_SEQUENCE,
  HOMETOWN_FACTS,
  HOMETOWN_SOLUTION,
  WEDGE_IDS,
  WEDGE_SLOT_IDS,
} from "../app/lib/chapter-two/canon.ts";
import { analyzeQuestion, chapterTwoReducer, initialChapterTwoState, parseQuestion } from "../app/lib/chapter-two/engine.ts";

function reduce(actions, initial = initialChapterTwoState()) {
  return actions.reduce(chapterTwoReducer, initial);
}

function enterToShield() {
  let state = reduce([
    { type: "ENTER_CHAPTER" },
    { type: "SUBMIT_AFTERMATH", answer: "protect-mask" },
    { type: "ANIMATION_FINISHED", animationId: "mask-writing-reveal" },
    { type: "ANIMATION_FINISHED", animationId: "wall-holes-open" },
  ]);
  for (const fact of HOMETOWN_FACTS) {
    state = chapterTwoReducer(state, {
      type: "PLACE_HOMETOWN",
      characterId: fact.characterId,
      placeId: fact.placeId,
    });
  }
  HOMETOWN_SOLUTION.strokes.forEach((stroke, strokeIndex) => {
    state = chapterTwoReducer(state, {
      type: "SET_MAP_STROKE",
      strokeIndex,
      placeIds: [...stroke],
    });
  });
  state = chapterTwoReducer(state, { type: "SUBMIT_HOMETOWN", direction: "right" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "table-turn-right" });
  return chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "table-split" });
}

test("opens chapter two from the canonical aftermath", () => {
  const state = reduce([{ type: "ENTER_CHAPTER" }]);
  assert.equal(state.scene, "aftermath");
  assert.equal(state.storyClockMinute, 60);
});

test("marks the heart-shot hypothesis precisely when it is wrong", () => {
  const state = reduce([
    { type: "ENTER_CHAPTER" },
    { type: "SUBMIT_AFTERMATH", answer: "avoid-pain" },
  ]);
  assert.equal(state.errors[0]?.fieldId, "shot-reason");
  assert.equal(state.errors[0]?.code, "DOES_NOT_EXPLAIN_HEART_SHOT");
  assert.equal(state.storyClockMinute, 61);
});

test("requires the hometown map and rightward direction", () => {
  let state = reduce([
    { type: "ENTER_CHAPTER" },
    { type: "SUBMIT_AFTERMATH", answer: "protect-mask" },
    { type: "ANIMATION_FINISHED", animationId: "mask-writing-reveal" },
    { type: "ANIMATION_FINISHED", animationId: "wall-holes-open" },
  ]);
  state = chapterTwoReducer(state, { type: "SUBMIT_HOMETOWN", direction: "left" });
  assert.ok(state.errors.some((item) => item.fieldId === "direction"));
  assert.equal(state.storyClockMinute, 62);
});

test("builds the canonical shield and preserves fixed injuries", () => {
  let state = enterToShield();
  assert.equal(state.scene, "shield-assembly");
  for (const [index, wedgeId] of WEDGE_IDS.filter((id) => id !== "large-decoy").entries()) {
    state = chapterTwoReducer(state, { type: "PLACE_WEDGE", wedgeId, slotId: WEDGE_SLOT_IDS[index] });
    state = chapterTwoReducer(state, { type: "ROTATE_WEDGE", wedgeId, orientation: "tip-in" });
  }
  state = chapterTwoReducer(state, { type: "DISCARD_WEDGE", wedgeId: "large-decoy" });
  state = chapterTwoReducer(state, { type: "SUBMIT_SHIELD" });
  assert.equal(state.status.kind, "animating");
  assert.equal(state.characterStates.tiantian.injuries[0], "tiantian-right-palm");
  assert.ok(state.characterStates.han.injuries.includes("han-shoulder-harpoon"));
});

test("keeps a logical branch for ordinary questions and closes both branches for Qixia's question", () => {
  const ordinary = parseQuestion(["will-you-pull"]);
  assert.ok(ordinary.kind !== "parse-error");
  assert.equal(analyzeQuestion(ordinary).every((branch) => branch.pullForced), false);

  const canonical = parseQuestion(["if", "my-next-question", "will-you-pull", "your-answer", "same-as-this"]);
  assert.ok(canonical.kind !== "parse-error");
  assert.equal(analyzeQuestion(canonical).every((branch) => branch.pullForced), true);
});

test("completes the canonical second-chapter route without clearing fixed injuries", () => {
  let state = enterToShield();
  for (const [index, wedgeId] of WEDGE_IDS.filter((id) => id !== "large-decoy").entries()) {
    state = chapterTwoReducer(state, { type: "PLACE_WEDGE", wedgeId, slotId: WEDGE_SLOT_IDS[index] });
    state = chapterTwoReducer(state, { type: "ROTATE_WEDGE", wedgeId, orientation: "tip-in" });
  }
  state = chapterTwoReducer(state, { type: "DISCARD_WEDGE", wedgeId: "large-decoy" });
  state = chapterTwoReducer(state, { type: "SUBMIT_SHIELD" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "shield-lock" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "harpoon-volley" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "rope-retract" });
  assert.equal(state.scene, "harpoon-rescue");

  for (const actionId of CANONICAL_RESCUE_SEQUENCE) {
    state = chapterTwoReducer(state, { type: "APPLY_RESCUE_ACTION", actionId });
  }
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "rope-cut-release" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "ceiling-holes-open" });
  assert.equal(state.scene, "sky-death");

  state = chapterTwoReducer(state, { type: "SET_SKY_FIELD", field: "gameType", value: "sheep-can-lie" });
  state = chapterTwoReducer(state, { type: "SET_SKY_FIELD", field: "position", value: "under-holes" });
  state = chapterTwoReducer(state, { type: "SET_SKY_FIELD", field: "boardUse", value: "ceiling-anchor" });
  state = chapterTwoReducer(state, { type: "SET_SKY_FIELD", field: "insertion", value: "vertical-then-horizontal" });
  state = chapterTwoReducer(state, { type: "SUBMIT_SKY_DEATH" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "floor-rise" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "floor-collapse" });
  assert.equal(state.scene, "yes-no");

  for (const tokenId of ["if", "my-next-question", "will-you-pull", "your-answer", "same-as-this"]) {
    state = chapterTwoReducer(state, { type: "ADD_QUESTION_TOKEN", tokenId });
  }
  state = chapterTwoReducer(state, { type: "SUBMIT_QUESTION" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "snake-lever" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "corridor-doors" });
  assert.equal(state.scene, "zodiac-corridor");

  for (let index = 0; index < 6; index += 1) state = chapterTwoReducer(state, { type: "ADVANCE_NARRATIVE" });
  state = chapterTwoReducer(state, { type: "ANIMATION_FINISHED", animationId: "city-reveal" });
  assert.equal(state.scene, "complete");
  assert.equal(state.daoCount, 4);
  assert.ok(state.characterStates.tiantian.injuries.includes("tiantian-right-palm"));
  assert.ok(state.characterStates.han.injuries.includes("han-shoulder-harpoon"));
});
