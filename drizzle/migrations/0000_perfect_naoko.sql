CREATE TYPE "public"."contract_status" AS ENUM('Draft', 'Finalized');--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"status" "contract_status" NOT NULL,
	"parties" text[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "title_idx" ON "contracts" USING btree ("title");--> statement-breakpoint
CREATE INDEX "parties_idx" ON "contracts" USING btree ("parties");--> statement-breakpoint
CREATE INDEX "status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "contracts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "updated_at_idx" ON "contracts" USING btree ("updated_at");