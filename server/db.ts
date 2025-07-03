import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Neon database URL (provided by user)
const NEON_DB_URL = "postgresql://neondb_owner:npg_wJJqbmMfuQnx@ep-gentle-leaf-a8jo9m3q-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

const DATABASE_URL = NEON_DB_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });