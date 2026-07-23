import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const gameRooms = sqliteTable("game_rooms", {
  code: text("code").primaryKey(),
  scenario: text("scenario").notNull().default("renyang-liar-canon-001"),
  phase: text("phase").notNull().default("lobby"),
  storyIndex: integer("story_index").notNull().default(0),
  hostToken: text("host_token").notNull(),
  result: text("result"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const gameRoomSeats = sqliteTable(
  "game_room_seats",
  {
    roomCode: text("room_code").notNull().references(() => gameRooms.code, { onDelete: "cascade" }),
    seatNumber: integer("seat_number").notNull(),
    playerName: text("player_name").notNull(),
    seatToken: text("seat_token").notNull().unique(),
    isHost: integer("is_host", { mode: "boolean" }).notNull().default(false),
    joinedAt: text("joined_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.roomCode, table.seatNumber] })],
);

export const gameRoomVotes = sqliteTable(
  "game_room_votes",
  {
    roomCode: text("room_code").notNull().references(() => gameRooms.code, { onDelete: "cascade" }),
    seatNumber: integer("seat_number").notNull(),
    targetId: text("target_id").notNull(),
    castAt: text("cast_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.roomCode, table.seatNumber] })],
);

export const gameRoomMessages = sqliteTable("game_room_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code").notNull().references(() => gameRooms.code, { onDelete: "cascade" }),
  seatNumber: integer("seat_number").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});
