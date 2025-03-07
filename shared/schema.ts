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
  first_name: text("first_name"),
  last_name: text("last_name"),
  phone: text("phone"),
  external_id: text("external_id"), // For any external volunteer ID
  created_at: timestamp("created_at").defaultNow().notNull(),
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
  first_name: true,
  last_name: true,
  phone: true,
  external_id: true,
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
  mealsPerVolunteerHour: 55,        // Meals provided per volunteer hour
  valuePerVolunteerHour: 36.36,      // Dollar value of volunteer hour
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
