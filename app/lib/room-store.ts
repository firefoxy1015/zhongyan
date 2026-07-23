import { getD1 } from "../../db";
import { LIAR_GAME } from "./liar-game";
import { ROOM_CAPACITY, isVoteTarget, nextRoomPhase, resolveRoomVotes } from "./room-logic";

type RoomRow = {
  code: string;
  scenario: string;
  phase: string;
  story_index: number;
  host_token: string;
  result: string | null;
  created_at: string;
  updated_at: string;
};

type SeatRow = {
  room_code: string;
  seat_number: number;
  player_name: string;
  seat_token: string;
  is_host: number;
  joined_at: string;
};

type VoteRow = {
  room_code: string;
  seat_number: number;
  target_id: string;
  cast_at: string;
};

type MessageRow = {
  id: number;
  seat_number: number;
  player_name: string;
  content: string;
  created_at: string;
};

type RoomResult = {
  allCorrect: boolean;
  outcome: "participants-survive" | "liar-survives";
};

const ROOM_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS game_rooms (
    code TEXT PRIMARY KEY,
    scenario TEXT NOT NULL,
    phase TEXT NOT NULL,
    story_index INTEGER NOT NULL DEFAULT 0,
    host_token TEXT NOT NULL,
    result TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS game_room_seats (
    room_code TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    seat_token TEXT NOT NULL UNIQUE,
    is_host INTEGER NOT NULL DEFAULT 0,
    joined_at TEXT NOT NULL,
    PRIMARY KEY (room_code, seat_number),
    FOREIGN KEY (room_code) REFERENCES game_rooms(code) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS game_room_votes (
    room_code TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    target_id TEXT NOT NULL,
    cast_at TEXT NOT NULL,
    PRIMARY KEY (room_code, seat_number),
    FOREIGN KEY (room_code) REFERENCES game_rooms(code) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS game_room_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_code TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (room_code) REFERENCES game_rooms(code) ON DELETE CASCADE
  )`,
];

let schemaReady: Promise<void> | null = null;

export class RoomError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

function now() {
  return new Date().toISOString();
}

function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

function seatToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

function cleanName(value: unknown) {
  const name = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (name.length < 1 || name.length > 18) {
    throw new RoomError("昵称需为 1–18 个字符。");
  }
  return name;
}

function cleanCode(value: unknown) {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!/^[A-Z2-9]{6}$/.test(code)) {
    throw new RoomError("房间码格式不正确。", 400);
  }
  return code;
}

function cleanToken(value: unknown) {
  const token = typeof value === "string" ? value.trim() : "";
  if (!/^[a-f0-9]{32}$/i.test(token)) {
    throw new RoomError("房间凭证无效。", 401);
  }
  return token;
}

function cleanMessage(value: unknown) {
  const content = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (content.length < 1 || content.length > 300) {
    throw new RoomError("讨论内容需为 1–300 个字符。");
  }
  return content;
}

async function ensureSchema() {
  if (!schemaReady) {
    const db = getD1();
    schemaReady = db.batch(ROOM_SCHEMA.map((statement) => db.prepare(statement))).then(async () => {
      const columns = await db.prepare("PRAGMA table_info(game_rooms)").all<{ name: string }>();
      if (!columns.results.some((column) => column.name === "story_index")) {
        await db.prepare("ALTER TABLE game_rooms ADD COLUMN story_index INTEGER NOT NULL DEFAULT 0").run();
      }
    });
  }
  await schemaReady;
}

async function getRoom(code: string) {
  const room = await getD1()
    .prepare("SELECT code, scenario, phase, story_index, host_token, result, created_at, updated_at FROM game_rooms WHERE code = ?")
    .bind(code)
    .first<RoomRow>();
  if (!room) throw new RoomError("房间不存在或已结束。", 404);
  return room;
}

async function getSeats(code: string) {
  const result = await getD1()
    .prepare("SELECT room_code, seat_number, player_name, seat_token, is_host, joined_at FROM game_room_seats WHERE room_code = ? ORDER BY seat_number ASC")
    .bind(code)
    .all<SeatRow>();
  return result.results;
}

async function getVotes(code: string) {
  const result = await getD1()
    .prepare("SELECT room_code, seat_number, target_id, cast_at FROM game_room_votes WHERE room_code = ? ORDER BY seat_number ASC")
    .bind(code)
    .all<VoteRow>();
  return result.results;
}

async function getMessages(code: string) {
  const result = await getD1()
    .prepare(`SELECT m.id, m.seat_number, s.player_name, m.content, m.created_at
      FROM game_room_messages AS m
      JOIN game_room_seats AS s ON s.room_code = m.room_code AND s.seat_number = m.seat_number
      WHERE m.room_code = ?
      ORDER BY m.id DESC
      LIMIT 40`)
    .bind(code)
    .all<MessageRow>();
  return result.results.reverse();
}

function parseResult(value: string | null): RoomResult | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as RoomResult;
  } catch {
    return null;
  }
}

async function requireSeat(code: string, token: string) {
  const seats = await getSeats(code);
  const seat = seats.find((candidate) => candidate.seat_token === token);
  if (!seat) throw new RoomError("该设备不属于这个房间。", 403);
  return { seat, seats };
}

export async function createRoom(playerName: unknown) {
  await ensureSchema();
  const name = cleanName(playerName);
  const db = getD1();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = roomCode();
    const token = seatToken();
    const timestamp = now();

    const existing = await db.prepare("SELECT code FROM game_rooms WHERE code = ?").bind(code).first<{ code: string }>();
    if (existing) continue;

    await db.batch([
      db.prepare("INSERT INTO game_rooms (code, scenario, phase, host_token, result, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?)")
        .bind(code, "renyang-liar-canon-001", "lobby", token, timestamp, timestamp),
      db.prepare("INSERT INTO game_room_seats (room_code, seat_number, player_name, seat_token, is_host, joined_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(code, 1, name, token, 1, timestamp),
    ]);

    return { ...(await getRoomSnapshot(code, token)), session: { token } };
  }

  throw new RoomError("房间创建失败，请重试。", 503);
}

export async function joinRoom(roomCodeValue: unknown, playerName: unknown) {
  await ensureSchema();
  const code = cleanCode(roomCodeValue);
  const name = cleanName(playerName);
  const db = getD1();
  const room = await getRoom(code);
  if (room.phase !== "lobby") throw new RoomError("本局已经开始，不能再加入。", 409);

  const seats = await getSeats(code);
  if (seats.length >= ROOM_CAPACITY) throw new RoomError("九个席位已经坐满。", 409);

  const token = seatToken();
  await db.prepare("INSERT INTO game_room_seats (room_code, seat_number, player_name, seat_token, is_host, joined_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(code, seats.length + 1, name, token, 0, now())
    .run();

  return { ...(await getRoomSnapshot(code, token)), session: { token } };
}

export async function getRoomSnapshot(roomCodeValue: unknown, tokenValue: unknown) {
  await ensureSchema();
  const code = cleanCode(roomCodeValue);
  const token = cleanToken(tokenValue);
  const room = await getRoom(code);
  const { seat, seats } = await requireSeat(code, token);
  const [votes, messages] = await Promise.all([getVotes(code), getMessages(code)]);

  return {
    room: {
      code: room.code,
      scenario: room.scenario,
      phase: room.phase,
      storyIndex: room.story_index,
      createdAt: room.created_at,
      updatedAt: room.updated_at,
      result: parseResult(room.result),
    },
    you: {
      seatNumber: seat.seat_number,
      playerName: seat.player_name,
      isHost: Boolean(seat.is_host),
      identity: "说谎者",
      role: LIAR_GAME.stories[seat.seat_number - 1],
      hasVoted: votes.some((vote) => vote.seat_number === seat.seat_number),
    },
    seats: Array.from({ length: ROOM_CAPACITY }, (_, index) => {
      const member = seats.find((candidate) => candidate.seat_number === index + 1);
      return member
        ? { seatNumber: member.seat_number, playerName: member.player_name, isHost: Boolean(member.is_host) }
        : { seatNumber: index + 1, playerName: null, isHost: false };
    }),
    voteCount: votes.length,
    messages: messages.map((message) => ({
      id: message.id,
      seatNumber: message.seat_number,
      playerName: message.player_name,
      content: message.content,
      createdAt: message.created_at,
    })),
  };
}

export async function applyRoomAction(roomCodeValue: unknown, tokenValue: unknown, action: unknown, payload: unknown) {
  await ensureSchema();
  const code = cleanCode(roomCodeValue);
  const token = cleanToken(tokenValue);
  const type = typeof action === "string" ? action : "";
  const room = await getRoom(code);
  const { seat, seats } = await requireSeat(code, token);
  const db = getD1();

  if (type === "advance") {
    if (!seat.is_host) throw new RoomError("只有房主可以推进阶段。", 403);
    if (room.phase === "lobby" && seats.length !== ROOM_CAPACITY) {
      throw new RoomError(`需要 ${ROOM_CAPACITY} 位真人入座后才能开始。`, 409);
    }
    const next = nextRoomPhase(room.phase);
    if (!next) throw new RoomError("本局已经结算。", 409);
    await db.prepare("UPDATE game_rooms SET phase = ?, updated_at = ? WHERE code = ?")
      .bind(next, now(), code)
      .run();
  } else if (type === "advanceStory") {
    if (room.phase !== "stories") throw new RoomError("尚未进入讲述阶段。", 409);
    if (seat.seat_number !== room.story_index + 1) throw new RoomError("尚未轮到你的讲述。", 403);

    const nextStoryIndex = room.story_index + 1;
    const timestamp = now();
    if (nextStoryIndex >= ROOM_CAPACITY) {
      await db.prepare("UPDATE game_rooms SET phase = ?, story_index = ?, updated_at = ? WHERE code = ?")
        .bind("deduction", nextStoryIndex, timestamp, code)
        .run();
    } else {
      await db.prepare("UPDATE game_rooms SET story_index = ?, updated_at = ? WHERE code = ?")
        .bind(nextStoryIndex, timestamp, code)
        .run();
    }
  } else if (type === "vote") {
    if (room.phase !== "vote") throw new RoomError("尚未进入投票阶段。", 409);
    const targetId = typeof (payload as { targetId?: unknown })?.targetId === "string"
      ? (payload as { targetId: string }).targetId
      : "";
    if (!isVoteTarget(targetId)) throw new RoomError("投票对象无效。", 400);

    const timestamp = now();
    await db.prepare(`INSERT INTO game_room_votes (room_code, seat_number, target_id, cast_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(room_code, seat_number) DO UPDATE SET target_id = excluded.target_id, cast_at = excluded.cast_at`)
      .bind(code, seat.seat_number, targetId, timestamp)
      .run();

    const votes = await getVotes(code);
    if (votes.length === ROOM_CAPACITY) {
      const result = resolveRoomVotes(votes.map((vote) => vote.target_id));
      await db.prepare("UPDATE game_rooms SET phase = ?, result = ?, updated_at = ? WHERE code = ?")
        .bind("result", JSON.stringify(result), timestamp, code)
        .run();
    }
  } else if (type === "message") {
    if (!["stories", "deduction", "vote"].includes(room.phase)) {
      throw new RoomError("当前阶段不能发送讨论。", 409);
    }
    const content = cleanMessage((payload as { content?: unknown })?.content);
    await db.prepare("INSERT INTO game_room_messages (room_code, seat_number, content, created_at) VALUES (?, ?, ?, ?)")
      .bind(code, seat.seat_number, content, now())
      .run();
  } else if (type === "reset") {
    if (!seat.is_host) throw new RoomError("只有房主可以重开本局。", 403);
    if (room.phase !== "result") throw new RoomError("本局尚未结算。", 409);
    await db.batch([
      db.prepare("DELETE FROM game_room_votes WHERE room_code = ?").bind(code),
      db.prepare("DELETE FROM game_room_messages WHERE room_code = ?").bind(code),
      db.prepare("UPDATE game_rooms SET phase = ?, result = NULL, updated_at = ? WHERE code = ?")
        .bind("lobby", now(), code),
    ]);
  } else {
    throw new RoomError("未知的房间操作。", 400);
  }

  return getRoomSnapshot(code, token);
}
