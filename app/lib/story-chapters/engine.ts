import { storyChapterSpec } from "./canon.ts";
import type {
  StoryChapterAction,
  StoryChapterId,
  StoryChapterSpec,
  StoryChapterState,
  StoryDaoDelta,
  StoryDaoLedger,
  StoryFieldError,
  StoryHistoryEntry,
  StoryScene,
  StoryStatus,
} from "./types.ts";

const DAO_ACCOUNTS = ["qixiaParty", "liZhang", "oldLu", "burned"] as const;
const HISTORY_KINDS = ["observation", "warning", "deduction", "result"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function appendHistory(
  state: StoryChapterState,
  entries: readonly Omit<StoryHistoryEntry, "id">[],
  idStem: string,
) {
  const history = [
    ...state.history,
    ...entries.map((entry, index) => ({
      ...entry,
      id: `${idStem}:${state.eventSequence + index}`,
    })),
  ].slice(-80);
  return { history, eventSequence: state.eventSequence + entries.length };
}

export function applyDaoDelta(ledger: StoryDaoLedger, delta?: StoryDaoDelta): StoryDaoLedger {
  if (!delta) return ledger;
  const next = { ...ledger };
  for (const account of DAO_ACCOUNTS) {
    const change = delta[account] ?? 0;
    if (!Number.isInteger(change)) throw new Error(`Invalid Dao delta for ${account}: ${change}`);
    next[account] += change;
    if (next[account] < 0) throw new Error(`Dao account ${account} cannot become negative.`);
  }
  return next;
}

function daoLedgersEqual(left: StoryDaoLedger, right: StoryDaoLedger) {
  return DAO_ACCOUNTS.every((account) => left[account] === right[account]);
}

export function initialStoryChapterState(chapterId: StoryChapterId): StoryChapterState {
  const spec = storyChapterSpec(chapterId);
  return {
    schemaVersion: 2,
    chapterId,
    sceneId: spec.scenes[0].id,
    checkpointSceneId: spec.scenes[0].id,
    status: { kind: "playing" },
    daoLedger: { ...spec.initialDaoLedger },
    pressure: 0,
    observedIds: [],
    solvedSceneIds: [],
    answers: {},
    errors: [],
    history: [{ id: `entry:${chapterId}:0`, kind: "result", text: `进入第${chapterId}章：${spec.title}` }],
    eventSequence: 1,
  };
}

export function sceneForState(state: StoryChapterState, spec = storyChapterSpec(state.chapterId)) {
  return spec.scenes.find((scene) => scene.id === state.sceneId) ?? spec.scenes[0];
}

function fatalRuleFor(scene: StoryScene, answers: Record<string, string>) {
  return scene.puzzle?.fatalRules?.find((rule) => {
    if (answers[rule.fieldId] !== rule.value) return false;
    return !rule.when || Object.entries(rule.when).every(([fieldId, value]) => answers[fieldId] === value);
  });
}

function prerequisiteErrors(state: StoryChapterState, scene: StoryScene): StoryFieldError[] {
  if (!scene.puzzle) return [];
  const missingObservations = scene.puzzle.requiredObservationIds.filter((id) => !state.observedIds.includes(id));
  if (missingObservations.length > 0) {
    return missingObservations.map((id) => {
      const observation = scene.observations.find((item) => item.id === id);
      return { fieldId: `observation:${id}`, message: `先检查“${observation?.label ?? id}”，再提交推演。` };
    });
  }
  return scene.puzzle.fields.flatMap((field) => state.answers[field.id]
    ? []
    : [{ fieldId: field.id, message: `“${field.label}”尚未选择。` }]);
}

function answerErrors(state: StoryChapterState, scene: StoryScene): StoryFieldError[] {
  if (!scene.puzzle) return [];
  return scene.puzzle.fields.flatMap((field) => {
    const value = state.answers[field.id];
    if (value === field.correctValue) return [];
    return [{ fieldId: field.id, message: field.wrongMessages[value] ?? `“${field.label}”与已记录事实冲突。` }];
  });
}

function ledgerAfterFinishedScenes(spec: StoryChapterSpec, count: number) {
  return spec.scenes.slice(0, count).reduce(
    (ledger, scene) => applyDaoDelta(
      applyDaoDelta(ledger, scene.daoLedgerDeltaOnSolve),
      scene.daoLedgerDeltaOnAdvance,
    ),
    { ...spec.initialDaoLedger },
  );
}

function advance(state: StoryChapterState, spec: StoryChapterSpec): StoryChapterState {
  const currentIndex = spec.scenes.findIndex((scene) => scene.id === state.sceneId);
  const current = spec.scenes[currentIndex] ?? spec.scenes[0];
  if (current.puzzle && !state.solvedSceneIds.includes(current.id)) {
    return {
      ...state,
      errors: [{ fieldId: "scene", message: "这页推演还没有闭合，不能进入下一幕。" }],
    };
  }

  if (!current.puzzle && current.animationId && !state.solvedSceneIds.includes(current.id)) {
    return {
      ...state,
      solvedSceneIds: [...state.solvedSceneIds, current.id],
      status: { kind: "animating", animationId: current.animationId },
      errors: [],
    };
  }

  const daoLedger = applyDaoDelta(state.daoLedger, current.daoLedgerDeltaOnAdvance);
  if (currentIndex >= spec.scenes.length - 1) {
    if (!daoLedgersEqual(daoLedger, spec.completionDaoLedger)) {
      throw new Error(
        `Chapter ${spec.id} Dao ledger mismatch: got ${JSON.stringify(daoLedger)}, expected ${JSON.stringify(spec.completionDaoLedger)}.`,
      );
    }
    return {
      ...state,
      daoLedger,
      status: { kind: "complete" },
      ...appendHistory(state, [{ kind: "result", text: spec.completionText }], `complete:${current.id}`),
    };
  }

  const next = spec.scenes[currentIndex + 1];
  return {
    ...state,
    daoLedger,
    sceneId: next.id,
    checkpointSceneId: next.id,
    status: { kind: "playing" },
    answers: {},
    errors: [],
    ...appendHistory(state, [{ kind: "result", text: `进入：${next.title}` }], `scene:${next.id}`),
  };
}

function stateAtCheckpoint(chapterId: StoryChapterId, checkpointSceneId: string): StoryChapterState {
  const spec = storyChapterSpec(chapterId);
  const checkpointIndex = Math.max(0, spec.scenes.findIndex((scene) => scene.id === checkpointSceneId));
  const previousScenes = spec.scenes.slice(0, checkpointIndex);
  const base = initialStoryChapterState(chapterId);
  return {
    ...base,
    sceneId: spec.scenes[checkpointIndex].id,
    checkpointSceneId: spec.scenes[checkpointIndex].id,
    daoLedger: ledgerAfterFinishedScenes(spec, checkpointIndex),
    observedIds: previousScenes.flatMap((scene) => scene.observations.map((observation) => observation.id)),
    solvedSceneIds: previousScenes.map((scene) => scene.id),
    history: [{
      id: `retry:${chapterId}:${checkpointSceneId}:0`,
      kind: "warning",
      text: `从检查点“${spec.scenes[checkpointIndex].title}”重新开始。错误提示已保留在死亡原因中。`,
    }],
    eventSequence: 1,
  };
}

function sanitizeStringArray(value: unknown, allowed: ReadonlySet<string>) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item)))];
}

function sanitizeHistory(value: unknown): StoryHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.id !== "string" || typeof item.text !== "string") return [];
    if (!HISTORY_KINDS.includes(item.kind as StoryHistoryEntry["kind"])) return [];
    return [{ id: item.id, text: item.text.slice(0, 500), kind: item.kind as StoryHistoryEntry["kind"] }];
  }).slice(-80);
}

function sanitizeErrors(value: unknown): StoryFieldError[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => isRecord(item) && typeof item.fieldId === "string" && typeof item.message === "string"
    ? [{ fieldId: item.fieldId, message: item.message.slice(0, 300) }]
    : []).slice(-20);
}

function sanitizeStatus(
  value: unknown,
  scene: StoryScene,
  checkpointSceneId: string,
  solvedSceneIds: readonly string[],
): StoryStatus {
  if (!isRecord(value) || typeof value.kind !== "string") return { kind: "playing" };
  if (value.kind === "complete") return { kind: "complete" };
  if (value.kind === "animating"
    && typeof value.animationId === "string"
    && value.animationId === scene.animationId
    && solvedSceneIds.includes(scene.id)) {
    return { kind: "animating", animationId: scene.animationId };
  }
  if (value.kind === "death"
    && typeof value.failureId === "string"
    && typeof value.reason === "string") {
    return {
      kind: "death",
      failureId: value.failureId,
      reason: value.reason.slice(0, 500),
      checkpointSceneId,
    };
  }
  return { kind: "playing" };
}

function canonicalLedgerForRestoredState(
  spec: StoryChapterSpec,
  sceneIndex: number,
  solvedSceneIds: readonly string[],
  status: StoryStatus,
) {
  if (status.kind === "complete") return { ...spec.completionDaoLedger };
  let ledger = ledgerAfterFinishedScenes(spec, sceneIndex);
  const current = spec.scenes[sceneIndex];
  if (current.puzzle && solvedSceneIds.includes(current.id)) {
    ledger = applyDaoDelta(ledger, current.daoLedgerDeltaOnSolve);
  }
  return ledger;
}

export function sanitizeStoryChapterState(value: unknown, chapterId: StoryChapterId): StoryChapterState {
  const spec = storyChapterSpec(chapterId);
  if (!isRecord(value) || value.chapterId !== chapterId || ![1, 2].includes(value.schemaVersion as number)) {
    return initialStoryChapterState(chapterId);
  }

  const requestedSceneId = typeof value.sceneId === "string" ? value.sceneId : "";
  let sceneIndex = spec.scenes.findIndex((scene) => scene.id === requestedSceneId);
  if (sceneIndex < 0) return initialStoryChapterState(chapterId);

  const reachableScenes = spec.scenes.slice(0, sceneIndex + 1);
  const reachableSceneIds = new Set(reachableScenes.map((scene) => scene.id));
  const reachableObservationIds = new Set(
    reachableScenes.flatMap((scene) => scene.observations.map((observation) => observation.id)),
  );
  const solvedSceneIds = sanitizeStringArray(value.solvedSceneIds, reachableSceneIds);
  const checkpointSceneId = typeof value.checkpointSceneId === "string" && reachableSceneIds.has(value.checkpointSceneId)
    ? value.checkpointSceneId
    : spec.scenes[sceneIndex].id;
  const statusCheckpointSceneId = isRecord(value.status)
    && typeof value.status.checkpointSceneId === "string"
    && reachableSceneIds.has(value.status.checkpointSceneId)
    ? value.status.checkpointSceneId
    : checkpointSceneId;
  let scene = spec.scenes[sceneIndex];
  let status = sanitizeStatus(value.status, scene, statusCheckpointSceneId, solvedSceneIds);

  if (status.kind === "complete") {
    sceneIndex = spec.scenes.length - 1;
    scene = spec.scenes[sceneIndex];
  }

  const answers: Record<string, string> = {};
  if (isRecord(value.answers) && scene.puzzle) {
    for (const field of scene.puzzle.fields) {
      const candidate = value.answers[field.id];
      if (typeof candidate === "string" && field.options.some((option) => option.value === candidate)) {
        answers[field.id] = candidate;
      }
    }
  }

  const history = sanitizeHistory(value.history);
  const pressure = Number.isFinite(value.pressure)
    ? Math.min(spec.pressureLimit, Math.max(0, Math.floor(value.pressure as number)))
    : 0;
  if (pressure >= spec.pressureLimit && (status.kind === "playing" || status.kind === "animating")) {
    status = {
      kind: "death",
      failureId: `pressure-${scene.id}`,
      reason: `推演压力已达到 ${spec.pressureLimit}/${spec.pressureLimit}。`,
      checkpointSceneId: scene.id,
    };
  }

  return {
    schemaVersion: 2,
    chapterId,
    sceneId: scene.id,
    checkpointSceneId: status.kind === "complete"
      ? scene.id
      : status.kind === "death"
        ? status.checkpointSceneId
        : checkpointSceneId,
    status,
    daoLedger: canonicalLedgerForRestoredState(spec, sceneIndex, solvedSceneIds, status),
    pressure,
    observedIds: sanitizeStringArray(value.observedIds, reachableObservationIds),
    solvedSceneIds,
    answers,
    errors: sanitizeErrors(value.errors),
    history,
    eventSequence: Number.isInteger(value.eventSequence) && (value.eventSequence as number) >= 0
      ? Math.max(value.eventSequence as number, history.length)
      : history.length,
  };
}

export function storyChapterReducer(state: StoryChapterState, action: StoryChapterAction): StoryChapterState {
  const spec = storyChapterSpec(state.chapterId);
  const scene = sceneForState(state, spec);

  if (action.type === "RESTORE") return sanitizeStoryChapterState(action.state, action.state.chapterId);
  if (action.type === "ENTER") return state;
  if (action.type === "RETRY_CHECKPOINT") {
    if (state.status.kind !== "death") return state;
    return stateAtCheckpoint(state.chapterId, state.status.checkpointSceneId);
  }
  if (state.status.kind === "death" || state.status.kind === "complete") return state;
  if (action.type === "ANIMATION_FINISHED") {
    if (state.status.kind !== "animating" || state.status.animationId !== action.animationId) return state;
    const finished = { ...state, status: { kind: "playing" } as const };
    return scene.puzzle ? finished : advance(finished, spec);
  }
  if (state.status.kind === "animating") return state;

  if (action.type === "OBSERVE") {
    const observation = scene.observations.find((item) => item.id === action.observationId);
    if (!observation || state.observedIds.includes(observation.id)) return state;
    return {
      ...state,
      observedIds: [...state.observedIds, observation.id],
      ...appendHistory(state, [{ kind: "observation", text: `${observation.label}：${observation.text}` }], `observation:${scene.id}`),
    };
  }

  if (action.type === "SET_FIELD") {
    const field = scene.puzzle?.fields.find((item) => item.id === action.fieldId);
    if (!field || !field.options.some((option) => option.value === action.value)) return state;
    return {
      ...state,
      answers: { ...state.answers, [action.fieldId]: action.value },
      errors: state.errors.filter((error) => error.fieldId !== action.fieldId),
    };
  }

  if (action.type === "SUBMIT_PUZZLE") {
    if (!scene.puzzle || state.solvedSceneIds.includes(scene.id)) return state;

    const prerequisites = prerequisiteErrors(state, scene);
    if (prerequisites.length > 0) return failedAttempt(state, scene, spec, prerequisites);

    const fatalRule = fatalRuleFor(scene, state.answers);
    if (fatalRule) {
      return {
        ...state,
        status: {
          kind: "death",
          failureId: fatalRule.failureId,
          reason: fatalRule.reason,
          checkpointSceneId: fatalRule.checkpointSceneId,
        },
        errors: [{ fieldId: fatalRule.fieldId, message: fatalRule.reason }],
        ...appendHistory(state, [{ kind: "warning", text: fatalRule.reason }], `death:${scene.id}:${fatalRule.failureId}`),
      };
    }

    const errors = answerErrors(state, scene);
    if (errors.length > 0) return failedAttempt(state, scene, spec, errors);

    return {
      ...state,
      daoLedger: applyDaoDelta(state.daoLedger, scene.daoLedgerDeltaOnSolve),
      solvedSceneIds: [...state.solvedSceneIds, scene.id],
      errors: [],
      status: scene.animationId ? { kind: "animating", animationId: scene.animationId } : { kind: "playing" },
      ...appendHistory(state, [{ kind: "deduction", text: scene.puzzle.solvedText }], `solve:${scene.id}`),
    };
  }

  if (action.type === "ADVANCE") return advance(state, spec);
  return state;
}

function failedAttempt(
  state: StoryChapterState,
  scene: StoryScene,
  spec: StoryChapterSpec,
  errors: StoryFieldError[],
): StoryChapterState {
  const pressure = Math.min(spec.pressureLimit, state.pressure + (scene.puzzle?.errorCost ?? 0));
  const reachedLimit = pressure >= spec.pressureLimit;
  const reason = `推演压力达到 ${pressure}/${spec.pressureLimit}。最后一次错误：${errors.map((error) => error.message).join("；")}`;
  return {
    ...state,
    pressure,
    errors,
    status: reachedLimit
      ? { kind: "death", failureId: `pressure-${scene.id}`, reason, checkpointSceneId: scene.id }
      : state.status,
    ...appendHistory(
      state,
      errors.map((error) => ({ kind: "warning" as const, text: error.message })),
      `error:${scene.id}`,
    ),
  };
}
