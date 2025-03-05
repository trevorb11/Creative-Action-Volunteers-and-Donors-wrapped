import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';

// Configure neon to use HTTP during development (WebSocket not available in Replit)
neonConfig.httpAgent = true;

// For replit, use the provided environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a Neon client
const sql = neon(databaseUrl);

// Create a Drizzle client
export const db = drizzle(sql, { schema });