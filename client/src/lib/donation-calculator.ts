import { DonationImpact } from "@/types/donation";
import { ALMANAC_DATA } from "./constants";

// Function for selecting the most appropriate weight comparison based on pounds of food
function generateWeightComparison(lbs: number): string {
  // Weighted tiers based on provided ranges
  if (lbs < 1) {
    return `about ${Math.max(1, Math.round(lbs / 1))} loaves of bread`;
  } else if (lbs < 5) {
    return `the weight of ${Math.max(1, Math.round(lbs / 3))} pineapples`;
  } else if (lbs < 20) {
    return `the weight of ${Math.max(1, Math.round(lbs / 10))} large house cats`;
  } else if (lbs < 50) {
    return `the weight of ${Math.max(1, Math.round(lbs / 30))} toddlers`;
  } else if (lbs < 100) {
    return `the weight of ${Math.max(1, Math.round(lbs / 50))} bulldogs`;
  } else if (lbs < 400) {
    return `the weight of ${Math.max(1, Math.round(lbs / 70))} Golden Retrievers`;
  } else if (lbs < 700) {
    return `the weight of ${Math.max(1, Math.round(lbs / 200))} baby elephants`;
  } else if (lbs < 3000) {
    return `the weight of ${Math.max(1, Math.round(lbs / 700))} grizzly bears`;
  } else if (lbs < 10000) {
    return `the weight of ${Math.max(1, Math.round(lbs / 3000))} hippos`;
  } else if (lbs < 24000) {
    return `the weight of ${(lbs / 10000).toFixed(1)} RVs`;
  } else if (lbs < 45000) {
    return `the weight of ${(lbs / 24000).toFixed(1)} school buses`;
  } else if (lbs < 60000) {
    return `the weight of ${(lbs / 45000).toFixed(2)} juvenile whale sharks`;
  } else {
    return `the weight of ${(lbs / 60000).toFixed(2)} blue whale calves`;
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
  
  // Original comparison fields
  const houseCats = `${Math.max(1, Math.round(lbs / 10))} large house cats`;
  const goldenRetrievers = `${Math.max(1, Math.round(lbs / 70))} Golden Retrievers`;
  const grizzlyBears = `${Math.max(1, Math.round(lbs / 700))} grizzly bears`;
  const hippos = `${Math.max(1, Math.round(lbs / 3000))} hippos`;
  const hippopotamus = `${Math.max(1, Math.round(lbs / 3000))} Hippopotamus`;
  const schoolBuses = `${(lbs / 24000).toFixed(1)} school buses`;
  const smallJets = `${(lbs / 90000).toFixed(2)} small jets`;
  
  // Additional comparison fields based on new ranges
  const breadLoaves = `${Math.max(1, Math.round(lbs / 1))} loaves of bread`;
  const pineapples = `${Math.max(1, Math.round(lbs / 3))} pineapples`;
  const toddlers = `${Math.max(1, Math.round(lbs / 30))} toddlers`;
  const bulldogs = `${Math.max(1, Math.round(lbs / 50))} bulldogs`;
  const rvs = `${(lbs / 10000).toFixed(1)} RVs`;
  const whaleSharkPups = `${(lbs / 45000).toFixed(2)} juvenile whale sharks`;
  const blueWhaleCalf = `${(lbs / 60000).toFixed(2)} blue whale calves`;
  
  // Fun text descriptions based on the weight range
  let weightComparisonText = "";
  if (lbs < 1) {
    weightComparisonText = "That's the perfect size for a sandwich!";
  } else if (lbs < 5) {
    weightComparisonText = "Sweet and tropical - just like the impact of your donation!";
  } else if (lbs < 20) {
    weightComparisonText = "Purr-fect amount of food rescued thanks to you!";
  } else if (lbs < 50) {
    weightComparisonText = "That's a lot of rescued food - and no toddler tantrums involved!";
  } else if (lbs < 100) {
    weightComparisonText = "Bulldogs may look tough, but your generosity is stronger!";
  } else if (lbs < 400) {
    weightComparisonText = "Golden impact for our community - retriever-ing food that would be wasted!";
  } else if (lbs < 700) {
    weightComparisonText = "Your donation is huge - elephant-sized impact!";
  } else if (lbs < 3000) {
    weightComparisonText = "Now that's a grizzly good amount of food rescued!";
  } else if (lbs < 10000) {
    weightComparisonText = "Hippo-sized generosity makes a massive splash!";
  } else if (lbs < 24000) {
    weightComparisonText = "You could take this much food on a cross-country RV trip!";
  } else if (lbs < 45000) {
    weightComparisonText = "You've rescued a school bus worth of food. Class act!";
  } else if (lbs < 60000) {
    weightComparisonText = "Swimming in generosity - whale shark sized impact!";
  } else {
    weightComparisonText = "The largest animals on earth have nothing on your generosity!";
  }

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
    // Original weight comparison fields
    weightComparison,
    houseCats,
    goldenRetrievers,
    grizzlyBears,
    hippos,
    hippopotamus,
    schoolBuses,
    smallJets,
    // Additional weight comparison fields
    breadLoaves,
    pineapples,
    toddlers,
    bulldogs,
    rvs,
    whaleSharkPups,
    blueWhaleCalf,
    // Text description
    weightComparisonText
  };
}

function getDaysFed(meals: number): string {
  if (meals < 12) return 'a day';
  if (meals < 84) return Math.floor(meals / 12) + ' days';
  return Math.floor(meals / 84) + ' weeks';
}
