import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_LIAR_TARGET,
  LIAR_GAME,
  chamberVolume,
  resolveCanonicalVote,
} from "../app/lib/liar-game.ts";

test("resolves the canonical liar vote", () => {
  assert.equal(CANONICAL_LIAR_TARGET, "renyang");
  assert.equal(LIAR_GAME.participantCount, 9);
  assert.equal(chamberVolume(), 48);
  assert.equal(resolveCanonicalVote("renyang").isCorrect, true);
  assert.equal(resolveCanonicalVote("qixia").isCorrect, false);
});

test("keeps Tian Tian's first-trial identity and testimony locked", () => {
  const tianTian = LIAR_GAME.stories.find((story) => story.id === "tiantian");
  assert.equal(tianTian?.occupation, "陪酒小姐");
  assert.match(tianTian?.testimony ?? "", /车里上班/);
});
