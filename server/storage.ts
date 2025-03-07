import { 
  users, type User, type InsertUser, 
  volunteers, type Volunteer, type InsertVolunteer, 
  volunteer_shifts, type VolunteerShift, type InsertVolunteerShift 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Volunteer methods
  getVolunteer(id: number): Promise<Volunteer | undefined>;
  getVolunteerByEmail(email: string): Promise<Volunteer | undefined>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  updateVolunteer(id: number, volunteer: Partial<InsertVolunteer>): Promise<Volunteer | undefined>;
  
  // Volunteer Shift methods
  createVolunteerShift(shift: InsertVolunteerShift): Promise<VolunteerShift>;
  getVolunteerShifts(volunteerId: number): Promise<VolunteerShift[]>;
  getVolunteerShiftByEmail(email: string): Promise<VolunteerShift | undefined>;
  getLatestVolunteerShift(volunteerId: number): Promise<VolunteerShift | undefined>;
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

  // Volunteer methods
  async getVolunteer(id: number): Promise<Volunteer | undefined> {
    const result = await db.select().from(volunteers).where(eq(volunteers.id, id));
    return result[0];
  }

  async getVolunteerByEmail(email: string): Promise<Volunteer | undefined> {
    if (!email) return undefined;
    const result = await db.select().from(volunteers).where(eq(volunteers.email, email));
    return result[0];
  }

  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    // Check if volunteer already exists by email
    const existingVolunteer = await this.getVolunteerByEmail(insertVolunteer.email);
    if (existingVolunteer) {
      // Update existing volunteer with new data
      const updated = await this.updateVolunteer(existingVolunteer.id, insertVolunteer);
      return updated || existingVolunteer;
    }
    
    // Create new volunteer
    const result = await db.insert(volunteers).values(insertVolunteer).returning();
    return result[0];
  }

  async updateVolunteer(id: number, volunteer: Partial<InsertVolunteer>): Promise<Volunteer | undefined> {
    const result = await db.update(volunteers)
      .set(volunteer)
      .where(eq(volunteers.id, id))
      .returning();
    return result[0];
  }

  // Volunteer Shift methods
  async createVolunteerShift(insertShift: InsertVolunteerShift): Promise<VolunteerShift> {
    // Make sure email is always a string (empty if not provided)
    const email = insertShift.email || '';
    
    // If we have a volunteer email but no volunteer_id, try to find the volunteer
    if (email && !insertShift.volunteer_id) {
      const volunteer = await this.getVolunteerByEmail(email);
      if (volunteer) {
        insertShift.volunteer_id = volunteer.id;
      }
    }
    
    const result = await db.insert(volunteer_shifts).values({
      ...insertShift,
      email
    }).returning();
    
    return result[0];
  }

  async getVolunteerShifts(volunteerId: number): Promise<VolunteerShift[]> {
    return await db.select()
      .from(volunteer_shifts)
      .where(eq(volunteer_shifts.volunteer_id, volunteerId))
      .orderBy(desc(volunteer_shifts.shift_date));
  }

  async getVolunteerShiftByEmail(email: string): Promise<VolunteerShift | undefined> {
    if (!email) return undefined;
    const result = await db.select()
      .from(volunteer_shifts)
      .where(eq(volunteer_shifts.email, email))
      .orderBy(desc(volunteer_shifts.shift_date));
    return result[0];
  }

  async getLatestVolunteerShift(volunteerId: number): Promise<VolunteerShift | undefined> {
    const result = await db.select()
      .from(volunteer_shifts)
      .where(eq(volunteer_shifts.volunteer_id, volunteerId))
      .orderBy(desc(volunteer_shifts.shift_date))
      .limit(1);
    return result[0];
  }
}

// In-memory storage implementation for testing or fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private volunteers: Map<number, Volunteer>;
  private volunteerShifts: Map<number, VolunteerShift>;
  
  currentUserId: number;
  currentVolunteerId: number;
  currentShiftId: number;

  constructor() {
    this.users = new Map();
    this.volunteers = new Map();
    this.volunteerShifts = new Map();
    
    this.currentUserId = 1;
    this.currentVolunteerId = 1;
    this.currentShiftId = 1;
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

  // Volunteer methods
  async getVolunteer(id: number): Promise<Volunteer | undefined> {
    return this.volunteers.get(id);
  }

  async getVolunteerByEmail(email: string): Promise<Volunteer | undefined> {
    if (!email) return undefined;
    return Array.from(this.volunteers.values()).find(
      (volunteer) => volunteer.email === email
    );
  }

  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    // Check if volunteer already exists by email
    const existingVolunteer = await this.getVolunteerByEmail(insertVolunteer.email);
    if (existingVolunteer) {
      // Update existing volunteer with new data
      const updated = await this.updateVolunteer(existingVolunteer.id, insertVolunteer);
      return updated || existingVolunteer;
    }
    
    const id = this.currentVolunteerId++;
    const now = new Date();
    const volunteer: Volunteer = { 
      id,
      email: insertVolunteer.email,
      created_at: now,
      updated_at: null,
      name: insertVolunteer.name || null,
      phone: insertVolunteer.phone || null,
      address: insertVolunteer.address || null,
      city: insertVolunteer.city || null,
      state: insertVolunteer.state || null,
      zip: insertVolunteer.zip || null
    };
    this.volunteers.set(id, volunteer);
    return volunteer;
  }

  async updateVolunteer(id: number, volunteer: Partial<InsertVolunteer>): Promise<Volunteer | undefined> {
    const existingVolunteer = this.volunteers.get(id);
    if (!existingVolunteer) return undefined;
    
    const updatedVolunteer = { 
      ...existingVolunteer, 
      ...volunteer
    };
    this.volunteers.set(id, updatedVolunteer);
    return updatedVolunteer;
  }

  // Volunteer Shift methods
  async createVolunteerShift(insertShift: InsertVolunteerShift): Promise<VolunteerShift> {
    const id = this.currentShiftId++;
    // Make sure email is always a string (empty if not provided)
    const email = insertShift.email || '';
    
    // If we have a volunteer email but no volunteer_id, try to find the volunteer
    let volunteer_id: number | null = null;
    if (email && !insertShift.volunteer_id) {
      const volunteer = await this.getVolunteerByEmail(email);
      if (volunteer) {
        volunteer_id = volunteer.id;
      }
    } else {
      volunteer_id = insertShift.volunteer_id || null;
    }
    
    const shift: VolunteerShift = { 
      ...insertShift, 
      id,
      email,
      shift_date: insertShift.shift_date || new Date(),
      volunteer_id: volunteer_id,
      external_shift_id: insertShift.external_shift_id || null
    };
    this.volunteerShifts.set(id, shift);
    return shift;
  }

  async getVolunteerShifts(volunteerId: number): Promise<VolunteerShift[]> {
    return Array.from(this.volunteerShifts.values())
      .filter(shift => shift.volunteer_id === volunteerId)
      .sort((a, b) => {
        return new Date(b.shift_date).getTime() - new Date(a.shift_date).getTime();
      });
  }

  async getVolunteerShiftByEmail(email: string): Promise<VolunteerShift | undefined> {
    if (!email) return undefined;
    const shifts = Array.from(this.volunteerShifts.values())
      .filter(shift => shift.email === email)
      .sort((a, b) => new Date(b.shift_date).getTime() - new Date(a.shift_date).getTime());
    return shifts[0];
  }

  async getLatestVolunteerShift(volunteerId: number): Promise<VolunteerShift | undefined> {
    const shifts = await this.getVolunteerShifts(volunteerId);
    return shifts.length > 0 ? shifts[0] : undefined;
  }
}

// Export the PostgreSQL storage implementation by default
export const storage = new PostgresStorage();
