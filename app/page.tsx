"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CROSS_EXAMINATIONS,
  DEDUCTION_PUZZLES,
  PUZZLE_BY_ID,
  ROOM_CLUES,
  puzzleErrorCount,
  type DeductionPuzzleId,
  type RoomClueId,
} from "./lib/deduction-game";
import { LIAR_GAME, resolveCanonicalVote } from "./lib/liar-game";
import { SuspenseBgm } from "./lib/suspense-bgm";
import {
  CHARACTER_VOICE_PROFILES,
  TestimonySpeech,
  type CharacterVoiceId,
  type VoiceLineKind,
} from "./lib/testimony-speech";

type GameScreen = "identity" | "room" | "vote" | "ending";
type Drawer = "witness" | "observation" | "notebook" | "rules" | null;
type EndingReason = "success" | "wrong-vote" | "timeout" | null;
type PuzzleAnswers = Record<DeductionPuzzleId, Record<string, string>>;

const ROOM_HOTSPOTS: readonly RoomClueId[] = [
  "host-account",
  "wall-grid",
  "clock",
  "occupants",
  "air-rate",
  "headless-body",
];

function clockAt(minutes: number) {
  const safeMinutes = Math.min(60, minutes);
  return `${String(12 + Math.floor(safeMinutes / 60)).padStart(2, "0")}:${String(safeMinutes % 60).padStart(2, "0")}`;
}

function cloneAnswers(): PuzzleAnswers {
  return {
    "case-thread": {},
    "air-ledger": {},
    "last-moment": {},
    "rule-reversal": {},
  };
}

export default function Home() {
  const [screen, setScreen] = useState<GameScreen>("identity");
  const [cardRevealed, setCardRevealed] = useState(false);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [activeStoryId, setActiveStoryId] = useState("tiantian");
  const [activeClueId, setActiveClueId] = useState<RoomClueId>("host-account");
  const [observedClues, setObservedClues] = useState<Set<RoomClueId>>(new Set());
  const [recordedStories, setRecordedStories] = useState<Set<string>>(new Set());
  const [challengedStories, setChallengedStories] = useState<Set<string>>(new Set());
  const [wrongChallenges, setWrongChallenges] = useState<Set<string>>(new Set());
  const [solvedPuzzles, setSolvedPuzzles] = useState<Set<DeductionPuzzleId>>(new Set());
  const [answers, setAnswers] = useState<PuzzleAnswers>(cloneAnswers);
  const [activePuzzleId, setActivePuzzleId] = useState<DeductionPuzzleId>("case-thread");
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [notice, setNotice] = useState("先看房间，不要急着相信任何人的故事。");
  const [history, setHistory] = useState<string[]>(["人羊：所有讲故事的人中，有且只有一位说谎者。"]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [endingReason, setEndingReason] = useState<EndingReason>(null);
  const [speakingLine, setSpeakingLine] = useState<VoiceLineKind | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const speechRef = useRef<TestimonySpeech | null>(null);
  const bgmRef = useRef<SuspenseBgm | null>(null);

  const activeStory = LIAR_GAME.stories.find((story) => story.id === activeStoryId) ?? LIAR_GAME.stories[0];
  const activeVoice = CHARACTER_VOICE_PROFILES[activeStory.id as CharacterVoiceId];
  const activeChallenge = CROSS_EXAMINATIONS.find((challenge) => challenge.storyId === activeStory.id)!;
  const activeClue = ROOM_CLUES.find((clue) => clue.id === activeClueId)!;
  const activePuzzle = PUZZLE_BY_ID[activePuzzleId];
  const voteUnlocked = solvedPuzzles.has("rule-reversal");
  const isTestimonyPlaying = speakingLine === "testimony";
  const isFollowUpPlaying = speakingLine === "followUp";

  const roomClueReady = useMemo(
    () => ["host-account", "wall-grid", "clock", "occupants", "air-rate"].every((id) => observedClues.has(id as RoomClueId)),
    [observedClues],
  );
  const caseThreadReady = useMemo(
    () => ["qiao", "zhang", "li", "qixia"].every((id) => recordedStories.has(id)),
    [recordedStories],
  );

  useEffect(() => {
    const speech = new TestimonySpeech();
    const bgm = new SuspenseBgm();
    speechRef.current = speech;
    bgmRef.current = bgm;
    return () => {
      speech.stop();
      bgm.stop();
    };
  }, []);

  const appendHistory = (line: string) => {
    setHistory((current) => [...current.slice(-4), line]);
  };

  const advanceTime = (amount: number) => {
    setMinutesUsed((current) => {
      const next = Math.min(60, current + amount);
      if (next >= 60) {
        setEndingReason("timeout");
        setScreen("ending");
        setDrawer(null);
      }
      return next;
    });
  };

  const startMusic = () => {
    void bgmRef.current?.start().then((started) => setMusicStarted(Boolean(started)));
  };

  const toggleMusic = () => {
    if (musicStarted) {
      bgmRef.current?.stop();
      setMusicStarted(false);
      return;
    }
    startMusic();
  };

  const speak = (kind: VoiceLineKind) => {
    if (speakingLine === kind) {
      speechRef.current?.stop();
      bgmRef.current?.setDucked(false);
      setSpeakingLine(null);
      return;
    }

    setSpeakingLine(kind);
    setVoiceError(null);
    bgmRef.current?.setDucked(true);
    void speechRef.current?.speak(
      activeStory.id as CharacterVoiceId,
      kind,
      () => undefined,
      () => {
        setSpeakingLine(null);
        bgmRef.current?.setDucked(false);
      },
      () => {
        setSpeakingLine(null);
        bgmRef.current?.setDucked(false);
        setVoiceError("固定音轨未能载入；不会临时换成其他音色。");
      },
    );
  };

  const enterRoom = () => {
    setObservedClues(new Set(["identity"]));
    setScreen("room");
    setNotice("身份牌必须扣住。先观察房间，再盘问桌边的人。");
    appendHistory("齐夏把「说谎者」身份牌扣在桌面上。");
    startMusic();
  };

  const closeDrawer = () => {
    speechRef.current?.stop();
    bgmRef.current?.setDucked(false);
    setSpeakingLine(null);
    setVoiceError(null);
    setDrawer(null);
  };

  const openWitness = (storyId: string) => {
    speechRef.current?.stop();
    setSpeakingLine(null);
    setVoiceError(null);
    setActiveStoryId(storyId);
    setDrawer("witness");
    setNotice("听证词，决定真正值得追问的地方。");
  };

  const openObservation = (clueId: RoomClueId) => {
    setActiveClueId(clueId);
    setDrawer("observation");
  };

  const recordObservation = () => {
    if (observedClues.has(activeClue.id)) return;
    setObservedClues((current) => new Set([...current, activeClue.id]));
    advanceTime(1);
    setNotice(activeClue.note);
    appendHistory(`观察：${activeClue.note}`);
  };

  const recordStory = () => {
    if (recordedStories.has(activeStory.id)) return;
    setRecordedStories((current) => new Set([...current, activeStory.id]));
    advanceTime(1);
    setNotice(`${activeStory.name}的证词已写进草稿。现在选择真正的裂痕。`);
    appendHistory(`${activeStory.name}：${activeStory.clue}`);
  };

  const challengeStory = (option: string) => {
    if (!recordedStories.has(activeStory.id) || challengedStories.has(activeStory.id)) return;
    const key = `${activeStory.id}:${option}`;
    if (wrongChallenges.has(key)) return;

    if (option !== activeChallenge.answer) {
      setWrongChallenges((current) => new Set([...current, key]));
      advanceTime(3);
      setNotice("这只能制造怀疑，无法击穿他的故事。座钟又走了三分钟。");
      appendHistory(`排除：${option}`);
      return;
    }

    setChallengedStories((current) => new Set([...current, activeStory.id]));
    advanceTime(1);
    setNotice(activeChallenge.reaction);
    appendHistory(`反应：${activeChallenge.reaction}`);
    speak("followUp");
  };

  const openNotebook = (puzzleId?: DeductionPuzzleId) => {
    if (puzzleId) setActivePuzzleId(puzzleId);
    setDrawer("notebook");
  };

  const puzzleIsAvailable = (puzzleId: DeductionPuzzleId) => {
    if (puzzleId === "case-thread") return caseThreadReady;
    if (puzzleId === "air-ledger") return roomClueReady;
    if (puzzleId === "last-moment") return challengedStories.size >= 3;
    return solvedPuzzles.has("air-ledger") && solvedPuzzles.has("last-moment");
  };

  const updateAnswer = (puzzleId: DeductionPuzzleId, slotId: string, value: string) => {
    setAnswers((current) => ({
      ...current,
      [puzzleId]: {
        ...current[puzzleId],
        [slotId]: value,
      },
    }));
  };

  const validateActivePuzzle = () => {
    if (!puzzleIsAvailable(activePuzzle.id)) {
      setNotice("纸上的条件还不够。回到房间继续观察。");
      return;
    }
    if (activePuzzle.id === "last-moment" && challengedStories.size < LIAR_GAME.stories.length) {
      advanceTime(4);
      setNotice("你还没资格替所有人下结论。至少还有人的最后一刻没有被击穿。");
      return;
    }

    const errors = puzzleErrorCount(activePuzzle, answers[activePuzzle.id]);
    if (errors > 0) {
      advanceTime(4);
      const feedback = errors <= 2
        ? "整条推演里只剩不超过两处不稳，但草稿不会告诉你是哪两处。"
        : "这条推演无法闭合。你把诱饵当成了结论。";
      setNotice(feedback);
      appendHistory(`推演失败：${feedback}`);
      return;
    }

    setSolvedPuzzles((current) => new Set([...current, activePuzzle.id]));
    setNotice(activePuzzle.success);
    appendHistory(`推演成立：${activePuzzle.success}`);
  };

  const submitVote = () => {
    const resolution = resolveCanonicalVote(selectedTarget);
    setEndingReason(resolution.isCorrect ? "success" : "wrong-vote");
    setScreen("ending");
  };

  const restart = () => {
    speechRef.current?.stop();
    bgmRef.current?.stop();
    setMusicStarted(false);
    setScreen("identity");
    setCardRevealed(false);
    setDrawer(null);
    setActiveStoryId("tiantian");
    setActiveClueId("host-account");
    setObservedClues(new Set());
    setRecordedStories(new Set());
    setChallengedStories(new Set());
    setWrongChallenges(new Set());
    setSolvedPuzzles(new Set());
    setAnswers(cloneAnswers());
    setActivePuzzleId("case-thread");
    setMinutesUsed(0);
    setNotice("先看房间，不要急着相信任何人的故事。");
    setHistory(["人羊：所有讲故事的人中，有且只有一位说谎者。"]);
    setSelectedTarget(null);
    setEndingReason(null);
    setSpeakingLine(null);
    setVoiceError(null);
  };

  const slot = (puzzleId: DeductionPuzzleId, slotId: string, label: string) => {
    const puzzleSlot = PUZZLE_BY_ID[puzzleId].slots.find((item) => item.id === slotId)!;
    return (
      <label className="thought-slot">
        <span className="sr-only">{label}</span>
        <select
          aria-label={label}
          value={answers[puzzleId][slotId] ?? ""}
          onChange={(event) => updateAnswer(puzzleId, slotId, event.target.value)}
        >
          <option value="">选择词条</option>
          {puzzleSlot.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  };

  if (screen === "identity") {
    return (
      <main className="deduction-game identity-scene">
        <div className="identity-scene__room" aria-hidden="true" />
        <div className="identity-scene__vignette" aria-hidden="true" />
        <section className="identity-table" aria-label="抽取身份牌">
          <p className="diegetic-kicker">女娲游戏 / 第一场</p>
          <h1>说谎者</h1>
          <p className="identity-table__rule">九个人依次讲述最后发生的事。所有讲故事的人中，有且只有一个说谎者。</p>
          <button
            aria-label={cardRevealed ? "身份牌：说谎者" : "翻开身份牌"}
            className={`identity-card ${cardRevealed ? "is-revealed" : ""}`}
            onClick={() => setCardRevealed(true)}
          >
            <span className="identity-card__back">女娲游戏</span>
            <span className="identity-card__front"><small>你的身份</small><strong>说谎者</strong></span>
          </button>
          {!cardRevealed
            ? <p className="identity-table__instruction">人羊正在看着你。翻牌。</p>
            : <button className="blood-button" onClick={enterRoom}>扣住卡片，开始游戏</button>}
        </section>
      </main>
    );
  }

  if (screen === "vote") {
    return (
      <main className="deduction-game vote-scene">
        <div className="vote-scene__room" aria-hidden="true" />
        <header className="diegetic-hud">
          <div><span>女娲游戏</span><strong>说谎者</strong></div>
          <time>{clockAt(minutesUsed)}</time>
        </header>
        <section className="ballot-table">
          <p className="diegetic-kicker">只写一个名字</p>
          <h1>八个人必须投中同一个说谎者</h1>
          <p>没有候选人提示，也没有撤回。你写下的名字会决定所有人的生死。</p>
          <div className="ballot-grid">
            {LIAR_GAME.suspects.map((suspect) => (
              <button
                className={selectedTarget === suspect.id ? "is-selected" : ""}
                key={suspect.id}
                onClick={() => setSelectedTarget(suspect.id)}
              >
                <span>{suspect.type === "host" ? "主持者" : "参与者"}</span>
                <strong>{suspect.name}</strong>
              </button>
            ))}
          </div>
          <div className="ballot-actions">
            <button className="ghost-button" onClick={() => setScreen("room")}>再看一眼草稿</button>
            <button className="blood-button" disabled={!selectedTarget} onClick={submitVote}>落笔</button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "ending") {
    const success = endingReason === "success";
    return (
      <main className={`deduction-game ending-scene ${success ? "is-success" : "is-failure"}`}>
        <div className="ending-scene__room" aria-hidden="true" />
        <section className="ending-card">
          <p className="diegetic-kicker">{success ? "01:00 / GAME CLEAR" : "制裁"}</p>
          <h1>{success ? "人羊" : endingReason === "timeout" ? "座钟指向一点" : "错误的一票"}</h1>
          <p>{success
            ? "九张纸上写下了同一个名字。人羊举枪抵住自己的心脏——规则第一次站在了参与者这一边。"
            : endingReason === "timeout"
              ? "推演没能在时限内闭合。人羊收走了桌上的白纸。"
              : "表面矛盾不是百分之百的证据。只要一票错误，说谎者存活，其余人全部出局。"}</p>
          {success && (
            <blockquote>
              “在这个游戏中，唯一能从已知线索里百分之百确认的说谎者，只有一个。”
            </blockquote>
          )}
          <button className="blood-button" onClick={restart}>{success ? "重新复盘" : "回到抽牌前"}</button>
        </section>
      </main>
    );
  }

  return (
    <main className="deduction-game room-game">
      <header className="diegetic-hud">
        <div><span>女娲游戏</span><strong>说谎者</strong></div>
        <p className="hud-notice">{notice}</p>
        <time className={minutesUsed >= 45 ? "is-urgent" : ""}>{clockAt(minutesUsed)}</time>
        <div className="hud-actions">
          <button onClick={toggleMusic}>{musicStarted ? "声场开" : "声场关"}</button>
          <button onClick={() => setDrawer("rules")}>规则</button>
          <button className={voteUnlocked ? "is-ready" : ""} onClick={() => openNotebook()}>
            草稿纸{voteUnlocked ? " · 已闭合" : ""}
          </button>
        </div>
      </header>

      <section className="interview-room-stage" aria-label="密闭面试房">
        <div className="room-stage__image" aria-hidden="true" />
        <div className="room-stage__light" aria-hidden="true" />
        <div className="room-stage__dust" aria-hidden="true" />

        {ROOM_HOTSPOTS.map((clueId) => {
          const clue = ROOM_CLUES.find((item) => item.id === clueId)!;
          return (
            <button
              aria-label={`观察：${clue.label}`}
              className={`room-hotspot room-hotspot--${clueId} ${observedClues.has(clueId) ? "is-observed" : ""}`}
              key={clueId}
              onClick={() => openObservation(clueId)}
            >
              <i />
              <span>{clue.label}</span>
            </button>
          );
        })}

        <button className="private-card-token" onClick={() => setDrawer("rules")}>
          <span>仅你可见</span>
          <strong>说谎者</strong>
        </button>

        <div className="seat-rail" aria-label="九位讲述者">
          {LIAR_GAME.stories.map((story, index) => (
            <button
              className={`${recordedStories.has(story.id) ? "is-recorded" : ""} ${challengedStories.has(story.id) ? "is-broken" : ""}`}
              key={story.id}
              onClick={() => openWitness(story.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{story.name}</strong>
              <em>{challengedStories.has(story.id) ? "……" : recordedStories.has(story.id) ? "已听" : "未问"}</em>
            </button>
          ))}
        </div>
      </section>

      <aside className="thought-ticker" aria-label="齐夏的即时思路">
        <p className="diegetic-kicker">齐夏 / 脑内记录</p>
        <div>
          {history.slice(-3).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
        </div>
      </aside>

      {drawer && <button aria-label="关闭当前面板" className="drawer-scrim" onClick={closeDrawer} />}

      {drawer === "witness" && (
        <section className="game-drawer witness-drawer" aria-label={`${activeStory.name}证词`}>
          <button aria-label="关闭证词" className="drawer-close" onClick={closeDrawer}>×</button>
          <figure className="witness-portrait">
            {/* Fixed portraits are never cropped; every breakpoint preserves the complete asset. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={`${activeStory.name}固定立绘`} src={`/art/${activeVoice.portraitAsset}.png`} />
            <figcaption>{activeStory.name}<span>{activeStory.occupation}</span></figcaption>
          </figure>
          <div className="witness-copy">
            <p className="diegetic-kicker">第 {String(LIAR_GAME.stories.findIndex((story) => story.id === activeStory.id) + 1).padStart(2, "0")} 号讲述者</p>
            <blockquote>“{activeStory.testimony}”</blockquote>
            <div className="audio-row">
              <button className={isTestimonyPlaying ? "is-playing" : ""} onClick={() => speak("testimony")}>
                {isTestimonyPlaying ? "■ 停止证词" : "▶ 播放固定证词"}
              </button>
              <button disabled={recordedStories.has(activeStory.id)} onClick={recordStory}>
                {recordedStories.has(activeStory.id) ? "已写入草稿" : "记下这段话"}
              </button>
            </div>
            {voiceError && <p className="voice-error">{voiceError}</p>}

            <div className={`cross-exam ${recordedStories.has(activeStory.id) ? "is-open" : ""}`}>
              <div>
                <p className="diegetic-kicker">{activeStory.id === "qixia" ? "反问自己" : "选择追问焦点"}</p>
                <span>错误的方向会让座钟继续走。系统不会标出答案。</span>
              </div>
              <div className="cross-exam__options">
                {activeChallenge.options.map((option) => {
                  const key = `${activeStory.id}:${option}`;
                  const isWrong = wrongChallenges.has(key);
                  return (
                    <button
                      className={isWrong ? "is-crossed" : ""}
                      disabled={!recordedStories.has(activeStory.id) || challengedStories.has(activeStory.id) || isWrong}
                      key={option}
                      onClick={() => challengeStory(option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {challengedStories.has(activeStory.id) && (
                <div className="witness-reaction">
                  <p>{activeStory.selfReflection ?? activeStory.followUp}</p>
                  <strong>{activeChallenge.reaction}</strong>
                  <button className={isFollowUpPlaying ? "is-playing" : ""} onClick={() => speak("followUp")}>
                    {isFollowUpPlaying ? "■ 停止齐夏语音" : "▶ 重播齐夏追问"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {drawer === "observation" && (
        <section className="game-drawer observation-drawer" aria-label={activeClue.label}>
          <button aria-label="关闭观察" className="drawer-close" onClick={closeDrawer}>×</button>
          <div className={`observation-visual observation-visual--${activeClue.id}`} aria-hidden="true" />
          <article>
            <p className="diegetic-kicker">{activeClue.eyebrow}</p>
            <h2>{activeClue.label}</h2>
            <p>{activeClue.observation}</p>
            <button className="blood-button" disabled={observedClues.has(activeClue.id)} onClick={recordObservation}>
              {observedClues.has(activeClue.id) ? "已经记住" : "记在草稿边缘"}
            </button>
          </article>
        </section>
      )}

      {drawer === "rules" && (
        <section className="game-drawer rules-drawer" aria-label="说谎者规则">
          <button aria-label="关闭规则" className="drawer-close" onClick={closeDrawer}>×</button>
          <p className="diegetic-kicker">人羊公布的规则</p>
          <h2>规则是绝对的</h2>
          <ol>
            {LIAR_GAME.rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ol>
          <div className="rules-card"><span>你的身份牌</span><strong>说谎者</strong><p>牌是真的。人羊的话未必都是真的。</p></div>
        </section>
      )}

      {drawer === "notebook" && (
        <section className="notebook-overlay" aria-label="齐夏的草稿纸">
          <button aria-label="关闭草稿纸" className="drawer-close" onClick={closeDrawer}>×</button>
          <nav className="notebook-tabs" aria-label="草稿页">
            {DEDUCTION_PUZZLES.map((puzzle) => (
              <button
                className={`${activePuzzleId === puzzle.id ? "is-active" : ""} ${solvedPuzzles.has(puzzle.id) ? "is-solved" : ""}`}
                key={puzzle.id}
                onClick={() => setActivePuzzleId(puzzle.id)}
              >
                {puzzle.tab}
              </button>
            ))}
          </nav>
          <article className="notebook-page">
            <header>
              <p className="diegetic-kicker">{activePuzzle.tab} / 齐夏</p>
              <h2>{activePuzzle.title}</h2>
              {solvedPuzzles.has(activePuzzle.id) && <span className="solved-stamp">成立</span>}
            </header>

            {!puzzleIsAvailable(activePuzzle.id) ? (
              <div className="folded-thought">
                <span>墨迹还没有连起来。</span>
                <p>{activePuzzle.id === "case-thread"
                  ? "二百万不止出现了一次。先把相关的讲述听完整。"
                  : activePuzzle.id === "air-ledger"
                    ? "房间里有答案。墙、钟、人、呼吸——缺一眼都不行。"
                    : activePuzzle.id === "last-moment"
                      ? "不要只找故事之间的矛盾，去问他们最后发生了什么。"
                      : "先证明眼前的现实和九个人的故事，再回头重读规则。"}</p>
              </div>
            ) : (
              <>
                {activePuzzle.id === "case-thread" && (
                  <div className="thought-sheet case-thread-sheet">
                    <p>乔家劲的债主说被骗走 {slot("case-thread", "qiao", "乔家劲故事中的金额")}；</p>
                    <p>章晨泽的当事人被骗走 {slot("case-thread", "zhang", "章晨泽故事中的金额")}；</p>
                    <p>李尚武蹲守的诈骗犯涉案 {slot("case-thread", "li", "李尚武故事中的金额")}；</p>
                    <p>齐夏正在洗手里的 {slot("case-thread", "qixia", "齐夏故事中的金额")}。</p>
                    <p className="thought-conclusion">“准备开庭”与“仍在蹲守”之间的冲突，只能 {slot("case-thread", "timeline", "案件线结论")}。</p>
                  </div>
                )}

                {activePuzzle.id === "air-ledger" && (
                  <div className="thought-sheet air-ledger-sheet">
                    <div className="formula-line">
                      <span>房间</span>
                      {slot("air-ledger", "length", "房间长度")} × {slot("air-ledger", "width", "房间宽度")} × {slot("air-ledger", "height", "房间高度")}
                      <strong>= {solvedPuzzles.has("air-ledger") ? "48 m³" : "?"}</strong>
                    </div>
                    <div className="formula-line">
                      <span>应耗空气</span>
                      {slot("air-ledger", "people", "房间人数")} × {slot("air-ledger", "hours", "密闭小时")} × {slot("air-ledger", "rate", "每人每小时空气消耗")}
                      <strong>= {solvedPuzzles.has("air-ledger") ? "54.6 m³" : "?"}</strong>
                    </div>
                    <div className="formula-line">
                      <span>排除人羊</span>
                      {slot("air-ledger", "withoutHost", "排除人羊后的人数")} × 13 × 0.42
                      <strong>= {solvedPuzzles.has("air-ledger") ? "49.14 m³" : "?"}</strong>
                    </div>
                    <p>如果这些数字成立，为什么没有任何人缺氧？</p>
                  </div>
                )}

                {activePuzzle.id === "last-moment" && (
                  <div className="thought-sheet last-moment-sheet">
                    <div className="reaction-grid">
                      {LIAR_GAME.stories.map((story) => (
                        <span className={challengedStories.has(story.id) ? "is-silent" : ""} key={story.id}>
                          {story.name}<i>{challengedStories.has(story.id) ? "沉默" : "？"}</i>
                        </span>
                      ))}
                    </div>
                    <p>{slot("last-moment", "subject", "共同说谎的人")} 实际上 {slot("last-moment", "truth", "九人的真实状态")}；</p>
                    <p>他们把死亡共同改写成 {slot("last-moment", "wording", "九人使用的共同措辞")}。</p>
                    <p className="thought-conclusion">所以：{slot("last-moment", "verdict", "九人证词结论")}。</p>
                  </div>
                )}

                {activePuzzle.id === "rule-reversal" && (
                  <div className="thought-sheet rule-reversal-sheet">
                    <p>{slot("rule-reversal", "narrator", "额外的讲述者")} 也讲过一段故事：</p>
                    <p className="quoted-thought">“{slot("rule-reversal", "story", "人羊讲述的故事")}。”</p>
                    <p>因此，他同样属于 {slot("rule-reversal", "scope", "规则中的讲述者范围")}。</p>
                    <p className="thought-conclusion">唯一能百分之百写下的名字是 {slot("rule-reversal", "certain", "最终确定的说谎者")}。</p>
                  </div>
                )}

                <footer className="notebook-page__footer">
                  <p>{solvedPuzzles.has(activePuzzle.id) ? activePuzzle.success : "系统只检查整条推演，不会指出具体哪个词填错。"}</p>
                  <button className="blood-button" disabled={solvedPuzzles.has(activePuzzle.id)} onClick={validateActivePuzzle}>
                    {solvedPuzzles.has(activePuzzle.id) ? "这条已经成立" : "压下这条推演"}
                  </button>
                </footer>
              </>
            )}
          </article>
          <footer className="notebook-actions">
            <span>{notice}</span>
            <button className="blood-button" disabled={!voteUnlocked} onClick={() => { closeDrawer(); setScreen("vote"); }}>
              {voteUnlocked ? "拿起白纸投票" : "纸背还没有答案"}
            </button>
          </footer>
        </section>
      )}
    </main>
  );
}
