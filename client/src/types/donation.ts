import { DonationImpact } from "@shared/schema";

export interface DonationFormValues {
  amount: number;
  email?: string;
}

export interface DonationState {
  amount: number;
  step: number;
  impact: DonationImpact | null;
  isLoading: boolean;
  error: string | null;
  donorEmail: string | null;
}

export enum SlideNames {
  WELCOME = 0,
  LOADING = 1,
  DONOR_SUMMARY = 2,
  MEALS = 3,            // Keep MEALS at position 3
  PEOPLE = 4,           // Move PEOPLE to position 4
  TIME_GIVING = 5,      // Move TIME_GIVING to position 5
  FOOD_RESCUE = 6,      // Move FOOD_RESCUE to position 6
  ENVIRONMENT = 7,      // Move ENVIRONMENT to position 7
  VOLUNTEER = 8,        // VOLUNTEER stays at position 8
  SUMMARY = 9           // SUMMARY moves to position 9 (PARTNER removed)
}
