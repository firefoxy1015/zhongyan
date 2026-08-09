import { storyChapterSpec } from "./canon.ts";
import type {
  StoryChapterAction,
  StoryChapterId,
  StoryChapterSpec,
  StoryChapterState,
  StoryFieldError,
  StoryScene,
} from "./types.ts";

function entryId(kind: string, sceneId: string, suffix: string) {
  return `${kind}:${sceneId}:${suffix}`;
}

export function initialStoryChapterState(chapterId: StoryChapterId): StoryChapterState {
  const spec = storyChapterSpec(chapterId);
  return {
    schemaVersion: 1,
    chapterId,
    sceneId: spec.scenes[0].id,
    checkpointSceneId: spec.scenes[0].id,
    status: { kind: "playing" },
    daoCount: spec.initialDao,
    pressure: 0,
    observedIds: [],
    solvedSceneIds: [],
    answers: {},
    errors: [],
    history: [{ id: `entry:${chapterId}`, kind: "result", text: `进入第${chapterId}章：${spec.title}` }],
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

function errorsForScene(state: StoryChapterState, scene: StoryScene): StoryFieldError[] {
  if (!scene.puzzle) return [];
  const missingObservations = scene.puzzle.requiredObservationIds.filter((id) => !state.observedIds.includes(id));
  if (missingObservations.length > 0) {
    return missingObservations.map((id) => {
      const observation = scene.observations.find((item) => item.id === id);
      return { fieldId: `observation:${id}`, message: `先检查“${observation?.label ?? id}”，再提交推演。` };
    });
  }

  return scene.puzzle.fields.flatMap((field) => {
    const value = state.answers[field.id];
    if (!value) return [{ fieldId: field.id, message: `“${field.label}”尚未选择。` }];
    if (value === field.correctValue) return [];
    return [{ fieldId: field.id, message: field.wrongMessages[value] ?? `“${field.label}”与已记录事实冲突。` }];
  });
}

function advance(state: StoryChapterState, spec: StoryChapterSpec) {
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
      status: { kind: "animating", animationId: current.animationId } as const,
      errors: [],
    };
  }

  const daoCount = state.daoCount + (current.daoDeltaOnAdvance ?? 0);
  if (currentIndex >= spec.scenes.length - 1) {
    return {
      ...state,
      daoCount,
      status: { kind: "complete" } as const,
      history: [...state.history, { id: entryId("complete", current.id, String(state.history.length)), kind: "result" as const, text: spec.completionText }],
    };
  }

  const next = spec.scenes[currentIndex + 1];
  return {
    ...state,
    daoCount,
    sceneId: next.id,
    checkpointSceneId: next.id,
    status: { kind: "playing" } as const,
    answers: {},
    errors: [],
    history: [...state.history, { id: entryId("scene", next.id, String(state.history.length)), kind: "result" as const, text: `进入：${next.title}` }],
  };
}

function stateAtCheckpoint(chapterId: StoryChapterId, checkpointSceneId: string) {
  const spec = storyChapterSpec(chapterId);
  const checkpointIndex = Math.max(0, spec.scenes.findIndex((scene) => scene.id === checkpointSceneId));
  const previousScenes = spec.scenes.slice(0, checkpointIndex);
  const daoCount = previousScenes.reduce(
    (value, scene) => value + (scene.daoDeltaOnSolve ?? 0) + (scene.daoDeltaOnAdvance ?? 0),
    spec.initialDao,
  );
  return {
    ...initialStoryChapterState(chapterId),
    sceneId: spec.scenes[checkpointIndex].id,
    checkpointSceneId: spec.scenes[checkpointIndex].id,
    daoCount,
    observedIds: previousScenes.flatMap((scene) => scene.observations.map((observation) => observation.id)),
    solvedSceneIds: previousScenes.filter((scene) => scene.puzzle).map((scene) => scene.id),
    history: [{ id: `retry:${chapterId}:${checkpointSceneId}`, kind: "warning" as const, text: `从检查点“${spec.scenes[checkpointIndex].title}”重新开始。错误已写清楚；死亡保留。` }],
  };
}

export function sanitizeStoryChapterState(value: StoryChapterState, chapterId: StoryChapterId) {
  const spec = storyChapterSpec(chapterId);
  if (value.schemaVersion !== 1 || value.chapterId !== chapterId) return initialStoryChapterState(chapterId);
  if (!spec.scenes.some((scene) => scene.id === value.sceneId)) return initialStoryChapterState(chapterId);
  return {
    ...value,
    daoCount: Number.isFinite(value.daoCount) ? Math.max(0, Math.floor(value.daoCount)) : spec.initialDao,
    pressure: Number.isFinite(value.pressure) ? Math.max(0, Math.floor(value.pressure)) : 0,
    observedIds: Array.isArray(value.observedIds) ? value.observedIds.filter((id): id is string => typeof id === "string") : [],
    solvedSceneIds: Array.isArray(value.solvedSceneIds) ? value.solvedSceneIds.filter((id): id is string => typeof id === "string") : [],
    answers: value.answers && typeof value.answers === "object" ? value.answers : {},
    errors: Array.isArray(value.errors) ? value.errors : [],
    history: Array.isArray(value.history) ? value.history.slice(-80) : [],
  };
}

export function storyChapterReducer(state: StoryChapterState, action: StoryChapterAction): StoryChapterState {
  const spec = storyChapterSpec(state.chapterId);
  const scene = sceneForState(state, spec);

  if (action.type === "RESTORE") return sanitizeStoryChapterState(action.state, state.chapterId);
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
      history: [...state.history, { id: entryId("observation", scene.id, observation.id), kind: "observation", text: `${observation.label}：${observation.text}` }],
    };
  }

  if (action.type === "SET_FIELD") {
    return {
      ...state,
      answers: { ...state.answers, [action.fieldId]: action.value },
      errors: state.errors.filter((error) => error.fieldId !== action.fieldId),
    };
  }

  if (action.type === "SUBMIT_PUZZLE") {
    if (!scene.puzzle || state.solvedSceneIds.includes(scene.id)) return state;
    const fatalRule = fatalRuleFor(scene, state.answers);
    if (fatalRule) {
      return {
        ...state,
        status: { kind: "death", failureId: fatalRule.failureId, reason: fatalRule.reason, checkpointSceneId: fatalRule.checkpointSceneId },
        errors: [{ fieldId: fatalRule.fieldId, message: fatalRule.reason }],
        history: [...state.history, { id: entryId("death", scene.id, fatalRule.failureId), kind: "warning", text: fatalRule.reason }],
      };
    }

    const errors = errorsForScene(state, scene);
    if (errors.length > 0) {
      return {
        ...state,
        pressure: state.pressure + scene.puzzle.errorCost,
        errors,
        history: [...state.history, ...errors.map((error, index) => ({ id: entryId("error", scene.id, `${state.pressure}:${index}`), kind: "warning" as const, text: error.message }))],
      };
    }

    return {
      ...state,
      daoCount: state.daoCount + (scene.daoDeltaOnSolve ?? 0),
      solvedSceneIds: [...state.solvedSceneIds, scene.id],
      errors: [],
      status: scene.animationId ? { kind: "animating", animationId: scene.animationId } : { kind: "playing" },
      history: [...state.history, { id: entryId("solve", scene.id, String(state.history.length)), kind: "deduction", text: scene.puzzle.solvedText }],
    };
  }

  if (action.type === "ADVANCE") return advance(state, spec);
  return state;
}
