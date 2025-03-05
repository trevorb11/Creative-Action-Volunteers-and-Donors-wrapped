export const ALMANAC_DATA = {
  mealsPerDollar: 0.833, // Based on 10.95M meals distributed at $25.88M value (~$2.36 per meal)
  peoplePerMeal: 0.328, // Based on serving 60,000 people with 11M meals annually
  foodRescuePerDollar: 0.421, // Pounds of food rescued per dollar (estimate)
  co2PerPoundFood: 0.84, // CO2 emissions prevented per pound of food
  waterPerPoundFood: 45.2, // Gallons of water saved per pound of food
  foodDistribution: {
    produce: 31.92, // Percentage
    dairy: 21.67,   // Percentage
    protein: 18.33  // Percentage
  },
  totalMealsProvided: 10951888, // 10.95 million meals provided in FY 2024
  totalPeopleServed: 60000, // 60,000 people served through partner agencies
};

export const SLIDE_CONFIG = {
  autoAdvanceDuration: 5000, // Time in ms before auto-advancing to next slide
  progressDuration: 3000, // Time in ms for loading progress bar animation
  counterDuration: 2000, // Time in ms for counter animations
};

export const SLIDE_COLORS = {
  welcome: "bg-white",
  loading: "bg-primary", 
  meals: "bg-[#3F51B5]", // Secondary color
  nutrition: "bg-[#FF9800]", // Accent color
  people: "bg-[#2AB674]", // Primary color
  environment: "bg-[#43A047]",
  foodRescue: "bg-[#5E35B1]",
  volunteer: "bg-[#1976D2]",
  partner: "bg-[#D32F2F]",
  summary: "bg-[#2AB674]", // Primary color
};
