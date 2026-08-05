ALTER TABLE `pages` ADD `parent_id` text;--> statement-breakpoint
ALTER TABLE `pages` ADD `tags` text DEFAULT '[]' NOT NULL;