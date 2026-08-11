import type { StoryAnimationId } from "./animation.ts";
import type { StoryImageAssetId } from "./assets.ts";

export const STORY_CHAPTER_IDS = [3, 4, 5, 6, 7, 8] as const;
export const SOLO_CHAPTER_IDS = [1, 2, ...STORY_CHAPTER_IDS] as const;

export type StoryChapterId = typeof STORY_CHAPTER_IDS[number];
export type SoloChapterId = typeof SOLO_CHAPTER_IDS[number];

export type StoryStatus =
  | { kind: "playing" }
  | { kind: "animating"; animationId: StoryAnimationId }
  | { kind: "death"; failureId: string; reason: string; checkpointSceneId: string }
  | { kind: "complete" };

export type StorySourceKind = "quote" | "adaptation" | "summary";

export interface StorySourceRef {
  chapterStart: number;
  chapterEnd: number;
  lineStart: number;
  lineEnd: number;
  kind: StorySourceKind;
}

export interface StoryObservation {
  id: string;
  label: string;
  text: string;
  note: string;
  sourceRef: StorySourceRef;
  visualAssetId?: StoryImageAssetId;
}

export interface StoryPuzzleOption {
  value: string;
  label: string;
  detail?: string;
}

export interface StoryPuzzleField {
  id: string;
  label: string;
  options: readonly StoryPuzzleOption[];
  correctValue: string;
  wrongMessages: Readonly<Record<string, string>>;
}

export interface StoryFatalRule {
  fieldId: string;
  value: string;
  failureId: string;
  reason: string;
  checkpointSceneId: string;
  when?: Readonly<Record<string, string>>;
}

export interface StoryPuzzle {
  id: string;
  prompt: string;
  requiredObservationIds: readonly string[];
  fields: readonly StoryPuzzleField[];
  errorCost: number;
  solvedText: string;
  fatalRules?: readonly StoryFatalRule[];
}

export type StorySpeakerId =
  | "qixia"
  | "qiao"
  | "tiantian"
  | "lin"
  | "li"
  | "zhao"
  | "han"
  | "zhang"
  | "xiao"
  | "store-clerk"
  | "human-rat"
  | "zhuque"
  | "ground-ox"
  | "zhang-shan"
  | "little-glasses"
  | "xiaoxiao"
  | "old-lu"
  | "human-pig"
  | "human-rabbit";

export interface StoryDialogueLine {
  id: string;
  speakerId: StorySpeakerId;
  text: string;
  sourceRef: StorySourceRef;
  offscreen?: boolean;
}

export type StoryDaoAccountId = "qixiaParty" | "liZhang" | "oldLu" | "burned";
export type StoryDaoLedger = Readonly<Record<StoryDaoAccountId, number>>;
export type StoryDaoDelta = Readonly<Partial<Record<StoryDaoAccountId, number>>>;

export interface StoryScene {
  id: string;
  title: string;
  eyebrow: string;
  lead: string;
  sourceRef: StorySourceRef;
  backgroundAsset: string;
  portraitIds: readonly string[];
  stagePropAssetIds?: readonly StoryImageAssetId[];
  observations: readonly StoryObservation[];
  dialogue: readonly StoryDialogueLine[];
  puzzle?: StoryPuzzle;
  animationId?: StoryAnimationId;
  advanceLabel: string;
  daoLedgerDeltaOnSolve?: StoryDaoDelta;
  daoLedgerDeltaOnAdvance?: StoryDaoDelta;
  canonicalEvent?: string;
}

export interface StoryChapterSpec {
  id: StoryChapterId;
  slug: string;
  title: string;
  subtitle: string;
  source: { startLine: number; endLine: number; chapters: readonly number[] };
  initialDaoLedger: StoryDaoLedger;
  pressureLimit: number;
  scenes: readonly StoryScene[];
  completionTitle: string;
  completionText: string;
  completionDaoLedger: StoryDaoLedger;
  completionDaoLabel: string;
  nextChapterId?: StoryChapterId;
}

export interface StoryFieldError {
  fieldId: string;
  message: string;
}

export interface StoryHistoryEntry {
  id: string;
  kind: "observation" | "warning" | "deduction" | "result";
  text: string;
}

export interface StoryChapterState {
  schemaVersion: 2;
  chapterId: StoryChapterId;
  sceneId: string;
  checkpointSceneId: string;
  status: StoryStatus;
  daoLedger: StoryDaoLedger;
  pressure: number;
  observedIds: string[];
  solvedSceneIds: string[];
  answers: Record<string, string>;
  errors: StoryFieldError[];
  history: StoryHistoryEntry[];
  eventSequence: number;
}

export type StoryChapterAction =
  | { type: "ENTER" }
  | { type: "RESTORE"; state: StoryChapterState }
  | { type: "OBSERVE"; observationId: string }
  | { type: "SET_FIELD"; fieldId: string; value: string }
  | { type: "SUBMIT_PUZZLE" }
  | { type: "ADVANCE" }
  | { type: "ANIMATION_FINISHED"; animationId: StoryAnimationId }
  | { type: "RETRY_CHECKPOINT" };
