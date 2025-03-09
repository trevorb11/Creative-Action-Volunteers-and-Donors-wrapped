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
  // Weight comparison fields
  babyElephants: string;
  bison: string;
  cars: string;
  houseCats: string;
  goldenRetrievers: string;
  grizzlyBears: string;
  hippos: string;
  schoolBuses: string;
  smallJets: string;
  // Additional weight comparison fields
  breadLoaves?: string;
  pineapples?: string;
  toddlers?: string;
  bulldogs?: string;
  rvs?: string;
  whaleSharkPups?: string;
  blueWhaleCalf?: string;
  // Text descriptions for comparisons
  weightComparisonText?: string;
}

export enum SlideNames {
  WELCOME = 0,
  LOADING = 1,
  DONOR_SUMMARY = 2,
  DONOR_INTRO = 3,      // New slide for donor introduction
  MEALS = 4,            // Shifted down 1 position
  PEOPLE = 5,           // Shifted down 1 position
  TIME_GIVING = 6,      // Shifted down 1 position
  FOOD_RESCUE = 7,      // Shifted down 1 position
  ENVIRONMENT = 8,      // Shifted down 1 position
  FINANCIAL = 9,        // Shifted down 1 position
  VOLUNTEER = 10,       // Shifted down 1 position
  SUMMARY = 11          // Shifted down 1 position
}
