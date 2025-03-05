import { users, type User, type InsertUser, donations, type Donation, type InsertDonation, donors, type Donor, type InsertDonor } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Donation methods
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonations(): Promise<Donation[]>;
  getDonationByEmail(email: string): Promise<Donation | undefined>;
  getDonationByIdentifier(identifier: string): Promise<Donation | undefined>;
  
  // Donor methods
  getDonor(id: number): Promise<Donor | undefined>;
  getDonorByEmail(email: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: number, donor: Partial<InsertDonor>): Promise<Donor | undefined>;
  getDonorDonations(donorId: number): Promise<Donation[]>;
}

// PostgreSQL implementation of the storage interface
export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Donation methods
  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    // Make sure email is always a string (empty if not provided)
    const email = insertDonation.email || '';
    
    // If we have a donor email but no donor_id, try to find the donor
    if (email && !insertDonation.donor_id) {
      const donor = await this.getDonorByEmail(email);
      if (donor) {
        insertDonation.donor_id = donor.id;
      }
    }
    
    const result = await db.insert(donations).values({
      ...insertDonation,
      email
    }).returning();
    
    return result[0];
  }

  async getDonations(): Promise<Donation[]> {
    return await db.select().from(donations).orderBy(desc(donations.timestamp));
  }

  async getDonationByEmail(email: string): Promise<Donation | undefined> {
    if (!email) return undefined;
    const result = await db.select()
      .from(donations)
      .where(eq(donations.email, email))
      .orderBy(desc(donations.timestamp));
    return result[0];
  }

  async getDonationByIdentifier(identifier: string): Promise<Donation | undefined> {
    // First try to find by email
    const emailDonation = await this.getDonationByEmail(identifier);
    if (emailDonation) return emailDonation;

    // Could be extended to search by other identifiers in the future
    return undefined;
  }

  // Donor methods
  async getDonor(id: number): Promise<Donor | undefined> {
    const result = await db.select().from(donors).where(eq(donors.id, id));
    return result[0];
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    if (!email) return undefined;
    const result = await db.select().from(donors).where(eq(donors.email, email));
    return result[0];
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    // Check if donor already exists by email
    const existingDonor = await this.getDonorByEmail(insertDonor.email);
    if (existingDonor) {
      // Update existing donor with new data
      const updated = await this.updateDonor(existingDonor.id, insertDonor);
      return updated || existingDonor;
    }
    
    // Create new donor
    const result = await db.insert(donors).values(insertDonor).returning();
    return result[0];
  }

  async updateDonor(id: number, donor: Partial<InsertDonor>): Promise<Donor | undefined> {
    const result = await db.update(donors)
      .set(donor)
      .where(eq(donors.id, id))
      .returning();
    return result[0];
  }

  async getDonorDonations(donorId: number): Promise<Donation[]> {
    return await db.select()
      .from(donations)
      .where(eq(donations.donor_id, donorId))
      .orderBy(desc(donations.timestamp));
  }
}

// In-memory storage implementation for testing or fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private donors: Map<number, Donor>;
  private donations: Map<number, Donation>;
  currentUserId: number;
  currentDonorId: number;
  currentDonationId: number;

  constructor() {
    this.users = new Map();
    this.donors = new Map();
    this.donations = new Map();
    this.currentUserId = 1;
    this.currentDonorId = 1;
    this.currentDonationId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Donation methods
  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.currentDonationId++;
    // Make sure email is always a string (empty if not provided)
    const email = insertDonation.email || '';
    
    // If we have a donor email but no donor_id, try to find the donor
    let donor_id: number | null = null;
    if (email && !insertDonation.donor_id) {
      const donor = await this.getDonorByEmail(email);
      if (donor) {
        donor_id = donor.id;
      }
    } else {
      donor_id = insertDonation.donor_id || null;
    }
    
    const donation: Donation = { 
      ...insertDonation, 
      id,
      email,
      timestamp: insertDonation.timestamp || new Date(),
      donor_id: donor_id,
      external_donation_id: insertDonation.external_donation_id || null,
      imported: insertDonation.imported || 0
    };
    this.donations.set(id, donation);
    return donation;
  }

  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async getDonationByEmail(email: string): Promise<Donation | undefined> {
    if (!email) return undefined;
    const donations = Array.from(this.donations.values())
      .filter(donation => donation.email === email)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return donations[0];
  }

  async getDonationByIdentifier(identifier: string): Promise<Donation | undefined> {
    // First try to find by email
    const emailDonation = await this.getDonationByEmail(identifier);
    if (emailDonation) return emailDonation;

    // Could be extended to search by other identifiers in the future
    return undefined;
  }

  // Donor methods
  async getDonor(id: number): Promise<Donor | undefined> {
    return this.donors.get(id);
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    if (!email) return undefined;
    return Array.from(this.donors.values()).find(
      (donor) => donor.email === email
    );
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    // Check if donor already exists by email
    const existingDonor = await this.getDonorByEmail(insertDonor.email);
    if (existingDonor) {
      // Update existing donor with new data
      const updated = await this.updateDonor(existingDonor.id, insertDonor);
      return updated || existingDonor;
    }
    
    const id = this.currentDonorId++;
    const now = new Date();
    const donor: Donor = { 
      id,
      email: insertDonor.email,
      created_at: now,
      last_imported: now,
      first_name: insertDonor.first_name || null,
      last_name: insertDonor.last_name || null,
      phone: insertDonor.phone || null,
      external_id: insertDonor.external_id || null
    };
    this.donors.set(id, donor);
    return donor;
  }

  async updateDonor(id: number, donor: Partial<InsertDonor>): Promise<Donor | undefined> {
    const existingDonor = this.donors.get(id);
    if (!existingDonor) return undefined;
    
    const updatedDonor = { 
      ...existingDonor, 
      ...donor,
      last_imported: new Date()
    };
    this.donors.set(id, updatedDonor);
    return updatedDonor;
  }

  async getDonorDonations(donorId: number): Promise<Donation[]> {
    return Array.from(this.donations.values())
      .filter(donation => donation.donor_id === donorId)
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }
}

// Export the PostgreSQL storage implementation by default
export const storage = new PostgresStorage();
