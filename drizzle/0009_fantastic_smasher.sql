ALTER TABLE `pages` ADD `workspace_id` text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE `workspace` ADD `owner_id` text;--> statement-breakpoint
ALTER TABLE `workspace` ADD `created_at` integer;