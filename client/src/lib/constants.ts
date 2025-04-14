export const CREATIVE_ACTION_DATA = {
  // Cost-to-impact metrics based on Creative Action's programs
  costPerCreativeInstructionHour: 10, // $10 per hour of creative instruction per student
  costPerMuralSupplies: 250, // $250 per student-led mural supplies
  costPerTeachingArtistHour: 50, // $50 per hour of instruction pay
  costPerSELModule: 25, // $25 per student for social-emotional learning module
  costPerTheaterWorkshop: 30, // $30 per student participation in workshop session
  costPerBraveSchoolsLesson: 100, // $100 per Brave Schools class lesson
  
  // Program distribution
  programAreas: {
    afterSchool: 35, // Percentage allocation
    communityMural: 15,
    teachingArtist: 20,
    selEnrichment: 10,
    youthTheater: 10,
    schoolPartnership: 10
  },
  
  // Impact metrics
  studentsPerInstructionHour: 5, // Each hour of instruction reaches about 5 students
  studentsPerYear: 15000, // Approximate number of students served annually
  teachingArtistsSupported: 45, // Number of teaching artists employed
  schoolsServed: 65, // Number of schools in partnership
  communityMuralsPerYear: 12, // Average number of community murals completed annually
};

export const SLIDE_CONFIG = {
  autoAdvanceDuration: 5000, // Time in ms before auto-advancing to next slide
  progressDuration: 3000, // Time in ms for loading progress bar animation
  counterDuration: 2000, // Time in ms for counter animations
};

export const SLIDE_COLORS = {
  // Creative Action slide colors using the new color scheme
  welcome: "bg-white",
  loading: "bg-[#6A1B9A]", // Purple
  donor: "bg-[#42A5F5]", // Blue
  donorSummary: "bg-[#66BB6A]", // Green
  
  // New slides for Creative Action
  students: "bg-[#42A5F5]", // Blue
  teachingArtists: "bg-[#6A1B9A]", // Purple
  timeGiving: "bg-[#FF8A65]", // Orange
  programs: "bg-[#66BB6A]", // Green
  murals: "bg-[#FFCA28]", // Yellow
  selImpact: "bg-[#EC407A]", // Pink
  financial: "bg-[#42A5F5]", // Blue
  schoolPartnerships: "bg-[#6A1B9A]", // Purple
  summary: "bg-[#66BB6A]", // Green
  
  // Legacy colors kept for compatibility
  meals: "bg-[#42A5F5]", // Blue (was teal)
  nutrition: "bg-[#66BB6A]", // Green (was bright green)
  people: "bg-[#6A1B9A]", // Purple (was dark green)
  environment: "bg-[#EC407A]", // Pink (was teal)
  foodRescue: "bg-[#FFCA28]", // Yellow (was bright green)
  volunteer: "bg-[#6A1B9A]", // Purple (was dark green)
  partner: "bg-[#42A5F5]", // Blue (was teal)
};
