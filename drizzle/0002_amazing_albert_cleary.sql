CREATE TABLE `staff_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`stylist` text,
	`role` text DEFAULT 'stylist' NOT NULL,
	`status` text DEFAULT 'invited' NOT NULL,
	`invited_at` text NOT NULL,
	`activated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_accounts_email_unique` ON `staff_accounts` (`email`);