ALTER TABLE "sections_occupancy" ALTER COLUMN "availablebeds" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sections_occupancy" ALTER COLUMN "availablebeds" SET NOT NULL;