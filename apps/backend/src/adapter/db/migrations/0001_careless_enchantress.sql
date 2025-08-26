ALTER TABLE "time_entries" ALTER COLUMN "updated_at" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "time_entries" ALTER COLUMN "ended_at" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "time_entries" ALTER COLUMN "message" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "time_entries" ADD COLUMN "userId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;