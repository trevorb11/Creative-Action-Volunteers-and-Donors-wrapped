import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';

// Configure neon to use HTTP during development (WebSocket not available in Replit)
neonConfig.httpAgent = true;

// Function to set up the database schema
export async function setupDatabase() {
  console.log('Setting up the database...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Create a Neon client
  const sql = neon(databaseUrl);
  
  // Create a Drizzle client
  const db = drizzle(sql, { schema });

  try {
    // Create the tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS donors (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        external_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_imported TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        amount NUMERIC NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        email TEXT NOT NULL DEFAULT '',
        donor_id INTEGER REFERENCES donors(id),
        external_donation_id TEXT,
        imported INTEGER DEFAULT 0
      );
    `;
    
    console.log('Database setup completed successfully.');
    return true;
  } catch (error) {
    console.error('Error setting up the database:', error);
    throw error;
  }
}