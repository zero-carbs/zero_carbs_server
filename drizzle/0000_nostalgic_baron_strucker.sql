CREATE TABLE IF NOT EXISTS "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(100),
	"itemName" varchar(256) NOT NULL,
	"purchaseId" uuid,
	"listingId" uuid,
	"soldPriceTotal" integer NOT NULL,
	"soldPriceShipping" integer NOT NULL,
	"soldPriceFees" integer NOT NULL,
	"soldDate" date,
	"isSold" boolean DEFAULT false NOT NULL,
	"isListed" boolean DEFAULT false NOT NULL,
	"listedSource" varchar(100),
	"listedSourceUrl" varchar(100),
	"itemNotes" varchar(5000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(100),
	"listingName" varchar(256) NOT NULL,
	"listingDate" date NOT NULL,
	"listingPrice" integer,
	"listingSource" varchar(100),
	"listingSourceUrl" varchar(100),
	"listingSold" boolean DEFAULT false NOT NULL,
	"listingSoldPrice" integer DEFAULT 0 NOT NULL,
	"listingSoldShipping" integer DEFAULT 0 NOT NULL,
	"listingSoldFees" integer DEFAULT 0 NOT NULL,
	"listingSoldDate" date,
	"listingNotes" varchar(5000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(100),
	"itemName" varchar(256) NOT NULL,
	"datePurchased" date NOT NULL,
	"purchasePrice" integer NOT NULL,
	"priceTax" integer NOT NULL,
	"priceShipping" integer NOT NULL,
	"priceFees" integer NOT NULL,
	"soldTotals" integer DEFAULT 0 NOT NULL,
	"source" varchar(100) NOT NULL,
	"sourceUrl" varchar(100),
	"purchaseNotes" varchar(5000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"settingsId" uuid,
	"userId" varchar(100),
	"theme" varchar(100) DEFAULT 'light' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(100),
	"sourceName" text,
	"sourceLabel" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(100),
	"emailAddress" varchar(256) NOT NULL,
	"createdAt" timestamp NOT NULL,
	"primaryEmailAddressId" text NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_purchaseId_purchases_id_fk" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_listingId_listings_id_fk" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
