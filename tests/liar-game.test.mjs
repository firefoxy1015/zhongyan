import assert from "node:assert/strict";
import test from "node:test";

import {
  CANONICAL_LIAR_TARGET,
  LIAR_GAME,
  chamberVolume,
  resolveCanonicalVote,
} from "../app/lib/liar-game.ts";
import { CHARACTER_VOICE_PROFILES, FOLLOW_UP_SPEAKER_ID } from "../app/lib/testimony-speech.ts";

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

test("keeps Qixia's own turn distinct from questioning another participant", () => {
  const qixia = LIAR_GAME.stories.find((story) => story.id === "qixia");
  assert.match(qixia?.testimony ?? "", /一百四十万/);
  assert.equal(qixia?.followUp, undefined);
  assert.match(qixia?.selfReflection ?? "", /化名“李明”/);
  assert.match(qixia?.clue ?? "", /没有承认抽到“说谎者”/);
});

test("locks every first-trial character to one unique permanent Lingke voice", () => {
  const ids = LIAR_GAME.stories.map((story) => story.id);
  const voiceIds = Object.values(CHARACTER_VOICE_PROFILES).map((profile) => profile.voiceId);
  assert.deepEqual(Object.keys(CHARACTER_VOICE_PROFILES).sort(), [...ids].sort());
  assert.equal(new Set(voiceIds).size, ids.length);
  assert.equal(CHARACTER_VOICE_PROFILES.tiantian.voiceId, "Vindemiatrix");
  assert.equal(CHARACTER_VOICE_PROFILES.qixia.voiceId, "Kore");
  assert.match(CHARACTER_VOICE_PROFILES.qiao.deliveryDirection, /香港普通话/);
  assert.equal(FOLLOW_UP_SPEAKER_ID, "qixia");
});
