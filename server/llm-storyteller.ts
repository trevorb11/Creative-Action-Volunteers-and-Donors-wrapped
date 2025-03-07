import { DonationImpact } from "@shared/schema";

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

// This is a placeholder that simulates what we'd do with a real LLM API
// In a production environment, this would call an actual LLM API service
export async function generateCreativeComparisons(impact: DonationImpact): Promise<DonationImpact> {
  // Create a copy of the impact to enrich with creative comparisons
  const enrichedImpact = { ...impact };

  // Generate creative comparisons based on the food rescued amount
  if (impact.foodRescued > 0) {
    // Add the most appropriate weight comparison
    enrichedImpact.weightComparison = generateWeightComparison(impact.foodRescued);
    
    // Also populate individual comparison fields for potential use in components
    const lbs = impact.foodRescued;
    
    // Add all comparisons regardless of size for flexibility in UI
    enrichedImpact.houseCats = `${Math.round(lbs / 10)} large house cats`;
    enrichedImpact.goldenRetrievers = `${Math.round(lbs / 70)} Golden Retrievers`;
    enrichedImpact.babyElephants = `${Math.round(lbs / 200)} baby elephants`;
    enrichedImpact.grizzlyBears = `${Math.round(lbs / 700)} grizzly bears`;
    enrichedImpact.hippos = `${Math.round(lbs / 3000)} hippos`;
    enrichedImpact.cars = `${(lbs / 4000).toFixed(1)} cars`;
    enrichedImpact.schoolBuses = `${(lbs / 24000).toFixed(1)} school buses`;
    enrichedImpact.smallJets = `${(lbs / 90000).toFixed(2)} small jets`;
    
    // For backward compatibility with older comparisons code
    if (impact.foodRescued < 100) {
      enrichedImpact.bison = "nearly one bison";
    } else if (impact.foodRescued < 500) {
      enrichedImpact.bison = `${Math.round(impact.foodRescued / 100)} bison`;
    } else if (impact.foodRescued < 1000) {
      enrichedImpact.bison = `a group of ${Math.round(impact.foodRescued / 100)} bison roaming the plains`;
    } else {
      enrichedImpact.bison = `a majestic herd of ${Math.round(impact.foodRescued / 100)} bison`;
    }
  }

  // Generate creative descriptions for people fed
  if (impact.mealsProvided > 0) {
    const peopleServed = impact.peopleServed;
    
    if (peopleServed < 10) {
      enrichedImpact.peopleFed = `a family of ${peopleServed}`;
    } else if (peopleServed < 50) {
      enrichedImpact.peopleFed = `everyone at a small community gathering (${peopleServed} people)`;
    } else if (peopleServed < 200) {
      enrichedImpact.peopleFed = `an entire school classroom for a month (${peopleServed} students)`;
    } else {
      enrichedImpact.peopleFed = `everyone in a small concert venue (${peopleServed} people)`;
    }
    
    // Calculate days fed from meals
    const avgMealsPerDay = 3;
    const daysOfFood = Math.round(impact.mealsProvided / (peopleServed * avgMealsPerDay));
    
    if (daysOfFood < 1) {
      enrichedImpact.daysFed = "a nutritious meal";
    } else if (daysOfFood === 1) {
      enrichedImpact.daysFed = "a full day of meals";
    } else if (daysOfFood < 7) {
      enrichedImpact.daysFed = `${daysOfFood} days of meals`;
    } else if (daysOfFood < 30) {
      enrichedImpact.daysFed = `${Math.round(daysOfFood / 7)} weeks of meals`;
    } else {
      enrichedImpact.daysFed = `over a month of meals`;
    }
  }

  return enrichedImpact;
}

// In the future, this function would send the impact data to an LLM API
// and receive back unique creative comparisons for each slide
function callLlmApi(prompt: string): string {
  // This would be replaced with an actual API call
  console.log("LLM API call with prompt:", prompt);
  return "LLM generated response would go here";
}