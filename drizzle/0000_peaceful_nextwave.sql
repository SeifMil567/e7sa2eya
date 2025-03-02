CREATE TABLE "actions" (
	"aid" serial PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"adminlevel" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutritions" (
	"nid" serial PRIMARY KEY NOT NULL,
	"nname" varchar(255) NOT NULL,
	"byuser" integer NOT NULL,
	"datecreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patient_ranks" (
	"rankid" serial PRIMARY KEY NOT NULL,
	"rankname" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"pid" serial PRIMARY KEY NOT NULL,
	"pnum" varchar(255) NOT NULL,
	"fullname" varchar(255) NOT NULL,
	"rankid" integer NOT NULL,
	"unit" varchar(255) NOT NULL,
	"host" varchar(255),
	"byuser" integer NOT NULL,
	"datecreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "patients_history" (
	"phid" serial PRIMARY KEY NOT NULL,
	"diagnoses" varchar(255) NOT NULL,
	"entrydate" date NOT NULL,
	"nutrition" integer,
	"pid" integer,
	"exitdate" date,
	"section" integer NOT NULL,
	"action" integer NOT NULL,
	"byuser" integer,
	"datecreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "ranks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "ranks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sections_occupancy" (
	"secid" serial PRIMARY KEY NOT NULL,
	"secname" varchar(255) NOT NULL,
	"officers" integer DEFAULT 0,
	"officersfamily" integer DEFAULT 0,
	"ranks" integer DEFAULT 0,
	"familyranks" integer DEFAULT 0,
	"civilian" integer DEFAULT 0,
	"patients" integer DEFAULT 0,
	"escorts" integer DEFAULT 0,
	"totalcapacity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uid" serial PRIMARY KEY NOT NULL,
	"uname" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"adminlevel" integer DEFAULT 3 NOT NULL,
	"milnum" varchar(255),
	"byuser" integer NOT NULL,
	"activ" integer DEFAULT 1 NOT NULL,
	"datecreated" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "nutritions" ADD CONSTRAINT "nutritions_byuser_users_uid_fk" FOREIGN KEY ("byuser") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_rankid_patient_ranks_rankid_fk" FOREIGN KEY ("rankid") REFERENCES "public"."patient_ranks"("rankid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_byuser_users_uid_fk" FOREIGN KEY ("byuser") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients_history" ADD CONSTRAINT "patients_history_nutrition_nutritions_nid_fk" FOREIGN KEY ("nutrition") REFERENCES "public"."nutritions"("nid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients_history" ADD CONSTRAINT "patients_history_pid_patients_pid_fk" FOREIGN KEY ("pid") REFERENCES "public"."patients"("pid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients_history" ADD CONSTRAINT "patients_history_section_sections_occupancy_secid_fk" FOREIGN KEY ("section") REFERENCES "public"."sections_occupancy"("secid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients_history" ADD CONSTRAINT "patients_history_action_actions_aid_fk" FOREIGN KEY ("action") REFERENCES "public"."actions"("aid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients_history" ADD CONSTRAINT "patients_history_byuser_users_uid_fk" FOREIGN KEY ("byuser") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;