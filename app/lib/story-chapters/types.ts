export type StoryChapterId = 3 | 4 | 5;

export type StoryStatus =
  | { kind: "playing" }
  | { kind: "animating"; animationId: string }
  | { kind: "death"; failureId: string; reason: string; checkpointSceneId: string }
  | { kind: "complete" };

export interface StorySourceRef {
  chapter: number;
  lineStart: number;
  lineEnd: number;
}

export interface StoryObservation {
  id: string;
  label: string;
  text: string;
  note: string;
  sourceRef: StorySourceRef;
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
  | "little-glasses";

export interface StoryDialogueLine {
  id: string;
  speakerId: StorySpeakerId;
  text: string;
  sourceRef: StorySourceRef;
}

export interface StoryScene {
  id: string;
  title: string;
  eyebrow: string;
  lead: string;
  sourceRef: StorySourceRef;
  backgroundAsset: string;
  portraitIds: readonly string[];
  observations: readonly StoryObservation[];
  dialogue: readonly StoryDialogueLine[];
  puzzle?: StoryPuzzle;
  animationId?: string;
  advanceLabel: string;
  daoDeltaOnSolve?: number;
  daoDeltaOnAdvance?: number;
  canonicalEvent?: string;
}

export interface StoryChapterSpec {
  id: StoryChapterId;
  slug: string;
  title: string;
  subtitle: string;
  source: { startLine: number; endLine: number; chapters: readonly number[] };
  initialDao: number;
  scenes: readonly StoryScene[];
  completionTitle: string;
  completionText: string;
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
  schemaVersion: 1;
  chapterId: StoryChapterId;
  sceneId: string;
  checkpointSceneId: string;
  status: StoryStatus;
  daoCount: number;
  pressure: number;
  observedIds: string[];
  solvedSceneIds: string[];
  answers: Record<string, string>;
  errors: StoryFieldError[];
  history: StoryHistoryEntry[];
}

export type StoryChapterAction =
  | { type: "ENTER" }
  | { type: "RESTORE"; state: StoryChapterState }
  | { type: "OBSERVE"; observationId: string }
  | { type: "SET_FIELD"; fieldId: string; value: string }
  | { type: "SUBMIT_PUZZLE" }
  | { type: "ADVANCE" }
  | { type: "ANIMATION_FINISHED"; animationId: string }
  | { type: "RETRY_CHECKPOINT" };
