import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for Supabase database URL first, then fallback to Replit's PostgreSQL
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

let pool: Pool;
let db: ReturnType<typeof drizzle>;

if (!databaseUrl) {
  console.warn("No DATABASE_URL found. Application will use Firebase/Local Storage mode.");
  // Create a mock database connection for development
  const mockUrl = "postgresql://localhost:5432/mock";
  pool = new Pool({ connectionString: mockUrl });
  db = drizzle({ client: pool, schema });
} else {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
}

export { pool, db };