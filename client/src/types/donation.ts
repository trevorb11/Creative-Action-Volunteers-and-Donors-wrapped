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

export interface DonationImpact {
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
  babyElephants: string;
  bison: string;
  cars: string;
  houseCats: string;
  goldenRetrievers: string;
  grizzlyBears: string;
  hippos: string;
  schoolBuses: string;
  smallJets: string;
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
  FINANCIAL = 8,        // Add FINANCIAL at position 8
  VOLUNTEER = 9,        // VOLUNTEER moves to position 9
  SUMMARY = 10          // SUMMARY moves to position 10
}
