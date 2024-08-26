CREATE TABLE IF NOT EXISTS "contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(100),
	"emailAddress" text NOT NULL,
	"type" text NOT NULL,
	"contactMessage" varchar(550) NOT NULL,
	"date" date NOT NULL
);
