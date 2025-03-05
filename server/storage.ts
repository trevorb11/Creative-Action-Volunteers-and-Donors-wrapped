import { users, type User, type InsertUser, donations, type Donation, type InsertDonation } from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonations(): Promise<Donation[]>;
  getDonationByEmail(email: string): Promise<Donation | undefined>;
  getDonationByIdentifier(identifier: string): Promise<Donation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private donations: Map<number, Donation>;
  currentUserId: number;
  currentDonationId: number;

  constructor() {
    this.users = new Map();
    this.donations = new Map();
    this.currentUserId = 1;
    this.currentDonationId = 1;
  }

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

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.currentDonationId++;
    // Make sure email is always a string (empty if not provided)
    const email = insertDonation.email || '';
    const donation: Donation = { 
      ...insertDonation, 
      id,
      email 
    };
    this.donations.set(id, donation);
    return donation;
  }

  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async getDonationByEmail(email: string): Promise<Donation | undefined> {
    return Array.from(this.donations.values()).find(
      (donation) => donation.email === email
    );
  }

  async getDonationByIdentifier(identifier: string): Promise<Donation | undefined> {
    // First try to find by email
    const emailDonation = await this.getDonationByEmail(identifier);
    if (emailDonation) return emailDonation;

    // Could be extended to search by other identifiers like phone, ID, etc.
    // For now, just email is implemented as the identifier
    return undefined;
  }
}

export const storage = new MemStorage();
