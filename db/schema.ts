import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Define related tables (these should already exist)
export const users = pgTable("users", {
  uID: serial("uid").primaryKey(), // Auto-increment primary key
  uName: varchar("uname", { length: 255 }).notNull(), // User name (non-nullable)
  username: varchar("username", { length: 255 }).notNull(), // Username (non-nullable)
  password: varchar("password", { length: 255 }).notNull(), // User password (non-nullable)
  adminlevel: integer("adminlevel").notNull().default(3), // Admin level (non-nullable)
  milNum: varchar("milnum", { length: 255 }), // Military number (nullable)
  ByUser: integer("byuser").notNull(), // Foreign key referencing the user table itself
  activ: integer("activ").notNull().default(1), // Active status (default value is 1)
  dateCreated: timestamp("datecreated").default(sql`CURRENT_TIMESTAMP`), // Date created with default current timestamp
});

export const supervisors = pgTable("supervisors", {
  id: serial("id").primaryKey(), // Auto-increment primary key
  name: varchar("name").notNull(),
  rank: integer("rank")
    .notNull()
    .references(() => ranks.id),
});

export const actions = pgTable("actions", {
  aID: serial("aid").primaryKey(), // Auto-increment primary key
  Type: varchar("type", { length: 255 }).notNull(), // Type (non-nullable string)
  adminLevel: integer("adminlevel").notNull(), // Admin level (non-nullable integer)
});

export const nutritions = pgTable("nutritions", {
  nID: serial("nid").primaryKey(), // Auto-increment primary key
  nName: varchar("nname", { length: 255 }).notNull(), // Name for nutrition (non-nullable)

  ByUser: integer("byuser")
    .notNull()
    .references(() => users.uID), // Foreign key referring to users
  dateCreated: timestamp("datecreated").default(sql`CURRENT_TIMESTAMP`), // Automatically set current timestamp
});

// Define the patients table in Drizzle ORM
export const patients = pgTable("patients", {
  pID: serial("pid").primaryKey(), // Auto-increment primary key
  pNum: varchar("pnum", { length: 255 }).notNull(), // Patient number (non-nullable)
  fullName: varchar("fullname", { length: 255 }).notNull(), // Patient number (non-nullable)
  rankID: integer("rankid")
    .notNull()
    .references(() => ranks.id), // Foreign key referencing patient_ranks table  fullName: varchar("fullname", { length: 255 }).notNull(), // Full name (non-nullable)
  unit: varchar("unit", { length: 255 }).notNull(), // Unit (non-nullable)
  host: varchar("host", { length: 255 }), // Host (nullable)

  ByUser: integer("byuser")
    .notNull()
    .references(() => users.uID), // Foreign key referencing users table

  familyRelation: integer("familyRelation").references(() => rankFamily.id),
  dateCreated: timestamp("datecreated").default(sql`CURRENT_TIMESTAMP`), // Automatically set current timestamp
});

// Define the patient_history table schema
export const patientsHistory = pgTable("patients_history", {
  phID: serial("phid").primaryKey(),
  Diagnoses: varchar("diagnoses", { length: 255 }).notNull(),
  entryDate: date("entrydate").notNull(),
  nutrition: integer("nutrition").references(() => nutritions.nID, {
    onDelete: "set null",
  }),
  pID: integer("pid").references(() => patients.pID),
  exitDate: date("exitdate"),
  section: integer("section").references(() => sectionsOccupancy.secID, {
    onDelete: "cascade",
  }),
  action: integer("action")
    .references(() => actions.aID)
    .notNull(),
  ByUser: integer("byuser").references(() => users.uID),
  room: varchar("room"),
  dateCreated: timestamp("datecreated").default(sql`CURRENT_TIMESTAMP`),
});

export const sectionsOccupancy = pgTable("sections_occupancy", {
  secID: serial("secid").primaryKey(), // Auto-increment primary key
  secName: varchar("secname", { length: 255 }).notNull(), // Section name (non-nullable string)
  officers: integer("officers").default(0), // Default value for officers
  officersfamily: integer("officersfamily").default(0), // Default value for officer's family
  ranks: integer("ranks").default(0), // Default value for ranks
  familyranks: integer("familyranks").default(0), // Default value for family ranks
  civilian: integer("civilian").default(0), // Default value for civilians
  patients: integer("patients").default(0), // Default value for patients
  escorts: integer("escorts").default(0), // Default value for escorts
  availableBeds: integer("availablebeds").notNull(), // ✅ Ensure it's a regular column
  totalCapacity: integer("totalcapacity").notNull(), // Section's total capacity
  sectionGroupID: integer("sectionGroupID")
    .references(() => sectionGroup.id)
    .notNull(),
});

export const ranks = pgTable("ranks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  typeID: integer("typeID")
    .notNull()
    .references(() => rankType.id),
});

export const rankType = pgTable("rank_type", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
});

export const rankFamily = pgTable("rank_family", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
});

export const sectionGroup = pgTable("section_groups", {
  id: serial("id").primaryKey(),
  groupName: varchar("groupName").notNull(),
});
