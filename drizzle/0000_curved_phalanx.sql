CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Sin título' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
