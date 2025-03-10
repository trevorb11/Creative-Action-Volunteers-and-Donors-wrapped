export const ALMANAC_DATA = {
  mealsPerDollar: 1.52, // Updated: 1.52 meals per $1 (3-year rolling average with SNAP)
  costPerMeal: 0.66, // Updated: $0.66 per meal based on 3-year rolling average
  foodRescuePerDollar: 1.83, // Updated: 1.83 pounds per $1 for donation conversions
  poundsPerMeal: 1.2, // Updated: 1.2 pounds = 1 meal
  peoplePerMeal: 0.328, // Based on serving 60,000 people with 11M meals annually
  co2PerPoundFood: 8.65, // CO₂e emissions prevented per pound of food rescued
  waterPerPoundFood: 45.2, // Gallons of water saved per pound of food
  foodDistribution: {
    produce: 31.92, // Percentage
    dairy: 21.67,   // Percentage
    protein: 18.33  // Percentage
  },
  totalMealsProvided: 10951888, // 10.95 million meals provided in FY 2024
  totalPeopleServed: 60000, // 60,000 people served through partner agencies
  dailyFoodRescue: 22000, // 11 tons (22,000 pounds) of food rescued daily
};

export const SLIDE_CONFIG = {
  autoAdvanceDuration: 5000, // Time in ms before auto-advancing to next slide
  progressDuration: 3000, // Time in ms for loading progress bar animation
  counterDuration: 2000, // Time in ms for counter animations
};

export const SLIDE_COLORS = {
  welcome: "bg-white",
  loading: "bg-cfs-darkGreen", 
  donor: "bg-cfs-teal", // Donor summary slide
  donorSummary: "bg-cfs-brightGreen", // For backward compatibility
  meals: "bg-cfs-teal", // Main brand color - teal
  nutrition: "bg-cfs-brightGreen", // Bright green
  people: "bg-cfs-darkGreen", // Dark green
  environment: "bg-cfs-teal",
  foodRescue: "bg-cfs-brightGreen",
  volunteer: "bg-cfs-darkGreen",
  partner: "bg-cfs-teal",
  summary: "bg-cfs-darkGreen", // Dark green
};
