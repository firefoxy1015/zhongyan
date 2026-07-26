"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LIAR_DEDUCTIONS,
  LIAR_EVIDENCE,
  LIAR_GAME,
  chamberVolume,
  deductionIsSupported,
  evidenceForStory,
  resolveCanonicalVote,
  type LiarEvidenceKind,
} from "./lib/liar-game";
import { SuspenseBgm } from "./lib/suspense-bgm";
import {
  CHARACTER_VOICE_PROFILES,
  TestimonySpeech,
  type CharacterVoiceId,
  type VoiceLineKind,
} from "./lib/testimony-speech";

type GameScreen = "entry" | "investigation" | "vote" | "result";
type NotebookFilter = "全部" | LiarEvidenceKind;

const INITIAL_EVIDENCE = new Set(
  LIAR_EVIDENCE.filter((evidence) => evidence.availableAtStart).map((evidence) => evidence.id),
);

const NOTEBOOK_FILTERS: NotebookFilter[] = ["全部", "规则", "案件", "事件", "人物", "地点"];

const FOLLOW_UP_REQUIREMENTS: Record<string, readonly string[]> = {
  tiantian: [],
  qiao: [],
  xiao: [],
  zhao: [],
  han: [],
  zhang: ["money-chain"],
  li: ["money-chain"],
  lin: [],
  qixia: ["money-chain", "case-timeline"],
};

function roomClock(turns: number) {
  const totalMinutes = 20 + turns * 2;
  const hour = 12 + Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export default function Home() {
  const [screen, setScreen] = useState<GameScreen>("entry");
  const [activeStoryId, setActiveStoryId] = useState("tiantian");
  const [recordedStories, setRecordedStories] = useState<Set<string>>(new Set());
  const [recordedEvidence, setRecordedEvidence] = useState<Set<string>>(() => new Set(INITIAL_EVIDENCE));
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<Set<string>>(new Set());
  const [completedDeductions, setCompletedDeductions] = useState<Set<string>>(new Set());
  const [askedFollowUps, setAskedFollowUps] = useState<Set<string>>(new Set());
  const [speakingLine, setSpeakingLine] = useState<VoiceLineKind | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [notebookFilter, setNotebookFilter] = useState<NotebookFilter>("全部");
  const [workbenchNotice, setWorkbenchNotice] = useState("先记录证词，再把事实拖进同一条推断。");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const bgmRef = useRef<SuspenseBgm | null>(null);
  const speechRef = useRef<TestimonySpeech | null>(null);

  const activeStory = LIAR_GAME.stories.find((story) => story.id === activeStoryId) ?? LIAR_GAME.stories[0];
  const activeVoice = CHARACTER_VOICE_PROFILES[activeStory.id as CharacterVoiceId];
  const activeEvidence = evidenceForStory(activeStory.id);
  const completedCount = completedDeductions.size;
  const allStoriesRecorded = recordedStories.size === LIAR_GAME.stories.length;
  const voteUnlocked = completedDeductions.has("rule-boundary");
  const activeFollowUp = activeStory.selfReflection ?? activeStory.followUp ?? "";
  const activeFollowUpLabel = activeStory.selfReflection ? "齐夏内心推演" : "齐夏追问";
  const activeFollowUpSpeaker = activeStory.selfReflection ? "齐夏（心声）" : "齐夏";
  const activeFollowUpRequirements = FOLLOW_UP_REQUIREMENTS[activeStory.id] ?? [];
  const followUpUnlocked = recordedStories.has(activeStory.id)
    && activeFollowUpRequirements.every((id) => completedDeductions.has(id));
  const isTestimonyPlaying = speakingLine === "testimony";
  const isFollowUpPlaying = speakingLine === "followUp";
  const visibleEvidence = useMemo(
    () => LIAR_EVIDENCE.filter((evidence) => recordedEvidence.has(evidence.id)),
    [recordedEvidence],
  );
  const filteredEvidence = useMemo(
    () => notebookFilter === "全部"
      ? visibleEvidence
      : visibleEvidence.filter((evidence) => evidence.kind === notebookFilter),
    [notebookFilter, visibleEvidence],
  );
  const resolution = screen === "result" ? resolveCanonicalVote(selectedTarget) : null;

  useEffect(() => {
    const bgm = new SuspenseBgm();
    bgmRef.current = bgm;
    const speech = new TestimonySpeech();
    speechRef.current = speech;
    return () => {
      bgm.stop();
      speech.stop();
    };
  }, []);

  const startMusic = () => {
    if (!musicEnabled) return;
    void bgmRef.current?.start().then((started) => setMusicStarted(Boolean(started)));
  };

  const toggleMusic = () => {
    if (musicStarted) {
      bgmRef.current?.stop();
      setMusicStarted(false);
      setMusicEnabled(false);
      return;
    }

    setMusicEnabled(true);
    void bgmRef.current?.start().then((started) => setMusicStarted(Boolean(started)));
  };

  const openStory = (storyId: string) => {
    speechRef.current?.stop();
    bgmRef.current?.setDucked(false);
    setSpeakingLine(null);
    setVoiceError(null);
    setActiveStoryId(storyId);
    startMusic();
  };

  const speak = (kind: VoiceLineKind) => {
    if (speakingLine === kind) {
      speechRef.current?.stop();
      bgmRef.current?.setDucked(false);
      setSpeakingLine(null);
      return;
    }

    setVoiceError(null);
    setSpeakingLine(kind);
    startMusic();
    bgmRef.current?.setDucked(true);
    void speechRef.current?.speak(
      activeStory.id as CharacterVoiceId,
      kind,
      () => undefined,
      () => {
        bgmRef.current?.setDucked(false);
        setSpeakingLine(null);
      },
      () => {
        bgmRef.current?.setDucked(false);
        setSpeakingLine(null);
        setVoiceError("该段固定语音暂时无法播放。请检查网络后重试；不会临时替换为其他音色。");
      },
    );
  };

  const recordActiveStory = () => {
    if (recordedStories.has(activeStory.id)) return;
    setRecordedStories((current) => new Set([...current, activeStory.id]));
    setRecordedEvidence((current) => new Set([
      ...current,
      ...activeEvidence.map((evidence) => evidence.id),
    ]));
    setTurns((current) => current + 1);
    setWorkbenchNotice(`已收录 ${activeStory.name} 的原文锚点。现在可以在齐夏手账中选择事实。`);
  };

  const askFollowUp = () => {
    if (!followUpUnlocked || !activeFollowUp) return;
    if (!askedFollowUps.has(activeStory.id)) {
      setAskedFollowUps((current) => new Set([...current, activeStory.id]));
      setTurns((current) => current + 1);
      setWorkbenchNotice(`${activeFollowUpLabel}已写入调查记录。`);
    }
    speak("followUp");
  };

  const toggleEvidenceSelection = (evidenceId: string) => {
    setSelectedEvidenceIds((current) => {
      const next = new Set(current);
      if (next.has(evidenceId)) next.delete(evidenceId);
      else next.add(evidenceId);
      return next;
    });
  };

  const buildDeduction = () => {
    const candidate = LIAR_DEDUCTIONS.find((deduction) => (
      !completedDeductions.has(deduction.id)
      && deductionIsSupported(deduction, recordedEvidence, completedDeductions)
      && deduction.requiredEvidence.every((evidenceId) => selectedEvidenceIds.has(evidenceId))
    ));

    if (!candidate) {
      const readyDeduction = LIAR_DEDUCTIONS.find((deduction) => (
        !completedDeductions.has(deduction.id)
        && deductionIsSupported(deduction, recordedEvidence, completedDeductions)
      ));
      setWorkbenchNotice(
        readyDeduction
          ? `已有可闭合的推断：${readyDeduction.title}。请从手账中选中所有相关事实。`
          : "没有可闭合的推断。继续调查，或检查尚未记录的证词。",
      );
      return;
    }

    setCompletedDeductions((current) => new Set([...current, candidate.id]));
    setSelectedEvidenceIds(new Set());
    setTurns((current) => current + 1);
    setWorkbenchNotice(candidate.result);
  };

  const beginInvestigation = () => {
    setScreen("investigation");
    setMusicEnabled(true);
    void bgmRef.current?.start().then((started) => setMusicStarted(Boolean(started)));
  };

  const restart = () => {
    speechRef.current?.stop();
    bgmRef.current?.setDucked(false);
    setScreen("entry");
    setActiveStoryId("tiantian");
    setRecordedStories(new Set());
    setRecordedEvidence(new Set(INITIAL_EVIDENCE));
    setSelectedEvidenceIds(new Set());
    setCompletedDeductions(new Set());
    setAskedFollowUps(new Set());
    setSpeakingLine(null);
    setVoiceError(null);
    setNotebookFilter("全部");
    setWorkbenchNotice("先记录证词，再把事实拖进同一条推断。");
    setSelectedTarget(null);
    setTurns(0);
  };

  if (screen === "entry") {
    return (
      <main className="liar-casebook liar-casebook--entry">
        <section className="case-entry" aria-label="说谎者首局入口">
          <div className="case-entry__image" aria-hidden="true" />
          <div className="case-entry__veil" aria-hidden="true" />
          <article className="case-entry__copy">
            <p className="case-kicker">DAY 01 / INTERVIEW ROOM</p>
            <span className="case-entry__chapter">首场游戏</span>
            <h1>说谎者</h1>
            <p className="case-entry__lead">不是翻页剧情。你以齐夏的视角自由访问九名叙述者，将原文事实写进手账，再亲手建立矛盾与结论。</p>
            <dl className="case-entry__facts">
              <div><dt>场地</dt><dd>方格面试房 · {chamberVolume()} 立方米</dd></div>
              <div><dt>规则</dt><dd>九人讲述；唯一说谎者必须被全部投中。</dd></div>
              <div><dt>胜利条件</dt><dd>用已记录的事实，把规则写回正确的讲述者范围。</dd></div>
            </dl>
            <div className="case-entry__actions">
              <button className="case-button case-button--primary" onClick={beginInvestigation}>进入调查台</button>
              <button className="case-button case-button--quiet" onClick={toggleMusic}>
                {musicStarted ? "关闭声场" : "试听紧迫声场"}
              </button>
            </div>
            <p className="case-entry__note">立绘与语音均为固定角色资产；每一段追问均由齐夏的固定男声音色播放。</p>
          </article>
        </section>
      </main>
    );
  }

  if (screen === "vote") {
    return (
      <main className="liar-casebook">
        <header className="case-topbar">
          <a className="case-brand" href="#vote-table"><span>终</span><div><small>终焉之地 / 调查记录</small><strong>第一日 · 说谎者</strong></div></a>
          <div className="case-topbar__tools"><span>座钟 {roomClock(turns)}</span><button onClick={toggleMusic}>{musicStarted ? "声场 ON" : "启动声场"}</button></div>
        </header>
        <section className="vote-desk" id="vote-table">
          <p className="case-kicker">FINAL SUBMISSION / ONE NAME</p>
          <h1>在白纸上写下一个名字</h1>
          <p>你已完成“规则边界”推断。系统不会替你投票；错误的一票同样会进入结算。</p>
          <div className="vote-desk__evidence">
            <span>已闭合推断</span>
            {LIAR_DEDUCTIONS.filter((deduction) => completedDeductions.has(deduction.id)).map((deduction) => <b key={deduction.id}>{deduction.title}</b>)}
          </div>
          <div className="vote-desk__targets">
            {LIAR_GAME.suspects.map((suspect) => (
              <button
                className={selectedTarget === suspect.id ? "is-selected" : ""}
                key={suspect.id}
                onClick={() => setSelectedTarget(suspect.id)}
              >
                <span>{suspect.type === "host" ? "主持者" : "参与者"}</span>{suspect.name}
              </button>
            ))}
          </div>
          <div className="vote-desk__actions">
            <button className="case-button case-button--quiet" onClick={() => setScreen("investigation")}>回到调查台</button>
            <button className="case-button case-button--primary" disabled={!selectedTarget} onClick={() => setScreen("result")}>提交这一票</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "result" && resolution) {
    return (
      <main className="liar-casebook">
        <header className="case-topbar">
          <a className="case-brand" href="#result"><span>终</span><div><small>终焉之地 / 调查记录</small><strong>第一日 · 说谎者</strong></div></a>
          <div className="case-topbar__tools"><span>结算 {roomClock(turns)}</span></div>
        </header>
        <section className={`result-desk ${resolution.isCorrect ? "is-correct" : "is-wrong"}`} id="result">
          <p className="case-kicker">ARCHIVE RESULT</p>
          <h1>{resolution.isCorrect ? "规则被写回了正确的位置" : "这条推断没有闭合"}</h1>
          <p className="result-desk__target">你写下的是：<strong>{resolution.target?.name ?? "无人"}</strong></p>
          <p>{resolution.isCorrect
            ? "你没有把表面矛盾当作唯一答案，而是把九人的共同谎言与人羊的叙述放回了规则的主语之中。"
            : "表面上的案件矛盾只能制造嫌疑。回到手账，检查谁真正落在“讲故事的人”与“唯一说谎者”的规则边界上。"}</p>
          <div className="result-desk__trail">
            {LIAR_DEDUCTIONS.filter((deduction) => completedDeductions.has(deduction.id)).map((deduction) => (
              <article key={deduction.id}><span>已验证</span><strong>{deduction.title}</strong><p>{deduction.result}</p></article>
            ))}
          </div>
          <div className="result-desk__actions">
            {!resolution.isCorrect && <button className="case-button case-button--quiet" onClick={() => setScreen("vote")}>改写投票</button>}
            <button className="case-button case-button--primary" onClick={restart}>从头复盘</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="liar-casebook">
      <header className="case-topbar">
        <a className="case-brand" href="#interview"><span>终</span><div><small>终焉之地 / 调查记录</small><strong>第一日 · 说谎者</strong></div></a>
        <nav className="case-navigation" aria-label="调查台导航">
          <a href="#people">人物</a>
          <a href="#interview">证词</a>
          <a href="#notebook">齐夏手账</a>
          <a href="#deduction">推断</a>
        </nav>
        <div className="case-topbar__tools">
          <span>座钟 <strong>{roomClock(turns)}</strong></span>
          <button aria-pressed={musicStarted} onClick={toggleMusic}>{musicStarted ? "声场 ON" : "启动声场"}</button>
        </div>
      </header>

      <section className="case-status" aria-label="调查状态">
        <div><span>当前目标</span><strong>{voteUnlocked ? "规则边界已经闭合，可以提交投票。" : "记录九段叙述，并用手账自行闭合四条推断。"}</strong></div>
        <dl>
          <div><dt>证词</dt><dd>{recordedStories.size} / {LIAR_GAME.stories.length}</dd></div>
          <div><dt>事实</dt><dd>{visibleEvidence.length}</dd></div>
          <div><dt>推断</dt><dd>{completedCount} / {LIAR_DEDUCTIONS.length}</dd></div>
        </dl>
      </section>

      <section className="investigation-desk">
        <aside className="people-panel case-panel" id="people">
          <div className="panel-heading"><div><p className="case-kicker">SEAT MAP</p><h2>九位叙述者</h2></div><span>{recordedStories.size} 已入账</span></div>
          <p className="people-panel__hint">点击任意座位调查。顺序由你决定，可随时回访。</p>
          <div className="people-list">
            {LIAR_GAME.stories.map((story, index) => {
              const isActive = story.id === activeStory.id;
              const isRecorded = recordedStories.has(story.id);
              return (
                <button
                  aria-pressed={isActive}
                  className={`${isActive ? "is-active" : ""} ${isRecorded ? "is-recorded" : ""}`}
                  key={story.id}
                  onClick={() => openStory(story.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{story.name}</b>
                  <em>{isRecorded ? "已记录" : "未接触"}</em>
                </button>
              );
            })}
          </div>
          <div className="people-panel__room">
            <span>环境记录</span>
            <strong>面试房 / 4 × 4 × 3 米</strong>
            <p>{chamberVolume()} 立方米的密闭方格。空间本身也是一条必须被记录的事实。</p>
          </div>
        </aside>

        <section className="interview-panel case-panel" id="interview" aria-live="polite">
          <div className="interview-panel__header">
            <div><p className="case-kicker">WITNESS {String(LIAR_GAME.stories.findIndex((story) => story.id === activeStory.id) + 1).padStart(2, "0")} / 09</p><h1>{activeStory.name}</h1><span>{activeStory.occupation}</span></div>
            <div className={`record-seal ${recordedStories.has(activeStory.id) ? "is-stamped" : ""}`}>{recordedStories.has(activeStory.id) ? "已入齐夏手账" : "待记录"}</div>
          </div>
          <div className="interview-panel__scene" key={activeStory.id}>
            <figure className="portrait-frame">
              {/* The portrait is deliberately kept as a contained original asset; responsive cropping is forbidden here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={`${activeStory.name}固定角色立绘`} src={`/art/${activeVoice.portraitAsset}.png`} />
              <figcaption><i />固定角色资产 · 不裁切头部与轮廓</figcaption>
            </figure>
            <article className="testimony-sheet">
              <div className="testimony-sheet__meta"><span>当事人证词</span><em>{activeVoice.gender} · {activeVoice.timbre}</em></div>
              <p className="testimony-sheet__speaker">{activeStory.name}</p>
              <blockquote>“{activeStory.testimony}”</blockquote>
              <div className="testimony-sheet__actions">
                <button className={`case-button case-button--audio ${isTestimonyPlaying ? "is-playing" : ""}`} onClick={() => speak("testimony")}>
                  <span>{isTestimonyPlaying ? "II" : "▶"}</span>{isTestimonyPlaying ? "停止固定证词音轨" : "播放固定证词音轨"}
                </button>
                <button className="case-button case-button--record" disabled={recordedStories.has(activeStory.id)} onClick={recordActiveStory}>
                  {recordedStories.has(activeStory.id) ? "已记录本段事实" : "记录本段事实"}
                </button>
              </div>
              {voiceError && <p className="audio-status is-error" role="status">{voiceError}</p>}
              {isTestimonyPlaying && <p className="audio-status"><i />固定音轨播放中；背景声场已压低。</p>}
            </article>
          </div>

          <section className="evidence-strip" aria-label="本段可记录事实">
            <div><p className="case-kicker">FACTS FROM THIS TESTIMONY</p><h2>本段事实</h2></div>
            <div className="evidence-strip__cards">
              {activeEvidence.map((evidence) => (
                <article className={recordedEvidence.has(evidence.id) ? "is-unlocked" : ""} key={evidence.id}>
                  <span>{evidence.kind}</span><strong>{evidence.label}</strong><p>{recordedEvidence.has(evidence.id) ? evidence.text : "记录证词后解锁"}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`follow-up-panel ${followUpUnlocked ? "is-unlocked" : ""}`}>
            <div><p className="case-kicker">QI XIA / CONDITIONAL QUESTION</p><h2>{activeFollowUpLabel}</h2><span>{followUpUnlocked ? "已满足发问条件" : recordedStories.has(activeStory.id) ? "尚有前置推断未闭合" : "先记录当事人证词"}</span></div>
            <div className="follow-up-panel__copy">
              {followUpUnlocked ? <><p className="testimony-sheet__speaker">{activeFollowUpSpeaker}</p><blockquote>“{activeFollowUp}”</blockquote></> : <p>追问不会自动出现。它必须建立在已记录的原文事实与已完成的推断上。</p>}
              <button className={`case-button case-button--audio ${isFollowUpPlaying ? "is-playing" : ""}`} disabled={!followUpUnlocked} onClick={askFollowUp}>
                <span>{isFollowUpPlaying ? "II" : "▶"}</span>{isFollowUpPlaying ? "停止齐夏语音" : "播放齐夏追问"}
              </button>
            </div>
          </section>
        </section>

        <aside className="notebook-panel case-panel" id="notebook">
          <div className="panel-heading"><div><p className="case-kicker">QI XIA&apos;S NOTEBOOK</p><h2>齐夏手账</h2></div><span>{selectedEvidenceIds.size} 枚已选</span></div>
          <p className="notebook-panel__hint">点击事实卡加入当前推断。系统只检验链条是否闭合，不替你选择答案。</p>
          <div className="notebook-filters" aria-label="手账筛选">
            {NOTEBOOK_FILTERS.map((filter) => <button className={notebookFilter === filter ? "is-active" : ""} key={filter} onClick={() => setNotebookFilter(filter)}>{filter}</button>)}
          </div>
          <div className="notebook-cards">
            {filteredEvidence.map((evidence) => (
              <button
                aria-pressed={selectedEvidenceIds.has(evidence.id)}
                className={selectedEvidenceIds.has(evidence.id) ? "is-selected" : ""}
                key={evidence.id}
                onClick={() => toggleEvidenceSelection(evidence.id)}
              >
                <span>{evidence.kind} / {evidence.storyId === "renyang" ? "人羊" : LIAR_GAME.stories.find((story) => story.id === evidence.storyId)?.name}</span>
                <strong>{evidence.label}</strong>
                <p>{evidence.text}</p>
                <em>{evidence.source}</em>
              </button>
            ))}
          </div>
          {!filteredEvidence.length && <p className="notebook-empty">这个分类还没有已记录的事实。</p>}
        </aside>
      </section>

      <section className="deduction-desk case-panel" id="deduction">
        <div className="deduction-desk__heading"><div><p className="case-kicker">REASONING BENCH / NO AUTO ANSWERS</p><h2>证据连线</h2><p>先从手账选择事实，再提交一条推断。只有已听到的证词可以成为凭据。</p></div><button className="case-button case-button--primary" onClick={buildDeduction}>建立当前连线</button></div>
        <div className="deduction-desk__grid">
          {LIAR_DEDUCTIONS.map((deduction) => {
            const isComplete = completedDeductions.has(deduction.id);
            const isSupported = deductionIsSupported(deduction, recordedEvidence, completedDeductions);
            return (
              <article className={`${isComplete ? "is-complete" : ""} ${isSupported ? "is-ready" : ""}`} key={deduction.id}>
                <span>{isComplete ? "已闭合" : isSupported ? "凭据已齐" : "线索不足"}</span>
                <h3>{deduction.title}</h3>
                <p>{deduction.description}</p>
                <footer>{isComplete ? deduction.result : `需要 ${deduction.requiredEvidence.length} 枚原文事实${deduction.requiresDeductions?.length ? "，以及前置推断" : ""}`}</footer>
              </article>
            );
          })}
        </div>
        <div className="deduction-desk__notice"><i />{workbenchNotice}</div>
        <div className="deduction-desk__footer">
          <span>{allStoriesRecorded ? "九段证词已完整记录。" : `还有 ${LIAR_GAME.stories.length - recordedStories.size} 段证词未记录。`}</span>
          <button className="case-button case-button--primary" disabled={!voteUnlocked} onClick={() => setScreen("vote")}>{voteUnlocked ? "前往投票台" : "完成规则边界后解锁投票"}</button>
        </div>
      </section>

      <footer className="case-footer">原文优先 · 固定角色立绘 · 静态语音资产 · 单机调查竖切</footer>
    </main>
  );
}
