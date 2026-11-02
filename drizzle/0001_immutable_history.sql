CREATE TRIGGER revisions_no_update BEFORE UPDATE ON revisions BEGIN SELECT RAISE(ABORT,'immutable revision'); END;
--> statement-breakpoint
CREATE TRIGGER revisions_no_delete BEFORE DELETE ON revisions BEGIN SELECT RAISE(ABORT,'immutable revision'); END;
--> statement-breakpoint
CREATE TRIGGER candidates_no_update BEFORE UPDATE ON candidates BEGIN SELECT RAISE(ABORT,'immutable candidate'); END;
--> statement-breakpoint
CREATE TRIGGER candidates_no_delete BEFORE DELETE ON candidates BEGIN SELECT RAISE(ABORT,'immutable candidate'); END;
