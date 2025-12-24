ALTER TABLE `recurring_expenses` ADD `start_date` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `recurring_expenses` ADD `auto_add` integer DEFAULT false NOT NULL;