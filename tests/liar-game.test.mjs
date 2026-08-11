import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  CANONICAL_LIAR_TARGET,
  LIAR_DEDUCTIONS,
  LIAR_EVIDENCE,
  LIAR_GAME,
  chamberVolume,
  deductionIsSupported,
  evidenceForStory,
  resolveCanonicalVote,
} from "../app/lib/liar-game.ts";
import {
  CROSS_EXAMINATIONS,
  PUZZLE_BY_ID,
  ROOM_CLUES,
  puzzleErrorCount,
  ruleReversalIsAvailable,
} from "../app/lib/deduction-game.ts";
import { CHARACTER_VOICE_PROFILES, FOLLOW_UP_SPEAKER_ID } from "../app/lib/testimony-speech.ts";
import {
  VOICE_ASSET_HASHES,
  VOICE_ASSET_MODEL,
  VOICE_ASSET_MODELS,
  VOICE_ASSET_SPEAKERS,
  VOICE_ASSET_URLS,
} from "../app/lib/voice-assets.ts";

const root = path.resolve(import.meta.dirname, "..");

test("ships the exact canonical source inside the repository", async () => {
  const sourceFile = path.join(root, "reference", "canon", "十日终焉 1--1496 完结 杀虫队队员.txt");
  const source = await readFile(sourceFile);
  const hash = createHash("sha256").update(source).digest("hex").toUpperCase();

  assert.equal(source.byteLength, 9_879_825);
  assert.equal(hash, "CE65EEC84123E2DAB72EDE9C13A0E91C7F7B1A803356A701148A178FEFE892E1");
});

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
  assert.match(qixia?.selfReflection ?? "", /倒塌的门廊/);
  assert.match(qixia?.clue ?? "", /没有承认抽到“说谎者”/);
});

test("surfaces the two-million fraud link in every canonical testimony", () => {
  for (const id of ["qiao", "zhang", "li", "qixia"]) {
    const story = LIAR_GAME.stories.find((item) => item.id === id);
    assert.match(story?.testimony ?? "", /二百(?:万|万元)/);
  }
  assert.deepEqual(
    PUZZLE_BY_ID["case-thread"].slots.slice(0, 4).map((slot) => slot.id),
    ["qiao", "zhang", "li", "qixia"],
  );
});

test("locks every first-trial character to one unique permanent voice", () => {
  const ids = LIAR_GAME.stories.map((story) => story.id);
  const voiceIds = Object.values(CHARACTER_VOICE_PROFILES).map((profile) => profile.voiceId);
  assert.deepEqual(Object.keys(CHARACTER_VOICE_PROFILES).sort(), [...ids].sort());
  assert.equal(new Set(voiceIds).size, ids.length);
  assert.equal(CHARACTER_VOICE_PROFILES.tiantian.model, "doubao-tts-2.0");
  assert.equal(CHARACTER_VOICE_PROFILES.tiantian.gender, "女");
  assert.match(CHARACTER_VOICE_PROFILES.tiantian.timbre, /甜美/);
  assert.equal(CHARACTER_VOICE_PROFILES.qixia.model, "doubao-tts-2.0");
  assert.equal(CHARACTER_VOICE_PROFILES.qixia.gender, "男");
  assert.equal(CHARACTER_VOICE_PROFILES.qiao.model, "speech-2.8");
  assert.equal(CHARACTER_VOICE_PROFILES.qiao.voiceId, "LK_9011036_1784973101");
  assert.match(CHARACTER_VOICE_PROFILES.qiao.deliveryDirection, /香港普通话/);
  assert.equal(FOLLOW_UP_SPEAKER_ID, "qixia");
  assert.deepEqual(
    Object.fromEntries(Object.entries(CHARACTER_VOICE_PROFILES).map(([id, profile]) => [id, profile.gender])),
    {
      tiantian: "女",
      qiao: "男",
      xiao: "女",
      zhao: "男",
      han: "男",
      zhang: "女",
      li: "男",
      lin: "女",
      qixia: "男",
    },
  );
});

test("ships every fixed line as a pre-rendered local audio asset", async () => {
  const expectedKeys = LIAR_GAME.stories.flatMap((story) => [
    `${story.id}:testimony`,
    `${story.id}:followUp`,
  ]);
  assert.deepEqual(Object.keys(VOICE_ASSET_URLS).sort(), expectedKeys.sort());
  for (const [key, url] of Object.entries(VOICE_ASSET_URLS)) {
    assert.match(url ?? "", /^\/audio\/chapter-01\/voice\/.+\.[a-f0-9]{12}\.mp3$/);
    const file = path.join(root, "public", ...url.slice(1).split("/"));
    const hash = createHash("sha256").update(await readFile(file)).digest("hex");
    assert.equal(hash, VOICE_ASSET_HASHES[key]);
  }
  assert.equal(VOICE_ASSET_MODEL, "mixed-static");
  assert.equal(VOICE_ASSET_MODELS["qiao:testimony"], "speech-2.8");
  assert.equal(VOICE_ASSET_MODELS["qiao:followUp"], "doubao-tts-2.0");
  for (const story of LIAR_GAME.stories) {
    assert.equal(VOICE_ASSET_SPEAKERS[`${story.id}:followUp`], "qixia");
  }
});

test("keeps investigation facts gated behind their source testimony", () => {
  const initial = LIAR_EVIDENCE.filter((evidence) => evidence.availableAtStart);
  assert.deepEqual(initial.map((evidence) => evidence.id).sort(), ["host-story", "rule-exclusive-liar"]);
  assert.deepEqual(evidenceForStory("qiao").map((evidence) => evidence.id).sort(), ["qiao-money", "qiao-terminal"]);

  for (const story of LIAR_GAME.stories) {
    assert.ok(evidenceForStory(story.id).length > 0, `${story.name} must unlock at least one fact card`);
  }
});

test("requires player-recorded evidence before a deduction can be closed", () => {
  const moneyChain = LIAR_DEDUCTIONS.find((deduction) => deduction.id === "money-chain");
  const ruleBoundary = LIAR_DEDUCTIONS.find((deduction) => deduction.id === "rule-boundary");
  assert.ok(moneyChain);
  assert.ok(ruleBoundary);

  const initialEvidence = new Set(["rule-exclusive-liar", "host-story"]);
  assert.equal(deductionIsSupported(moneyChain, initialEvidence, new Set()), false);

  const moneyEvidence = new Set([...initialEvidence, ...moneyChain.requiredEvidence]);
  assert.equal(deductionIsSupported(moneyChain, moneyEvidence, new Set()), true);
  assert.equal(deductionIsSupported(ruleBoundary, moneyEvidence, new Set()), false);

  const fullEvidence = new Set(LIAR_EVIDENCE.map((evidence) => evidence.id));
  assert.equal(deductionIsSupported(ruleBoundary, fullEvidence, new Set(["survival-wording"])), true);
});

test("builds the canonical room-air deduction instead of exposing a checklist answer", () => {
  const notes = Object.fromEntries(ROOM_CLUES.map((clue) => [clue.id, clue.note]));
  assert.match(notes["wall-grid"], /竖三横四/);
  assert.doesNotMatch(notes["wall-grid"], /长宽高|4 米、4 米、3 米/);
  assert.match(notes["clock"], /十二点|一点/);
  assert.doesNotMatch(notes["clock"], /13 小时/);
  assert.match(notes["occupants"], /九名参与者.*人羊/);
  assert.doesNotMatch(notes["occupants"], /十人|九人两种/);
  assert.match(notes["air-rate"], /0\.007/);
  assert.doesNotMatch(notes["air-rate"], /0\.42/);

  const puzzle = PUZZLE_BY_ID["air-ledger"];
  const correct = Object.fromEntries(puzzle.slots.map((slot) => [slot.id, slot.answer]));
  assert.equal(puzzleErrorCount(puzzle, correct), 0);
  assert.equal(4 * 4 * 3, 48);
  assert.equal(10 * 13 * 0.42, 54.6);
  assert.equal(9 * 13 * 0.42, 49.14);
});

test("requires one story-specific cross-examination for every narrator", () => {
  assert.deepEqual(
    CROSS_EXAMINATIONS.map((challenge) => challenge.storyId),
    LIAR_GAME.stories.map((story) => story.id),
  );
  assert.equal(new Set(CROSS_EXAMINATIONS.map((challenge) => challenge.answer)).size, LIAR_GAME.stories.length);
  for (const challenge of CROSS_EXAMINATIONS) {
    assert.ok(challenge.options.includes(challenge.answer));
    assert.equal(challenge.options.length, 3);
  }
});

test("keeps the two-million chain as a tempting but non-decisive side deduction", () => {
  const puzzle = PUZZLE_BY_ID["case-thread"];
  const correct = Object.fromEntries(puzzle.slots.map((slot) => [slot.id, slot.answer]));
  assert.equal(puzzleErrorCount(puzzle, correct), 0);
  assert.match(correct.timeline, /不能百分百定罪/);
  assert.match(PUZZLE_BY_ID["rule-reversal"].success, /人羊/);
});

test("requires every prior draft before the rule reversal can be opened", () => {
  assert.equal(ruleReversalIsAvailable(new Set(["air-ledger", "last-moment"])), false);
  assert.equal(ruleReversalIsAvailable(new Set(["case-thread", "last-moment"])), false);
  assert.equal(ruleReversalIsAvailable(new Set(["case-thread", "air-ledger"])), false);
  assert.equal(ruleReversalIsAvailable(new Set(["case-thread", "air-ledger", "last-moment"])), true);
});
