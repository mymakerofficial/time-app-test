CREATE TABLE "attachments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"note_id" varchar NOT NULL,
	"created_at" varchar NOT NULL,
	"updated_at" varchar NOT NULL,
	"mime_type" varchar NOT NULL,
	"content" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "time_entries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "time_entries" CASCADE;--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN "userId";