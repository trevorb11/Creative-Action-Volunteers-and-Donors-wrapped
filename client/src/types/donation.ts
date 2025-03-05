import { DonationImpact } from "@shared/schema";

export interface DonationFormValues {
  amount: number;
}

export interface DonationState {
  amount: number;
  step: number;
  impact: DonationImpact | null;
  isLoading: boolean;
  error: string | null;
}

export enum SlideNames {
  WELCOME = 0,
  LOADING = 1,
  MEALS = 2,
  NUTRITION = 3,
  PEOPLE = 4,
  ENVIRONMENT = 5,
  FOOD_RESCUE = 6,
  VOLUNTEER = 7,
  PARTNER = 8,
  SUMMARY = 9
}
