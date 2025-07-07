import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for Supabase database URL first, then fallback to Neon PostgreSQL
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or SUPABASE_DATABASE_URL must be set. Please check your .env file.",
  );
}

console.log("✅ Connected to database:", databaseUrl.split('@')[1]?.split('/')[0] || 'database');

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });