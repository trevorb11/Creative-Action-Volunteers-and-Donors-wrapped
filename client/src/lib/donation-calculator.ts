import { DonationImpact } from "@/types/donation";
import { CREATIVE_ACTION_DATA } from "./constants";

// Generate creative impact description based on donation amount
function generateImpactDescription(amount: number): string {
  if (amount < 50) {
    return "Your donation provides vital art supplies and creative materials.";
  } else if (amount < CREATIVE_ACTION_DATA.dayCampCost) {
    return "You're helping a student get one step closer to camp this year.";
  } else if (amount < CREATIVE_ACTION_DATA.averageStudentCost) {
    return "You just sent a student to a full day of Creative Action camp!";
  } else if (amount < CREATIVE_ACTION_DATA.afterSchoolMonthlyCost) {
    return "You're covering a student's core creative learning experience for the year.";
  } else if (amount < CREATIVE_ACTION_DATA.residencyCost) {
    return "You're funding a full month of after-school programming for a student.";
  } else if (amount < CREATIVE_ACTION_DATA.residencyCost * 2) {
    return "You just underwrote a year-long arts residency for a student at Campbell.";
  } else {
    return "Your extraordinary gift funds multiple year-long residencies for emerging creatives!";
  }
}

// Generate summary text for student experiences
function generateStudentExperienceSummary(students: number): string {
  if (students >= 10) {
    return `${Math.round(students).toLocaleString()} students' creative journeys`;
  }

  if (students >= 1) {
    return `${students.toFixed(1)} students' creative journeys`;
  }

  const percentage = Math.max(1, Math.round(students * 100));
  return `${percentage}% of a student's creative journey`;
}

export function calculateDonationImpact(amount: number): DonationImpact {
  // Calculate impact metrics based on Creative Action's program costs
  const instructionHours = Math.round(amount / CREATIVE_ACTION_DATA.costPerCreativeInstructionHour);
  const muralsSupported = Math.max(1, Math.round(amount / CREATIVE_ACTION_DATA.costPerMuralSupplies));
  const teachingArtistHours = Math.round(amount / CREATIVE_ACTION_DATA.costPerTeachingArtistHour);
  const selStudents = Math.round(amount / CREATIVE_ACTION_DATA.costPerSELModule);
  const theaterStudents = Math.round(amount / CREATIVE_ACTION_DATA.costPerTheaterWorkshop);
  const braveSchoolsLessons = Math.round(amount / CREATIVE_ACTION_DATA.costPerBraveSchoolsLesson);
  
  // Core conversions for the wrapped experience
  const studentsSupportedRaw = amount / CREATIVE_ACTION_DATA.averageStudentCost;
  const studentsSupported = Number(studentsSupportedRaw.toFixed(2));
  const studentsFullyFunded = Math.floor(studentsSupportedRaw);
  const partialStudentPercentage = studentsSupportedRaw > studentsFullyFunded
    ? Math.round((studentsSupportedRaw - studentsFullyFunded) * 100)
    : 0;

  const dayCampExperiences = Number((amount / CREATIVE_ACTION_DATA.dayCampCost).toFixed(2));
  const afterSchoolMonthsFunded = Number((amount / CREATIVE_ACTION_DATA.afterSchoolMonthlyCost).toFixed(2));
  const residencyStudentsFunded = Number((amount / CREATIVE_ACTION_DATA.residencyCost).toFixed(2));

  // Calculate students reached based on the new average cost metric
  const studentsReached = Number(studentsSupported.toFixed(2));

  // Calculate percentage of total students served annually
  const studentPercentage = ((studentsReached / CREATIVE_ACTION_DATA.studentsPerYear) * 100).toFixed(3) + '%';

  // Generate text descriptions
  const impactDescription = generateImpactDescription(amount);
  const classroomComparison = generateStudentExperienceSummary(studentsSupportedRaw);

  // Map these metrics to the expected return type for now
  // Some properties are kept for backward compatibility
  return {
    // Creative Action specific metrics
    instructionHours,
    muralsSupported,
    teachingArtistHours,
    selStudents,
    theaterStudents,
    braveSchoolsLessons,
    studentsReached,
    studentPercentage,
    impactDescription,
    classroomComparison,
    programDistribution: CREATIVE_ACTION_DATA.programAreas,

    averageStudentCost: CREATIVE_ACTION_DATA.averageStudentCost,
    studentsSupported,
    studentsFullyFunded,
    partialStudentPercentage,
    dayCampExperiences,
    afterSchoolMonthsFunded,
    residencyStudentsFunded,
    
    // Required fields for backward compatibility
    mealsProvided: instructionHours, // Repurposing meals as instruction hours
    peopleServed: studentsReached,
    peoplePercentage: studentPercentage,
    foodRescued: amount, // For simplicity in transition
    co2Saved: amount,
    waterSaved: amount,
    producePercentage: CREATIVE_ACTION_DATA.programAreas.afterSchool,
    dairyPercentage: CREATIVE_ACTION_DATA.programAreas.communityMural,
    proteinPercentage: CREATIVE_ACTION_DATA.programAreas.teachingArtist,
    freshFoodPercentage: CREATIVE_ACTION_DATA.programAreas.afterSchool + 
                         CREATIVE_ACTION_DATA.programAreas.communityMural + 
                         CREATIVE_ACTION_DATA.programAreas.teachingArtist,
    peopleFed: classroomComparison,
    daysFed: "creative experiences",
    weightComparison: impactDescription,
    weightComparisonText: impactDescription,
    
    // These will be unused but needed for type compatibility
    babyElephants: "1",
    bison: "1",
    cars: "1",
    houseCats: "1",
    goldenRetrievers: "1",
    grizzlyBears: "1",
    hippos: "1",
    hippopotamus: "1",
    schoolBuses: "1",
    smallJets: "1",
    breadLoaves: "1",
    pineapples: "1",
    toddlers: "1",
    bulldogs: "1",
    rvs: "1",
    whaleSharkPups: "1",
    blueWhaleCalf: "1"
  };
}
