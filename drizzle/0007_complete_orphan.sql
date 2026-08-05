CREATE TABLE `page_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`user_id` text,
	`title` text DEFAULT 'Sin título' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
