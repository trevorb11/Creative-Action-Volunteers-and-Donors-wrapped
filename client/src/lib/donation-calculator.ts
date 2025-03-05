import { DonationImpact } from "@shared/schema";
import { ALMANAC_DATA } from "./constants";

export function calculateDonationImpact(amount: number): DonationImpact {
  const mealsProvided = Math.round(amount * ALMANAC_DATA.mealsPerDollar);
  const peopleServed = Math.round(amount * ALMANAC_DATA.mealsPerDollar * ALMANAC_DATA.peoplePerMeal);
  const peoplePercentage = ((amount * ALMANAC_DATA.mealsPerDollar * ALMANAC_DATA.peoplePerMeal / ALMANAC_DATA.totalPeopleServed) * 100).toFixed(2);
  const foodRescued = Math.round(amount * ALMANAC_DATA.foodRescuePerDollar);
  const co2Saved = Math.round(amount * ALMANAC_DATA.foodRescuePerDollar * ALMANAC_DATA.co2PerPoundFood);
  const waterSaved = Math.round(amount * ALMANAC_DATA.foodRescuePerDollar * ALMANAC_DATA.waterPerPoundFood);
  const babyElephants = (amount * ALMANAC_DATA.foodRescuePerDollar / 200).toFixed(1); // Baby elephant ~200 lbs
  const bison = (amount * ALMANAC_DATA.foodRescuePerDollar / 2000).toFixed(1); // Bison ~2000 lbs
  const cars = (amount * ALMANAC_DATA.foodRescuePerDollar / 4000).toFixed(1); // Car ~4000 lbs
  const peopleFed = mealsProvided < 12 ? 'a person' : 'a family of 4';
  const daysFed = getDaysFed(mealsProvided);

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
    daysFed
  };
}

function getDaysFed(meals: number): string {
  if (meals < 12) return 'a day';
  if (meals < 84) return Math.floor(meals / 12) + ' days';
  return Math.floor(meals / 84) + ' weeks';
}
