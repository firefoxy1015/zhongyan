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
