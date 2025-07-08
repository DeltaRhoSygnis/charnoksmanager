import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

async function createDatabaseConnection() {
  // Try different database connections in priority order
  const connections = [
    {
      name: 'Supabase',
      url: process.env.SUPABASE_DATABASE_URL,
      ssl: true
    },
    {
      name: 'Neon',
      url: process.env.DATABASE_URL,
      ssl: true
    },
    {
      name: 'Local PostgreSQL',
      url: process.env.PGHOST ? 
        `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}` : 
        null,
      ssl: false
    }
  ];

  for (const conn of connections) {
    if (!conn.url) continue;
    
    try {
      console.log(`🔄 Testing ${conn.name} connection...`);
      
      const testPool = new Pool({
        connectionString: conn.url,
        ssl: conn.ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000
      });

      // Test connection with a simple query
      await testPool.query('SELECT 1');
      await testPool.end();

      console.log(`✅ Using ${conn.name} as primary database`);
      
      return new Pool({
        connectionString: conn.url,
        ssl: conn.ssl ? { rejectUnauthorized: false } : false
      });
      
    } catch (error) {
      console.log(`❌ ${conn.name} connection failed:`, (error as Error).message);
      continue;
    }
  }
  
  throw new Error('No database connections available. Please check your database credentials.');
}

// Initialize database connection
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = await createDatabaseConnection();
  db = drizzle(pool, { schema });
} catch (error) {
  console.error('Database initialization failed:', error);
  // Create a mock pool for development that will throw meaningful errors
  pool = {
    query: () => Promise.reject(new Error('No database available. Please configure database credentials.')),
    end: () => Promise.resolve()
  } as any;
  db = drizzle(pool, { schema });
}

export { pool, db };