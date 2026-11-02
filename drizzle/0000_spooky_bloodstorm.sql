CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`suggestion` text,
	`base` integer NOT NULL,
	`section` text NOT NULL,
	`body` text NOT NULL,
	`document` text NOT NULL,
	`hash` text NOT NULL,
	`checks` text,
	`kind` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `current_article` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `request_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`until` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document` text NOT NULL,
	`hash` text NOT NULL,
	`created` integer NOT NULL,
	`status` text NOT NULL,
	`operation` text NOT NULL,
	`input_hash` text NOT NULL,
	`summary` text NOT NULL,
	`parent` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `revisions_operation_unique` ON `revisions` (`operation`);--> statement-breakpoint
CREATE TABLE `ai_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`stage` text NOT NULL,
	`input_hash` text NOT NULL,
	`requested` text NOT NULL,
	`actual` text,
	`result` text,
	`usage` text,
	`status` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt` text NOT NULL,
	`idem` text NOT NULL,
	`input_hash` text NOT NULL,
	`base` integer NOT NULL,
	`section` text NOT NULL,
	`quote` text NOT NULL,
	`replacement` text NOT NULL,
	`reason` text NOT NULL,
	`state` text NOT NULL,
	`stage` text NOT NULL,
	`analysis` text,
	`candidate` text,
	`error` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`lease` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suggestions_receipt_unique` ON `suggestions` (`receipt`);--> statement-breakpoint
CREATE UNIQUE INDEX `suggestions_idem_unique` ON `suggestions` (`idem`);