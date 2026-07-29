export type CharacterId =
  | "qixia"
  | "qiao"
  | "tiantian"
  | "xiao"
  | "zhao"
  | "han"
  | "zhang"
  | "li"
  | "lin";

export type InjuryId = "tiantian-right-palm" | "han-shoulder-harpoon" | "han-blood-loss";

export type CharacterPose =
  | "standing"
  | "turning-table"
  | "holding-shield"
  | "hanging"
  | "supporting"
  | "injured";

export interface CharacterRuntimeState {
  alive: boolean;
  pose: CharacterPose;
  injuries: InjuryId[];
  stamina: 0 | 1 | 2 | 3;
}

export type ChapterTwoSceneId =
  | "entry"
  | "aftermath"
  | "hometown-map"
  | "shield-assembly"
  | "harpoon-rescue"
  | "sky-death"
  | "yes-no"
  | "zodiac-corridor"
  | "termination-reveal"
  | "complete"
  | "death";

export type ChapterTwoCheckpointId =
  | "c2-a"
  | "c2-b"
  | "c2-c"
  | "c2-d"
  | "c2-e"
  | "c2-f"
  | "c2-g"
  | "c2-h";

export type ChapterTwoFailureId =
  | "harpoon-volley"
  | "shield-breach"
  | "han-pinned-to-wall"
  | "wall-position-crush"
  | "floor-collapse"
  | "yes-no-exhausted";

export type ChapterTwoPuzzleId =
  | "aftermath"
  | "hometown-map"
  | "shield-assembly"
  | "harpoon-rescue"
  | "sky-death"
  | "yes-no";

export type ChapterTwoObservationId =
  | "heart-shot"
  | "preserved-mask"
  | "mask-writing"
  | "wall-holes"
  | "clock-quarter"
  | "rotating-table"
  | "nine-hometowns"
  | "split-table"
  | "harpoon-ropes"
  | "harpoon-tail-writing"
  | "ceiling-nine-holes"
  | "square-board-handles"
  | "sheep-dog-types"
  | "shaft-door"
  | "snake-rules"
  | "zodiac-masks"
  | "human-dragon"
  | "dao-token"
  | "termination-plaza";

export type ChapterTwoAnimationId =
  | "mask-writing-reveal"
  | "wall-holes-open"
  | "table-turn-right"
  | "table-split"
  | "shield-lock"
  | "harpoon-volley"
  | "rope-retract"
  | "rope-cut-release"
  | "ceiling-holes-open"
  | "floor-rise"
  | "floor-collapse"
  | "snake-lever"
  | "corridor-doors"
  | "city-reveal";

export type ChapterTwoStatus =
  | { kind: "playing" }
  | { kind: "animating"; animationId: ChapterTwoAnimationId }
  | { kind: "death"; failureId: ChapterTwoFailureId }
  | { kind: "complete" };

export interface FieldError {
  scope: ChapterTwoPuzzleId;
  fieldId: string;
  code: string;
  message: string;
  clockCost?: number;
  dangerCost?: number;
}

export interface HistoryEntry {
  id: string;
  scene: ChapterTwoSceneId;
  text: string;
  kind: "observation" | "deduction" | "warning" | "result";
}

export type AftermathAnswer = "avoid-pain" | "head-too-hard" | "protect-mask";

export interface AftermathPuzzleState {
  selectedReason: AftermathAnswer | null;
}

export type PlaceId =
  | "inner-mongolia"
  | "sichuan"
  | "shaanxi"
  | "yunnan"
  | "guangdong"
  | "ningxia"
  | "jiangsu"
  | "shandong"
  | "guangxi";

export interface HometownPuzzleState {
  placements: Partial<Record<CharacterId, PlaceId>>;
  strokes: [PlaceId[], PlaceId[], PlaceId[]];
  direction: "left" | "right" | null;
  scriptedLeftTurns: number;
  committedRightTurns: number;
}

export type WedgeId =
  | "small-1"
  | "small-2"
  | "small-3"
  | "small-4"
  | "small-5"
  | "small-6"
  | "small-7"
  | "small-8"
  | "small-9"
  | "large-decoy";

export type WedgeSlotId = "slot-1" | "slot-2" | "slot-3" | "slot-4" | "slot-5" | "slot-6" | "slot-7" | "slot-8" | "slot-9";
export type WedgeOrientation = "tip-in" | "tip-out" | "vertical";

export interface ShieldPuzzleState {
  placements: Partial<Record<WedgeId, WedgeSlotId>>;
  orientations: Partial<Record<WedgeId, WedgeOrientation>>;
  discardedIds: WedgeId[];
}

export type RescueActionId =
  | "pull-han-harpoon"
  | "hold-retracting-rope"
  | "knot-opposing-ropes"
  | "lin-release-knot"
  | "li-cut-rope"
  | "qiao-brace-han";

export interface RescuePuzzleState {
  step: number;
  completedActionIds: RescueActionId[];
}

export interface SkyDeathAnswer {
  gameType: "trust-human-sheep" | "sheep-can-lie" | null;
  position: "wall" | "under-holes" | null;
  boardUse: "shield" | "floor-cover" | "ceiling-anchor" | null;
  insertion: "flat" | "vertical-then-horizontal" | null;
}

export type QuestionTokenId =
  | "if"
  | "my-next-question"
  | "will-you-pull"
  | "your-answer"
  | "same-as-this"
  | "will-you-not-pull"
  | "can-you-save-us"
  | "is-yes";

export type QuestionAst =
  | { kind: "direct"; proposition: "pull-lever" | "save-us" | "do-not-pull" }
  | {
      kind: "same-answer-meta";
      nextQuestion: { kind: "direct"; proposition: "pull-lever" };
    };

export interface QuestionBranch {
  currentAnswer: "yes" | "no";
  nextAnswer: "yes" | "no" | "unconstrained";
  pullForced: boolean;
}

export interface YesNoPuzzleState {
  tokenIds: QuestionTokenId[];
  branches: QuestionBranch[];
  solvedText: string | null;
}

export interface ChapterTwoState {
  schemaVersion: 1;
  scene: ChapterTwoSceneId;
  checkpoint: ChapterTwoCheckpointId;
  status: ChapterTwoStatus;
  storyClockMinute: number;
  deadlineMinute: 75 | 90 | null;
  dangerTicks: number;
  questionCount: number;
  daoCount: number;
  narrativeBeat: number;
  observedIds: ChapterTwoObservationId[];
  recordedIds: ChapterTwoObservationId[];
  solvedPuzzleIds: ChapterTwoPuzzleId[];
  history: HistoryEntry[];
  errors: FieldError[];
  characterStates: Record<CharacterId, CharacterRuntimeState>;
  aftermath: AftermathPuzzleState;
  hometown: HometownPuzzleState;
  shield: ShieldPuzzleState;
  rescue: RescuePuzzleState;
  skyDeath: SkyDeathAnswer;
  yesNo: YesNoPuzzleState;
}

export type ChapterTwoAction =
  | { type: "ENTER_CHAPTER" }
  | { type: "OBSERVE"; observationId: ChapterTwoObservationId }
  | { type: "RECORD"; observationId: ChapterTwoObservationId }
  | { type: "SUBMIT_AFTERMATH"; answer: AftermathAnswer }
  | { type: "PLACE_HOMETOWN"; characterId: CharacterId; placeId: PlaceId }
  | { type: "SET_MAP_STROKE"; strokeIndex: 0 | 1 | 2; placeIds: PlaceId[] }
  | { type: "SUBMIT_HOMETOWN"; direction: "left" | "right" }
  | { type: "PLACE_WEDGE"; wedgeId: WedgeId; slotId: WedgeSlotId }
  | { type: "ROTATE_WEDGE"; wedgeId: WedgeId; orientation: WedgeOrientation }
  | { type: "DISCARD_WEDGE"; wedgeId: WedgeId }
  | { type: "SUBMIT_SHIELD" }
  | { type: "APPLY_RESCUE_ACTION"; actionId: RescueActionId }
  | { type: "SET_SKY_FIELD"; field: keyof SkyDeathAnswer; value: string }
  | { type: "SUBMIT_SKY_DEATH" }
  | { type: "ADD_QUESTION_TOKEN"; tokenId: QuestionTokenId }
  | { type: "REMOVE_QUESTION_TOKEN"; index: number }
  | { type: "CLEAR_QUESTION" }
  | { type: "SUBMIT_QUESTION" }
  | { type: "ADVANCE_NARRATIVE" }
  | { type: "ANIMATION_FINISHED"; animationId: ChapterTwoAnimationId }
  | { type: "RETRY_CHECKPOINT" }
  | { type: "RESTORE"; state: ChapterTwoState };
