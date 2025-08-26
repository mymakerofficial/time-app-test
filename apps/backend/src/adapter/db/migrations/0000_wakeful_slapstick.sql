CREATE TABLE "time_entries" (
	"id" varchar PRIMARY KEY NOT NULL,
	"updated_at" "bytea" NOT NULL,
	"lookup_key" integer NOT NULL,
	"ended_at" "bytea",
	"message" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_passwords" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"salt" varchar NOT NULL,
	"verifier" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" varchar NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "user_passwords" ADD CONSTRAINT "user_passwords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;