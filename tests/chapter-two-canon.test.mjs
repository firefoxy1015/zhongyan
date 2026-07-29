import assert from "node:assert/strict";
import test from "node:test";

import {
  CHAPTER_TWO_OBSERVATIONS,
  CHAPTER_TWO_SCOPE,
  CHAPTER_TWO_TRIALS,
  HOMETOWN_FACTS,
  applyCanonicalHarpoonInjuries,
  initialCharacters,
} from "../app/lib/chapter-two/canon.ts";

test("locks chapter two to the post-liar interview sequence", () => {
  assert.equal(CHAPTER_TWO_SCOPE.startLine, 1237);
  assert.equal(CHAPTER_TWO_SCOPE.endLine, 2927);
  assert.deepEqual(
    CHAPTER_TWO_TRIALS.map((trial) => trial.title),
    ["雨后春笋", "天降死亡", "是与非"],
  );
});

test("keeps every canonical injury on the correct character", () => {
  const injuries = applyCanonicalHarpoonInjuries(initialCharacters());
  assert.ok(injuries.tiantian.injuries.includes("tiantian-right-palm"));
  assert.ok(injuries.han.injuries.includes("han-shoulder-harpoon"));
  assert.equal(injuries.qixia.injuries.length, 0);
});

test("keeps Zhao's work location as work, not a rewritten hometown", () => {
  const zhao = HOMETOWN_FACTS.find((fact) => fact.characterId === "zhao");
  assert.match(zhao?.wording ?? "", /江苏工作/);
});

test("keeps answers out of raw observations", () => {
  const raw = CHAPTER_TWO_OBSERVATIONS.map((item) => `${item.observation}\n${item.note}`).join("\n");
  assert.doesNotMatch(raw, /向右转一百次/);
  assert.doesNotMatch(raw, /丢掉大桌板/);
  assert.doesNotMatch(raw, /站在孔洞下面才是生路/);
  assert.doesNotMatch(raw, /假如我的下一个问题是/);
});
