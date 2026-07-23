"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { LIAR_GAME } from "../lib/liar-game";
import { ROOM_CAPACITY, ROOM_PHASES, nextRoomPhase } from "../lib/room-logic";

type RoomResult = {
  allCorrect: boolean;
  outcome: "participants-survive" | "liar-survives";
};

type RoomSnapshot = {
  room: {
    code: string;
    scenario: string;
    phase: string;
    storyIndex: number;
    createdAt: string;
    updatedAt: string;
    result: RoomResult | null;
  };
  you: {
    seatNumber: number;
    playerName: string;
    isHost: boolean;
    identity: string;
    role: {
      id: string;
      name: string;
      occupation: string;
      summary: string;
      clue: string;
    };
    hasVoted: boolean;
  };
  seats: Array<{ seatNumber: number; playerName: string | null; isHost: boolean }>;
  voteCount: number;
  messages: Array<{ id: number; seatNumber: number; playerName: string; content: string; createdAt: string }>;
  session?: { token: string };
};

type Session = { code: string; token: string };

const phaseLabels: Record<string, string> = {
  lobby: "等待入座",
  rules: "规则公布",
  identity: "身份牌",
  stories: "轮流讲述",
  deduction: "自由讨论",
  vote: "秘密投票",
  result: "结算",
};

const SESSION_KEY = "zhongyan-liar-room-session";

function requestJson<T>(url: string, options?: RequestInit) {
  return fetch(url, options).then(async (response) => {
    const data = (await response.json()) as T & { error?: string };
    if (!response.ok) throw new Error(data.error ?? "请求失败。");
    return data;
  });
}

export default function RoomPage() {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async (activeSession: Session) => {
    const next = await requestJson<RoomSnapshot>(`/api/room?code=${activeSession.code}&token=${activeSession.token}`);
    setSnapshot(next);
  }, []);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    const fromUrl = new URLSearchParams(window.location.search).get("code")?.toUpperCase() ?? "";
    if (!stored) {
      if (fromUrl) window.setTimeout(() => setJoinCode(fromUrl), 0);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Session;
      if (fromUrl && fromUrl !== parsed.code) {
        window.setTimeout(() => setJoinCode(fromUrl), 0);
        return;
      }
      window.setTimeout(() => {
        setSession(parsed);
        void refresh(parsed).catch((requestError: unknown) => {
          window.sessionStorage.removeItem(SESSION_KEY);
          setError(requestError instanceof Error ? requestError.message : "无法恢复上次房间。");
        });
      }, 0);
    } catch {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }, [refresh]);

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => {
      void refresh(session).catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "房间同步失败。");
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, [refresh, session]);

  const saveSession = (nextSnapshot: RoomSnapshot) => {
    const token = nextSnapshot.session?.token;
    if (!token) throw new Error("房间凭证未返回。");
    const nextSession = { code: nextSnapshot.room.code, token };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    window.history.replaceState(null, "", `/room?code=${nextSession.code}`);
    setSession(nextSession);
    setSnapshot(nextSnapshot);
    setError(null);
  };

  const createRoom = async () => {
    setBusy(true);
    try {
      const next = await requestJson<RoomSnapshot>("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerName: name }),
      });
      saveSession(next);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "创建房间失败。");
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = async () => {
    setBusy(true);
    try {
      const next = await requestJson<RoomSnapshot>("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "join", roomCode: joinCode, playerName: name }),
      });
      saveSession(next);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "加入房间失败。");
    } finally {
      setBusy(false);
    }
  };

  const roomAction = async (action: string, payload?: Record<string, unknown>) => {
    if (!session) return;
    setBusy(true);
    try {
      const next = await requestJson<RoomSnapshot>("/api/room", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomCode: session.code, token: session.token, action, payload }),
      });
      setSnapshot(next);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "房间操作失败。");
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    await roomAction("message", { content: message });
    setMessage("");
  };

  const shareRoom = async () => {
    if (!snapshot) return;
    const url = `${window.location.origin}/room?code=${snapshot.room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setError("入座链接已复制。把它发给另外八位玩家。");
    } catch {
      setError(`房间码：${snapshot.room.code}`);
    }
  };

  const filledSeats = snapshot?.seats.filter((seat) => seat.playerName).length ?? 0;
  const nextPhase = snapshot ? nextRoomPhase(snapshot.room.phase) : null;
  const canDiscuss = snapshot && ["stories", "deduction", "vote"].includes(snapshot.room.phase);
  const canAdvance = snapshot?.you.isHost && nextPhase && snapshot.room.phase !== "stories" && !(snapshot.room.phase === "lobby" && filledSeats !== ROOM_CAPACITY);
  const activeSeat = snapshot?.seats[snapshot.room.storyIndex] ?? null;
  const isYourStoryTurn = Boolean(activeSeat && activeSeat.seatNumber === snapshot?.you.seatNumber);
  const resultCopy = useMemo(() => {
    if (!snapshot?.room.result) return null;
    return snapshot.room.result.allCorrect
      ? "九票全部写下“人羊”。人羊是唯一可被证明的说谎者，参与者存活。"
      : "至少一票没有投向人羊。规则不留容错：说谎者存活，参与者全部出局。";
  }, [snapshot]);

  if (!snapshot) {
    return (
      <main className="room-entry">
        <Link className="room-back" href="/">← 返回单机剧本</Link>
        <section className="room-entry-card">
          <p className="game-eyebrow">ONLINE TABLE / 09 REAL SEATS</p>
          <h1>创建或加入面试房</h1>
          <p>这是九人真实房间：每名玩家独占一个席位与投票权，房间状态和讨论记录保存在服务端并持续同步。</p>
          <label>
            你的昵称
            <input maxLength={18} onChange={(event) => setName(event.target.value)} placeholder="例如：齐夏" value={name} />
          </label>
          <button className="game-primary" disabled={busy || !name.trim()} onClick={createRoom}>创建九人房</button>
          <div className="room-entry-divider"><span>或</span></div>
          <label>
            房间码
            <input maxLength={6} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ABC123" value={joinCode} />
          </label>
          <button className="game-secondary" disabled={busy || !name.trim() || joinCode.length !== 6} onClick={joinRoom}>加入房间</button>
          {error && <p className="room-error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="live-room-app">
      <header className="live-room-header">
        <Link className="room-back" href="/">← 单机剧本</Link>
        <div><p className="game-eyebrow">LIVE ROOM</p><h1>说谎者 · {phaseLabels[snapshot.room.phase]}</h1></div>
        <button className="room-code-button" onClick={shareRoom}><span>房间码</span>{snapshot.room.code}</button>
      </header>

      <section className="live-room-grid">
        <aside className="live-panel seat-panel">
          <p className="game-eyebrow">九个席位</p>
          <strong className="seat-count">{filledSeats} / {ROOM_CAPACITY}</strong>
          <div className="live-seat-list">
            {snapshot.seats.map((seat) => (
              <div className={seat.seatNumber === snapshot.you.seatNumber ? "is-you" : ""} key={seat.seatNumber}>
                <span>{String(seat.seatNumber).padStart(2, "0")}</span>
                <strong>{seat.playerName ?? "等待入座"}</strong>
                {seat.isHost && <i>房主</i>}
              </div>
            ))}
          </div>
        </aside>

        <section className="live-table">
          <div className="live-table-heading">
            <div><p className="game-eyebrow">面试房 / 原著模式</p><h2>{phaseLabels[snapshot.room.phase]}</h2></div>
            <div className={`live-identity live-identity--${snapshot.you.role.id}`}>
              <i aria-hidden="true" />
              <span>{snapshot.you.role.name} · {snapshot.you.role.occupation}</span>
              <strong>{snapshot.you.identity}</strong>
            </div>
          </div>

          <div className="live-phase-track">
            {ROOM_PHASES.map((phase, index) => (
              <span className={ROOM_PHASES.indexOf(snapshot.room.phase as typeof ROOM_PHASES[number]) >= index ? "is-reached" : ""} key={phase}>
                {String(index + 1).padStart(2, "0")} {phaseLabels[phase]}
              </span>
            ))}
          </div>

          {snapshot.room.phase === "lobby" && (
            <div className="live-notice">
              <h3>九位参与者尚未齐席</h3>
              <p>房主复制房间码后，邀请另外八位玩家进入；第九席入座前，规则不能开始。</p>
            </div>
          )}
          {snapshot.room.phase === "rules" && <div className="live-notice"><h3>规则正在公布</h3><p>九位玩家依序讲述故事；全部投向唯一说谎者才能存活。每个人都应只依据当前已公开信息讨论。</p></div>}
          {snapshot.room.phase === "identity" && <div className="live-notice"><h3>身份牌已发放</h3><p>身份信息仅显示在各自设备上。不要向他人展示你的纸牌。</p></div>}
          {snapshot.room.phase === "stories" && activeSeat && (
            <div className="live-story-turn">
              <p className="game-eyebrow">当前讲述 / 席位 {String(activeSeat.seatNumber).padStart(2, "0")}</p>
              <h3>{activeSeat.playerName} 正在讲述</h3>
              {isYourStoryTurn ? (
                <>
                  <p className="live-private-label">仅你可见的角色叙述卡</p>
                  <blockquote>{snapshot.you.role.summary}</blockquote>
                  <p>讲完后由你确认，讲述权才会移交给下一席。</p>
                  <button className="game-primary" disabled={busy} onClick={() => roomAction("advanceStory")}>我已完成讲述</button>
                </>
              ) : (
                <p>等待这位玩家讲述抵达前最后发生的事。轮次结束后，下一席会在自己的设备上获得叙述卡。</p>
              )}
            </div>
          )}
          {snapshot.room.phase === "deduction" && <div className="live-notice"><h3>自由讨论</h3><p>密室为 4 × 4 × 3 米；把规则、空气与每段“昏迷”叙述一起推演。不要将猜测当作证据。</p></div>}
          {snapshot.room.phase === "vote" && (
            <div className="live-vote">
              <h3>秘密投票</h3>
              <p>已收到 {snapshot.voteCount} / {ROOM_CAPACITY} 张票。提交后可在全部投票前改写自己的票。</p>
              <div className="live-suspects">
                {LIAR_GAME.suspects.map((suspect) => (
                  <button className={targetId === suspect.id ? "is-selected" : ""} key={suspect.id} onClick={() => setTargetId(suspect.id)}>
                    <span>{suspect.type === "host" ? "主持者" : "参与者"}</span>{suspect.name}
                  </button>
                ))}
              </div>
              <button className="game-danger" disabled={busy || !targetId} onClick={() => roomAction("vote", { targetId })}>
                {snapshot.you.hasVoted ? "改写我的投票" : "提交我的投票"}
              </button>
            </div>
          )}
          {snapshot.room.phase === "result" && (
            <div className={`live-result ${snapshot.room.result?.allCorrect ? "is-victory" : "is-failure"}`}>
              <h3>{snapshot.room.result?.allCorrect ? "九票一致：人羊" : "投票未能一致"}</h3>
              <p>{resultCopy}</p>
            </div>
          )}

          <div className="live-host-controls">
            {canAdvance && <button className="game-primary" disabled={busy} onClick={() => roomAction("advance")}>推进至：{nextPhase ? phaseLabels[nextPhase] : "结算"}</button>}
            {snapshot.you.isHost && snapshot.room.phase === "lobby" && filledSeats !== ROOM_CAPACITY && <p>还差 {ROOM_CAPACITY - filledSeats} 名玩家。</p>}
            {snapshot.you.isHost && snapshot.room.phase === "result" && <button className="game-primary" disabled={busy} onClick={() => roomAction("reset")}>重开房间</button>}
          </div>
        </section>

        <aside className="live-panel discussion-panel">
          <p className="game-eyebrow">桌面讨论</p>
          <div className="discussion-log">
            {snapshot.messages.length === 0 && <p>尚无讨论记录。</p>}
            {snapshot.messages.map((item) => (
              <article key={item.id}><strong>{item.playerName}</strong><span>{item.content}</span></article>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input disabled={!canDiscuss || busy} maxLength={300} onChange={(event) => setMessage(event.target.value)} placeholder={canDiscuss ? "记录你的推断…" : "等待讨论阶段"} value={message} />
            <button disabled={!canDiscuss || busy || !message.trim()} type="submit">发送</button>
          </form>
          {error && <p className="room-error">{error}</p>}
        </aside>
      </section>
    </main>
  );
}
