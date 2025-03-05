import { pgTable, text, serial, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  timestamp: text("timestamp").notNull(),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDonationSchema = createInsertSchema(donations).pick({
  amount: true,
  timestamp: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export const almanacData = {
  mealsPerDollar: 0.833, // Based on 10.95M meals distributed at $25.88M value (~$2.36 per meal)
  peoplePerMeal: 0.328, // Based on serving 60,000 people with 11M meals annually
  foodRescuePerDollar: 0.421, // Pounds of food rescued per dollar (estimate)
  co2PerPoundFood: 0.84, // CO2 emissions prevented per pound of food
  waterPerPoundFood: 45.2, // Gallons of water saved per pound of food
  foodDistribution: {
    produce: 31.92, // Percentage
    dairy: 21.67, // Percentage
    protein: 18.33, // Percentage
  },
  totalMealsProvided: 10951888,
  totalPeopleServed: 60000,
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
