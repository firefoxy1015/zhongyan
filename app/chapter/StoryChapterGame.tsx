"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { STORY_ANIMATIONS, storyAnimationDuration, type StoryAnimationId } from "../lib/story-chapters/animation.ts";
import { STORY_IMAGE_ASSETS, STORY_STAGE_PROP_LABELS } from "../lib/story-chapters/assets.ts";
import { bgmForStoryChapter, StoryAudioDirector } from "../lib/story-chapters/audio.ts";
import { STORY_PORTRAIT_NAMES, STORY_PORTRAITS, STORY_SPEAKER_NAMES, storyChapterSpec } from "../lib/story-chapters/canon.ts";
import { initialStoryChapterState, sceneForState, storyChapterReducer } from "../lib/story-chapters/engine.ts";
import {
  canEnterStoryChapter,
  createFreshStoryChapterSave,
  loadStorySave,
  saveStoryChapter,
} from "../lib/story-chapters/save.ts";
import type {
  StoryChapterAction,
  StoryChapterId,
  StoryDaoAccountId,
  StoryDaoLedger,
} from "../lib/story-chapters/types.ts";
import { storyVoiceAsset } from "../lib/story-chapters/voice-assets.ts";
import styles from "./story-chapter.module.css";

const DAO_ACCOUNT_LABELS: Readonly<Record<StoryDaoAccountId, string>> = {
  qixiaParty: "齐夏队",
  liZhang: "李尚武 / 章晨泽",
  oldLu: "老吕",
  burned: "已焚毁（不可用）",
};

function DaoLedger({ ledger }: { ledger: StoryDaoLedger }) {
  return (
    <div className={styles.daoLedger} aria-label="道账明细">
      {(Object.keys(DAO_ACCOUNT_LABELS) as StoryDaoAccountId[]).map((accountId) => (
        <span data-account={accountId} key={accountId}>
          <small>{DAO_ACCOUNT_LABELS[accountId]}</small>
          <b>{ledger[accountId]}</b>
        </span>
      ))}
    </div>
  );
}

function StoryCinematic({
  animationId,
  backgroundAsset,
  onFinish,
}: {
  animationId: StoryAnimationId;
  backgroundAsset: string;
  onFinish: () => void;
}) {
  const animation = STORY_ANIMATIONS[animationId];
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanSkip(true), animation.skippableAfterMs);
    return () => window.clearTimeout(timer);
  }, [animation.skippableAfterMs]);

  return (
    <section className={styles.cinematic} data-animation={animationId} aria-label="剧情动画" role="dialog">
      <div className={styles.cinematicFrame} style={{ backgroundImage: `url("${backgroundAsset}")` }}><i /><i /><i /></div>
      <span>ANIMATION / {animationId}</span>
      <p>{animation.caption}</p>
      <button disabled={!canSkip} onClick={onFinish}>{canSkip ? "跳过动画" : "剧情展开中……"}</button>
    </section>
  );
}

function StoryPlayGuide({
  errorCost,
  openByDefault,
  pressureLimit,
}: {
  errorCost: number;
  openByDefault: boolean;
  pressureLimit: number;
}) {
  const [open, setOpen] = useState(openByDefault);

  return (
    <details className={styles.playGuide} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>本章怎么玩 <span>先观察，再推演，最后推进正史</span></summary>
      <ol>
        <li><b>检查现场</b><span>逐项点击“现场观察”。推演要求的事实没有记录齐，就不能闭合。</span></li>
        <li><b>完成推演</b><span>每个词条选一个答案再提交。错误项会在原位置写明错因，不会只扣压力。</span></li>
        <li><b>承担风险</b><span>本幕答错一次增加 {errorCost} 点压力；压力达到 {pressureLimit} 会死亡。致命选择会直接死亡，但可返回检查点。</span></li>
        <li><b>推进事件</b><span>推演闭合后按下推进按钮；关键事件会先播放不可立即跳过的动画，再写入道账和记录。</span></li>
      </ol>
    </details>
  );
}

export default function StoryChapterGame({ chapterId }: { chapterId: StoryChapterId }) {
  return <StoryChapterSession chapterId={chapterId} key={chapterId} />;
}

function StoryChapterSession({ chapterId }: { chapterId: StoryChapterId }) {
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
      const freshStartRequested = new URLSearchParams(window.location.search).get("fresh") === "1";
      if (freshStartRequested) {
        const fresh = createFreshStoryChapterSave(window.localStorage, chapterId);
        dispatch({ type: "RESTORE", state: fresh });
        window.history.replaceState(window.history.state, "", window.location.pathname);
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
    audioRef.current?.stopVoice();
  }, [chapterId, scene.id, state.status.kind]);

  useEffect(() => {
    if (state.status.kind !== "animating") return;
    const animationId = state.status.animationId;
    const animation = STORY_ANIMATIONS[animationId];
    for (const sfxId of animation.sfxIds) audioRef.current?.playSfx(sfxId);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => dispatch({ type: "ANIMATION_FINISHED", animationId }),
      storyAnimationDuration(animationId, reduced),
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
    setActiveVoiceId(null);
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
    const deathStatus = state.status;
    return (
      <main className={styles.death}>
        <span>非正史失败 / {deathStatus.failureId}</span>
        <h1>你死在了这一幕</h1>
        <p>{deathStatus.reason}</p>
        <small>返回检查点：{spec.scenes.find((item) => item.id === deathStatus.checkpointSceneId)?.title}</small>
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
        <section className={styles.completeStats} aria-label="本章道账结算">
          <h2>道账结算</h2>
          <DaoLedger ledger={state.daoLedger} />
          <p>{spec.completionDaoLabel}</p>
        </section>
        <div className={styles.completeActions}>
          {spec.nextChapterId && <Link href={`/chapter/${spec.nextChapterId}?fresh=1`}>进入第{spec.nextChapterId}章</Link>}
          <Link href="/">返回章节目录</Link>
        </div>
      </main>
    );
  }

  const solved = state.solvedSceneIds.includes(scene.id);
  const observationCount = scene.observations.filter((item) => state.observedIds.includes(item.id)).length;
  const animationId = state.status.kind === "animating" ? state.status.animationId : null;

  return (
    <main className={styles.shell}>
      <header className={styles.hud}>
        <div><span>CHAPTER {chapterId}</span><strong>{spec.title}</strong></div>
        <div className={styles.progress}><i style={{ width: `${progress}%` }} /><span>{sceneIndex + 1} / {spec.scenes.length}</span></div>
        <div className={styles.resources}>
          <DaoLedger ledger={state.daoLedger} />
          <span className={styles.pressure}>压力 <b>{state.pressure} / {spec.pressureLimit}</b></span>
        </div>
        <button aria-pressed={audioEnabled && !muted} onClick={toggleAudio}>{!audioEnabled ? "开启声场" : muted ? "恢复声音" : "静音"}</button>
      </header>

      <section className={styles.stage} style={{ backgroundImage: `linear-gradient(180deg, rgba(5,5,5,.06), rgba(6,5,4,.88)), url("${scene.backgroundAsset}")` }}>
        <div className={styles.sceneTitle}><span>{scene.eyebrow}</span><h1>{scene.title}</h1><p>{scene.lead}</p></div>
        <div className={styles.portraits} aria-label="当前人物">
          {scene.portraitIds.map((portraitId, index) => {
            const src = STORY_PORTRAITS[portraitId];
            if (!src) return null;
            const label = STORY_PORTRAIT_NAMES[portraitId] ?? portraitId;
            return <figure className={styles[`portrait${Math.min(index, 3)}`]} key={portraitId}><Image alt={label} fill priority={index === 0} sizes="(max-width: 720px) 38vw, 24vw" src={src} style={{ objectFit: "contain", objectPosition: "center bottom" }} unoptimized /><figcaption>{label}</figcaption></figure>;
          })}
        </div>
        {!!scene.stagePropAssetIds?.length && <div className={styles.stageProps} aria-label="现场物证">
          {scene.stagePropAssetIds.map((assetId) => {
            const asset = STORY_IMAGE_ASSETS[assetId];
            const label = STORY_STAGE_PROP_LABELS[assetId] ?? assetId;
            return <figure data-stage-prop-id={assetId} key={assetId}><Image alt={label} fill sizes="(max-width: 620px) 34vw, 20vw" src={asset.src} style={{ objectFit: "contain", objectPosition: "center bottom" }} unoptimized /><figcaption>{label}</figcaption></figure>;
          })}
        </div>}
      </section>

      <section className={styles.tabletop}>
        <div className={styles.mainColumn}>
          <StoryPlayGuide
            errorCost={scene.puzzle?.errorCost ?? 0}
            key={scene.id}
            openByDefault={sceneIndex === 0}
            pressureLimit={spec.pressureLimit}
          />

          <section className={styles.observations}>
            <header><span>现场观察</span><b>{observationCount} / {scene.observations.length}</b></header>
            <div className={styles.observationGrid}>
              {scene.observations.map((observation) => {
                const active = state.observedIds.includes(observation.id);
                const visualAsset = observation.visualAssetId ? STORY_IMAGE_ASSETS[observation.visualAssetId] : undefined;
                return <button className={active ? styles.observed : ""} data-observation-id={observation.id} key={observation.id} onClick={() => act({ type: "OBSERVE", observationId: observation.id })}>{visualAsset && <span className={styles.observationVisual} data-asset-id={visualAsset.assetId}><Image alt="" height={visualAsset.height} sizes="(max-width: 620px) 86vw, 32vw" src={visualAsset.src} style={{ height: "100%", objectFit: "contain", width: "100%" }} unoptimized width={visualAsset.width} /></span>}<strong>{observation.label}</strong><span>{active ? observation.text : "点击检查"}</span>{active && <small>{observation.note}</small>}</button>;
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

      {animationId && (
        <StoryCinematic
          animationId={animationId}
          backgroundAsset={scene.backgroundAsset}
          key={animationId}
          onFinish={() => dispatch({ type: "ANIMATION_FINISHED", animationId })}
        />
      )}
    </main>
  );
}
