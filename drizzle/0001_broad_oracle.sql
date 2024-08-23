ALTER TABLE "users" ADD COLUMN "isSubscribed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "squareId" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionId" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionCreatedAt" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscriptionStatus" text;