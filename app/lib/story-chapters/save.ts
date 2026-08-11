import { loadSoloSave, SOLO_SAVE_KEY as LEGACY_SOLO_SAVE_KEY, type StorageLike } from "../chapter-two/save.ts";
import { initialStoryChapterState, sanitizeStoryChapterState } from "./engine.ts";
import { SOLO_CHAPTER_IDS, STORY_CHAPTER_IDS } from "./types.ts";
import type { SoloChapterId, StoryChapterId, StoryChapterState } from "./types.ts";

export const STORY_SAVE_KEY = "zhongyan:solo-save:v3";

export interface StorySaveEnvelope {
  version: 3;
  updatedAt: string;
  completedChapters: SoloChapterId[];
  activeChapter: SoloChapterId;
  chapters: Partial<Record<StoryChapterId, StoryChapterState>>;
  lockedAssetVersions: {
    portraits: string;
    voices: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueChapters(value: unknown): SoloChapterId[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<number>(SOLO_CHAPTER_IDS);
  return [...new Set(value.filter((item): item is SoloChapterId => Number.isInteger(item) && allowed.has(item as number)))]
    .sort((left, right) => left - right);
}

function legacyCompletedChapters(value: readonly number[]) {
  return uniqueChapters(value.filter((chapterId) => chapterId === 1 || chapterId === 2));
}

export function createEmptyStorySave(): StorySaveEnvelope {
  return {
    version: 3,
    updatedAt: new Date(0).toISOString(),
    completedChapters: [],
    activeChapter: 1,
    chapters: {},
    lockedAssetVersions: {
      portraits: "story-chapters-locked-v1",
      voices: "story-chapters-static-v1",
    },
  };
}

export function parseStorySave(value: unknown): StorySaveEnvelope | null {
  if (!isRecord(value) || value.version !== 3 || !isRecord(value.chapters)) return null;
  if (!SOLO_CHAPTER_IDS.includes(value.activeChapter as SoloChapterId)) return null;
  const chapters: Partial<Record<StoryChapterId, StoryChapterState>> = {};
  for (const chapterId of STORY_CHAPTER_IDS) {
    const candidate = value.chapters[String(chapterId)];
    if (isRecord(candidate) && [1, 2].includes(candidate.schemaVersion as number) && candidate.chapterId === chapterId) {
      chapters[chapterId] = sanitizeStoryChapterState(candidate, chapterId);
    }
  }
  return {
    version: 3,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    completedChapters: uniqueChapters(value.completedChapters),
    activeChapter: value.activeChapter as SoloChapterId,
    chapters,
    lockedAssetVersions: isRecord(value.lockedAssetVersions)
      ? {
          portraits: typeof value.lockedAssetVersions.portraits === "string" ? value.lockedAssetVersions.portraits : "story-chapters-locked-v1",
          voices: typeof value.lockedAssetVersions.voices === "string" ? value.lockedAssetVersions.voices : "story-chapters-static-v1",
        }
      : createEmptyStorySave().lockedAssetVersions,
  };
}

function migrateLegacy(storage: Pick<StorageLike, "getItem">): StorySaveEnvelope | null {
  const legacy = loadSoloSave(storage);
  if (!legacy) return null;
  return {
    ...createEmptyStorySave(),
    updatedAt: legacy.updatedAt,
    completedChapters: legacyCompletedChapters(legacy.completedChapters),
    activeChapter: legacy.activeChapter,
  };
}

function mergeLegacyProgress(
  save: StorySaveEnvelope,
  storage: Pick<StorageLike, "getItem">,
): StorySaveEnvelope {
  const legacy = loadSoloSave(storage);
  if (!legacy) return save;
  return {
    ...save,
    completedChapters: uniqueChapters([...save.completedChapters, ...legacyCompletedChapters(legacy.completedChapters)]),
  };
}

export function loadStorySave(storage: Pick<StorageLike, "getItem">): StorySaveEnvelope | null {
  const raw = storage.getItem(STORY_SAVE_KEY);
  if (raw) {
    try {
      const parsed = parseStorySave(JSON.parse(raw));
      return parsed ? mergeLegacyProgress(parsed, storage) : migrateLegacy(storage);
    } catch {
      return migrateLegacy(storage);
    }
  }
  return migrateLegacy(storage);
}

export function saveStoryEnvelope(storage: StorageLike, envelope: StorySaveEnvelope) {
  storage.setItem(STORY_SAVE_KEY, JSON.stringify({ ...envelope, updatedAt: new Date().toISOString() }));
}

export function canEnterStoryChapter(storage: Pick<StorageLike, "getItem">, chapterId: StoryChapterId) {
  const save = loadStorySave(storage);
  if (!save) return false;
  return SOLO_CHAPTER_IDS.filter((completedId) => completedId < chapterId)
    .every((completedId) => save.completedChapters.includes(completedId));
}

export function createFreshStoryChapterSave(storage: StorageLike, chapterId: StoryChapterId) {
  const current = loadStorySave(storage) ?? createEmptyStorySave();
  const state = initialStoryChapterState(chapterId);
  saveStoryEnvelope(storage, {
    ...current,
    activeChapter: chapterId,
    chapters: { ...current.chapters, [chapterId]: state },
  });
  return state;
}

export function saveStoryChapter(storage: StorageLike, state: StoryChapterState) {
  const current = loadStorySave(storage) ?? createEmptyStorySave();
  const completedChapters = state.status.kind === "complete"
    ? uniqueChapters([...current.completedChapters, state.chapterId])
    : current.completedChapters;
  saveStoryEnvelope(storage, {
    ...current,
    activeChapter: state.chapterId,
    completedChapters,
    chapters: { ...current.chapters, [state.chapterId]: state },
  });
}

export function unlockStoryChapterForTesting(storage: StorageLike, chapterId: StoryChapterId) {
  const current = loadStorySave(storage) ?? createEmptyStorySave();
  const completedChapters = uniqueChapters([
    ...current.completedChapters,
    ...Array.from({ length: chapterId - 1 }, (_, index) => index + 1),
  ]);
  const chapters = { ...current.chapters };
  for (const id of STORY_CHAPTER_IDS) {
    if (id <= chapterId && !chapters[id]) chapters[id] = initialStoryChapterState(id);
  }
  chapters[chapterId] = initialStoryChapterState(chapterId);
  saveStoryEnvelope(storage, { ...current, completedChapters, activeChapter: chapterId, chapters });
}

export function clearLegacyMarkerForTests(storage: StorageLike) {
  return storage.getItem(LEGACY_SOLO_SAVE_KEY);
}
