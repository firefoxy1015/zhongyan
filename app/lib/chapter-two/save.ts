import { initialChapterTwoState, sanitizeRestoredState } from "./engine.ts";
import type { ChapterTwoState } from "./types.ts";

export const SOLO_SAVE_KEY = "zhongyan:solo-save:v2";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export interface SoloSaveEnvelope {
  version: 2;
  updatedAt: string;
  completedChapters: number[];
  activeChapter: 1 | 2;
  chapterTwo?: ChapterTwoState;
  lockedAssetVersions: {
    portraits: string;
    voices: string;
  };
}

function appendUnique(items: readonly number[], item: number) {
  return items.includes(item) ? [...items] : [...items, item];
}

export function createEmptySoloSave(): SoloSaveEnvelope {
  return {
    version: 2,
    updatedAt: new Date(0).toISOString(),
    completedChapters: [],
    activeChapter: 1,
    lockedAssetVersions: {
      portraits: "chapter-one-locked-v2",
      voices: "chapter-one-static-v2",
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasChapterTwoState(value: unknown): value is ChapterTwoState {
  if (!isRecord(value)) return false;
  return value.schemaVersion === 1
    && typeof value.scene === "string"
    && typeof value.checkpoint === "string"
    && typeof value.storyClockMinute === "number"
    && isRecord(value.status);
}

export function parseSoloSave(value: unknown): SoloSaveEnvelope | null {
  if (!isRecord(value) || value.version !== 2 || !Array.isArray(value.completedChapters)) return null;
  if (value.activeChapter !== 1 && value.activeChapter !== 2) return null;
  if (!isRecord(value.lockedAssetVersions)) return null;
  if (typeof value.lockedAssetVersions.portraits !== "string" || typeof value.lockedAssetVersions.voices !== "string") return null;

  const completedChapters = value.completedChapters.filter((item): item is number => typeof item === "number" && Number.isInteger(item));
  const chapterTwo = hasChapterTwoState(value.chapterTwo) ? sanitizeRestoredState(value.chapterTwo) : undefined;

  return {
    version: 2,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    completedChapters: [...new Set(completedChapters)],
    activeChapter: value.activeChapter,
    chapterTwo,
    lockedAssetVersions: {
      portraits: value.lockedAssetVersions.portraits,
      voices: value.lockedAssetVersions.voices,
    },
  };
}

export function loadSoloSave(storage: Pick<StorageLike, "getItem">): SoloSaveEnvelope | null {
  const raw = storage.getItem(SOLO_SAVE_KEY);
  if (!raw) return null;
  try {
    return parseSoloSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSoloState(storage: StorageLike, state: SoloSaveEnvelope) {
  storage.setItem(SOLO_SAVE_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
}

export function markChapterOneComplete(storage: StorageLike) {
  const current = loadSoloSave(storage) ?? createEmptySoloSave();
  saveSoloState(storage, {
    ...current,
    completedChapters: appendUnique(current.completedChapters, 1),
    activeChapter: 2,
  });
}

export function saveChapterTwo(storage: StorageLike, chapterTwo: ChapterTwoState) {
  const current = loadSoloSave(storage) ?? createEmptySoloSave();
  saveSoloState(storage, {
    ...current,
    activeChapter: 2,
    chapterTwo,
  });
}

export function markChapterTwoComplete(storage: StorageLike, chapterTwo: ChapterTwoState) {
  const current = loadSoloSave(storage) ?? createEmptySoloSave();
  saveSoloState(storage, {
    ...current,
    completedChapters: appendUnique(current.completedChapters, 2),
    activeChapter: 2,
    chapterTwo,
  });
}

export function canEnterChapterTwo(storage: Pick<StorageLike, "getItem">) {
  return loadSoloSave(storage)?.completedChapters.includes(1) ?? false;
}

export function createFreshChapterTwoSave(storage: StorageLike) {
  const current = loadSoloSave(storage) ?? createEmptySoloSave();
  const chapterTwo = initialChapterTwoState();
  saveSoloState(storage, {
    ...current,
    activeChapter: 2,
    chapterTwo,
  });
  return chapterTwo;
}
