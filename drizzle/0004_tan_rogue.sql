CREATE TABLE `income` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_id` text NOT NULL,
	`account_id` text,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`date` integer NOT NULL,
	`source` text,
	`is_recurring` integer DEFAULT false NOT NULL,
	`recurring_income_id` text,
	`tags` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `income_budget_id_idx` ON `income` (`budget_id`);--> statement-breakpoint
CREATE INDEX `income_date_idx` ON `income` (`date`);--> statement-breakpoint
CREATE INDEX `income_account_id_idx` ON `income` (`account_id`);