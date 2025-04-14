export interface DonationFormValues {
  amount: number;
  email?: string;
}

export interface DonationState {
  amount: number;
  step: number;
  previousStep?: number;
  impact: DonationImpact | null;
  isLoading: boolean;
  error: string | null;
  donorEmail: string | null;
  transitionDirection?: 'forward' | 'backward';
}

export interface DonationImpact {
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
  babyElephants: string;
  bison: string;
  cars: string;
  houseCats: string;
  goldenRetrievers: string;
  grizzlyBears: string;
  hippos: string;
  hippopotamus: string;
  schoolBuses: string;
  smallJets: string;
  breadLoaves?: string;
  pineapples?: string;
  toddlers?: string;
  bulldogs?: string;
  rvs?: string;
  whaleSharkPups?: string;
  blueWhaleCalf?: string;
  weightComparisonText?: string;
}

export enum SlideNames {
  WELCOME = 0,
  LOADING = 1,
  DONOR_SUMMARY = 2,
  DONOR_INTRO = 3,        // Introduction slide
  STUDENTS = 4,           // Creative instruction hours impact (was MEALS)
  TEACHING_ARTISTS = 5,   // Teaching artists support (was PEOPLE)
  TIME_GIVING = 6,        // History of giving
  PROGRAMS = 7,           // Program areas breakdown (was FOOD_RESCUE_COMPARISON)
  MURALS = 8,             // Community murals (was FOOD_RESCUE)
  SEL_IMPACT = 9,         // Social-emotional learning impact (was ENVIRONMENT)
  FINANCIAL = 10,         // Financial impact
  SCHOOL_PARTNERSHIPS = 11, // School partnerships (was VOLUNTEER)
  SUMMARY = 12            // Summary slide
}
