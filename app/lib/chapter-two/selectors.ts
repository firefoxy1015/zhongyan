import { CHARACTER_NAMES, CORRIDOR_BEATS, FAILURE_PRESENTATION } from "./canon.ts";
import type {
  ChapterTwoSceneId,
  ChapterTwoState,
  FieldError,
  InjuryId,
} from "./types.ts";

export interface InjurySummary {
  characterId: keyof typeof CHARACTER_NAMES;
  name: string;
  injuries: InjuryId[];
}

export interface ChapterTwoHudView {
  chapterLabel: string;
  trialLabel: string;
  objective: string;
  clockLabel: string | null;
  questionLabel: string | null;
  daoCount: number;
  injuries: InjurySummary[];
}

export interface ChapterTwoView {
  hud: ChapterTwoHudView;
  activeErrors: readonly FieldError[];
  failure: ReturnType<typeof selectFailure>;
}

function clockLabel(minute: number) {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function sceneText(scene: ChapterTwoSceneId, state: ChapterTwoState) {
  switch (scene) {
    case "entry":
      return { trial: "面试房 / 后半场", objective: "第一章通关后，继续检查人羊留下的现场。" };
    case "aftermath":
      return { trial: "面具内侧", objective: "先解释人羊为什么朝心脏开枪。" };
    case "hometown-map":
      return { trial: "雨后春笋 / 家乡", objective: "把九个地点落到地图上，判断桌面该往哪边转。" };
    case "shield-assembly":
      return { trial: "雨后春笋 / 鱼叉雨", objective: "用九块小桌板闭合出能承受鱼叉的结构。" };
    case "harpoon-rescue":
      return { trial: "雨后 / 留叉", objective: "在鱼叉被回收前留下工具，救下韩一墨。" };
    case "sky-death":
      return { trial: "天降死亡", objective: "别照着人羊的文字站位；找出九孔与方板的用途。" };
    case "yes-no":
      return { trial: "是与非", objective: "还剩两问。构造一个不论回答什么都能迫使人蛇拉杆的问题。" };
    case "zodiac-corridor":
      return { trial: "走廊 / 生肖", objective: CORRIDOR_BEATS[state.narrativeBeat] ?? "继续向出口走。" };
    case "termination-reveal":
      return { trial: "终焉之地", objective: "门后的世界正在显现。" };
    case "complete":
      return { trial: "第二章完成", objective: "九人第一次看见了终焉之地。" };
    case "death":
      return { trial: "制裁", objective: "从当前检查点重试。" };
  }
}

export function selectInjuries(state: ChapterTwoState): InjurySummary[] {
  return Object.entries(state.characterStates)
    .filter(([, character]) => character.injuries.length > 0)
    .map(([characterId, character]) => ({
      characterId: characterId as keyof typeof CHARACTER_NAMES,
      name: CHARACTER_NAMES[characterId as keyof typeof CHARACTER_NAMES],
      injuries: character.injuries,
    }));
}

export function selectFailure(state: ChapterTwoState) {
  return state.status.kind === "death" ? FAILURE_PRESENTATION[state.status.failureId] : null;
}

export function selectChapterTwoView(state: ChapterTwoState): ChapterTwoView {
  const text = sceneText(state.scene, state);
  return {
    hud: {
      chapterLabel: "第二章 / 四面杀机",
      trialLabel: text.trial,
      objective: text.objective,
      clockLabel: state.deadlineMinute === null ? null : clockLabel(state.storyClockMinute),
      questionLabel: state.scene === "yes-no" ? `已用 ${state.questionCount}/3 问` : null,
      daoCount: state.daoCount,
      injuries: selectInjuries(state),
    },
    activeErrors: state.errors,
    failure: selectFailure(state),
  };
}
