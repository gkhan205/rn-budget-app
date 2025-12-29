ALTER TABLE `budgets` ADD `income` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `budgets` DROP COLUMN `limit_amount`;