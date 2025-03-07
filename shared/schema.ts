import { pgTable, text, serial, integer, numeric, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const donors = pgTable("donors", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  phone: text("phone"),
  external_id: text("external_id"), // For any external donor ID (e.g., from a CRM)
  created_at: timestamp("created_at").defaultNow().notNull(),
  last_imported: timestamp("last_imported").defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  email: text("email").notNull().default(''),
  donor_id: integer("donor_id").references(() => donors.id),
  external_donation_id: text("external_donation_id"), // For any external donation ID
  imported: integer("imported").default(0), // 0 = new donation via app, 1 = imported
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDonorSchema = createInsertSchema(donors).pick({
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  external_id: true,
});

export const insertDonationSchema = createInsertSchema(donations).pick({
  amount: true,
  timestamp: true,
  email: true,
  donor_id: true,
  external_donation_id: true,
  imported: true,
});

// Schema for bulk importing donors
export const importDonorSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  external_id: z.string().optional(),
  donations: z.array(z.object({
    amount: z.number().or(z.string()),
    timestamp: z.string().or(z.date()),
    external_donation_id: z.string().optional(),
  })).optional(),
});

export type ImportDonor = z.infer<typeof importDonorSchema>;
export type BulkImportResult = {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donors.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export const almanacData = {
  // 3-year rolling average per Appendix B
  mealsPerDollar: 1.52,      // Replaces old 0.833
  poundsPerDollar: 1.83,     // If you're counting total distribution per dollar
  co2PerPoundFood: 3.8,      // Updated from 0.84
  waterPerPoundFood: 51,     // Updated from 45.2

  // If you need a direct meals/lb ratio:
  mealPerPound: 0.833,       // (1 / 1.2)

  // Nutritional distribution breakdown if needed:
  foodDistribution: {
    produce: 31.92, // Percent
    dairy: 21.67,   // Percent
    protein: 18.33, // Percent
  },

  // Possibly for references or base calculations:
  totalMealsProvided: 10951888, // or update from new data
  totalPeopleServed: 60000,     // only if needed
};


export type DonationImpact = {
  mealsProvided: number;
  peopleServed: number;
  peoplePercentage: string;
  foodRescued: number;
  co2Saved: number;
  waterSaved: number;
  producePercentage: number;
  dairyPercentage: number;
  proteinPercentage: number;
  freshFoodPercentage: number;
  babyElephants: string;
  bison: string;
  cars: string;
  peopleFed: string;
  daysFed: string;
};
