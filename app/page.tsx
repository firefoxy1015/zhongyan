"use client";

import { useState } from "react";
import {
  CANON_MANIFEST,
  OFFICIAL_REFERENCES,
  PROLOGUE_PLAYERS,
  PROLOGUE_STEPS,
} from "./lib/canon";

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState("观察座钟");
  const [activeVolume, setActiveVolume] = useState(1);
  const scene = PROLOGUE_STEPS[activeStep];

  const advance = () => {
    const nextStep = (activeStep + 1) % PROLOGUE_STEPS.length;
    setActiveStep(nextStep);
    setSelectedAction(PROLOGUE_STEPS[nextStep].action);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div aria-hidden="true" className="brand-mark">十</div>
          <div>
            <p>非官方同人桌游 · 正史资料工程</p>
            <h1>十日终焉</h1>
          </div>
        </div>
        <div className="room-meta">
          <span className="official-badge">官方视觉参考已锁定</span>
          <div>
            <p className="room-label">当前房间</p>
            <div className="room-code">EMPTY-01</div>
          </div>
        </div>
      </header>

      <section className="game-layout" aria-label="十日终焉桌游开发原型">
        <aside className="side-panel" aria-label="正史章节目录">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Canon archive</p>
              <h2>正史目录</h2>
            </div>
            <span className="data-badge">LOCKED</span>
          </div>

          <div className="canon-stats">
            <div className="stat">
              <p className="stat-label">原文单元</p>
              <span className="stat-value">{CANON_MANIFEST.source.storyUnits}</span>
            </div>
            <div className="stat">
              <p className="stat-label">人物番外</p>
              <span className="stat-value">{CANON_MANIFEST.source.extras}</span>
            </div>
          </div>

          <div className="volume-list">
            {CANON_MANIFEST.volumes.map((volume) => (
              <button
                aria-pressed={activeVolume === volume.id}
                className={`volume-row ${activeVolume === volume.id ? "is-current" : ""}`}
                key={volume.id}
                onClick={() => setActiveVolume(volume.id)}
              >
                <span className="volume-index">VOL.{String(volume.id).padStart(2, "0")}</span>
                <span>{volume.title}</span>
                <span className="volume-range">{volume.range}</span>
              </button>
            ))}
          </div>

          <div className="source-lock">
            <p className="source-label">原文锁定校验</p>
            <p>{CANON_MANIFEST.source.sha256}</p>
          </div>
        </aside>

        <section className="story-stage" aria-live="polite" aria-label="序章试玩">
          <div className="story-header">
            <div>
              <p className="scene-kicker">第一卷 · 第{scene.chapter}章 · {scene.phase}</p>
              <h2>{scene.title}</h2>
            </div>
            <span className="mode-pill">原著模式</span>
          </div>

          <div className="scene-grid">
            <div className="clock-zone" aria-label="座钟倒计时">
              <div className="pendulum" />
              <div className="clock"><span className="clock-center" /></div>
              <p className="clock-label">12 : 00</p>
            </div>
            <article className="narrative-card">
              <h3>{scene.heading}</h3>
              <p>{scene.body}</p>
              <span className="scene-tag">{scene.reference}</span>
            </article>
          </div>

          <div className="story-actions" aria-label="当前可执行行动">
            {scene.actions.map((action) => (
              <button
                className={`action-button ${selectedAction === action ? "is-selected" : ""}`}
                key={action}
                onClick={() => setSelectedAction(action)}
              >
                {action}
              </button>
            ))}
            <button className="advance-button" onClick={advance}>{scene.nextLabel}</button>
          </div>

          <div className="story-log" aria-label="行动记录">
            <div className="log-row"><b>记录 01</b><span>当前行动：{selectedAction}</span></div>
            <div className="log-row"><b>记录 02</b><span>剧情结果将由正史节点与角色私密信息共同判定。</span></div>
          </div>
        </section>

        <aside className="player-panel" aria-label="面试房参与者">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Interview room</p>
              <h2>在场人物</h2>
            </div>
            <span className="data-badge">{PROLOGUE_PLAYERS.length} VISIBLE</span>
          </div>

          <div className="player-list">
            {PROLOGUE_PLAYERS.map((player) => (
              <div className="player-card" key={player.name}>
                <div className="player-token">{player.token}</div>
                <div><strong>{player.name}</strong><span>{player.role}</span></div>
                <i className={`status-light ${player.status}`} />
              </div>
            ))}
          </div>

          <div className="identity-card">
            <p className="panel-kicker">私密状态</p>
            <h3>身份牌：未公开</h3>
            <p>角色手牌、记忆和游戏答案只在原著允许的时机发送给对应玩家。</p>
          </div>

          <div className="reference-stack">
            <h3>本场视觉锚点</h3>
            {OFFICIAL_REFERENCES.slice(0, 3).map((reference) => (
              <a
                className="reference-item"
                href={reference.href}
                key={reference.id}
                rel="noreferrer"
                target="_blank"
              >
                {reference.label}
              </a>
            ))}
          </div>
        </aside>

        <section className="bottom-grid" aria-label="开发状态">
          <article className="bottom-card">
            <p className="panel-kicker">章节进度</p>
            <h3>第1–48章纵切片</h3>
            <p>空屋、说谎者、人鼠、仓库寻道、地牛与初始队伍分裂。</p>
            <div className="progress-track"><span style={{ width: "8%" }} /></div>
          </article>

          <article className="bottom-card">
            <p className="panel-kicker">游戏适配器</p>
            <h3>首批正史游戏</h3>
            <div className="game-chip-list">
              {CANON_MANIFEST.initialGames.map((game) => <span className="game-chip" key={game}>{game}</span>)}
            </div>
          </article>

          <article className="bottom-card">
            <p className="panel-kicker">官方视觉审计</p>
            <h3>3组资料已登记</h3>
            <p>实体书负责品牌；动画负责角色与世界；剧集仅补充写实材质。</p>
            <button className="archive-button" onClick={() => setActiveVolume(1)}>查看第一卷资料</button>
          </article>
        </section>
      </section>

      <footer className="footer-note">开发状态：P0资料锁定 + P1叙事原型。所有后续剧情节点将绑定原文行号与校验值。</footer>
    </main>
  );
}
