import { DonationImpact } from "@/types/donation";
import { ALMANAC_DATA } from "./constants";

// Function for selecting the most appropriate weight comparison based on pounds of food
function generateWeightComparison(lbs: number): string {
  // Weighted tiers
  if (lbs < 20) {
    return `${Math.round(lbs / 10)} large house cats (~10 lbs each)`;
  } else if (lbs < 200) {
    return `${Math.round(lbs / 70)} Golden Retrievers (~70 lbs each)`;
  } else if (lbs < 1000) {
    return `${Math.round(lbs / 200)} baby elephants (~200 lbs each)`;
  } else if (lbs < 3000) {
    return `${Math.round(lbs / 700)} grizzly bears (~700 lbs each)`;
  } else if (lbs < 5000) {
    return `${Math.round(lbs / 3000)} hippos (~3,000 lbs each)`;
  } else if (lbs < 10000) {
    return `${(lbs / 4000).toFixed(1)} cars (~4,000 lbs each)`;
  } else if (lbs < 30000) {
    return `${(lbs / 24000).toFixed(1)} school buses (~24,000 lbs each)`;
  } else {
    return `${(lbs / 90000).toFixed(2)} small jets (~90,000 lbs each)`;
  }
}

export function calculateDonationImpact(amount: number): DonationImpact {
  // Updated values based on the Almanac 2023-24 data
  const mealsProvided = Math.round(amount * ALMANAC_DATA.mealsPerDollar);
  const peopleServed = Math.round(amount * ALMANAC_DATA.mealsPerDollar * ALMANAC_DATA.peoplePerMeal);
  const peoplePercentage = ((amount * ALMANAC_DATA.mealsPerDollar * ALMANAC_DATA.peoplePerMeal / ALMANAC_DATA.totalPeopleServed) * 100).toFixed(2) + '%';
  const foodRescued = Math.round(amount * ALMANAC_DATA.foodRescuePerDollar);
  const co2Saved = Math.round(amount * ALMANAC_DATA.foodRescuePerDollar * ALMANAC_DATA.co2PerPoundFood);
  const waterSaved = Math.round(amount * ALMANAC_DATA.foodRescuePerDollar * ALMANAC_DATA.waterPerPoundFood);
  const babyElephants = (amount * ALMANAC_DATA.foodRescuePerDollar / 200).toFixed(1); // Baby elephant ~200 lbs
  const bison = (amount * ALMANAC_DATA.foodRescuePerDollar / 2000).toFixed(1); // Bison ~2000 lbs
  const cars = (amount * ALMANAC_DATA.foodRescuePerDollar / 4000).toFixed(1); // Car ~4000 lbs
  const peopleFed = mealsProvided < 12 ? 'a person' : 'a family of 4';
  const daysFed = getDaysFed(mealsProvided);

  // Add new weight comparisons
  const lbs = foodRescued;
  const weightComparison = generateWeightComparison(lbs);
  const houseCats = `${Math.round(lbs / 10)} large house cats`;
  const goldenRetrievers = `${Math.round(lbs / 70)} Golden Retrievers`;
  const grizzlyBears = `${Math.round(lbs / 700)} grizzly bears`;
  const hippos = `${Math.round(lbs / 3000)} hippos`;
  const schoolBuses = `${(lbs / 24000).toFixed(1)} school buses`;
  const smallJets = `${(lbs / 90000).toFixed(2)} small jets`;

  return {
    mealsProvided,
    peopleServed,
    peoplePercentage,
    foodRescued,
    co2Saved,
    waterSaved,
    producePercentage: ALMANAC_DATA.foodDistribution.produce,
    dairyPercentage: ALMANAC_DATA.foodDistribution.dairy,
    proteinPercentage: ALMANAC_DATA.foodDistribution.protein,
    freshFoodPercentage: ALMANAC_DATA.foodDistribution.produce + ALMANAC_DATA.foodDistribution.dairy + ALMANAC_DATA.foodDistribution.protein,
    babyElephants,
    bison,
    cars,
    peopleFed,
    daysFed,
    // New weight comparison fields
    weightComparison,
    houseCats,
    goldenRetrievers,
    grizzlyBears,
    hippos,
    schoolBuses,
    smallJets
  };
}

function getDaysFed(meals: number): string {
  if (meals < 12) return 'a day';
  if (meals < 84) return Math.floor(meals / 12) + ' days';
  return Math.floor(meals / 84) + ' weeks';
}
