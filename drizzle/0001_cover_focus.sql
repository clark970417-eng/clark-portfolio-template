ALTER TABLE `events` ADD COLUMN `cover_photo_id` text;
--> statement-breakpoint
ALTER TABLE `events` ADD COLUMN `cover_x` integer DEFAULT 50 NOT NULL;
--> statement-breakpoint
ALTER TABLE `events` ADD COLUMN `cover_y` integer DEFAULT 50 NOT NULL;
