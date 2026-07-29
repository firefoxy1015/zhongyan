"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import {
  CHARACTER_NAMES,
  CHAPTER_TWO_OBSERVATIONS,
  CORRIDOR_BEATS,
  HOMETOWN_FACTS,
  PLACE_LABELS,
  PLACE_POINTS,
  QUESTION_TOKEN_LABELS,
  WEDGE_IDS,
  WEDGE_SLOT_IDS,
} from "../../lib/chapter-two/canon.ts";
import {
  ChapterTwoAudioDirector,
  nextChapterTwoAudioState,
  type ChapterTwoBgmId,
} from "../../lib/chapter-two/audio.ts";
import { ANIMATION_SPECS, animationDuration } from "../../lib/chapter-two/animation.ts";
import { assetFor, SCENE_BACKGROUND_ASSET } from "../../lib/chapter-two/assets.ts";
import { chapterTwoReducer, initialChapterTwoState } from "../../lib/chapter-two/engine.ts";
import {
  canEnterChapterTwo,
  createFreshChapterTwoSave,
  loadSoloSave,
  saveChapterTwo,
} from "../../lib/chapter-two/save.ts";
import { selectChapterTwoView } from "../../lib/chapter-two/selectors.ts";
import type { ChapterTwoVoiceLineId } from "../../lib/chapter-two/voice-lines.ts";
import type {
  AftermathAnswer,
  ChapterTwoAction,
  ChapterTwoAnimationId,
  ChapterTwoObservationId,
  CharacterId,
  PlaceId,
  QuestionTokenId,
  RescueActionId,
  SkyDeathAnswer,
  WedgeId,
  WedgeOrientation,
  WedgeSlotId,
} from "../../lib/chapter-two/types.ts";
import CinematicOverlay from "./CinematicOverlay";
import SceneDialogue from "./SceneDialogue";
import styles from "./chapter-two.module.css";

type StageCharacterId = CharacterId | "renshe" | "renlong";

const CHARACTER_ART: Record<StageCharacterId, string> = {
  qixia: "/art/qixia-v1.png",
  qiao: "/art/qiaojiajin-v1.png",
  tiantian: "/art/tiantian-v2.png",
  xiao: "/art/xiaoran-v1.png",
  zhao: "/art/zhaohaibo-v1.png",
  han: "/art/hanyimo-v1.png",
  zhang: "/art/zhangchenze-v1.png",
  li: "/art/lishangwu-v1.png",
  lin: "/art/linqin-v1.png",
  renshe: "/art/chapter-02/renshe-v1.png",
  renlong: "/art/chapter-02/renlong-v1.png",
};

const STAGE_CHARACTER_NAMES: Record<StageCharacterId, string> = {
  ...CHARACTER_NAMES,
  renshe: "人蛇",
  renlong: "人龙",
};

const SKY_CHOICES: ReadonlyArray<{
  field: keyof SkyDeathAnswer;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}> = [
  {
    field: "gameType",
    label: "先判断谁的话可以作为规则",
    options: [
      { value: "trust-human-sheep", label: "人羊留下文字，按字面执行" },
      { value: "sheep-can-lie", label: "人羊的文字可能在诱导站位" },
    ],
  },
  {
    field: "position",
    label: "九人要把身体放在哪里",
    options: [
      { value: "wall", label: "全部贴住墙面" },
      { value: "under-holes", label: "九人各守住一个天花孔下方" },
    ],
  },
  {
    field: "boardUse",
    label: "九块方板的把手要怎么利用",
    options: [
      { value: "shield", label: "拼成地面盾牌" },
      { value: "floor-cover", label: "盖住正在下沉的地板" },
      { value: "ceiling-anchor", label: "卡在孔后，成为悬挂支点" },
    ],
  },
  {
    field: "insertion",
    label: "方板怎样进入窄孔",
    options: [
      { value: "flat", label: "平着向上推" },
      { value: "vertical-then-horizontal", label: "先竖着穿过，再横向卡住" },
    ],
  },
];

const RESCUE_ACTIONS: ReadonlyArray<{ id: RescueActionId; title: string; detail: string }> = [
  { id: "knot-opposing-ropes", title: "让两根回收绳对拉", detail: "把墙洞的回收力变成互相牵制。" },
  { id: "lin-release-knot", title: "林檎解开绳结", detail: "给切割动作留下唯一的空当。" },
  { id: "li-cut-rope", title: "李尚武割断绳索", detail: "利用留下的鱼叉完成切割。" },
  { id: "qiao-brace-han", title: "乔家劲撑住韩一墨", detail: "在切断的瞬间稳住被倒钩钉住的人。" },
  { id: "pull-han-harpoon", title: "直接拔出韩一墨的鱼叉", detail: "看似最快，但倒钩会扩大伤口。" },
  { id: "hold-retracting-rope", title: "徒手拽住回收绳", detail: "先确认人的力量能否对抗机关。" },
];

function bgmForScene(scene: ReturnType<typeof initialChapterTwoState>["scene"]): ChapterTwoBgmId {
  if (scene === "harpoon-rescue" || scene === "sky-death" || scene === "yes-no") return "harpoon-crisis";
  if (scene === "termination-reveal" || scene === "complete") return "termination-reveal";
  return "room-tension";
}

function observationById(id: ChapterTwoObservationId) {
  return CHAPTER_TWO_OBSERVATIONS.find((item) => item.id === id)!;
}

export default function ChapterTwoGame() {
  const [state, dispatch] = useReducer(chapterTwoReducer, undefined, initialChapterTwoState);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lastAnimationId, setLastAnimationId] = useState<ChapterTwoAnimationId | null>(null);
  const [replayAnimationId, setReplayAnimationId] = useState<ChapterTwoAnimationId | null>(null);
  const [activeVoiceLineId, setActiveVoiceLineId] = useState<ChapterTwoVoiceLineId | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const audioRef = useRef<ChapterTwoAudioDirector | null>(null);
  const view = useMemo(() => selectChapterTwoView(state), [state]);

  useEffect(() => {
    const audio = new ChapterTwoAudioDirector();
    audioRef.current = audio;
    return () => audio.stop();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hydrationTimer = window.setTimeout(() => {
      if (!canEnterChapterTwo(window.localStorage)) {
        setLocked(true);
        setReady(true);
        return;
      }
      const save = loadSoloSave(window.localStorage);
      if (save?.chapterTwo && save.chapterTwo.scene !== "entry") dispatch({ type: "RESTORE", state: save.chapterTwo });
      else {
        createFreshChapterTwoSave(window.localStorage);
        dispatch({ type: "ENTER_CHAPTER" });
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!ready || locked || typeof window === "undefined") return;
    saveChapterTwo(window.localStorage, state);
  }, [locked, ready, state]);

  useEffect(() => {
    if (!audioEnabled) return;
    void audioRef.current?.start(bgmForScene(state.scene));
  }, [audioEnabled, state.scene]);

  useEffect(() => {
    if (state.status.kind !== "animating") return;
    const animationId = state.status.animationId;
    for (const sfxId of ANIMATION_SPECS[animationId].sfxIds) audioRef.current?.playSfx(sfxId);
    const rememberFrame = window.requestAnimationFrame(() => setLastAnimationId(animationId));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(
      () => dispatch({ type: "ANIMATION_FINISHED", animationId }),
      animationDuration(animationId, reducedMotion),
    );
    return () => {
      window.cancelAnimationFrame(rememberFrame);
      window.clearTimeout(timeout);
    };
  }, [state.status]);

  useEffect(() => {
    if (!replayAnimationId) return;
    for (const sfxId of ANIMATION_SPECS[replayAnimationId].sfxIds) audioRef.current?.playSfx(sfxId);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(
      () => setReplayAnimationId(null),
      animationDuration(replayAnimationId, reducedMotion),
    );
    return () => window.clearTimeout(timeout);
  }, [replayAnimationId]);

  const beginAudio = useCallback(() => {
    setAudioEnabled(true);
    void audioRef.current?.start(bgmForScene(state.scene));
  }, [state.scene]);

  const act = useCallback((action: ChapterTwoAction, sound?: "clock" | "chain" | "wood" | "impact" | "door" | "bell") => {
    beginAudio();
    if (sound) audioRef.current?.hit(sound);
    dispatch(action);
  }, [beginAudio]);

  const toggleMuted = () => {
    const next = nextChapterTwoAudioState(audioEnabled, muted);
    setAudioEnabled(next.audioEnabled);
    setMuted(next.muted);
    audioRef.current?.setMuted(next.muted);
    if (!next.muted) void audioRef.current?.start(bgmForScene(state.scene));
  };

  const playVoiceLine = (lineId: ChapterTwoVoiceLineId) => {
    if (activeVoiceLineId === lineId) {
      audioRef.current?.stopVoice();
      setActiveVoiceLineId(null);
      return;
    }
    beginAudio();
    setVoiceError(null);
    void audioRef.current?.playVoice(
      lineId,
      () => setActiveVoiceLineId(lineId),
      () => setActiveVoiceLineId(null),
      () => {
        setActiveVoiceLineId(null);
        setVoiceError("固定语音文件载入失败；系统不会临时换音色或重新生成。");
      },
    );
  };

  const liveAnimationId = state.status.kind === "animating" ? state.status.animationId : null;
  const visibleAnimationId = liveAnimationId ?? replayAnimationId;
  const sceneAssetId = SCENE_BACKGROUND_ASSET[state.scene];
  const stageStyle = sceneAssetId
    ? { "--chapter-two-scene": `url("${assetFor(sceneAssetId).src}")` } as CSSProperties
    : undefined;

  const skipVisibleAnimation = () => {
    if (liveAnimationId) dispatch({ type: "ANIMATION_FINISHED", animationId: liveAnimationId });
    else setReplayAnimationId(null);
  };

  if (!ready) {
    return <main className={styles.loading}><p>正在读取单机档案……</p></main>;
  }

  if (locked) {
    return (
      <main className={styles.locked}>
        <section>
          <p>第二章 / 锁定</p>
          <h1>先完成「说谎者」</h1>
          <span>第二章只读取第一章的单机结算档，不提供跳关入口。</span>
          <Link href="/">回到第一章</Link>
        </section>
      </main>
    );
  }

  if (state.status.kind === "death") {
    const failure = view.failure!;
    return (
      <main className={styles.death}>
        <section>
          <p>制裁 / {failure.checkpoint.toUpperCase()}</p>
          <h1>{failure.title}</h1>
          <p>{failure.description}</p>
          <p className={styles.deathRule}>错误已写清楚；死亡保留。你会回到当前检查点，而不是跳过这段推演。</p>
          <button onClick={() => act({ type: "RETRY_CHECKPOINT" }, "clock")}>从检查点重试</button>
        </section>
      </main>
    );
  }

  return (
    <main className={`${styles.game} ${styles[`scene_${state.scene}`]}`}>
      <header className={styles.hud}>
        <div className={styles.hudTitle}>
          <span>{view.hud.chapterLabel}</span>
          <strong>{view.hud.trialLabel}</strong>
        </div>
        <p>{view.hud.objective}</p>
        <div className={styles.hudStats}>
          {view.hud.clockLabel && <span>座钟 {view.hud.clockLabel}</span>}
          {view.hud.questionLabel && <span>{view.hud.questionLabel}</span>}
          {view.hud.daoCount > 0 && <span>道 × {view.hud.daoCount}</span>}
          {lastAnimationId && state.status.kind !== "animating" && <button onClick={() => { beginAudio(); setReplayAnimationId(lastAnimationId); }}>重看动画</button>}
          <button aria-pressed={audioEnabled && !muted} onClick={toggleMuted}>
            {muted || !audioEnabled ? "开启声场" : "声场开启"}
          </button>
        </div>
      </header>

      <section className={styles.stage} aria-live="polite" style={stageStyle}>
        <div className={styles.stageTexture} aria-hidden="true" />
        <CharacterLayer state={state} />
        <article className={styles.storyPanel}>
          <SceneTitle scene={state.scene} />
          <SceneDialogue activeLineId={activeVoiceLineId} error={voiceError} onPlay={playVoiceLine} state={state} />
          <SceneBody state={state} act={act} />
        </article>
        {visibleAnimationId && <CinematicOverlay animationId={visibleAnimationId} key={`${visibleAnimationId}-${liveAnimationId ? "live" : "replay"}`} replaying={!liveAnimationId} onSkip={skipVisibleAnimation} />}
      </section>

      <aside className={styles.caseLog} aria-label="齐夏的现场笔记">
        <div>
          <p>齐夏 / 现场笔记</p>
          <span>只记录已经看见或已经推出的内容。</span>
        </div>
        <div className={styles.caseLogScroll} role="log" tabIndex={0}>
          {state.history.length === 0
            ? <p>人羊倒下了。面具里还留着字。</p>
            : state.history.slice(-4).map((item) => <p key={item.id} className={styles[`log_${item.kind}`]}>{item.text}</p>)}
          {view.activeErrors.map((item) => <p key={`${item.fieldId}-${item.code}`} className={styles.log_error}>错误：{item.message}</p>)}
        </div>
      </aside>
    </main>
  );
}

function SceneTitle({ scene }: { scene: ReturnType<typeof initialChapterTwoState>["scene"] }) {
  const titles: Record<typeof scene, { kicker: string; title: string }> = {
    entry: { kicker: "第二章", title: "四面杀机" },
    aftermath: { kicker: "现场 / 人羊死后", title: "面具为什么没有破" },
    "hometown-map": { kicker: "女娲游戏 / 雨后春笋", title: "九个地点，三个笔画" },
    "shield-assembly": { kicker: "座钟一点一刻前", title: "九块小桌板" },
    "harpoon-rescue": { kicker: "鱼叉停止后", title: "把韩一墨留下来" },
    "sky-death": { kicker: "女娲游戏 / 天降死亡", title: "孔、把手与九个人" },
    "yes-no": { kicker: "女娲游戏 / 是与非", title: "人蛇只会回答是或否" },
    "zodiac-corridor": { kicker: "长廊", title: "十天，三千六百个道" },
    "termination-reveal": { kicker: "门外", title: "终焉之地" },
    complete: { kicker: "章节完成", title: "暗红的太阳升起来了" },
    death: { kicker: "制裁", title: "" },
  };
  const current = titles[scene];
  return <header className={styles.sceneTitle}><p>{current.kicker}</p><h1>{current.title}</h1></header>;
}

function SceneBody({ state, act }: {
  state: ReturnType<typeof initialChapterTwoState>;
  act: (action: ChapterTwoAction, sound?: "clock" | "chain" | "wood" | "impact" | "door" | "bell") => void;
}) {
  switch (state.scene) {
    case "aftermath": return <AftermathPuzzle state={state} act={act} />;
    case "hometown-map": return <HometownPuzzle state={state} act={act} />;
    case "shield-assembly": return <ShieldPuzzle state={state} act={act} />;
    case "harpoon-rescue": return <RescuePuzzle state={state} act={act} />;
    case "sky-death": return <SkyDeathPuzzle state={state} act={act} />;
    case "yes-no": return <YesNoPuzzle state={state} act={act} />;
    case "zodiac-corridor": return <CorridorScene state={state} act={act} />;
    case "termination-reveal": return <TerminationScene state={state} act={act} />;
    case "complete": return <CompleteScene />;
    default: return <AftermathPuzzle state={state} act={act} />;
  }
}

function ObservationButtons({ ids, state, act }: {
  ids: ChapterTwoObservationId[];
  state: ReturnType<typeof initialChapterTwoState>;
  act: (action: ChapterTwoAction, sound?: "clock" | "chain" | "wood" | "impact" | "door" | "bell") => void;
}) {
  return (
    <div className={styles.observations}>
      {ids.map((id) => {
        const item = observationById(id);
        const seen = state.observedIds.includes(id);
        const recorded = state.recordedIds.includes(id);
        return (
          <article key={id} className={seen ? styles.observed : ""}>
            <button onClick={() => act({ type: "OBSERVE", observationId: id }, "clock")}>{seen ? item.label : `观察：${item.label}`}</button>
            {seen && <p>{item.observation}</p>}
            {seen && <button className={styles.noteButton} disabled={recorded} onClick={() => act({ type: "RECORD", observationId: id })}>{recorded ? "已记下" : "记入笔记"}</button>}
          </article>
        );
      })}
    </div>
  );
}

function AftermathPuzzle({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  const answers: ReadonlyArray<{ id: AftermathAnswer; title: string; copy: string }> = [
    { id: "avoid-pain", title: "为了少受痛苦", copy: "心脏中弹会更快结束一切。" },
    { id: "head-too-hard", title: "头骨太硬", copy: "所以他选择避开头部。" },
    { id: "protect-mask", title: "面具下面有不能毁掉的东西", copy: "他宁愿痛苦挣扎，也没有射向头。" },
  ];
  return <>
    <p className={styles.lead}>人羊把枪口对准心脏，却没有打碎羊皮面具。先判断这个选择保护了什么。</p>
    <ObservationButtons ids={["heart-shot", "preserved-mask", "mask-writing"]} state={state} act={act} />
    <div className={styles.choiceGrid}>{answers.map((answer) => <button key={answer.id} onClick={() => act({ type: "SUBMIT_AFTERMATH", answer: answer.id }, "impact")}><strong>{answer.title}</strong><span>{answer.copy}</span></button>)}</div>
  </>;
}

function HometownPuzzle({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  const placeIds = Object.keys(PLACE_LABELS) as PlaceId[];
  const toggleStroke = (index: 0 | 1 | 2, placeId: PlaceId) => {
    const current = state.hometown.strokes[index];
    const next = current.includes(placeId) ? current.filter((item) => item !== placeId) : [...current, placeId];
    act({ type: "SET_MAP_STROKE", strokeIndex: index, placeIds: next }, "wood");
  };
  return <>
    <p className={styles.lead}>把每个人说过的地点落到同一张图上。不要凭感觉转桌，先把图形画出来。</p>
    <ObservationButtons ids={["wall-holes", "clock-quarter", "rotating-table", "nine-hometowns"]} state={state} act={act} />
    <div className={styles.mapLayout}>
      <div className={styles.mapBoard} aria-label="九地手绘地图">
        <svg aria-hidden="true" className={styles.mapStrokes} viewBox="0 0 100 100" preserveAspectRatio="none">
          {state.hometown.strokes.map((stroke, index) => stroke.length > 1 && (
            <polyline
              key={index}
              points={stroke.map((placeId) => `${PLACE_POINTS[placeId].x},${PLACE_POINTS[placeId].y}`).join(" ")}
            />
          ))}
        </svg>
        {placeIds.map((placeId) => {
          const point = PLACE_POINTS[placeId];
          return <span key={placeId} style={{ left: `${point.x}%`, top: `${point.y}%` }}>{PLACE_LABELS[placeId]}</span>;
        })}
      </div>
      <div className={styles.hometownList}>
        {HOMETOWN_FACTS.map((fact) => <label key={fact.characterId}><span>{CHARACTER_NAMES[fact.characterId]}：{fact.wording}</span><select value={state.hometown.placements[fact.characterId] ?? ""} onChange={(event) => act({ type: "PLACE_HOMETOWN", characterId: fact.characterId, placeId: event.target.value as PlaceId })}><option value="">落点</option>{placeIds.map((placeId) => <option value={placeId} key={placeId}>{PLACE_LABELS[placeId]}</option>)}</select></label>)}
      </div>
    </div>
    <section className={styles.strokeBoard}><p>用三笔连接你认为属于同一路径的地点。每个地点只能属于一笔。</p>{([0, 1, 2] as const).map((index) => <div key={index}><strong>第 {index + 1} 笔</strong>{placeIds.map((placeId) => <button className={state.hometown.strokes[index].includes(placeId) ? styles.selected : ""} key={placeId} onClick={() => toggleStroke(index, placeId)}>{PLACE_LABELS[placeId]}</button>)}</div>)}</section>
    <div className={styles.actions}><button onClick={() => act({ type: "SUBMIT_HOMETOWN", direction: "left" }, "wood")}>九人向左转</button><button className={styles.primary} onClick={() => act({ type: "SUBMIT_HOMETOWN", direction: "right" }, "wood")}>九人向右转</button></div>
  </>;
}

function ShieldPuzzle({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  const smallWedges = WEDGE_IDS.filter((id) => id !== "large-decoy");
  return <>
    <p className={styles.lead}>座钟射出光线，桌面裂成九块小三角板和一块大板。结构必须闭合，不能留下被鱼叉直射的缝。</p>
    <ObservationButtons ids={["split-table"]} state={state} act={act} />
    <div className={styles.shieldGrid}>{smallWedges.map((wedge) => <WedgeControl key={wedge} wedge={wedge} state={state} act={act} />)}</div>
    <section className={styles.decoy}><strong>大板</strong><p>它看似最完整，但不是九人共同结构的一部分。</p><button disabled={state.shield.discardedIds.includes("large-decoy")} onClick={() => act({ type: "DISCARD_WEDGE", wedgeId: "large-decoy" }, "wood")}>{state.shield.discardedIds.includes("large-decoy") ? "已移开" : "移开大板"}</button></section>
    <div className={styles.actions}><button className={styles.primary} onClick={() => act({ type: "SUBMIT_SHIELD" }, "wood")}>闭合结构</button></div>
  </>;
}

function WedgeControl({ wedge, state, act }: { wedge: Exclude<WedgeId, "large-decoy">; state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  return <label className={styles.wedge}><strong>{wedge.replace("small-", "小板 ")}</strong><select value={state.shield.placements[wedge] ?? ""} onChange={(event) => act({ type: "PLACE_WEDGE", wedgeId: wedge, slotId: event.target.value as WedgeSlotId })}><option value="">选择位置</option>{WEDGE_SLOT_IDS.map((slot) => <option key={slot} value={slot}>{slot.replace("slot-", "槽位 ")}</option>)}</select><select value={state.shield.orientations[wedge] ?? ""} onChange={(event) => act({ type: "ROTATE_WEDGE", wedgeId: wedge, orientation: event.target.value as WedgeOrientation })}><option value="">选择朝向</option><option value="tip-in">尖端向内</option><option value="tip-out">尖端向外</option><option value="vertical">竖直</option></select></label>;
}

function RescuePuzzle({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  return <>
    <p className={styles.lead}>鱼叉停止了，但墙洞正在回收所有绳索。韩一墨被钉在墙上，每一步都要留下下一步需要的条件。</p>
    <ObservationButtons ids={["harpoon-ropes"]} state={state} act={act} />
    <div className={styles.rescueGrid}>{RESCUE_ACTIONS.map((item) => <button className={state.rescue.completedActionIds.includes(item.id) ? styles.completed : ""} disabled={state.rescue.completedActionIds.includes(item.id)} onClick={() => act({ type: "APPLY_RESCUE_ACTION", actionId: item.id }, "chain")} key={item.id}><strong>{item.title}</strong><span>{item.detail}</span></button>)}</div>
    <p className={styles.danger}>错误动作会明确指出因果，并增加风险。累计四次错误，回收机关会造成死亡。</p>
  </>;
}

function SkyDeathPuzzle({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  return <>
    <p className={styles.lead}>新的鱼叉文字说「躲开它们」。但孔全在中央，九块方板有把手，人数也是九。别把人羊的字当作规则。</p>
    <ObservationButtons ids={["harpoon-tail-writing", "ceiling-nine-holes", "square-board-handles", "sheep-dog-types"]} state={state} act={act} />
    <div className={styles.skyChoices}>{SKY_CHOICES.map((group) => <fieldset key={group.field}><legend>{group.label}</legend>{group.options.map((option) => <label key={option.value}><input checked={state.skyDeath[group.field] === option.value} name={group.field} onChange={() => act({ type: "SET_SKY_FIELD", field: group.field, value: option.value })} type="radio" value={option.value} />{option.label}</label>)}</fieldset>)}</div>
    <div className={styles.actions}><button className={styles.primary} onClick={() => act({ type: "SUBMIT_SKY_DEATH" }, "impact")}>压下推演</button></div>
  </>;
}

function YesNoPuzzle({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  const tokenIds = Object.keys(QUESTION_TOKEN_LABELS) as QuestionTokenId[];
  return <>
    <p className={styles.lead}>肖冉已经问过第一问。人蛇只答是或否，不会说假话；只有当他答应救人时，才会拉杆。剩余问题：{3 - state.questionCount}。</p>
    <ObservationButtons ids={["shaft-door", "snake-rules"]} state={state} act={act} />
    <section className={styles.questionBuilder}><p>把词块组成一个能由「是 / 否」回答的问题。提交后会列出未被排除的回答分支。</p><div className={styles.questionLine}>{state.yesNo.tokenIds.length ? state.yesNo.tokenIds.map((id, index) => <button key={`${id}-${index}`} onClick={() => act({ type: "REMOVE_QUESTION_TOKEN", index })}>{QUESTION_TOKEN_LABELS[id]}</button>) : <span>问题尚未组成</span>}</div><div className={styles.tokenBank}>{tokenIds.map((id) => <button key={id} onClick={() => act({ type: "ADD_QUESTION_TOKEN", tokenId: id })}>{QUESTION_TOKEN_LABELS[id]}</button>)}</div><div className={styles.actions}><button onClick={() => act({ type: "CLEAR_QUESTION" })}>清空</button><button className={styles.primary} onClick={() => act({ type: "SUBMIT_QUESTION" }, "door")}>问人蛇</button></div></section>
    {state.yesNo.branches.length > 0 && <section className={styles.branches}><p>分支检查</p>{state.yesNo.branches.map((branch) => <span key={branch.currentAnswer}>若当前回答「{branch.currentAnswer === "yes" ? "是" : "否"}」，下一问为「{branch.nextAnswer === "yes" ? "是" : branch.nextAnswer === "no" ? "否" : "无法确定"}」；{branch.pullForced ? "拉杆被迫成立。" : "仍存在不拉杆的分支。"}</span>)}</section>}
  </>;
}

function CorridorScene({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  return <>
    <p className={styles.lead}>{CORRIDOR_BEATS[state.narrativeBeat]}</p>
    {state.narrativeBeat === 2 && <ObservationButtons ids={["zodiac-masks"]} state={state} act={act} />}
    {state.narrativeBeat === 3 && <ObservationButtons ids={["human-dragon", "dao-token"]} state={state} act={act} />}
    <div className={styles.actions}><button className={styles.primary} onClick={() => act({ type: "ADVANCE_NARRATIVE" }, state.narrativeBeat === 4 ? "bell" : "door")}>{state.narrativeBeat >= CORRIDOR_BEATS.length - 1 ? "推开出口" : "继续向前"}</button></div>
  </>;
}

function TerminationScene({ state, act }: { state: ReturnType<typeof initialChapterTwoState>; act: SceneAction }) {
  return <><p className={styles.lead}>门外的城市在暗红光线里逐渐清晰。身后的门和人龙已经消失，电子屏亮起一句陌生的提示。</p><ObservationButtons ids={["termination-plaza"]} state={state} act={act} /><div className={styles.actions}><button className={styles.primary} onClick={() => act({ type: "ADVANCE_NARRATIVE" }, "bell")}>看向广场</button></div></>;
}

function CompleteScene() {
  return <section className={styles.complete}><p>第二章完成</p><h2>我听到了「招灾」的回响。</h2><span>终焉之地已经展开。第三章将在便利店开始。</span><Link href="/">回到章节目录</Link></section>;
}

function CharacterLayer({ state }: { state: ReturnType<typeof initialChapterTwoState> }) {
  const scene = state.scene;
  const ids: StageCharacterId[] = scene === "harpoon-rescue"
    ? ["han", "qiao", "li", "lin"]
    : scene === "yes-no"
      ? ["renshe", "qixia", "qiao"]
      : scene === "zodiac-corridor" && state.narrativeBeat >= 3
        ? ["renlong", "qixia", "qiao"]
        : scene === "zodiac-corridor" || scene === "termination-reveal" || scene === "complete"
          ? ["qixia", "qiao", "tiantian"]
          : ["qixia", "tiantian", "qiao"];
  return <div className={styles.characters} aria-hidden="true">{ids.map((id, index) => {
    const injuries = id === "renshe" || id === "renlong" ? [] : state.characterStates[id].injuries;
    return <figure className={`${styles[`character_${index}`]} ${id === "renshe" || id === "renlong" ? styles.hostCharacter : ""}`} key={id}><Image alt="" fill priority={index === 0} sizes="(max-width: 880px) 34vw, 27vw" src={CHARACTER_ART[id]} unoptimized />{injuries.includes("tiantian-right-palm") && <i className={styles.handInjury} />}{injuries.includes("han-shoulder-harpoon") && <i className={styles.shoulderInjury} />}<figcaption>{STAGE_CHARACTER_NAMES[id]}</figcaption></figure>;
  })}</div>;
}

type SceneAction = (action: ChapterTwoAction, sound?: "clock" | "chain" | "wood" | "impact" | "door" | "bell") => void;
