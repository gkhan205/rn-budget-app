PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recurring_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_id` text,
	`account_id` text,
	`category_id` text,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`frequency` text NOT NULL,
	`start_date` integer NOT NULL,
	`next_due_date` integer NOT NULL,
	`end_date` integer,
	`category` text,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`auto_add` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_recurring_expenses`("id", "budget_id", "account_id", "category_id", "name", "amount", "frequency", "start_date", "next_due_date", "end_date", "category", "description", "is_active", "auto_add", "created_at", "updated_at") SELECT "id", "budget_id", "account_id", "category_id", "name", "amount", "frequency", "start_date", "next_due_date", "end_date", "category", "description", "is_active", "auto_add", "created_at", "updated_at" FROM `recurring_expenses`;--> statement-breakpoint
DROP TABLE `recurring_expenses`;--> statement-breakpoint
ALTER TABLE `__new_recurring_expenses` RENAME TO `recurring_expenses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `recurring_expenses_budget_id_idx` ON `recurring_expenses` (`budget_id`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_next_due_date_idx` ON `recurring_expenses` (`next_due_date`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_account_id_idx` ON `recurring_expenses` (`account_id`);--> statement-breakpoint
CREATE INDEX `recurring_expenses_category_id_idx` ON `recurring_expenses` (`category_id`);