import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Supabase database URL using environment variables
const SUPABASE_DB_URL = process.env.SUPABASE_DATABASE_PASSWORD 
  ? `postgresql://postgres.zkuhrvsqslnwvtbgzcii:${process.env.SUPABASE_DATABASE_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
  : null;

const DATABASE_URL = SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });