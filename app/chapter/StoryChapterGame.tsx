"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { STORY_ANIMATIONS, storyAnimationDuration } from "../lib/story-chapters/animation.ts";
import { bgmForStoryChapter, StoryAudioDirector } from "../lib/story-chapters/audio.ts";
import { STORY_PORTRAITS, STORY_SPEAKER_NAMES, storyChapterSpec } from "../lib/story-chapters/canon.ts";
import { initialStoryChapterState, sceneForState, storyChapterReducer } from "../lib/story-chapters/engine.ts";
import {
  canEnterStoryChapter,
  createFreshStoryChapterSave,
  loadStorySave,
  saveStoryChapter,
} from "../lib/story-chapters/save.ts";
import type { StoryChapterAction, StoryChapterId } from "../lib/story-chapters/types.ts";
import { storyVoiceAsset } from "../lib/story-chapters/voice-assets.ts";
import styles from "./story-chapter.module.css";

export default function StoryChapterGame({ chapterId }: { chapterId: StoryChapterId }) {
  const spec = useMemo(() => storyChapterSpec(chapterId), [chapterId]);
  const [state, dispatch] = useReducer(storyChapterReducer, chapterId, initialStoryChapterState);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const audioRef = useRef<StoryAudioDirector | null>(null);
  const scene = sceneForState(state, spec);
  const sceneIndex = spec.scenes.findIndex((item) => item.id === scene.id);
  const progress = Math.round(((sceneIndex + (state.status.kind === "complete" ? 1 : 0)) / spec.scenes.length) * 100);

  useEffect(() => {
    const audio = new StoryAudioDirector();
    audioRef.current = audio;
    return () => audio.stop();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      if (!canEnterStoryChapter(window.localStorage, chapterId)) {
        setLocked(true);
        setReady(true);
        return;
      }
      const save = loadStorySave(window.localStorage);
      const restored = save?.chapters[chapterId];
      if (restored) dispatch({ type: "RESTORE", state: restored });
      else createFreshStoryChapterSave(window.localStorage, chapterId);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [chapterId]);

  useEffect(() => {
    if (!ready || locked || typeof window === "undefined") return;
    saveStoryChapter(window.localStorage, state);
  }, [locked, ready, state]);

  useEffect(() => {
    if (!audioEnabled || muted) return;
    void audioRef.current?.start(bgmForStoryChapter(chapterId));
  }, [audioEnabled, chapterId, muted]);

  useEffect(() => {
    if (state.status.kind !== "animating") return;
    const animation = STORY_ANIMATIONS[state.status.animationId];
    for (const sfxId of animation?.sfxIds ?? []) audioRef.current?.playSfx(sfxId);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => dispatch({ type: "ANIMATION_FINISHED", animationId: state.status.kind === "animating" ? state.status.animationId : "" }),
      storyAnimationDuration(state.status.animationId, reduced),
    );
    return () => window.clearTimeout(timer);
  }, [state.status]);

  const beginAudio = useCallback(() => {
    setAudioEnabled(true);
    setMuted(false);
    audioRef.current?.setMuted(false);
    void audioRef.current?.start(bgmForStoryChapter(chapterId));
  }, [chapterId]);

  const act = useCallback((action: StoryChapterAction) => {
    beginAudio();
    dispatch(action);
  }, [beginAudio]);

  const toggleAudio = () => {
    if (!audioEnabled) {
      beginAudio();
      return;
    }
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioRef.current?.setMuted(nextMuted);
    if (!nextMuted) void audioRef.current?.start(bgmForStoryChapter(chapterId));
  };

  const playVoice = (lineId: string) => {
    if (activeVoiceId === lineId) {
      audioRef.current?.stopVoice();
      setActiveVoiceId(null);
      return;
    }
    beginAudio();
    setVoiceError(null);
    void audioRef.current?.playVoice(lineId, () => setActiveVoiceId(lineId), () => setActiveVoiceId(null), () => {
      setActiveVoiceId(null);
      setVoiceError("固定语音文件载入失败；运行时不会重新生成或换音色。");
    });
  };

  if (!ready) return <main className={styles.loading}>正在读取单机档案……</main>;

  if (locked) {
    return (
      <main className={styles.locked}>
        <span>章节门禁</span>
        <h1>第{chapterId}章尚未解锁</h1>
        <p>必须先完成第{chapterId - 1}章。测试人员可以使用首页标有“普通用户请勿点击”的调试入口。</p>
        <Link href="/">返回首页</Link>
      </main>
    );
  }

  if (state.status.kind === "death") {
    return (
      <main className={styles.death}>
        <span>非正史失败 / {state.status.failureId}</span>
        <h1>你死在了这一幕</h1>
        <p>{state.status.reason}</p>
        <small>返回检查点：{spec.scenes.find((item) => item.id === state.status.checkpointSceneId)?.title}</small>
        <button onClick={() => dispatch({ type: "RETRY_CHECKPOINT" })}>回到检查点</button>
        <b>错误已写清楚；死亡保留。</b>
      </main>
    );
  }

  if (state.status.kind === "complete") {
    return (
      <main className={styles.complete}>
        <span>第{chapterId}章完成</span>
        <h1>{spec.completionTitle}</h1>
        <p>{spec.completionText}</p>
        <div className={styles.completeStats}><b>{state.daoCount}</b><span>当前队伍持有“道”</span></div>
        <div className={styles.completeActions}>
          {spec.nextChapterId && <Link href={`/chapter/${spec.nextChapterId}`}>进入第{spec.nextChapterId}章</Link>}
          <Link href="/">返回章节目录</Link>
        </div>
      </main>
    );
  }

  const solved = state.solvedSceneIds.includes(scene.id);
  const observationCount = scene.observations.filter((item) => state.observedIds.includes(item.id)).length;
  const animation = state.status.kind === "animating" ? STORY_ANIMATIONS[state.status.animationId] : null;

  return (
    <main className={styles.shell}>
      <header className={styles.hud}>
        <div><span>CHAPTER {chapterId}</span><strong>{spec.title}</strong></div>
        <div className={styles.progress}><i style={{ width: `${progress}%` }} /><span>{sceneIndex + 1} / {spec.scenes.length}</span></div>
        <div className={styles.resources}><span>道 <b>{state.daoCount}</b></span><span>压力 <b>{state.pressure}</b></span></div>
        <button aria-pressed={audioEnabled && !muted} onClick={toggleAudio}>{!audioEnabled ? "开启声场" : muted ? "恢复声音" : "静音"}</button>
      </header>

      <section className={styles.stage} style={{ backgroundImage: `linear-gradient(180deg, rgba(5,5,5,.06), rgba(6,5,4,.88)), url("${scene.backgroundAsset}")` }}>
        <div className={styles.sceneTitle}><span>{scene.eyebrow}</span><h1>{scene.title}</h1><p>{scene.lead}</p></div>
        <div className={styles.portraits} aria-label="当前人物">
          {scene.portraitIds.map((portraitId, index) => {
            const src = STORY_PORTRAITS[portraitId];
            if (!src) return null;
            return <figure className={styles[`portrait${Math.min(index, 3)}`]} key={portraitId}><Image alt={STORY_SPEAKER_NAMES[portraitId as keyof typeof STORY_SPEAKER_NAMES] ?? portraitId} fill priority={index === 0} sizes="(max-width: 720px) 38vw, 24vw" src={src} unoptimized /><figcaption>{STORY_SPEAKER_NAMES[portraitId as keyof typeof STORY_SPEAKER_NAMES] ?? portraitId}</figcaption></figure>;
          })}
        </div>
      </section>

      <section className={styles.tabletop}>
        <div className={styles.mainColumn}>
          <section className={styles.observations}>
            <header><span>现场观察</span><b>{observationCount} / {scene.observations.length}</b></header>
            <div className={styles.observationGrid}>
              {scene.observations.map((observation) => {
                const active = state.observedIds.includes(observation.id);
                return <button className={active ? styles.observed : ""} key={observation.id} onClick={() => act({ type: "OBSERVE", observationId: observation.id })}><strong>{observation.label}</strong><span>{active ? observation.text : "点击检查"}</span>{active && <small>{observation.note}</small>}</button>;
              })}
            </div>
          </section>

          {scene.puzzle && (
            <section className={styles.puzzle}>
              <header><span>齐夏推演</span><b>{solved ? "已闭合" : "待闭合"}</b></header>
              <p>{scene.puzzle.prompt}</p>
              <div className={styles.fields}>
                {scene.puzzle.fields.map((field) => {
                  const fieldError = state.errors.find((error) => error.fieldId === field.id);
                  return <fieldset className={fieldError ? styles.fieldError : ""} key={field.id}><legend>{field.label}</legend>{field.options.map((option) => <label key={option.value}><input checked={state.answers[field.id] === option.value} disabled={solved} name={`${scene.id}:${field.id}`} onChange={() => act({ type: "SET_FIELD", fieldId: field.id, value: option.value })} type="radio" /><span><b>{option.label}</b>{option.detail && <small>{option.detail}</small>}</span></label>)}{fieldError && <em>{fieldError.message}</em>}</fieldset>;
                })}
              </div>
              {state.errors.filter((error) => error.fieldId.startsWith("observation:") || error.fieldId === "scene").map((error) => <p className={styles.globalError} key={`${error.fieldId}:${error.message}`}>{error.message}</p>)}
              {solved && <p className={styles.solvedText}>{scene.puzzle.solvedText}</p>}
              <div className={styles.actions}>
                {!solved && <button className={styles.primary} onClick={() => act({ type: "SUBMIT_PUZZLE" })}>压下这条推演</button>}
                {solved && <button className={styles.primary} onClick={() => act({ type: "ADVANCE" })}>{scene.advanceLabel}</button>}
              </div>
            </section>
          )}

          {!scene.puzzle && (
            <section className={styles.narrativeAction}>
              {scene.canonicalEvent && <p><b>正史事件</b>{scene.canonicalEvent}</p>}
              <button className={styles.primary} onClick={() => act({ type: "ADVANCE" })}>{scene.advanceLabel}</button>
            </section>
          )}
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.dialogue}>
            <header>场景对白</header>
            {scene.dialogue.map((line) => {
              const asset = storyVoiceAsset(line.id);
              return <article key={line.id}><span>{STORY_SPEAKER_NAMES[line.speakerId]}</span><p>“{line.text}”</p><button disabled={!asset} onClick={() => playVoice(line.id)}>{!asset ? "固定语音缺失" : activeVoiceId === line.id ? "停止" : "播放语音"}</button></article>;
            })}
            {voiceError && <p className={styles.globalError}>{voiceError}</p>}
          </section>
          <section className={styles.log}>
            <header>脑内记录</header>
            <div>{state.history.slice().reverse().map((entry) => <p data-kind={entry.kind} key={entry.id}>{entry.text}</p>)}</div>
          </section>
        </aside>
      </section>

      {animation && state.status.kind === "animating" && (
        <section className={styles.cinematic} data-animation={state.status.animationId} aria-label="剧情动画">
          <div className={styles.cinematicFrame} style={{ backgroundImage: `url("${scene.backgroundAsset}")` }}><i /><i /><i /></div>
          <span>ANIMATION / {state.status.animationId}</span>
          <p>{animation.caption}</p>
          <button onClick={() => dispatch({ type: "ANIMATION_FINISHED", animationId: state.status.kind === "animating" ? state.status.animationId : "" })}>跳过动画</button>
        </section>
      )}
    </main>
  );
}
