"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CANONICAL_LIAR_TARGET,
  LIAR_GAME,
  type LiarGamePhase,
  chamberVolume,
  resolveCanonicalVote,
} from "./lib/liar-game";

const PHASES: Array<{ id: LiarGamePhase; label: string }> = [
  { id: "lobby", label: "入场" },
  { id: "rules", label: "规则" },
  { id: "identity", label: "身份牌" },
  { id: "stories", label: "讲述" },
  { id: "deduction", label: "推演" },
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

export default function Home() {
  const [phase, setPhase] = useState<LiarGamePhase>("lobby");
  const [identityRevealed, setIdentityRevealed] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [heardStories, setHeardStories] = useState<Set<string>>(new Set());
  const [deductionRevealed, setDeductionRevealed] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const currentStory = LIAR_GAME.stories[storyIndex];
  const phaseIndex = PHASES.findIndex((item) => item.id === phase);
  const allStoriesHeard = heardStories.size === LIAR_GAME.stories.length;
  const resolution = useMemo(
    () => (phase === "result" ? resolveCanonicalVote(selectedTarget) : null),
    [phase, selectedTarget],
  );

  const openStory = (index: number) => {
    const story = LIAR_GAME.stories[index];
    setStoryIndex(index);
    setHeardStories((current) => new Set([...current, story.id]));
  };

  const resetGame = () => {
    setPhase("lobby");
    setIdentityRevealed(false);
    setStoryIndex(0);
    setHeardStories(new Set());
    setDeductionRevealed(false);
    setSelectedTarget(null);
  };

  return (
    <main className="game-app">
      <header className="game-topbar">
        <div className="game-brand">
          <span className="game-brand-mark" aria-hidden="true">女</span>
          <div>
            <p>女娲游戏 · 原著模式</p>
            <h1>说谎者</h1>
          </div>
        </div>
        <div className="game-clock" aria-label="游戏时间">
          <span>座钟</span>
          <strong>{PHASE_CLOCK[phase]}</strong>
        </div>
      </header>

      <section className="game-frame" aria-label="说谎者游戏桌">
        <aside className="game-progress" aria-label="游戏阶段">
          <p className="game-eyebrow">GAME FLOW</p>
          <ol>
            {PHASES.map((item, index) => (
              <li className={index <= phaseIndex ? "is-reached" : ""} key={item.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </li>
            ))}
          </ol>

          <div className="game-rule-card">
            <p className="game-eyebrow">胜负条件</p>
            <strong>九票必须一致</strong>
            <p>全部投向唯一的说谎者，参与者才能存活。</p>
          </div>
        </aside>

        <section className="game-table" aria-live="polite">
          {phase === "lobby" && (
            <section className="game-stage game-stage--entry">
              <p className="game-kicker">INTERVIEW ROOM / 09 PARTICIPANTS</p>
              <div className="entry-clock" aria-hidden="true"><i /></div>
              <h2>座钟指向十二点。</h2>
              <p className="game-lead">
                你坐在没有门的密室中。十人围桌而坐，山羊头却只向“九位”参与者问好。
                这一局不靠数值，不靠抽卡强度；你必须读懂规则、听完每段叙述，并在最后写下唯一的名字。
              </p>
              <div className="entry-actions">
                <button className="game-primary" onClick={() => setPhase("rules")}>进入单人剧本</button>
                <Link className="game-secondary live-room-link" href="/room">创建 / 加入真人房</Link>
              </div>
            </section>
          )}

          {phase === "rules" && (
            <section className="game-stage">
              <p className="game-kicker">HOST: 人羊</p>
              <h2>规则公布</h2>
              <div className="rule-list">
                {LIAR_GAME.rules.map((rule, index) => (
                  <article key={rule}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{rule}</p>
                  </article>
                ))}
              </div>
              <div className="stage-footer">
                <p>规则已经说完了吗？不要假定主持者会替你补充遗漏的部分。</p>
                <button className="game-primary" onClick={() => setPhase("identity")}>抽取身份牌</button>
              </div>
            </section>
          )}

          {phase === "identity" && (
            <section className="game-stage">
              <p className="game-kicker">PRIVATE INFORMATION / ONLY YOU</p>
              <h2>翻开你的身份牌</h2>
              <button
                aria-pressed={identityRevealed}
                className={`identity-card ${identityRevealed ? "is-revealed" : ""}`}
                onClick={() => setIdentityRevealed(true)}
              >
                <span className="identity-card__back">女娲游戏</span>
                <span className="identity-card__front">说谎者</span>
              </button>
              <p className="identity-note">
                {identityRevealed
                  ? "你拿到的牌要求你必须说谎。先别急着把它当成唯一事实。"
                  : "身份牌只向持牌者公开。点击纸牌查看。"}
              </p>
              <div className="stage-footer">
                <p>原著模式保留身份牌信息差；你可以在叙述中选择相信、质疑或等待。</p>
                <button
                  className="game-primary"
                  disabled={!identityRevealed}
                  onClick={() => {
                    openStory(0);
                    setPhase("stories");
                  }}
                >
                  开始讲述
                </button>
              </div>
            </section>
          )}

          {phase === "stories" && (
            <section className="game-stage game-stage--stories">
              <div className="story-heading">
                <div>
                  <p className="game-kicker">NARRATIVE {storyIndex + 1} / {LIAR_GAME.stories.length}</p>
                  <h2>{currentStory.name}</h2>
                  <span>{currentStory.occupation}</span>
                </div>
                <button className="story-mark" onClick={() => openStory(storyIndex)}>记录已听</button>
              </div>
              <div className="story-transcript">
                <p>{currentStory.summary}</p>
              </div>
              <div className="story-clue">
                <span>记录</span>
                <p>{heardStories.has(currentStory.id) ? currentStory.clue : "先完整听取这段叙述，再登记可公开的线索。"}</p>
              </div>
              <div className="story-controls">
                <button className="game-secondary" disabled={storyIndex === 0} onClick={() => openStory(storyIndex - 1)}>上一位</button>
                {storyIndex < LIAR_GAME.stories.length - 1 ? (
                  <button className="game-primary" onClick={() => openStory(storyIndex + 1)}>下一位讲述者</button>
                ) : (
                  <button className="game-primary" disabled={!allStoriesHeard} onClick={() => setPhase("deduction")}>进入自由讨论</button>
                )}
              </div>
              <div className="story-seats" aria-label="讲述者列表">
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
          )}

          {phase === "deduction" && (
            <section className="game-stage">
              <p className="game-kicker">FREE DISCUSSION / REMAINING 20:00</p>
              <h2>找出唯一能被证明的谎言</h2>
              <div className="deduction-grid">
                <article>
                  <span>已知</span>
                  <h3>规则绝对</h3>
                  <p>“有且只有一位说谎者”与“身份牌”同时为真，不能只挑其中一条相信。</p>
                </article>
                <article>
                  <span>已知</span>
                  <h3>九张身份牌</h3>
                  <p>每段叙述都用“昏迷”遮住了同一个致命事实；卡面并未提供唯一答案。</p>
                </article>
                <article className={deductionRevealed ? "is-revealed" : ""}>
                  <span>{deductionRevealed ? "已推演" : "待推演"}</span>
                  <h3>密室与氧气</h3>
                  <p>{deductionRevealed
                    ? `房间体积只有 ${chamberVolume()} 立方米；按规则给出的时间与人数，空气消耗已经超过容积。`
                    : "测量墙面、地板与天花板的方格，验证这间密室真正的异常。"}</p>
                  {!deductionRevealed && <button className="game-secondary" onClick={() => setDeductionRevealed(true)}>推演密室</button>}
                </article>
              </div>
              <div className="stage-footer">
                <p>{deductionRevealed ? "所有参与者都已死亡，因此每个人都在自己的故事中说了谎。现在只剩一个问题：谁也被算作讲述者？" : "在最后投票前，先完成至少一次可验证的推演。"}</p>
                <button className="game-primary" disabled={!deductionRevealed} onClick={() => setPhase("vote")}>拿起投票纸</button>
              </div>
            </section>
          )}

          {phase === "vote" && (
            <section className="game-stage game-stage--vote">
              <p className="game-kicker">SECRET VOTE / 09 BALLOTS REQUIRED</p>
              <h2>在纸上写下一个名字。</h2>
              <p className="game-lead">人羊也讲了一个故事：他将众人聚集到这里，是为了创造“神”。在已知事实中，只有这个故事无法成立。</p>
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
                <p>{selectedTarget ? `你的投票：${LIAR_GAME.suspects.find((suspect) => suspect.id === selectedTarget)?.name}` : "尚未落笔。投票确认后不可更改。"}</p>
                <button className="game-danger" disabled={!selectedTarget} onClick={() => setPhase("result")}>确认投票</button>
              </div>
            </section>
          )}

          {phase === "result" && resolution && (
            <section className={`game-stage game-stage--result ${resolution.isCorrect ? "is-victory" : "is-failure"}`}>
              <p className="game-kicker">GAME OVER / {resolution.isCorrect ? "CLEAR" : "FAILED"}</p>
              <h2>{resolution.isCorrect ? "九票一致：人羊" : `投票偏差：${resolution.target?.name ?? "未知"}`}</h2>
              <p className="result-copy">
                {resolution.isCorrect
                  ? "所有身份牌翻开后，九人均为“说谎者”。唯一的谎言来自人羊将自己排除在讲述者之外；规则允许你们将票投给他。人羊接受制裁，面试房第一局结束。"
                  : "规则没有留下容错。只要有一票没有投向唯一的说谎者，人羊存活，参与者全部出局。重新回到座钟指向十二点的时刻。"}
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
          <p className="game-eyebrow">TABLE LEDGER</p>
          <h2>面试房</h2>
          <dl>
            <div><dt>主持者</dt><dd>{LIAR_GAME.host}</dd></div>
            <div><dt>参与者</dt><dd>{LIAR_GAME.participantCount} 人</dd></div>
            <div><dt>房间</dt><dd>{LIAR_GAME.chamber.lengthMeters} × {LIAR_GAME.chamber.widthMeters} × {LIAR_GAME.chamber.heightMeters} m</dd></div>
          </dl>

          <div className="ledger-section">
            <p className="game-eyebrow">已听叙述</p>
            <strong>{heardStories.size} / {LIAR_GAME.stories.length}</strong>
            <div className="ledger-dots" aria-label="叙述收听进度">
              {LIAR_GAME.stories.map((story) => <i className={heardStories.has(story.id) ? "is-heard" : ""} key={story.id} />)}
            </div>
          </div>

          <div className="ledger-section">
            <p className="game-eyebrow">本局原则</p>
            <p>原著模式不替玩家提前公布答案。每个可用结论都必须由规则、叙述或现场证据支持。</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
