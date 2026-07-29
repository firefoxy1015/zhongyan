import {
  CANONICAL_META_QUESTION,
  CANONICAL_RESCUE_SEQUENCE,
  CHAPTER_TWO_OBSERVATIONS,
  CORRIDOR_BEATS,
  error,
  HOMETOWN_FACTS,
  HOMETOWN_SOLUTION,
  HUMAN_DRAGON_DAO_BEAT,
  applyCanonicalHarpoonInjuries,
  initialCharacters,
  WEDGE_IDS,
} from "./canon.ts";
import type {
  AftermathAnswer,
  ChapterTwoAction,
  ChapterTwoAnimationId,
  ChapterTwoCheckpointId,
  ChapterTwoFailureId,
  ChapterTwoObservationId,
  ChapterTwoSceneId,
  ChapterTwoState,
  FieldError,
  PlaceId,
  QuestionAst,
  QuestionBranch,
  QuestionTokenId,
  RescueActionId,
  SkyDeathAnswer,
} from "./types.ts";

export type QuestionParseError = {
  kind: "parse-error";
  fieldId: string;
  message: string;
};

export type ParsedQuestion = QuestionAst | QuestionParseError;

const META_QUESTION_PATTERN: readonly QuestionTokenId[] = [
  "if",
  "my-next-question",
  "will-you-pull",
  "your-answer",
  "same-as-this",
];

const DIRECT_PULL_PATTERN: readonly QuestionTokenId[] = ["will-you-pull"];
const DIRECT_SAVE_PATTERN: readonly QuestionTokenId[] = ["can-you-save-us"];
const DIRECT_NEGATED_PATTERN: readonly QuestionTokenId[] = ["will-you-not-pull"];

function emptyState(scene: ChapterTwoSceneId = "entry"): ChapterTwoState {
  return {
    schemaVersion: 1,
    scene,
    checkpoint: "c2-a",
    status: { kind: "playing" },
    storyClockMinute: 60,
    deadlineMinute: null,
    dangerTicks: 0,
    questionCount: 0,
    daoCount: 0,
    narrativeBeat: 0,
    observedIds: [],
    recordedIds: [],
    solvedPuzzleIds: [],
    history: [],
    errors: [],
    characterStates: initialCharacters(),
    aftermath: { selectedReason: null },
    hometown: {
      placements: {},
      strokes: [[], [], []],
      direction: null,
      scriptedLeftTurns: 0,
      committedRightTurns: 0,
    },
    shield: { placements: {}, orientations: {}, discardedIds: [] },
    rescue: { step: 0, completedActionIds: [] },
    skyDeath: { gameType: null, position: null, boardUse: null, insertion: null },
    yesNo: { tokenIds: [], branches: [], solvedText: null },
  };
}

function appendUnique<T>(items: readonly T[], item: T): T[] {
  return items.includes(item) ? [...items] : [...items, item];
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

function addHistory(
  state: ChapterTwoState,
  text: string,
  kind: "observation" | "deduction" | "warning" | "result",
): ChapterTwoState {
  const entry = {
    id: `${state.scene}:${state.history.length}:${text}`,
    scene: state.scene,
    text,
    kind,
  } as const;
  return { ...state, history: [...state.history.slice(-19), entry] };
}

function clearErrors(state: ChapterTwoState): ChapterTwoState {
  return state.errors.length === 0 ? state : { ...state, errors: [] };
}

function withErrors(state: ChapterTwoState, errors: FieldError[]): ChapterTwoState {
  return { ...state, errors };
}

function enterDeath(state: ChapterTwoState, failureId: ChapterTwoFailureId): ChapterTwoState {
  return {
    ...state,
    scene: "death",
    status: { kind: "death", failureId },
    errors: [],
  };
}

function advanceStoryClock(
  state: ChapterTwoState,
  amount: number,
  failureId: ChapterTwoFailureId,
): ChapterTwoState {
  const nextMinute = state.storyClockMinute + amount;
  if (state.deadlineMinute !== null && nextMinute >= state.deadlineMinute) {
    return enterDeath(
      { ...state, storyClockMinute: state.deadlineMinute },
      failureId,
    );
  }
  return { ...state, storyClockMinute: nextMinute };
}

function sceneForObservation(observationId: ChapterTwoObservationId) {
  return CHAPTER_TWO_OBSERVATIONS.find((item) => item.id === observationId)?.scene;
}

function observationCost(observationId: ChapterTwoObservationId) {
  return CHAPTER_TWO_OBSERVATIONS.find((item) => item.id === observationId)?.actionCost ?? 0;
}

function observationNote(observationId: ChapterTwoObservationId) {
  return CHAPTER_TWO_OBSERVATIONS.find((item) => item.id === observationId)?.note ?? "";
}

function observationFailure(scene: ChapterTwoSceneId): ChapterTwoFailureId {
  if (scene === "hometown-map") return "harpoon-volley";
  if (scene === "shield-assembly") return "shield-breach";
  if (scene === "sky-death") return "floor-collapse";
  return "harpoon-volley";
}

function isObservationAllowed(state: ChapterTwoState, observationId: ChapterTwoObservationId) {
  return sceneForObservation(observationId) === state.scene;
}

function validateAftermath(answer: AftermathAnswer): FieldError[] {
  if (answer === "protect-mask") return [];
  return [error(
    "aftermath",
    "shot-reason",
    "DOES_NOT_EXPLAIN_HEART_SHOT",
    "这个解释没有说明：他为什么宁愿承受更久痛苦，也不让子弹接近头部。",
  )];
}

function normalizeStroke(placeIds: readonly PlaceId[]) {
  return unique(placeIds).sort().join("|");
}

function validateHometown(state: ChapterTwoState, direction: "left" | "right"): FieldError[] {
  const errors: FieldError[] = [];

  for (const fact of HOMETOWN_FACTS) {
    if (state.hometown.placements[fact.characterId] !== fact.placeId) {
      errors.push(error(
        "hometown-map",
        `place:${fact.characterId}`,
        "WRONG_PLACE",
        `${fact.characterId === "zhao" ? "赵海博的江苏工作地点" : fact.characterId}的位置与刚才的原话不一致。`,
      ));
    }
  }

  const expected = HOMETOWN_SOLUTION.strokes.map(normalizeStroke).sort();
  const actual = state.hometown.strokes.map(normalizeStroke).sort();
  if (expected.join(",") !== actual.join(",")) {
    errors.push(error(
      "hometown-map",
      "strokes",
      "MAP_STROKES_NOT_CLOSED",
      "这三笔还没有把九个已知地点组成可验证的字形。",
    ));
  }

  if (direction !== "right") {
    errors.push(error(
      "hometown-map",
      "direction",
      "DIRECTION_NOT_SUPPORTED",
      "九个地点没有构成“左”的字形证据。",
    ));
  }

  return errors;
}

function validateShield(state: ChapterTwoState): FieldError[] {
  const errors: FieldError[] = [];
  const smallIds = WEDGE_IDS.filter((id) => id !== "large-decoy");

  if (!state.shield.discardedIds.includes("large-decoy")) {
    errors.push(error(
      "shield-assembly",
      "large-decoy",
      "LARGE_BOARD_BLOCKS_CLOSURE",
      "大桌板占用了第九块小板的位置，锥体无法闭合。",
    ));
  }

  if (smallIds.some((id) => state.shield.placements[id] === undefined)) {
    errors.push(error(
      "shield-assembly",
      "small-wedges",
      "MISSING_SMALL_WEDGE",
      "九块小桌板没有全部进入结构。",
    ));
  }

  const placedSlots = smallIds
    .map((id) => state.shield.placements[id])
    .filter((slot): slot is NonNullable<typeof slot> => slot !== undefined);
  if (new Set(placedSlots).size !== placedSlots.length) {
    errors.push(error(
      "shield-assembly",
      "slots",
      "WEDGES_OVERLAP",
      "两块小桌板占用了同一个位置，结构无法受力。",
    ));
  }

  if (smallIds.some((id) => state.shield.orientations[id] !== "tip-in")) {
    errors.push(error(
      "shield-assembly",
      "orientation",
      "WRONG_WEDGE_ANGLE",
      "仍有桌板与鱼叉近乎垂直，或者在头顶留下开口。",
    ));
  }

  return errors;
}

function rescueErrorFor(actionId: RescueActionId): FieldError {
  const messages: Record<RescueActionId, string> = {
    "pull-han-harpoon": "倒钩会扩大伤口，而且没有解决墙洞回收的绳索。",
    "hold-retracting-rope": "回收力足以撕碎木板，人的力量不能抵消。",
    "knot-opposing-ropes": "现在应先让两根回收绳互相对拉，留下能够切割的鱼叉。",
    "lin-release-knot": "林檎的绳结要在两根绳子开始对拉后才有意义。",
    "li-cut-rope": "还没有留下可用于切割的鱼叉。",
    "qiao-brace-han": "乔家劲需要在李尚武切割的最后关头撑住韩一墨。",
  };
  return {
    ...error("harpoon-rescue", actionId, "RESCUE_SEQUENCE_WRONG", messages[actionId]),
    dangerCost: 1,
  };
}

function validateSkyDeath(answer: SkyDeathAnswer): FieldError[] {
  const errors: FieldError[] = [];
  if (answer.gameType !== "sheep-can-lie") {
    errors.push(error(
      "sky-death",
      "gameType",
      "TRUSTED_SHEEP_TEXT",
      "这套方案仍然把人羊写下的话当成了可靠说明。",
    ));
  }
  if (answer.position !== "under-holes") {
    errors.push(error(
      "sky-death",
      "position",
      "POSITION_DOES_NOT_USE_NINE_HOLES",
      "这个站位没有解释：为什么孔洞和参与者都恰好是九个。",
    ));
  }
  if (answer.boardUse !== "ceiling-anchor") {
    errors.push(error(
      "sky-death",
      "boardUse",
      "HANDLE_UNUSED",
      "这个用途没有利用方板背面的牢固把手。",
    ));
  }
  if (answer.insertion !== "vertical-then-horizontal") {
    errors.push(error(
      "sky-death",
      "insertion",
      "BOARD_CANNOT_LOCK",
      "方板无法以当前角度穿过窄孔并在孔后卡住。",
    ));
  }
  return errors;
}

function matches(tokens: readonly QuestionTokenId[], pattern: readonly QuestionTokenId[]) {
  return tokens.length === pattern.length && tokens.every((token, index) => token === pattern[index]);
}

export function parseQuestion(tokenIds: readonly QuestionTokenId[]): ParsedQuestion {
  if (matches(tokenIds, META_QUESTION_PATTERN)) {
    return {
      kind: "same-answer-meta",
      nextQuestion: { kind: "direct", proposition: "pull-lever" },
    };
  }
  if (matches(tokenIds, DIRECT_PULL_PATTERN)) return { kind: "direct", proposition: "pull-lever" };
  if (matches(tokenIds, DIRECT_SAVE_PATTERN)) return { kind: "direct", proposition: "save-us" };
  if (matches(tokenIds, DIRECT_NEGATED_PATTERN)) return { kind: "direct", proposition: "do-not-pull" };
  return {
    kind: "parse-error",
    fieldId: tokenIds.length === 0 ? "tokens" : `token:${tokenIds.length}`,
    message: "这个句子还没有形成可由“是”或“否”回答的完整逻辑。",
  };
}

export function analyzeQuestion(question: QuestionAst): QuestionBranch[] {
  if (question.kind === "same-answer-meta") {
    return [
      { currentAnswer: "yes", nextAnswer: "yes", pullForced: true },
      { currentAnswer: "no", nextAnswer: "yes", pullForced: true },
    ];
  }
  return [
    { currentAnswer: "yes", nextAnswer: "unconstrained", pullForced: false },
    { currentAnswer: "no", nextAnswer: "unconstrained", pullForced: false },
  ];
}

function isParseError(value: ParsedQuestion): value is QuestionParseError {
  return value.kind === "parse-error";
}

function checkpointState(checkpoint: ChapterTwoCheckpointId): ChapterTwoState {
  const state = emptyState();
  switch (checkpoint) {
    case "c2-a":
      return { ...state, scene: "aftermath", checkpoint, status: { kind: "playing" } };
    case "c2-b":
      return {
        ...state,
        scene: "hometown-map",
        checkpoint,
        deadlineMinute: 75,
        observedIds: ["heart-shot", "preserved-mask", "mask-writing"],
        recordedIds: ["heart-shot", "preserved-mask", "mask-writing"],
        solvedPuzzleIds: ["aftermath"],
      };
    case "c2-c":
      return {
        ...checkpointState("c2-b"),
        scene: "shield-assembly",
        checkpoint,
        storyClockMinute: 72,
        deadlineMinute: 75,
        solvedPuzzleIds: ["aftermath", "hometown-map"],
      };
    case "c2-d":
      return {
        ...checkpointState("c2-c"),
        scene: "harpoon-rescue",
        checkpoint,
        storyClockMinute: 75,
        deadlineMinute: null,
        characterStates: applyCanonicalHarpoonInjuries(initialCharacters()),
        solvedPuzzleIds: ["aftermath", "hometown-map", "shield-assembly"],
      };
    case "c2-e":
      return {
        ...checkpointState("c2-d"),
        scene: "sky-death",
        checkpoint,
        deadlineMinute: 90,
        solvedPuzzleIds: ["aftermath", "hometown-map", "shield-assembly", "harpoon-rescue"],
      };
    case "c2-f":
      return {
        ...checkpointState("c2-e"),
        scene: "yes-no",
        checkpoint,
        storyClockMinute: 90,
        deadlineMinute: null,
        questionCount: 1,
        characterStates: Object.fromEntries(
          Object.entries(applyCanonicalHarpoonInjuries(initialCharacters())).map(([id, character]) => [
            id,
            { ...character, pose: "hanging" },
          ]),
        ) as ChapterTwoState["characterStates"],
        solvedPuzzleIds: ["aftermath", "hometown-map", "shield-assembly", "harpoon-rescue", "sky-death"],
      };
    case "c2-g":
      return {
        ...checkpointState("c2-f"),
        scene: "zodiac-corridor",
        checkpoint,
        questionCount: 3,
        narrativeBeat: 0,
        solvedPuzzleIds: ["aftermath", "hometown-map", "shield-assembly", "harpoon-rescue", "sky-death", "yes-no"],
      };
    case "c2-h":
      return {
        ...checkpointState("c2-g"),
        scene: "termination-reveal",
        checkpoint,
        daoCount: 4,
      };
  }
}

export function initialChapterTwoState(): ChapterTwoState {
  return emptyState("entry");
}

export function sanitizeRestoredState(state: ChapterTwoState): ChapterTwoState {
  if (state.schemaVersion !== 1) return initialChapterTwoState();
  if (state.status.kind === "animating") {
    return { ...state, status: { kind: "playing" } };
  }
  return state;
}

function finishAnimation(state: ChapterTwoState, animationId: ChapterTwoAnimationId): ChapterTwoState {
  if (state.status.kind !== "animating" || state.status.animationId !== animationId) return state;
  switch (animationId) {
    case "mask-writing-reveal":
      return {
        ...checkpointState("c2-b"),
        status: { kind: "animating", animationId: "wall-holes-open" },
      };
    case "wall-holes-open":
      return { ...state, status: { kind: "playing" } };
    case "table-turn-right":
      return { ...state, status: { kind: "animating", animationId: "table-split" } };
    case "table-split":
      return checkpointState("c2-c");
    case "shield-lock":
      return { ...state, status: { kind: "animating", animationId: "harpoon-volley" } };
    case "harpoon-volley":
      return {
        ...checkpointState("c2-d"),
        status: { kind: "animating", animationId: "rope-retract" },
      };
    case "rope-retract":
      return { ...state, status: { kind: "playing" } };
    case "rope-cut-release":
      return {
        ...checkpointState("c2-e"),
        status: { kind: "animating", animationId: "ceiling-holes-open" },
      };
    case "ceiling-holes-open":
      return checkpointState("c2-e");
    case "floor-rise":
      return { ...state, status: { kind: "animating", animationId: "floor-collapse" } };
    case "floor-collapse":
      return checkpointState("c2-f");
    case "snake-lever":
      return {
        ...checkpointState("c2-g"),
        status: { kind: "animating", animationId: "corridor-doors" },
      };
    case "corridor-doors":
      return checkpointState("c2-g");
    case "city-reveal":
      return {
        ...checkpointState("c2-h"),
        scene: "complete",
        status: { kind: "complete" },
      };
  }
}

function applyRescueAction(state: ChapterTwoState, actionId: RescueActionId): ChapterTwoState {
  const expected = CANONICAL_RESCUE_SEQUENCE[state.rescue.step];
  if (actionId !== expected) {
    const next = withErrors(
      { ...state, dangerTicks: state.dangerTicks + 1 },
      [rescueErrorFor(actionId)],
    );
    return next.dangerTicks >= 4 ? enterDeath(next, "han-pinned-to-wall") : next;
  }

  const completedActionIds = appendUnique(state.rescue.completedActionIds, actionId);
  const nextStep = state.rescue.step + 1;
  if (nextStep < CANONICAL_RESCUE_SEQUENCE.length) {
    return addHistory(
      clearErrors({ ...state, rescue: { step: nextStep, completedActionIds } }),
      "救援动作成立，绳索仍在回收。",
      "deduction",
    );
  }

  return {
    ...clearErrors(state),
    rescue: { step: nextStep, completedActionIds },
    dangerTicks: 0,
    solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "harpoon-rescue"),
    status: { kind: "animating", animationId: "rope-cut-release" },
  };
}

function setSkyField(
  state: ChapterTwoState,
  field: keyof SkyDeathAnswer,
  value: string,
): ChapterTwoState {
  const valid: Record<keyof SkyDeathAnswer, readonly string[]> = {
    gameType: ["trust-human-sheep", "sheep-can-lie"],
    position: ["wall", "under-holes"],
    boardUse: ["shield", "floor-cover", "ceiling-anchor"],
    insertion: ["flat", "vertical-then-horizontal"],
  };
  if (!valid[field].includes(value)) return state;
  return {
    ...state,
    skyDeath: { ...state.skyDeath, [field]: value } as SkyDeathAnswer,
    errors: state.errors.filter((item) => item.fieldId !== field),
  };
}

function submitQuestion(state: ChapterTwoState): ChapterTwoState {
  const parsed = parseQuestion(state.yesNo.tokenIds);
  if (isParseError(parsed)) {
    return withErrors(state, [error("yes-no", parsed.fieldId, "QUESTION_PARSE_ERROR", parsed.message)]);
  }

  const branches = analyzeQuestion(parsed);
  const forcesPull = branches.every((branch) => branch.pullForced);
  const nextCount = state.questionCount + 1;
  if (!forcesPull) {
    const next = withErrors(
      {
        ...state,
        questionCount: nextCount,
        yesNo: { ...state.yesNo, branches },
      },
      [error(
        "yes-no",
        "question",
        "UNFORCED_BRANCH",
        "这个问题仍保留了“不拉杆”的合法分支，不能迫使人蛇救人。",
      )],
    );
    return nextCount >= 3 ? enterDeath(next, "yes-no-exhausted") : next;
  }

  return {
    ...clearErrors(state),
    questionCount: nextCount,
    solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "yes-no"),
    yesNo: { ...state.yesNo, branches, solvedText: CANONICAL_META_QUESTION },
    status: { kind: "animating", animationId: "snake-lever" },
  };
}

function advanceNarrative(state: ChapterTwoState): ChapterTwoState {
  if (state.scene === "zodiac-corridor") {
    const nextBeat = state.narrativeBeat + 1;
    if (nextBeat >= CORRIDOR_BEATS.length) {
      return {
        ...state,
        scene: "termination-reveal",
        checkpoint: "c2-h",
        narrativeBeat: 0,
        status: { kind: "animating", animationId: "city-reveal" },
      };
    }
    const next = { ...state, narrativeBeat: nextBeat, daoCount: nextBeat >= HUMAN_DRAGON_DAO_BEAT ? 4 : state.daoCount };
    return addHistory(next, CORRIDOR_BEATS[nextBeat], "result");
  }
  if (state.scene === "termination-reveal") {
    return { ...state, status: { kind: "animating", animationId: "city-reveal" } };
  }
  return state;
}

export function chapterTwoReducer(state: ChapterTwoState, action: ChapterTwoAction): ChapterTwoState {
  if (action.type === "RESTORE") return sanitizeRestoredState(action.state);
  if (action.type === "RETRY_CHECKPOINT") return checkpointState(state.checkpoint);
  if (state.status.kind === "death" || state.status.kind === "complete") return state;
  if (state.status.kind === "animating" && action.type !== "ANIMATION_FINISHED") return state;

  switch (action.type) {
    case "ENTER_CHAPTER":
      return checkpointState("c2-a");
    case "OBSERVE": {
      if (!isObservationAllowed(state, action.observationId)) return state;
      const observedIds = appendUnique(state.observedIds, action.observationId);
      if (observedIds.length === state.observedIds.length) return state;
      const next = advanceStoryClock(
        { ...state, observedIds },
        observationCost(action.observationId),
        observationFailure(state.scene),
      );
      return addHistory(next, observationNote(action.observationId), "observation");
    }
    case "RECORD":
      if (!state.observedIds.includes(action.observationId)) return state;
      return {
        ...state,
        recordedIds: appendUnique(state.recordedIds, action.observationId),
      };
    case "SUBMIT_AFTERMATH": {
      if (state.scene !== "aftermath") return state;
      const errors = validateAftermath(action.answer);
      if (errors.length > 0) {
        const next = advanceStoryClock({ ...state, aftermath: { selectedReason: action.answer } }, 1, "harpoon-volley");
        return withErrors(next, errors.map((item) => ({ ...item, clockCost: 1 })));
      }
      return {
        ...clearErrors(state),
        aftermath: { selectedReason: action.answer },
        solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "aftermath"),
        status: { kind: "animating", animationId: "mask-writing-reveal" },
      };
    }
    case "PLACE_HOMETOWN":
      if (state.scene !== "hometown-map") return state;
      return {
        ...state,
        hometown: {
          ...state.hometown,
          placements: { ...state.hometown.placements, [action.characterId]: action.placeId },
        },
        errors: state.errors.filter((item) => item.fieldId !== `place:${action.characterId}`),
      };
    case "SET_MAP_STROKE":
      if (state.scene !== "hometown-map") return state;
      return {
        ...state,
        hometown: {
          ...state.hometown,
          strokes: state.hometown.strokes.map((stroke, index) => index === action.strokeIndex ? unique(action.placeIds) : stroke) as ChapterTwoState["hometown"]["strokes"],
        },
        errors: state.errors.filter((item) => item.fieldId !== "strokes"),
      };
    case "SUBMIT_HOMETOWN": {
      if (state.scene !== "hometown-map") return state;
      const errors = validateHometown(state, action.direction);
      if (errors.length > 0) {
        const cost = action.direction === "left" ? 2 : 1;
        const next = advanceStoryClock(
          {
            ...state,
            hometown: {
              ...state.hometown,
              direction: action.direction,
              scriptedLeftTurns: action.direction === "left" ? 10 : state.hometown.scriptedLeftTurns,
            },
          },
          cost,
          "harpoon-volley",
        );
        return withErrors(next, errors.map((item) => ({ ...item, clockCost: cost })));
      }
      return {
        ...clearErrors(state),
        storyClockMinute: 72,
        deadlineMinute: 75,
        hometown: { ...state.hometown, direction: "right", committedRightTurns: 100 },
        solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "hometown-map"),
        status: { kind: "animating", animationId: "table-turn-right" },
      };
    }
    case "PLACE_WEDGE":
      if (state.scene !== "shield-assembly") return state;
      return {
        ...state,
        shield: {
          ...state.shield,
          placements: { ...state.shield.placements, [action.wedgeId]: action.slotId },
        },
      };
    case "ROTATE_WEDGE":
      if (state.scene !== "shield-assembly") return state;
      return {
        ...state,
        shield: {
          ...state.shield,
          orientations: { ...state.shield.orientations, [action.wedgeId]: action.orientation },
        },
      };
    case "DISCARD_WEDGE":
      if (state.scene !== "shield-assembly") return state;
      return {
        ...state,
        shield: { ...state.shield, discardedIds: appendUnique(state.shield.discardedIds, action.wedgeId) },
      };
    case "SUBMIT_SHIELD": {
      if (state.scene !== "shield-assembly") return state;
      const errors = validateShield(state);
      if (errors.length > 0) {
        const next = advanceStoryClock(state, 1, "shield-breach");
        return withErrors(next, errors.map((item) => ({ ...item, clockCost: 1 })));
      }
      return {
        ...clearErrors(state),
        storyClockMinute: 75,
        deadlineMinute: null,
        characterStates: applyCanonicalHarpoonInjuries(state.characterStates),
        solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "shield-assembly"),
        status: { kind: "animating", animationId: "shield-lock" },
      };
    }
    case "APPLY_RESCUE_ACTION":
      return state.scene === "harpoon-rescue" ? applyRescueAction(state, action.actionId) : state;
    case "SET_SKY_FIELD":
      return state.scene === "sky-death" ? setSkyField(state, action.field, action.value) : state;
    case "SUBMIT_SKY_DEATH": {
      if (state.scene !== "sky-death") return state;
      const errors = validateSkyDeath(state.skyDeath);
      if (errors.length > 0) {
        const next = advanceStoryClock(state, 2, "floor-collapse");
        return withErrors(next, errors.map((item) => ({ ...item, clockCost: 2 })));
      }
      return {
        ...clearErrors(state),
        storyClockMinute: 90,
        deadlineMinute: null,
        solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "sky-death"),
        status: { kind: "animating", animationId: "floor-rise" },
      };
    }
    case "ADD_QUESTION_TOKEN":
      if (state.scene !== "yes-no" || state.yesNo.tokenIds.length >= 5) return state;
      return {
        ...state,
        yesNo: { ...state.yesNo, tokenIds: [...state.yesNo.tokenIds, action.tokenId] },
        errors: state.errors.filter((item) => item.scope !== "yes-no"),
      };
    case "REMOVE_QUESTION_TOKEN":
      if (state.scene !== "yes-no") return state;
      return {
        ...state,
        yesNo: { ...state.yesNo, tokenIds: state.yesNo.tokenIds.filter((_, index) => index !== action.index) },
      };
    case "CLEAR_QUESTION":
      return state.scene === "yes-no" ? { ...state, yesNo: { ...state.yesNo, tokenIds: [], branches: [] } } : state;
    case "SUBMIT_QUESTION":
      return state.scene === "yes-no" ? submitQuestion(state) : state;
    case "ADVANCE_NARRATIVE":
      return advanceNarrative(state);
    case "ANIMATION_FINISHED":
      return finishAnimation(state, action.animationId);
    default:
      return state;
  }
}

export function checkpointForFailure(failureId: ChapterTwoFailureId): ChapterTwoCheckpointId {
  if (failureId === "harpoon-volley") return "c2-b";
  if (failureId === "shield-breach") return "c2-c";
  if (failureId === "han-pinned-to-wall") return "c2-d";
  if (failureId === "wall-position-crush" || failureId === "floor-collapse") return "c2-e";
  return "c2-f";
}

export function questionText(tokenIds: readonly QuestionTokenId[]) {
  const labels: Record<QuestionTokenId, string> = {
    if: "假如",
    "my-next-question": "我的下一个问题是",
    "will-you-pull": "你会不会拉下拉杆",
    "your-answer": "你的回答会",
    "same-as-this": "跟这个问题一样吗",
    "will-you-not-pull": "你会不会不拉下拉杆",
    "can-you-save-us": "你能救我们吗",
    "is-yes": "回答是吗",
  };
  return tokenIds.map((token) => labels[token]).join("，");
}
