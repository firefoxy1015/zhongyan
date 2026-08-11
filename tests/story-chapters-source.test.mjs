import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { STORY_CHAPTERS } from "../app/lib/story-chapters/canon.ts";
import { STORY_CHAPTER_IDS } from "../app/lib/story-chapters/types.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(
  projectRoot,
  "reference",
  "canon",
  "十日终焉 1--1496 完结 杀虫队队员.txt",
);
const manifestPath = path.join(projectRoot, "content", "canon-manifest.json");
const [sourceBuffer, manifestText] = await Promise.all([
  readFile(sourcePath),
  readFile(manifestPath, "utf8"),
]);
const sourceText = sourceBuffer.toString("utf8");
const sourceLines = sourceText.split(/\r?\n/);
const manifest = JSON.parse(manifestText);
const allowedKinds = new Set(["quote", "adaptation", "summary"]);
const auditedChapters = STORY_CHAPTER_IDS.map((chapterId) => STORY_CHAPTERS[chapterId]);

function normalizeQuote(value) {
  return value.normalize("NFC").replace(/[\s\uFEFF]+/gu, "");
}

function chapterAt(lineNumber) {
  let low = 0;
  let high = manifest.chapters.length - 1;
  let found = null;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const chapter = manifest.chapters[middle];
    if (chapter.line <= lineNumber) {
      found = chapter;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return found;
}

function referencesFor(chapter) {
  const references = [];
  for (const scene of chapter.scenes) {
    references.push({ owner: `scene:${scene.id}`, role: "summary", ref: scene.sourceRef });
    for (const observation of scene.observations) {
      references.push({ owner: `observation:${observation.id}`, role: "summary", ref: observation.sourceRef });
    }
    for (const dialogue of scene.dialogue) {
      references.push({ owner: `dialogue:${dialogue.id}`, role: "dialogue", ref: dialogue.sourceRef, text: dialogue.text });
    }
  }
  return references;
}

test("canon manifest identifies the exact repository source", () => {
  assert.equal(sourceBuffer.byteLength, manifest.source.bytes);
  assert.equal(sourceLines.length, manifest.source.lines);
  assert.equal(
    createHash("sha256").update(sourceBuffer).digest("hex").toUpperCase(),
    manifest.source.sha256,
  );
});

test("every story chapter source reference resolves to its declared canon chapter", () => {
  for (const chapter of auditedChapters) {
    for (const { owner, role, ref } of referencesFor(chapter)) {
      assert.deepEqual(
        Object.keys(ref).sort(),
        ["chapterEnd", "chapterStart", "kind", "lineEnd", "lineStart"],
        `${owner} must use the complete StorySourceRef contract`,
      );
      assert.ok(allowedKinds.has(ref.kind), `${owner} has invalid source kind ${ref.kind}`);
      assert.equal(role === "summary", ref.kind === "summary", `${owner} has the wrong source kind for its role`);
      assert.ok(Number.isInteger(ref.lineStart) && Number.isInteger(ref.lineEnd), `${owner} uses non-integer lines`);
      assert.ok(ref.lineStart <= ref.lineEnd, `${owner} has a reversed line range`);
      assert.ok(ref.lineStart >= chapter.source.startLine, `${owner} starts before game chapter ${chapter.id}`);
      assert.ok(ref.lineEnd <= chapter.source.endLine, `${owner} ends after game chapter ${chapter.id}`);

      const startHeading = chapterAt(ref.lineStart);
      const endHeading = chapterAt(ref.lineEnd);
      assert.ok(startHeading && endHeading, `${owner} does not resolve to canon headings`);
      assert.equal(ref.chapterStart, startHeading.number, `${owner} has the wrong starting canon chapter`);
      assert.equal(ref.chapterEnd, endHeading.number, `${owner} has the wrong ending canon chapter`);
      assert.ok(chapter.source.chapters.includes(ref.chapterStart), `${owner} starts outside the declared canon span`);
      assert.ok(chapter.source.chapters.includes(ref.chapterEnd), `${owner} ends outside the declared canon span`);

      const crossedChapters = manifest.chapters
        .filter(({ line }) => line >= startHeading.line && line <= ref.lineEnd)
        .map(({ number }) => number);
      for (const canonChapter of crossedChapters) {
        assert.ok(chapter.source.chapters.includes(canonChapter), `${owner} crosses undeclared canon chapter ${canonChapter}`);
      }
    }
  }
});

test("chapters six through eight keep evidence inside the scene that presents it", () => {
  for (const chapter of auditedChapters.filter(({ id }) => id >= 6)) {
    for (const scene of chapter.scenes) {
      const childReferences = [
        ...scene.observations.map((observation) => ({ owner: `observation:${observation.id}`, ref: observation.sourceRef })),
        ...scene.dialogue.map((dialogue) => ({ owner: `dialogue:${dialogue.id}`, ref: dialogue.sourceRef })),
      ];

      for (const { owner, ref } of childReferences) {
        assert.ok(
          ref.lineStart >= scene.sourceRef.lineStart,
          `${owner} starts before scene:${scene.id}`,
        );
        assert.ok(
          ref.lineEnd <= scene.sourceRef.lineEnd,
          `${owner} ends after scene:${scene.id}`,
        );
      }
    }
  }
});

test("chapters six through eight present canon scenes in strict source order", () => {
  for (const chapter of auditedChapters.filter(({ id }) => id >= 6)) {
    for (let index = 1; index < chapter.scenes.length; index += 1) {
      const previous = chapter.scenes[index - 1];
      const current = chapter.scenes[index];
      assert.ok(
        previous.sourceRef.lineEnd < current.sourceRef.lineStart,
        `scene:${current.id} overlaps or precedes scene:${previous.id}`,
      );
    }
  }
});

test("quote dialogue is a normalized verbatim substring and adaptations are not mislabeled quotes", () => {
  for (const chapter of auditedChapters) {
    for (const { owner, role, ref, text } of referencesFor(chapter)) {
      if (role !== "dialogue") continue;
      const sourceSpan = sourceLines.slice(ref.lineStart - 1, ref.lineEnd).join("\n");
      const isVerbatim = normalizeQuote(sourceSpan).includes(normalizeQuote(text));
      if (ref.kind === "quote") {
        assert.ok(isVerbatim, `${owner} is marked quote but does not match lines ${ref.lineStart}-${ref.lineEnd}`);
      } else {
        assert.equal(ref.kind, "adaptation", `${owner} dialogue must be quote or adaptation`);
        assert.equal(isVerbatim, false, `${owner} is verbatim and should be marked quote`);
      }
    }
  }
});

test("observation notes do not disclose the audited puzzle conclusions", () => {
  const forbiddenConclusions = [
    /独自跟进去不是交易/,
    /只保证宣读规则的瞬间/,
    /不是答案/,
    /知道里面不可能有/,
    /装死的人当成食物/,
    /决定权集中在前方两人/,
    /一次攻击背部/,
    /四人份为七十六颗/,
    /目标不再是重建阵型/,
  ];

  for (const chapter of auditedChapters) {
    for (const scene of chapter.scenes) {
      for (const observation of scene.observations) {
        for (const forbidden of forbiddenConclusions) {
          assert.doesNotMatch(observation.note, forbidden, `observation:${observation.id} discloses a conclusion`);
        }
      }
    }
  }
});
