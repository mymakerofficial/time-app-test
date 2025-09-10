ALTER TABLE "attachments" DROP CONSTRAINT "attachments_note_id_notes_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_authenticators" DROP CONSTRAINT "user_authenticators_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "filename" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_authenticators" ADD CONSTRAINT "user_authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;