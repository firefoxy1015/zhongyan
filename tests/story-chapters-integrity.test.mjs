import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { STORY_ANIMATIONS } from "../app/lib/story-chapters/animation.ts";
import { STORY_CHAPTERS, STORY_PORTRAIT_NAMES, STORY_PORTRAITS, STORY_SPEAKER_NAMES } from "../app/lib/story-chapters/canon.ts";
import { STORY_CHAPTER_IDS } from "../app/lib/story-chapters/types.ts";

const css = await readFile(new URL("../app/chapter/story-chapter.module.css", import.meta.url), "utf8");

const expectedSourceRanges = {
  3: [3001, 4142, 22, 29],
  4: [4143, 4986, 30, 35],
  5: [4987, 6744, 36, 48],
  6: [6745, 8060, 49, 57],
  7: [8061, 9016, 58, 64],
  8: [9017, 9968, 65, 71],
};

function scene(chapterId, sceneId) {
  const result = STORY_CHAPTERS[chapterId].scenes.find((item) => item.id === sceneId);
  assert.ok(result, `missing scene ${sceneId}`);
  return result;
}

function field(chapterId, sceneId, fieldId) {
  const result = scene(chapterId, sceneId).puzzle?.fields.find((item) => item.id === fieldId);
  assert.ok(result, `missing field ${sceneId}/${fieldId}`);
  return result;
}

function observation(chapterId, sceneId, observationId) {
  const result = scene(chapterId, sceneId).observations.find((item) => item.id === observationId);
  assert.ok(result, `missing observation ${sceneId}/${observationId}`);
  return result;
}

test("chapter three through eight use one contiguous frozen canon range", () => {
  for (const chapterId of STORY_CHAPTER_IDS) {
    const spec = STORY_CHAPTERS[chapterId];
    const [startLine, endLine, firstCanonChapter, lastCanonChapter] = expectedSourceRanges[chapterId];
    assert.equal(spec.source.startLine, startLine);
    assert.equal(spec.source.endLine, endLine);
    assert.equal(spec.source.chapters[0], firstCanonChapter);
    assert.equal(spec.source.chapters.at(-1), lastCanonChapter);
    if (chapterId > STORY_CHAPTER_IDS[0]) {
      assert.equal(STORY_CHAPTERS[chapterId - 1].source.endLine + 1, startLine);
    }
    if (spec.nextChapterId) assert.equal(spec.nextChapterId, chapterId + 1);
  }
});

test("scene, observation and dialogue ids stay globally unique", () => {
  const sceneIds = new Set();
  const observationIds = new Set();
  const dialogueIds = new Set();
  for (const chapter of Object.values(STORY_CHAPTERS)) {
    for (const scene of chapter.scenes) {
      assert.equal(sceneIds.has(scene.id), false, `duplicate scene id ${scene.id}`);
      sceneIds.add(scene.id);
      for (const observation of scene.observations) {
        assert.equal(observationIds.has(observation.id), false, `duplicate observation id ${observation.id}`);
        observationIds.add(observation.id);
      }
      for (const dialogue of scene.dialogue) {
        assert.equal(dialogueIds.has(dialogue.id), false, `duplicate dialogue id ${dialogue.id}`);
        dialogueIds.add(dialogue.id);
      }
    }
  }
});

test("every puzzle is fully authored and every fatal rule targets a valid option", () => {
  for (const chapter of Object.values(STORY_CHAPTERS)) {
    assert.ok(chapter.pressureLimit > 0);
    for (const scene of chapter.scenes) {
      if (!scene.puzzle) continue;
      const observationIds = new Set(scene.observations.map((observation) => observation.id));
      for (const requiredId of scene.puzzle.requiredObservationIds) {
        assert.ok(observationIds.has(requiredId), `${scene.id} requires missing observation ${requiredId}`);
      }
      for (const field of scene.puzzle.fields) {
        const optionValues = new Set(field.options.map((option) => option.value));
        assert.ok(optionValues.has(field.correctValue), `${scene.id}/${field.id} has no correct option`);
        for (const option of field.options) {
          if (option.value !== field.correctValue) {
            assert.ok(field.wrongMessages[option.value], `${scene.id}/${field.id}/${option.value} has no specific hint`);
          }
        }
      }
      for (const fatalRule of scene.puzzle.fatalRules ?? []) {
        const field = scene.puzzle.fields.find((item) => item.id === fatalRule.fieldId);
        assert.ok(field?.options.some((option) => option.value === fatalRule.value), `${scene.id} has invalid fatal choice`);
        assert.ok(chapter.scenes.some((item) => item.id === fatalRule.checkpointSceneId), `${scene.id} has invalid checkpoint`);
        for (const [fieldId, value] of Object.entries(fatalRule.when ?? {})) {
          const dependency = scene.puzzle.fields.find((item) => item.id === fieldId);
          assert.ok(dependency?.options.some((option) => option.value === value), `${scene.id} has invalid fatal dependency`);
        }
      }
    }
  }
});

test("every visible speaker and portrait is registered", () => {
  for (const chapter of Object.values(STORY_CHAPTERS)) {
    for (const scene of chapter.scenes) {
      for (const portraitId of scene.portraitIds) {
        assert.ok(STORY_PORTRAITS[portraitId], `${scene.id} uses missing portrait ${portraitId}`);
        assert.ok(STORY_PORTRAIT_NAMES[portraitId], `${scene.id} exposes raw portrait id ${portraitId}`);
      }
      for (const line of scene.dialogue) {
        assert.ok(STORY_SPEAKER_NAMES[line.speakerId], `${line.id} uses missing speaker ${line.speakerId}`);
        const visible = scene.portraitIds.some((portraitId) => portraitId === line.speakerId || portraitId.startsWith(`${line.speakerId}-`));
        assert.ok(line.offscreen || visible, `${line.id} speaks without a matching portrait or offscreen flag`);
      }
    }
  }
});

test("every declared animation has dedicated CSS and a meaningful skip delay", () => {
  const referenced = new Set(Object.values(STORY_CHAPTERS).flatMap((chapter) => chapter.scenes.flatMap((scene) => scene.animationId ?? [])));
  for (const animationId of referenced) {
    const animation = STORY_ANIMATIONS[animationId];
    assert.ok(animation, `missing animation ${animationId}`);
    assert.ok(animation.skippableAfterMs > 0 && animation.skippableAfterMs < animation.durationMs, `${animationId} has no protected opening`);
    assert.match(css, new RegExp(`data-animation=["']${animationId}["']`), `${animationId} falls back to generic CSS`);
  }
});

test("chapter six fixes both deaths and accounts for all ninety-six burned Dao", () => {
  const chapter = STORY_CHAPTERS[6];
  assert.deepEqual(chapter.initialDaoLedger, { qixiaParty: 96, liZhang: 1, oldLu: 0, burned: 0 });
  assert.equal(field(6, "c6-share-ledger", "total").correctValue, "96");
  assert.equal(field(6, "c6-share-ledger", "per-person").correctValue, "24");
  assert.equal(field(6, "c6-bell-trap", "dao-fate").correctValue, "all-burned");
  assert.deepEqual(scene(6, "c6-bell-trap").daoLedgerDeltaOnSolve, { qixiaParty: -96, burned: 96 });
  assert.match(scene(6, "c6-gokudo").canonicalEvent, /乔家劲先.*甜甜随后.*死亡/);
  assert.deepEqual(chapter.completionDaoLedger, { qixiaParty: 0, liZhang: 1, oldLu: 0, burned: 96 });

  const storeObservation = observation(6, "c6-return-store", "c6-li-left");
  assert.match(storeObservation.note, /起始筹码.*不代表.*最终余额/);
  assert.equal(field(6, "c6-human-pig-door", "fifty-two").correctValue, "unresolved");
  assert.deepEqual(observation(6, "c6-human-pig-door", "c6-number-52").sourceRef, {
    chapterStart: 57,
    chapterEnd: 57,
    lineStart: 7971,
    lineEnd: 7993,
    kind: "summary",
  });
});

test("chapter seven keeps 74/99 exact and Old Lu's confirmed ledger separate", () => {
  const chapter = STORY_CHAPTERS[7];
  assert.deepEqual(chapter.initialDaoLedger, { qixiaParty: 0, liZhang: 1, oldLu: 5, burned: 96 });
  assert.match(scene(7, "c7-pig-rules").lead, /至少.*五颗/);
  assert.match(observation(7, "c7-pig-rules", "c7-oldlu-ticket").note, /至少.*五颗.*存量未知/);
  assert.deepEqual(scene(7, "c7-pig-rules").daoLedgerDeltaOnSolve, { oldLu: -5 });
  assert.deepEqual(scene(7, "c7-read-reaction").daoLedgerDeltaOnSolve, { oldLu: 10 });
  assert.deepEqual(chapter.completionDaoLedger, { qixiaParty: 0, liZhang: 1, oldLu: 10, burned: 96 });

  assert.equal(field(7, "c7-optimal-split", "split").correctValue, "one-black-rest");
  assert.equal(field(7, "c7-optimal-split", "probability").correctValue, "74/99");
  assert.equal(scene(7, "c7-optimal-split").title, "九十九分之七十四");
  assert.match(STORY_ANIMATIONS["c7-stone-split"].caption, /九十九分之七十四/);
  assert.doesNotMatch(STORY_ANIMATIONS["c7-stone-split"].caption, /七十四分之九十九/);
  assert.match(scene(7, "c7-optimal-split").puzzle.solvedText, /1\/2×1 \+ 1\/2×49\/99 = 74\/99/);
  assert.equal(field(7, "c7-forced-wager", "truth-map").correctValue, "cold-lie-hot-truth");
  assert.doesNotMatch(scene(7, "c7-forced-wager").lead, /林檎.*假话|老吕.*真话/);
  assert.doesNotMatch(observation(7, "c7-forced-wager", "c7-glasses-truth").text, /林檎.*假话|老吕.*真话/);
  assert.match(observation(7, "c7-nested-question", "c7-opposite-answer").text, /林檎.*冰凉.*说假话.*老吕.*说真话/);

  const pair = field(7, "c7-force-one-of-each", "pair");
  assert.equal(pair.correctValue, "one-black-one-white");
  assert.match(pair.wrongMessages["two-white"], /反悔.*剩余棋子重选/);
  assert.match(pair.wrongMessages["two-black"], /直接.*胜局.*齐夏/);

  const fourAnswers = observation(7, "c7-atonement", "c7-four-answers").text;
  assert.match(fourAnswers, /不确定能否出去.*选择留下/);
  assert.match(fourAnswers, /三千六百颗最慢/);
  assert.match(fourAnswers, /赢“地”.*不要招惹“天”和“龙”/);
  assert.match(scene(7, "c7-atonement").canonicalEvent, /第五个问题.*枪响.*固定死亡/);
});

test("chapter eight preserves the unknown death, Rabbit aftermath and four-Dao transfer", () => {
  const chapter = STORY_CHAPTERS[8];
  assert.equal(field(8, "c8-heavens-mouth", "death-cause").correctValue, "unknown");
  assert.match(field(8, "c8-heavens-mouth", "death-cause").wrongMessages.xiaoxiao, /推测.*没有.*(?:物证|证据)/);
  assert.deepEqual(scene(8, "c8-heavens-mouth").sourceRef, {
    chapterStart: 65,
    chapterEnd: 66,
    lineStart: 9139,
    lineEnd: 9256,
    kind: "summary",
  });

  assert.equal(field(8, "c8-rabbit-reconstruction", "ox-ledger").correctValue, "4");
  assert.equal(field(8, "c8-rabbit-reconstruction", "prisoners").correctValue, "zhang-tank-li-cuff");
  assert.equal(field(8, "c8-rabbit-reconstruction", "objects").correctValue, "key-tank-valve-two-steps");
  assert.deepEqual(scene(8, "c8-rabbit-reconstruction").daoLedgerDeltaOnSolve, { liZhang: 3 });
  assert.equal(field(8, "c8-sacrifice-sequence", "first-phase").correctValue, "keep-fail-sacrifice");
  assert.equal(field(8, "c8-sacrifice-sequence", "rescue-phase").correctValue, "valve-glass-wire");
  assert.deepEqual(observation(8, "c8-bell-anomaly", "c8-object-pairs").sourceRef, {
    chapterStart: 67,
    chapterEnd: 68,
    lineStart: 9387,
    lineEnd: 9541,
    kind: "summary",
  });

  assert.deepEqual(scene(8, "c8-three-questions").daoLedgerDeltaOnSolve, { qixiaParty: 4, liZhang: -4 });
  assert.deepEqual(chapter.completionDaoLedger, { qixiaParty: 4, liZhang: 0, oldLu: 10, burned: 96 });
  assert.match(chapter.completionText, /章晨泽把四颗.*全部交给齐夏.*老吕个人的十颗仍单独记账/);
});
