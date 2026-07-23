import assert from "node:assert/strict";
import test from "node:test";

import {
  ROOM_CAPACITY,
  isVoteTarget,
  nextRoomPhase,
  resolveRoomVotes,
} from "../app/lib/room-logic.ts";

test("advances the room through the canonical phase order", () => {
  assert.equal(nextRoomPhase("lobby"), "rules");
  assert.equal(nextRoomPhase("vote"), "result");
  assert.equal(nextRoomPhase("result"), null);
  assert.equal(nextRoomPhase("unknown"), null);
});

test("requires all nine seats to vote for the canonical target", () => {
  assert.equal(isVoteTarget("renyang"), true);
  assert.equal(isVoteTarget("not-a-seat"), false);
  assert.deepEqual(resolveRoomVotes(Array(ROOM_CAPACITY).fill("renyang")), {
    allCorrect: true,
    outcome: "participants-survive",
  });
  assert.deepEqual(resolveRoomVotes([...Array(ROOM_CAPACITY - 1).fill("renyang"), "qixia"]), {
    allCorrect: false,
    outcome: "liar-survives",
  });
});
