ALTER TABLE "user_passwords" RENAME COLUMN "salt" TO "auth_salt";--> statement-breakpoint
ALTER TABLE "user_passwords" RENAME COLUMN "verifier" TO "auth_verifier";--> statement-breakpoint
ALTER TABLE "user_passwords" ADD COLUMN "kek_salt" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user_passwords" ADD COLUMN "dek" varchar NOT NULL;