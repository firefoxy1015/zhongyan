import { loadSoloSave, SOLO_SAVE_KEY as LEGACY_SOLO_SAVE_KEY, type StorageLike } from "../chapter-two/save.ts";
import { initialStoryChapterState, sanitizeStoryChapterState } from "./engine.ts";
import type { StoryChapterId, StoryChapterState } from "./types.ts";

export const STORY_SAVE_KEY = "zhongyan:solo-save:v3";

export interface StorySaveEnvelope {
  version: 3;
  updatedAt: string;
  completedChapters: number[];
  activeChapter: 1 | 2 | 3 | 4 | 5;
  chapters: Partial<Record<StoryChapterId, StoryChapterState>>;
  lockedAssetVersions: {
    portraits: string;
    voices: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueChapters(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 5))];
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
  if (![1, 2, 3, 4, 5].includes(value.activeChapter as number)) return null;
  const chapters: Partial<Record<StoryChapterId, StoryChapterState>> = {};
  for (const chapterId of [3, 4, 5] as const) {
    const candidate = value.chapters[String(chapterId)];
    if (isRecord(candidate) && candidate.schemaVersion === 1 && candidate.chapterId === chapterId) {
      chapters[chapterId] = sanitizeStoryChapterState(candidate as unknown as StoryChapterState, chapterId);
    }
  }
  return {
    version: 3,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    completedChapters: uniqueChapters(value.completedChapters),
    activeChapter: value.activeChapter as StorySaveEnvelope["activeChapter"],
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
    completedChapters: [...legacy.completedChapters],
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
    completedChapters: [...new Set([...save.completedChapters, ...legacy.completedChapters])],
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
  return save?.completedChapters.includes(chapterId - 1) ?? false;
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
    ? [...new Set([...current.completedChapters, state.chapterId])]
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
  const completedChapters = [...new Set([...current.completedChapters, ...Array.from({ length: chapterId - 1 }, (_, index) => index + 1)])];
  const chapters = { ...current.chapters };
  for (const id of [3, 4, 5] as const) {
    if (id <= chapterId && !chapters[id]) chapters[id] = initialStoryChapterState(id);
  }
  saveStoryEnvelope(storage, { ...current, completedChapters, activeChapter: chapterId, chapters });
}

export function clearLegacyMarkerForTests(storage: StorageLike) {
  return storage.getItem(LEGACY_SOLO_SAVE_KEY);
}
