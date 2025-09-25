CREATE TABLE `certificates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serial` text NOT NULL,
	`holder_name` text NOT NULL,
	`program` text,
	`issued_on` text,
	`institution_id` integer,
	`qr_hash` text,
	`metadata` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`institution_id`) REFERENCES `institutions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certificates_serial_unique` ON `certificates` (`serial`);--> statement-breakpoint
CREATE TABLE `flags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`certificate_id` integer,
	`reason` text NOT NULL,
	`resolved` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`certificate_id`) REFERENCES `certificates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `institutions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`contact_email` text,
	`trusted` integer DEFAULT true,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `institutions_name_unique` ON `institutions` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `institutions_code_unique` ON `institutions` (`code`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`certificate_id` integer,
	`status` text NOT NULL,
	`confidence` real,
	`checked_by` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`certificate_id`) REFERENCES `certificates`(`id`) ON UPDATE no action ON DELETE cascade
);
