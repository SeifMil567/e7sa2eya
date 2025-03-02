/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'sections'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "sections" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "sections" ALTER COLUMN "secid" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "sections" ALTER COLUMN "secname" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_secid_sections_occupancy_secid_fk" FOREIGN KEY ("secid") REFERENCES "public"."sections_occupancy"("secid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_secname_sections_occupancy_secname_fk" FOREIGN KEY ("secname") REFERENCES "public"."sections_occupancy"("secname") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_seccapacity_sections_occupancy_totalcapacity_fk" FOREIGN KEY ("seccapacity") REFERENCES "public"."sections_occupancy"("totalcapacity") ON DELETE no action ON UPDATE no action;