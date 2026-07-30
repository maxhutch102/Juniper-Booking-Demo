CREATE TABLE `blocked_time` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stylist` text NOT NULL,
	`block_date` text NOT NULL,
	`start_time` text,
	`end_time` text,
	`reason` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stylist_settings` (
	`stylist` text PRIMARY KEY NOT NULL,
	`work_days` text DEFAULT '1,2,3,4,5,6' NOT NULL,
	`start_time` text DEFAULT '09:00' NOT NULL,
	`end_time` text DEFAULT '18:00' NOT NULL,
	`break_start` text,
	`break_end` text,
	`payment_methods` text DEFAULT 'Zelle' NOT NULL,
	`updated_at` text NOT NULL
);
