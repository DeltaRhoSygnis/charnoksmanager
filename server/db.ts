import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use local PostgreSQL database
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Please check your environment variables.",
  );
}

console.log("✅ Connected to database:", databaseUrl.split('@')[1]?.split('/')[0] || 'database');

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });