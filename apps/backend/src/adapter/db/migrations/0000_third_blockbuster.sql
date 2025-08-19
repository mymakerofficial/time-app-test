CREATE TABLE "time_entries" (
	"id" varchar PRIMARY KEY NOT NULL,
	"createdAt" "bytea" NOT NULL,
	"updatedAt" "bytea" NOT NULL,
	"lookupKey" integer NOT NULL,
	"startedAt" "bytea" NOT NULL,
	"endedAt" "bytea",
	"message" "bytea" NOT NULL
);
