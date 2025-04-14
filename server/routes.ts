import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { almanacData, volunteerParamsSchema, insertVolunteerSchema, insertVolunteerShiftSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export function calculateVolunteerImpact(hours: number) {
  return {
    hoursWorked: hours,
    // Using updated value of 55 meals per volunteer hour
    mealsProvided: Math.round(hours * almanacData.mealsPerVolunteerHour),
    // Using updated value of $36.30 per volunteer hour (55 meals * $0.66/meal)
    costSavings: parseFloat((hours * almanacData.valuePerVolunteerHour).toFixed(2)),
    // Assuming 3 meals per person per day
    peopleServedPerDay: Math.round((hours * almanacData.mealsPerVolunteerHour) / almanacData.mealsPerDay)
  };
}

// Function to calculate donation impact based on Creative Action's metrics
export function calculateDonationImpact(amount: number) {
  // Define impact equivalencies based on Creative Action's program costs
  const costPerCreativeInstructionHour = 10; // $10 per hour of creative instruction per student
  const costPerMuralSupplies = 250; // $250 per student-led mural supplies
  const costPerTeachingArtistHour = 50; // $50 per hour of instruction pay
  const costPerSELModule = 25; // $25 per student for social-emotional learning module
  const costPerTheaterWorkshop = 30; // $30 per student participation in workshop session
  const costPerBraveSchoolsLesson = 100; // $100 per Brave Schools class lesson
  const studentsPerInstructionHour = 5; // Each hour of instruction reaches about 5 students
  const studentsPerYear = 15000; // Approximate number of students served annually
  
  // Calculate impact metrics
  const instructionHours = Math.round(amount / costPerCreativeInstructionHour);
  const muralsSupported = Math.max(1, Math.round(amount / costPerMuralSupplies));
  const teachingArtistHours = Math.round(amount / costPerTeachingArtistHour);
  const selStudents = Math.round(amount / costPerSELModule);
  const theaterStudents = Math.round(amount / costPerTheaterWorkshop);
  const braveSchoolsLessons = Math.round(amount / costPerBraveSchoolsLesson);
  
  // Calculate students reached using the instruction hours metric
  const studentsReached = Math.round(instructionHours * studentsPerInstructionHour);
  
  // Calculate percentage of total students served annually
  const studentPercentage = ((studentsReached / studentsPerYear) * 100).toFixed(2) + '%';
  
  // Generate classroom size comparison
  let classroomComparison = "";
  if (studentsReached < 10) {
    classroomComparison = `a small group workshop (${studentsReached} students)`;
  } else if (studentsReached < 25) {
    classroomComparison = `a typical classroom (${studentsReached} students)`;
  } else if (studentsReached < 60) {
    classroomComparison = `${Math.round(studentsReached / 25)} typical classrooms (${studentsReached} students)`;
  } else if (studentsReached < 150) {
    classroomComparison = `a small school assembly (${studentsReached} students)`;
  } else if (studentsReached < 500) {
    classroomComparison = `a large school assembly (${studentsReached} students)`;
  } else if (studentsReached < 1000) {
    classroomComparison = `an entire small school (${studentsReached} students)`;
  } else {
    classroomComparison = `multiple school communities (${studentsReached} students)`;
  }
  
  // Generate impact description
  let impactDescription = "";
  if (amount < 25) {
    impactDescription = "Your donation provides vital art supplies for creative expression.";
  } else if (amount < 50) {
    impactDescription = "You're helping students explore their creative talents and build confidence!";
  } else if (amount < 100) {
    impactDescription = "Your gift supports teaching artists who inspire the next generation.";
  } else if (amount < 250) {
    impactDescription = "You're making social-emotional learning through arts possible for so many students!";
  } else if (amount < 500) {
    impactDescription = "Your generosity helps create safe spaces for youth to express themselves.";
  } else if (amount < 1000) {
    impactDescription = "You're helping transform communities through collaborative art projects!";
  } else {
    impactDescription = "Your extraordinary gift is helping create lasting change through arts education!";
  }
  
  // Program distribution data
  const programDistribution = {
    afterSchool: 35, // Percentage allocation
    communityMural: 15,
    teachingArtist: 20,
    selEnrichment: 10,
    youthTheater: 10,
    schoolPartnership: 10
  };
  
  // Map Creative Action metrics to the expected return type
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
    programDistribution,
    
    // Required fields for backward compatibility
    mealsProvided: instructionHours, // Repurposing meals as instruction hours
    peopleServed: studentsReached,
    peoplePercentage: studentPercentage,
    foodRescued: amount, // For simplicity in transition
    co2Saved: amount,
    waterSaved: amount,
    producePercentage: programDistribution.afterSchool,
    dairyPercentage: programDistribution.communityMural,
    proteinPercentage: programDistribution.teachingArtist,
    freshFoodPercentage: programDistribution.afterSchool + 
                       programDistribution.communityMural + 
                       programDistribution.teachingArtist,
    peopleFed: classroomComparison,
    daysFed: "creative experiences",
    weightComparison: impactDescription,
    weightComparisonText: impactDescription,
    
    // These fields are included for backward compatibility
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

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to calculate donation impact - POST method
  app.post('/api/calculate-impact', async (req, res) => {
    try {
      const schema = z.object({
        amount: z.number().min(1)
      });

      const { amount } = schema.parse(req.body);
      
      // Calculate Creative Action donation impact metrics
      const impact = calculateDonationImpact(amount);
      
      res.json({ impact });
    } catch (error) {
      console.error("Error calculating donation impact:", error);
      res.status(400).json({ error: 'Invalid donation amount' });
    }
  });

  // API endpoint to calculate volunteer impact based on hours - GET method
  app.get('/api/calculate-volunteer-impact', async (req, res) => {
    try {
      const schema = z.object({
        hours: z.string().or(z.number()).transform(val => {
          const num = typeof val === 'string' ? parseFloat(val) : val;
          if (isNaN(num) || num < 0.1) throw new Error('Hours must be a positive number');
          return num;
        })
      });

      const { hours } = schema.parse(req.query);
      
      // Calculate volunteer impact metrics
      const impact = calculateVolunteerImpact(hours);
      
      res.json(impact);
    } catch (error) {
      console.error("Error calculating volunteer impact:", error);
      res.status(400).json({ error: 'Invalid volunteer hours' });
    }
  });

  // API endpoint to calculate volunteer impact based on hours - POST method
  app.post('/api/calculate-volunteer-impact', async (req, res) => {
    try {
      const schema = z.object({
        hours: z.number().min(0.1)
      });

      const { hours } = schema.parse(req.body);
      
      // Calculate volunteer impact metrics
      const impact = calculateVolunteerImpact(hours);
      
      res.json(impact);
    } catch (error) {
      res.status(400).json({ error: 'Invalid volunteer hours' });
    }
  });

  // API endpoint to record a volunteer shift
  app.post('/api/log-volunteer-shift', async (req, res) => {
    try {
      // Schema for the request body with more flexible hours handling
      const requestSchema = z.object({
        email: z.string().email(),
        hours: z.number().or(z.string().transform(val => {
          const num = parseFloat(val);
          if (isNaN(num) || num <= 0) throw new Error('Hours must be a positive number');
          return num;
        }))
      });
      
      // Parse and validate the request
      const { email, hours } = requestSchema.parse(req.body);
      
      // Convert hours to string for database storage
      const hoursNumeric = typeof hours === 'number' ? hours.toString() : hours;
      
      // Check if this volunteer already exists
      const existingVolunteer = await storage.getVolunteerByEmail(email);
      let volunteerId: number | undefined;
      
      if (!existingVolunteer) {
        // Create a new volunteer with minimal information
        const newVolunteer = await storage.createVolunteer({
          email: email,
        });
        
        // Get the new volunteer's ID
        volunteerId = newVolunteer.id;
      } else {
        // Use the existing volunteer's ID
        volunteerId = existingVolunteer.id;
      }
      
      // Prepare the shift data
      const shiftData = {
        hours: hoursNumeric,
        email: email,
        volunteer_id: volunteerId,
        shift_date: new Date()
      };
      
      // Save the volunteer shift
      const savedShift = await storage.createVolunteerShift(shiftData);
      
      // Calculate impact for the response
      const impactHours = parseFloat(savedShift.hours.toString());
      const impact = calculateVolunteerImpact(impactHours);
      
      res.json({ 
        shift: savedShift,
        impact
      });
    } catch (error) {
      console.error("Error logging volunteer shift:", error);
      res.status(400).json({ error: 'Invalid volunteer shift data' });
    }
  });

  // API endpoint to get almanac data
  app.get('/api/almanac-data', (req, res) => {
    res.json({ data: almanacData });
  });
  
  // API endpoint to get volunteer information and impact by identifier (email)
  app.get('/api/volunteer/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      if (!identifier) {
        return res.status(400).json({ error: 'Identifier is required' });
      }
      
      // Add cache-control headers to prevent repeated fetches
      res.set('Cache-Control', 'private, max-age=60'); // Cache for 60 seconds on client
      
      // Decode the identifier (in case it's a URL-encoded email)
      const decodedIdentifier = decodeURIComponent(identifier);
      
      // Try to find the volunteer first
      const volunteer = await storage.getVolunteerByEmail(decodedIdentifier);
      
      if (volunteer) {
        // Get the volunteer's shifts
        const shifts = await storage.getVolunteerShifts(volunteer.id);
        
        if (shifts.length > 0) {
          // Calculate impact based on most recent shift
          const recentShift = shifts[0]; // Shifts are sorted by date desc
          const hours = parseFloat(recentShift.hours.toString());
          const impact = calculateVolunteerImpact(hours);
          
          return res.json({
            volunteer,
            shift: recentShift,
            shifts,
            impact,
            cached: true, // Flag to indicate this is a cacheable response
            timestamp: new Date().toISOString() // Add timestamp for debugging
          });
        }
        
        // Volunteer exists but no shifts found
        return res.json({ 
          volunteer,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // If volunteer not found, fallback to looking for just a shift by email
      const shift = await storage.getVolunteerShiftByEmail(decodedIdentifier);
      
      if (!shift) {
        return res.status(404).json({ 
          error: 'Volunteer not found',
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
      
      // Calculate the impact
      const hours = parseFloat(shift.hours.toString());
      const impact = calculateVolunteerImpact(hours);
      
      res.json({ 
        shift, 
        impact,
        cached: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching volunteer:", error);
      res.status(500).json({ 
        error: 'Failed to fetch volunteer information',
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // API endpoint to create or update a volunteer
  app.post('/api/volunteers', async (req, res) => {
    try {
      const volunteerData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json({ volunteer });
    } catch (error) {
      console.error("Error creating volunteer:", error);
      res.status(400).json({ error: 'Invalid volunteer data' });
    }
  });
  
  // API endpoint for volunteer impact "wrapped" - with hours passed in URL
  app.get('/api/volunteer-impact', async (req, res) => {
    try {
      // Parse hours from URL query parameters
      const params = volunteerParamsSchema.parse(req.query);
      
      let hours = 0;
      
      // If hours are provided directly in the URL
      if (params.hours) {
        hours = typeof params.hours === 'string' ? parseFloat(params.hours) : params.hours;
      } 
      // If email is provided, look up latest shift
      else if (params.email) {
        const volunteer = await storage.getVolunteerByEmail(params.email);
        
        if (volunteer) {
          const latestShift = await storage.getLatestVolunteerShift(volunteer.id);
          
          if (latestShift) {
            hours = parseFloat(latestShift.hours.toString());
          }
        }
      }
      
      // Calculate impact
      const impact = calculateVolunteerImpact(hours);
      
      res.json({
        hours,
        impact,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error calculating volunteer impact:", error);
      res.status(400).json({ error: 'Invalid parameters' });
    }
  });

  // Create http server for the application
  const server = createServer(app);
  
  // Add a ping endpoint for keep-alive and health checks
  app.get('/ping', (_req, res) => {
    res.status(200).send('pong');
  });
  
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'An unexpected error occurred',
      error: process.env.NODE_ENV === 'production' ? {} : err
    });
  });

  return server;
}