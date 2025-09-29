import { db } from './db';
import { sql } from 'drizzle-orm';

export async function setupDatabase() {
  console.log('Setting up the database...');

  try {
    await db.execute(sql`
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
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        amount NUMERIC NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        email TEXT NOT NULL DEFAULT '',
        donor_id INTEGER REFERENCES donors(id),
        external_donation_id TEXT,
        imported INTEGER DEFAULT 0
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS volunteers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        external_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS volunteer_shifts (
        id SERIAL PRIMARY KEY,
        hours NUMERIC NOT NULL,
        shift_date TIMESTAMP NOT NULL DEFAULT NOW(),
        email TEXT NOT NULL DEFAULT '',
        volunteer_id INTEGER REFERENCES volunteers(id),
        external_shift_id TEXT
      );
    `);
    
    console.log('Database setup completed successfully.');
    return true;
  } catch (error) {
    console.error('Error setting up the database:', error);
    throw error;
  }
}
