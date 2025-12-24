CREATE TABLE `budgets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`limit_amount` real,
	`period_type` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_id` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`date` integer NOT NULL,
	`category` text,
	`is_recurring` integer DEFAULT false NOT NULL,
	`recurring_expense_id` text,
	`tags` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_id` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`frequency` text NOT NULL,
	`next_due_date` integer NOT NULL,
	`category` text,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`end_date` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade
);
