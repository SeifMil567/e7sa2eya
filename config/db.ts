import { drizzle } from "drizzle-orm/node-postgres"; // Import drizzle from the correct submodule
import { Pool } from "pg"; // Import the PostgreSQL client

// Set up the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a drizzle instance using the pg pool
const db = drizzle(pool);

export default db;
