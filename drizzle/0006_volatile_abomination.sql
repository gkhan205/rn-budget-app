CREATE TABLE `budget_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_id` text NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`limit_amount` real DEFAULT 0 NOT NULL,
	`period_start` integer NOT NULL,
	`period_end` integer NOT NULL,
	`is_notified` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade
);
