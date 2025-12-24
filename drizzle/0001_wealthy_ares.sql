CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`icon` text DEFAULT '💳' NOT NULL,
	`color` text DEFAULT '#2196F3' NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`type` text DEFAULT 'string' NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_settings_key_unique` ON `app_settings` (`key`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT '📂' NOT NULL,
	`color` text DEFAULT '#9E9E9E' NOT NULL,
	`type` text DEFAULT 'expense' NOT NULL,
	`parent_id` text,
	`description` text,
	`is_default` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
ALTER TABLE `expenses` ADD `account_id` text REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `expenses` ADD `category_id` text REFERENCES categories(id);--> statement-breakpoint
CREATE INDEX `expenses_budget_id_idx` ON `expenses` (`budget_id`);--> statement-breakpoint
CREATE INDEX `expenses_date_idx` ON `expenses` (`date`);--> statement-breakpoint
CREATE INDEX `expenses_account_id_idx` ON `expenses` (`account_id`);--> statement-breakpoint
CREATE INDEX `expenses_category_id_idx` ON `expenses` (`category_id`);--> statement-breakpoint
ALTER TABLE `recurring_expenses` ADD `account_id` text REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `recurring_expenses` ADD `category_id` text REFERENCES categories(id);--> statement-breakpoint
CREATE INDEX `recurring_expenses_budget_id_idx` ON `recurring_expenses` (`budget_id`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_next_due_date_idx` ON `recurring_expenses` (`next_due_date`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_account_id_idx` ON `recurring_expenses` (`account_id`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_category_id_idx` ON `recurring_expenses` (`category_id`);