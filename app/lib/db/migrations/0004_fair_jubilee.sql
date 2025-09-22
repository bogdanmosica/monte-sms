ALTER TABLE "payments" ALTER COLUMN "type" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending';