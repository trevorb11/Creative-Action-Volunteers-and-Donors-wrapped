import { DonationImpact } from "@/types/donation";
import { CREATIVE_ACTION_DATA } from "./constants";

// Generate creative impact description based on donation amount
function generateImpactDescription(amount: number): string {
  if (amount < 25) {
    return "Your donation provides vital art supplies for creative expression.";
  } else if (amount < 50) {
    return "You're helping students explore their creative talents and build confidence!";
  } else if (amount < 100) {
    return "Your gift supports teaching artists who inspire the next generation.";
  } else if (amount < 250) {
    return "You're making social-emotional learning through arts possible for so many students!";
  } else if (amount < 500) {
    return "Your generosity helps create safe spaces for youth to express themselves.";
  } else if (amount < 1000) {
    return "You're helping transform communities through collaborative art projects!";
  } else {
    return "Your extraordinary gift is helping create lasting change through arts education!";
  }
}

// Generate classroom size comparison based on students reached
function generateClassroomComparison(students: number): string {
  if (students < 10) {
    return `a small group workshop (${students} students)`;
  } else if (students < 25) {
    return `a typical classroom (${students} students)`;
  } else if (students < 60) {
    return `${Math.round(students / 25)} typical classrooms (${students} students)`;
  } else if (students < 150) {
    return `a small school assembly (${students} students)`;
  } else if (students < 500) {
    return `a large school assembly (${students} students)`;
  } else if (students < 1000) {
    return `an entire small school (${students} students)`;
  } else {
    return `multiple school communities (${students} students)`;
  }
}

export function calculateDonationImpact(amount: number): DonationImpact {
  // Calculate impact metrics based on Creative Action's program costs
  const instructionHours = Math.round(amount / CREATIVE_ACTION_DATA.costPerCreativeInstructionHour);
  const muralsSupported = Math.max(1, Math.round(amount / CREATIVE_ACTION_DATA.costPerMuralSupplies));
  const teachingArtistHours = Math.round(amount / CREATIVE_ACTION_DATA.costPerTeachingArtistHour);
  const selStudents = Math.round(amount / CREATIVE_ACTION_DATA.costPerSELModule);
  const theaterStudents = Math.round(amount / CREATIVE_ACTION_DATA.costPerTheaterWorkshop);
  const braveSchoolsLessons = Math.round(amount / CREATIVE_ACTION_DATA.costPerBraveSchoolsLesson);
  
  // Calculate students reached using the instruction hours metric
  const studentsReached = Math.round(instructionHours * CREATIVE_ACTION_DATA.studentsPerInstructionHour);
  
  // Calculate percentage of total students served annually
  const studentPercentage = ((studentsReached / CREATIVE_ACTION_DATA.studentsPerYear) * 100).toFixed(2) + '%';
  
  // Generate text descriptions
  const impactDescription = generateImpactDescription(amount);
  const classroomComparison = generateClassroomComparison(studentsReached);
  
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
