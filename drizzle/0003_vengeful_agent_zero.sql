CREATE TABLE `stylist_services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stylist` text NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`duration_minutes` integer NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`add_ons` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stylist_services_name_unique` ON `stylist_services` (`stylist`,`name`);