CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"username" varchar NOT NULL,
	"salt" varchar NOT NULL,
	"verifier" varchar NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
