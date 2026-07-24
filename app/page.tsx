"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CANONICAL_LIAR_TARGET,
  LIAR_GAME,
  type LiarGamePhase,
  chamberVolume,
  resolveCanonicalVote,
} from "./lib/liar-game";
import { SuspenseBgm } from "./lib/suspense-bgm";
import { TestimonySpeech, type CharacterVoiceId, type VoiceLineKind } from "./lib/testimony-speech";

const PHASES: Array<{ id: LiarGamePhase; label: string }> = [
  { id: "lobby", label: "入场" },
  { id: "rules", label: "规则" },
  { id: "identity", label: "身份牌" },
  { id: "stories", label: "叙述" },
  { id: "deduction", label: "调查" },
  { id: "vote", label: "投票" },
  { id: "result", label: "结算" },
];

const PHASE_CLOCK: Record<LiarGamePhase, string> = {
  lobby: "12:00",
  rules: "12:00",
  identity: "12:01",
  stories: "12:20",
  deduction: "12:47",
  vote: "12:59",
  result: "01:00",
};

const INVESTIGATION_ACTIONS = [
  {
    id: "grid",
    label: "踏查方格",
    short: "空间",
    description: "沿着墙、地面与天花板逐格测量面试房。",
    result: "方格组成的房间是 4 × 4 × 3 米：这不是可以容纳漫长等待的正常空间。",
  },
  {
    id: "cards",
    label: "比对身份牌",
    short: "规则",
    description: "将九张“说谎者”身份牌与每段叙述并置。",
    result: "每个人都在用“失去意识”遮蔽同一件事；身份牌不是唯一的谎言来源。",
  },
  {
    id: "host",
    label: "锁定主持者",
    short: "人羊",
    description: "把人羊的叙述放回规则的边界内检查。",
    result: "九人都属于讲述者，只有人羊把自己排除在外；他的“造神”叙述无法成立。",
  },
] as const;

export default function Home() {
  const [phase, setPhase] = useState<LiarGamePhase>("lobby");
  const [identityRevealed, setIdentityRevealed] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyTake, setStoryTake] = useState(0);
  const [storyQuestionOpen, setStoryQuestionOpen] = useState(false);
  const [speakingLine, setSpeakingLine] = useState<VoiceLineKind | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [heardStories, setHeardStories] = useState<Set<string>>(new Set());
  const [collectedEvidence, setCollectedEvidence] = useState<Set<string>>(new Set());
  const [deductionRevealed, setDeductionRevealed] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const bgmRef = useRef<SuspenseBgm | null>(null);
  const speechRef = useRef<TestimonySpeech | null>(null);

  const currentStory = LIAR_GAME.stories[storyIndex];
  const isSelfNarration = Boolean(currentStory.selfReflection);
  const responseLine = currentStory.selfReflection ?? currentStory.followUp ?? "";
  const responseTitle = isSelfNarration ? "齐夏内心推演" : "齐夏追问";
  const responseSpeaker = isSelfNarration ? "齐夏（心声）" : "齐夏";
  const responseAction = isSelfNarration ? "内心推演" : "追问";
  const testimonyPlaying = speakingLine === "testimony";
  const followUpPlaying = speakingLine === "followUp";
  const phaseIndex = PHASES.findIndex((item) => item.id === phase);
  const allStoriesHeard = heardStories.size === LIAR_GAME.stories.length;
  const allEvidenceCollected = collectedEvidence.size === INVESTIGATION_ACTIONS.length;
  const resolution = useMemo(
    () => (phase === "result" ? resolveCanonicalVote(selectedTarget) : null),
    [phase, selectedTarget],
  );

  useEffect(() => {
    const bgm = new SuspenseBgm();
    bgmRef.current = bgm;
    return () => bgm.stop();
  }, []);

  useEffect(() => {
    const speech = new TestimonySpeech();
    speechRef.current = speech;
    return () => speech.stop();
  }, []);

  const startMusic = () => {
    if (!musicEnabled) return;
    void bgmRef.current?.start().then(setMusicStarted);
  };

  const activateMusic = () => {
    setMusicEnabled(true);
    void bgmRef.current?.start().then(setMusicStarted);
  };

  const toggleMusic = () => {
    if (musicStarted) {
      bgmRef.current?.stop();
      setMusicStarted(false);
      setMusicEnabled(false);
      return;
    }

    activateMusic();
  };

  const advanceTo = (nextPhase: LiarGamePhase) => {
    startMusic();
    setPhase(nextPhase);
  };

  const openStory = (index: number) => {
    startMusic();
    speechRef.current?.stop();
    bgmRef.current?.setDucked(false);
    setStoryIndex(index);
    setStoryTake((current) => current + 1);
    setStoryQuestionOpen(false);
    setSpeakingLine(null);
    setVoiceError(null);
  };

  const recordCurrentStory = () => {
    setHeardStories((current) => new Set([...current, currentStory.id]));
  };

  const toggleCurrentSpeech = (kind: VoiceLineKind) => {
    if (speakingLine === kind) {
      speechRef.current?.stop();
      bgmRef.current?.setDucked(false);
      setSpeakingLine(null);
      return;
    }

    startMusic();
    bgmRef.current?.setDucked(true);
    setVoiceError(null);
    setSpeakingLine(kind);
    void speechRef.current?.speak(
      currentStory.id as CharacterVoiceId,
      kind,
      () => undefined,
      () => {
        bgmRef.current?.setDucked(false);
        setSpeakingLine(null);
      },
      () => {
        bgmRef.current?.setDucked(false);
        setSpeakingLine(null);
        setVoiceError("固定语音文件暂时无法播放。");
      },
    );
  };

  const askFollowUp = () => {
    setStoryQuestionOpen(true);
    toggleCurrentSpeech("followUp");
  };

  const collectEvidence = (id: string) => {
    setCollectedEvidence((current) => new Set([...current, id]));
  };

  const resetGame = () => {
    setPhase("lobby");
    setIdentityRevealed(false);
    setStoryIndex(0);
    setStoryTake(0);
    setStoryQuestionOpen(false);
    speechRef.current?.stop();
    bgmRef.current?.setDucked(false);
    setSpeakingLine(null);
    setVoiceError(null);
    setHeardStories(new Set());
    setCollectedEvidence(new Set());
    setDeductionRevealed(false);
    setSelectedTarget(null);
  };

  return (
    <main className="game-app">
      <header className="game-topbar">
        <div className="game-brand">
          <span className="game-brand-mark" aria-hidden="true">女</span>
          <div>
            <p>单机剧情 RPG · 第一日</p>
            <h1>说谎者</h1>
          </div>
        </div>
        <div className="game-topbar__tools">
          <button
            aria-pressed={musicEnabled}
            className={`music-control ${musicEnabled ? "is-enabled" : ""}`}
            onClick={toggleMusic}
          >
            <i aria-hidden="true" />
            <span>BGM</span>
            <em>{musicEnabled ? (musicStarted ? "紧迫声场" : "点击剧情启动") : "静音"}</em>
          </button>
          <div className="game-clock" aria-label="游戏时间">
            <span>座钟</span>
            <strong>{PHASE_CLOCK[phase]}</strong>
          </div>
        </div>
      </header>

      <section className="game-frame" aria-label="说谎者单机桌游关卡">
        <aside className="game-progress" aria-label="关卡阶段">
          <p className="game-eyebrow">SOLO RPG FLOW</p>
          <ol>
            {PHASES.map((item, index) => (
              <li className={index <= phaseIndex ? "is-reached" : ""} key={item.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </li>
            ))}
          </ol>

          <div className="game-rule-card">
            <p className="game-eyebrow">当前目标</p>
            <strong>完成叙述与三次调查</strong>
            <p>你以齐夏的视角读取规则、记录线索，并在最后落下唯一的一票。</p>
          </div>
        </aside>

        <section className="game-table" aria-live="polite">
          {phase === "lobby" && (
            <section className="game-stage game-stage--entry">
              <p className="game-kicker">SOLO STORY RPG / CHAPTER 001</p>
              <div className="entry-clock" aria-hidden="true"><i /></div>
              <h2>座钟指向十二点。</h2>
              <p className="game-lead">
                这是单机剧情模式：你将以桌游的行动、线索和投票流程，亲自走完“说谎者”。
                联机房间不参与当前版本，先把每一个角色、场景与关键时刻做成可体验的故事。
              </p>
              <div className="entry-actions">
                <button className="game-primary" onClick={() => advanceTo("rules")}>开始第一日</button>
              </div>
            </section>
          )}

          {phase === "rules" && (
            <section className="game-stage game-stage--rules">
              <p className="game-kicker">HOST: 人羊</p>
              <h2>规则公布</h2>
              <div className="host-showcase" aria-hidden="true">
                <div className="host-showcase__portrait" />
                <i className="host-showcase__glow" />
              </div>
              <div className="rule-list">
                {LIAR_GAME.rules.map((rule, index) => (
                  <article key={rule}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{rule}</p>
                  </article>
                ))}
              </div>
              <div className="stage-footer">
                <p>规则不是背景说明。它们会决定每一条叙述能否成立。</p>
                <button className="game-primary" onClick={() => advanceTo("identity")}>抽取身份牌</button>
              </div>
            </section>
          )}

          {phase === "identity" && (
            <section className="game-stage game-stage--identity">
              <p className="game-kicker">PRIVATE INFORMATION / QI XIA</p>
              <h2>翻开你的身份牌</h2>
              <div className="identity-reveal-layout">
                <div className="character-keyart character-keyart--qixia" aria-label="齐夏立绘">
                  <span>齐夏 · 职业骗子</span>
                </div>
                <button
                  aria-pressed={identityRevealed}
                  className={`identity-card ${identityRevealed ? "is-revealed" : ""}`}
                  onClick={() => setIdentityRevealed(true)}
                >
                  <span className="identity-card__back">女娲游戏</span>
                  <span className="identity-card__front">
                    <small>你的身份</small>
                    <b>说谎者</b>
                    <em>你必须说谎</em>
                  </span>
                </button>
              </div>
              <p className="identity-note">
                {identityRevealed
                  ? "身份牌要求你说谎；但“说谎者”这个词是否只指身份牌，仍需由你在规则中判断。"
                  : "身份牌只向持牌者公开。点击纸牌查看。"}
              </p>
              <div className="stage-footer">
                <p>齐夏的第一条行动不是下结论，而是把每个人的叙述完整听完。</p>
                <button
                  className="game-primary"
                  disabled={!identityRevealed}
                  onClick={() => {
                    openStory(0);
                    advanceTo("stories");
                  }}
                >
                  开始听取叙述
                </button>
              </div>
            </section>
          )}

          {phase === "stories" && (
            <>
              <section className="game-stage game-stage--testimony" aria-label="角色证词回合">
                <div className="testimony-heading">
                  <div>
                    <p className="game-kicker">FIRST TRIAL / TESTIMONY {String(storyIndex + 1).padStart(2, "0")}</p>
                    <h2>{currentStory.name}</h2>
                    <span>{currentStory.occupation}</span>
                  </div>
                  <button
                    className={`testimony-record ${heardStories.has(currentStory.id) ? "is-recorded" : ""}`}
                    disabled={heardStories.has(currentStory.id)}
                    onClick={recordCurrentStory}
                  >
                    {heardStories.has(currentStory.id) ? "矛盾已记录" : "记录矛盾"}
                  </button>
                </div>

                <div className="testimony-layout">
                  <article className="character-dossier">
                    <div
                      aria-label={`${currentStory.name}立绘`}
                      className={`story-portrait story-portrait--${currentStory.id}`}
                      key={`${currentStory.id}-${storyTake}`}
                      role="img"
                    />
                    <div className="character-dossier__meta">
                      <span>角色档案 / {String(storyIndex + 1).padStart(2, "0")}</span>
                      <strong>{currentStory.name}</strong>
                      <em>{currentStory.occupation}</em>
                    </div>
                  </article>

                  <article className="testimony-card">
                    <div className="testimony-card__topline">
                      <span>{isSelfNarration ? "齐夏陈述 / 你的行动" : "当事人证词"}</span>
                      <em>灵客配音 · 固定角色声线</em>
                    </div>
                    <p className="testimony-card__speaker">{currentStory.name}：</p>
                    <blockquote>“{currentStory.testimony}”</blockquote>
                    <button
                      aria-pressed={testimonyPlaying}
                      className={`testimony-speak ${testimonyPlaying ? "is-speaking" : ""}`}
                      onClick={() => toggleCurrentSpeech("testimony")}
                    >
                      <span aria-hidden="true">{testimonyPlaying ? "II" : "▶"}</span>
                      {testimonyPlaying ? "停止本段证词" : "播放本段证词"}
                    </button>
                    {voiceError && <p className="voice-error" role="status">{voiceError}</p>}
                  </article>
                </div>

                <div className="testimony-actions">
                  <button
                    aria-expanded={storyQuestionOpen}
                    className="game-secondary"
                    onClick={askFollowUp}
                  >
                    {followUpPlaying ? `停止${responseAction}语音` : isSelfNarration ? "回看齐夏的判断" : "追问细节"}
                  </button>
                  <p>先听证词，再将发现的矛盾写入手账。已记录 {heardStories.size} / {LIAR_GAME.stories.length}</p>
                </div>

                {storyQuestionOpen && (
                  <aside className="testimony-question">
                    <span>{responseTitle}</span>
                    <p className="testimony-card__speaker">{responseSpeaker}：</p>
                    <p>{responseLine}</p>
                    <button
                      aria-pressed={followUpPlaying}
                      className={`testimony-speak testimony-speak--follow-up ${followUpPlaying ? "is-speaking" : ""}`}
                      onClick={() => toggleCurrentSpeech("followUp")}
                    >
                      <span aria-hidden="true">{followUpPlaying ? "II" : "▶"}</span>
                      {followUpPlaying ? `停止${responseAction}语音` : `播放${responseTitle}`}
                    </button>
                    <p className="testimony-question__clue">
                      <span>{isSelfNarration ? "齐夏自证线索 / " : `齐夏手账 / ${currentStory.name} / `}</span>
                      {currentStory.clue}
                    </p>
                  </aside>
                )}

                <div className={`story-clue ${heardStories.has(currentStory.id) ? "is-recorded" : ""}`}>
                  <span>手账记录</span>
                  <p>{heardStories.has(currentStory.id) ? currentStory.clue : "这段证词尚未入账。找到矛盾后点击“记录矛盾”。"}</p>
                </div>

                <div className="story-controls">
                  <button className="game-secondary" disabled={storyIndex === 0} onClick={() => openStory(storyIndex - 1)}>上一位</button>
                  {storyIndex < LIAR_GAME.stories.length - 1 ? (
                    <button className="game-primary" onClick={() => openStory(storyIndex + 1)}>下一位叙述者</button>
                  ) : (
                    <button className="game-primary" disabled={!allStoriesHeard} onClick={() => advanceTo("deduction")}>进入调查回合</button>
                  )}
                </div>

                <div className="story-seats" aria-label="叙述者列表">
                  {LIAR_GAME.stories.map((story, index) => (
                    <button
                      aria-pressed={storyIndex === index}
                      className={`${storyIndex === index ? "is-current" : ""} ${heardStories.has(story.id) ? "is-heard" : ""}`}
                      key={story.id}
                      onClick={() => openStory(index)}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>{story.name}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {phase === "deduction" && (
            <section className="game-stage game-stage--deduction">
              <p className="game-kicker">RPG INVESTIGATION / 03 ACTIONS</p>
              <h2>将线索落到棋盘上</h2>
              <p className="game-lead investigation-lead">每次行动都会留下可以验证的记录。完成三次调查，才允许进入最终投票。</p>
              <div className="investigation-board" aria-label="调查行动">
                {INVESTIGATION_ACTIONS.map((action, index) => {
                  const isCollected = collectedEvidence.has(action.id);
                  return (
                    <button
                      aria-pressed={isCollected}
                      className={isCollected ? "is-collected" : ""}
                      key={action.id}
                      onClick={() => collectEvidence(action.id)}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{action.label}</strong>
                      <em>{action.short}</em>
                      <p>{isCollected ? action.result : action.description}</p>
                    </button>
                  );
                })}
              </div>
              <div className="deduction-grid">
                <article className={collectedEvidence.has("grid") ? "is-revealed" : ""}>
                  <span>行动 01</span>
                  <h3>密室与氧气</h3>
                  <p>{collectedEvidence.has("grid") ? `房间体积只有 ${chamberVolume()} 立方米；时间、人数与空气的逻辑无法共存。` : "完成“踏查方格”后解锁。"}</p>
                </article>
                <article className={collectedEvidence.has("cards") ? "is-revealed" : ""}>
                  <span>行动 02</span>
                  <h3>九张身份牌</h3>
                  <p>{collectedEvidence.has("cards") ? "所有人都说了谎，但其中只有一段叙述违反了规则本身。" : "完成“比对身份牌”后解锁。"}</p>
                </article>
                <article className={deductionRevealed ? "is-revealed" : ""}>
                  <span>{deductionRevealed ? "已推演" : "待推演"}</span>
                  <h3>唯一说谎者</h3>
                  <p>{deductionRevealed ? "人羊将自己排除在讲述者之外；这正是规则允许被九票锁定的唯一谎言。" : "完成三次行动后，提交最终推演。"}</p>
                  {!deductionRevealed && <button className="game-secondary" disabled={!allEvidenceCollected} onClick={() => setDeductionRevealed(true)}>提交推演</button>}
                </article>
              </div>
              <div className="stage-footer">
                <p>{deductionRevealed ? "推演成立：现在由你亲手写下最终一票。" : `已完成 ${collectedEvidence.size} / ${INVESTIGATION_ACTIONS.length} 次调查行动。`}</p>
                <button className="game-primary" disabled={!deductionRevealed} onClick={() => advanceTo("vote")}>拿起投票纸</button>
              </div>
            </section>
          )}

          {phase === "vote" && (
            <section className="game-stage game-stage--vote">
              <p className="game-kicker">FINAL DECISION / ONE BALLOT</p>
              <h2>在纸上写下一个名字。</h2>
              <p className="game-lead">将所有线索还原到规则的边界：只有人羊将自己排除在叙述者之外。现在由你落下这一票。</p>
              <div className="suspect-grid">
                {LIAR_GAME.suspects.map((suspect) => (
                  <button
                    aria-pressed={selectedTarget === suspect.id}
                    className={selectedTarget === suspect.id ? "is-selected" : ""}
                    key={suspect.id}
                    onClick={() => setSelectedTarget(suspect.id)}
                  >
                    <span>{suspect.type === "host" ? "主持者" : "参与者"}</span>
                    {suspect.name}
                  </button>
                ))}
              </div>
              <div className="stage-footer">
                <p>{selectedTarget ? `你的投票：${LIAR_GAME.suspects.find((suspect) => suspect.id === selectedTarget)?.name}` : "尚未落笔。"}</p>
                <button className="game-danger" disabled={!selectedTarget} onClick={() => advanceTo("result")}>确认投票</button>
              </div>
            </section>
          )}

          {phase === "result" && resolution && (
            <section className={`game-stage game-stage--result ${resolution.isCorrect ? "is-victory" : "is-failure"}`}>
              <p className="game-kicker">CHAPTER RESULT / {resolution.isCorrect ? "CLEAR" : "FAILED"}</p>
              <h2>{resolution.isCorrect ? "九票一致：人羊" : `投票偏差：${resolution.target?.name ?? "未知"}`}</h2>
              <p className="result-copy">
                {resolution.isCorrect
                  ? "九张身份牌全部翻开后，九人均为“说谎者”。唯一能被规则证明的谎言来自人羊将自己排除在讲述者之外。面试房第一局结束。"
                  : "规则没有留下容错。只要没有锁定唯一的说谎者，面试房就会回到座钟指向十二点的时刻。"}
              </p>
              <div className="result-record">
                <span>你的投票</span><strong>{resolution.target?.name}</strong>
                <span>正确目标</span><strong>{LIAR_GAME.suspects.find((suspect) => suspect.id === CANONICAL_LIAR_TARGET)?.name}</strong>
              </div>
              <button className="game-primary" onClick={resetGame}>重开本局</button>
            </section>
          )}
        </section>

        <aside className="game-ledger" aria-label="本局记录">
          <p className="game-eyebrow">RPG LEDGER</p>
          <h2>面试房</h2>
          <dl>
            <div><dt>视角角色</dt><dd>齐夏</dd></div>
            <div><dt>主持者</dt><dd>{LIAR_GAME.host}</dd></div>
            <div><dt>参与者</dt><dd>{LIAR_GAME.participantCount} 人</dd></div>
            <div><dt>房间</dt><dd>{LIAR_GAME.chamber.lengthMeters} × {LIAR_GAME.chamber.widthMeters} × {LIAR_GAME.chamber.heightMeters} m</dd></div>
          </dl>

          <div className="ledger-section">
            <p className="game-eyebrow">叙述记录</p>
            <strong>{heardStories.size} / {LIAR_GAME.stories.length}</strong>
            <div className="ledger-dots" aria-label="叙述收听进度">
              {LIAR_GAME.stories.map((story) => <i className={heardStories.has(story.id) ? "is-heard" : ""} key={story.id} />)}
            </div>
          </div>

          <div className="ledger-section">
            <p className="game-eyebrow">调查行动</p>
            <strong>{collectedEvidence.size} / {INVESTIGATION_ACTIONS.length}</strong>
            <p>桌游规则负责边界，RPG 行动负责把边界变成你的判断。</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
