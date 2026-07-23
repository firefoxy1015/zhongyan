CREATE TABLE `game_room_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text NOT NULL,
	`seat_number` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`room_code`) REFERENCES `game_rooms`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_room_seats` (
	`room_code` text NOT NULL,
	`seat_number` integer NOT NULL,
	`player_name` text NOT NULL,
	`seat_token` text NOT NULL,
	`is_host` integer DEFAULT false NOT NULL,
	`joined_at` text NOT NULL,
	PRIMARY KEY(`room_code`, `seat_number`),
	FOREIGN KEY (`room_code`) REFERENCES `game_rooms`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_room_seats_seat_token_unique` ON `game_room_seats` (`seat_token`);--> statement-breakpoint
CREATE TABLE `game_room_votes` (
	`room_code` text NOT NULL,
	`seat_number` integer NOT NULL,
	`target_id` text NOT NULL,
	`cast_at` text NOT NULL,
	PRIMARY KEY(`room_code`, `seat_number`),
	FOREIGN KEY (`room_code`) REFERENCES `game_rooms`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`scenario` text DEFAULT 'renyang-liar-canon-001' NOT NULL,
	`phase` text DEFAULT 'lobby' NOT NULL,
	`host_token` text NOT NULL,
	`result` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
