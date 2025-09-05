CREATE TYPE "public"."auth_method" AS ENUM('SRP', 'PASSKEY');--> statement-breakpoint
CREATE TABLE "user_authenticators" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"method" "auth_method" NOT NULL,
	"data" jsonb NOT NULL,
	"kek_salt" varchar NOT NULL,
	"dek" varchar NOT NULL
);
--> statement-breakpoint
DROP TABLE "user_passwords" CASCADE;--> statement-breakpoint
ALTER TABLE "user_authenticators" ADD CONSTRAINT "user_authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;