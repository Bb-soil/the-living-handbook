CREATE TABLE `article_translations` (
	`id` text PRIMARY KEY NOT NULL,
	`source_hash` text NOT NULL,
	`section` text NOT NULL,
	`locale` text NOT NULL,
	`status` text NOT NULL,
	`result` text,
	`model` text,
	`error` text,
	`lease` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
