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
  MEALS = 3,
  NUTRITION = 4,
  PEOPLE = 5,
  ENVIRONMENT = 6,
  FOOD_RESCUE = 7,
  VOLUNTEER = 8,
  PARTNER = 9,
  SUMMARY = 10
}
