import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
});

export const volunteer_shifts = pgTable("volunteer_shifts", {
  id: serial("id").primaryKey(),
  hours: numeric("hours").notNull(),
  shift_date: timestamp("shift_date").defaultNow().notNull(),
  email: text("email").notNull().default(''),
  volunteer_id: integer("volunteer_id").references(() => volunteers.id),
  external_shift_id: text("external_shift_id"), // For any external shift ID
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVolunteerSchema = createInsertSchema(volunteers).pick({
  email: true,
  name: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zip: true,
});

export const insertVolunteerShiftSchema = createInsertSchema(volunteer_shifts).pick({
  hours: true,
  shift_date: true,
  email: true,
  volunteer_id: true,
  external_shift_id: true,
});

// Schema for identifying a volunteer from URL params
export const volunteerParamsSchema = z.object({
  email: z.string().email().optional(),
  hours: z.number().or(z.string()).optional(),
});

export type VolunteerParams = z.infer<typeof volunteerParamsSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteers.$inferSelect;

export type InsertVolunteerShift = z.infer<typeof insertVolunteerShiftSchema>;
export type VolunteerShift = typeof volunteer_shifts.$inferSelect;

export const almanacData = {
  // Volunteer impact metrics
  mealsPerVolunteerHour: 55,        // Updated: 55 meals per volunteer hour
  valuePerVolunteerHour: 36.30,      // Dollar value of volunteer hour (55 meals * $0.66 per meal)
  mealsPerDay: 3,                    // Meals per person per day
  
  // For reference or calculations
  totalMealsProvided: 10951888,      // Total meals provided annually
  totalPeopleServed: 60000,          // Total people served annually
};

export type VolunteerImpact = {
  hoursWorked: number;
  mealsProvided: number;
  costSavings: number;
  peopleServedPerDay: number;
};

export type DonationImpact = {
  // Creative Action specific metrics
  instructionHours: number;
  muralsSupported: number;
  teachingArtistHours: number;
  selStudents: number;
  theaterStudents: number;
  braveSchoolsLessons: number;
  studentsReached: number;
  studentPercentage: string;
  impactDescription: string;
  classroomComparison: string;
  programDistribution: {
    afterSchool: number;
    communityMural: number;
    teachingArtist: number;
    selEnrichment: number;
    youthTheater: number;
    schoolPartnership: number;
  };
  
  // Legacy fields kept for compatibility with existing components
  mealsProvided: number;
  peopleFed: string;
  daysFed: string;
  foodRescued: number;
  peopleServed: number;
  peoplePercentage: string;
  weightComparison?: string;
  co2Saved: number;
  waterSaved: number;
  producePercentage: number;
  dairyPercentage: number;
  proteinPercentage: number;
  freshFoodPercentage: number;
  
  // Legacy comparison fields kept for compatibility
  babyElephants?: string;
  bison?: string;
  cars?: string;
  houseCats?: string;
  goldenRetrievers?: string;
  grizzlyBears?: string;
  hippos?: string;
  hippopotamus?: string;
  schoolBuses?: string;
  smallJets?: string;
  breadLoaves?: string;
  pineapples?: string;
  toddlers?: string;
  bulldogs?: string;
  rvs?: string;
  whaleSharkPups?: string;
  blueWhaleCalf?: string;
  weightComparisonText?: string;
};
