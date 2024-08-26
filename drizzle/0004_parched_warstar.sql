ALTER TABLE "contact" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "open" boolean DEFAULT true NOT NULL;