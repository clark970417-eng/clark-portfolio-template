CREATE TABLE `events` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `slug` text NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `position` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);
--> statement-breakpoint
CREATE TABLE `photos` (
  `id` text PRIMARY KEY NOT NULL,
  `event_id` text NOT NULL,
  `object_key` text NOT NULL,
  `alt` text DEFAULT '' NOT NULL,
  `width` integer,
  `height` integer,
  `position` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `photos_event_position_idx` ON `photos` (`event_id`, `position`);
