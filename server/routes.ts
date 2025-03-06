import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonationSchema, insertDonorSchema, almanacData, importDonorSchema } from "@shared/schema";
import { z } from "zod";
import { generateCreativeComparisons } from "./llm-storyteller";
import multer from "multer";
import { parseExcelDonors } from "./excel-importer";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export function calculateImpact(amount: number) {
  return {
    mealsProvided: Math.round(amount * almanacData.mealsPerDollar),
    peopleServed: Math.round(amount * almanacData.mealsPerDollar * almanacData.peoplePerMeal),
    peoplePercentage: ((amount * almanacData.mealsPerDollar * almanacData.peoplePerMeal / almanacData.totalPeopleServed) * 100).toFixed(2),
    foodRescued: Math.round(amount * almanacData.foodRescuePerDollar),
    co2Saved: Math.round(amount * almanacData.foodRescuePerDollar * almanacData.co2PerPoundFood),
    waterSaved: Math.round(amount * almanacData.foodRescuePerDollar * almanacData.waterPerPoundFood),
    producePercentage: almanacData.foodDistribution.produce,
    dairyPercentage: almanacData.foodDistribution.dairy,
    proteinPercentage: almanacData.foodDistribution.protein,
    freshFoodPercentage: almanacData.foodDistribution.produce + almanacData.foodDistribution.dairy + almanacData.foodDistribution.protein,
    babyElephants: (amount * almanacData.foodRescuePerDollar / 200).toFixed(1), // Baby elephant ~200 lbs
    bison: (amount * almanacData.foodRescuePerDollar / 2000).toFixed(1), // Bison ~2000 lbs
    cars: (amount * almanacData.foodRescuePerDollar / 4000).toFixed(1), // Car ~4000 lbs
    peopleFed: amount * almanacData.mealsPerDollar < 12 ? 'a person' : 'a family of 4',
    daysFed: getDaysFed(amount * almanacData.mealsPerDollar)
  };
}

function getDaysFed(meals: number) {
  if (meals < 12) return 'a day';
  if (meals < 84) return Math.floor(meals / 12) + ' days';
  return Math.floor(meals / 84) + ' weeks';
}

interface SegmentationCriteria {
  donationMin?: number;
  donationMax?: number;
  donationFrequency?: string;
  dateRange?: string;
  includeNoEmail?: boolean;
}

interface SegmentResult {
  id: string;
  name: string;
  criteria: SegmentationCriteria;
  donorCount: number;
  donors: Array<{
    id: number;
    email: string;
    name?: string;
    totalDonations: number;
    lastDonation: Date;
  }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to calculate impact based on donation amount
  app.post('/api/calculate-impact', async (req, res) => {
    try {
      const schema = z.object({
        amount: z.number().min(1)
      });

      const { amount } = schema.parse(req.body);
      
      // Calculate basic impact metrics
      let impact = calculateImpact(amount);
      
      // Enhance with LLM-generated creative storytelling
      // In a production environment, this would call an actual LLM API
      impact = await generateCreativeComparisons(impact);
      
      res.json({ impact });
    } catch (error) {
      res.status(400).json({ error: 'Invalid donation amount' });
    }
  });

  // API endpoint to retrieve donor information by email is defined below

  // API endpoint to log a donation
  app.post('/api/log-donation', async (req, res) => {
    try {
      // Extend the schema to require email for donations
      const donationSchema = insertDonationSchema.extend({
        email: z.string().email().optional(),
      });
      
      const donationData = donationSchema.parse(req.body);
      
      // If an email is provided, try to create/update the donor record
      if (donationData.email) {
        // Check if this donor already exists
        const existingDonor = await storage.getDonorByEmail(donationData.email);
        
        if (!existingDonor) {
          // Create a new donor with minimal information
          const newDonor = await storage.createDonor({
            email: donationData.email,
          });
          
          // Link the donation to the donor
          donationData.donor_id = newDonor.id;
        } else {
          // Link the donation to the existing donor
          donationData.donor_id = existingDonor.id;
        }
      }
      
      // Save the donation
      const savedDonation = await storage.createDonation(donationData);
      
      // Calculate impact for the response
      const amount = parseFloat(savedDonation.amount.toString());
      const impact = calculateImpact(amount);
      
      res.json({ 
        donation: savedDonation,
        impact
      });
    } catch (error) {
      console.error("Error logging donation:", error);
      res.status(400).json({ error: 'Invalid donation data' });
    }
  });

  // API endpoint to get almanac data
  app.get('/api/almanac-data', (req, res) => {
    res.json({ data: almanacData });
  });
  
  // API endpoint to get donor information by identifier (email)
  app.get('/api/donor/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      if (!identifier) {
        return res.status(400).json({ error: 'Identifier is required' });
      }
      
      // Decode the identifier (in case it's a URL-encoded email)
      const decodedIdentifier = decodeURIComponent(identifier);
      
      // Try to find the donor first
      const donor = await storage.getDonorByEmail(decodedIdentifier);
      
      if (donor) {
        // Get the donor's donations
        const donations = await storage.getDonorDonations(donor.id);
        
        if (donations.length > 0) {
          // Calculate impact based on most recent donation
          const recentDonation = donations[0]; // Donations are sorted by timestamp desc
          const amount = parseFloat(recentDonation.amount.toString());
          const impact = await generateCreativeComparisons(calculateImpact(amount));
          
          return res.json({
            donor,
            donation: recentDonation,
            donations,
            impact
          });
        }
        
        // Donor exists but no donations found
        return res.json({ donor });
      }
      
      // If donor not found, fallback to looking for just a donation
      // First try to get by email directly
      let donation = await storage.getDonationByEmail(decodedIdentifier);
      
      // If no result, try the more general identifier lookup
      if (!donation) {
        donation = await storage.getDonationByIdentifier(decodedIdentifier);
      }
      
      if (!donation) {
        return res.status(404).json({ error: 'Donor not found' });
      }
      
      // Calculate the impact
      const amount = parseFloat(donation.amount.toString());
      const impact = await generateCreativeComparisons(calculateImpact(amount));
      
      res.json({ 
        donation, 
        impact 
      });
    } catch (error) {
      console.error("Error fetching donor:", error);
      res.status(500).json({ error: 'Failed to fetch donor information' });
    }
  });
  
  // API endpoint to create or update a donor
  app.post('/api/donors', async (req, res) => {
    try {
      const donorData = insertDonorSchema.parse(req.body);
      const donor = await storage.createDonor(donorData);
      res.json({ donor });
    } catch (error) {
      console.error("Error creating donor:", error);
      res.status(400).json({ error: 'Invalid donor data' });
    }
  });
  
  // API endpoint to get all donations
  app.get('/api/donations', async (req, res) => {
    try {
      const donations = await storage.getDonations();
      res.json({ donations });
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ error: 'Failed to fetch donations' });
    }
  });
  
  // API endpoint to bulk import donors with their donation history
  app.post('/api/import/donors', async (req, res) => {
    try {
      // Parse and validate the import data
      const importData = z.array(importDonorSchema).parse(req.body);
      
      const result = {
        total: importData.length,
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };
      
      // Process each donor
      for (const donorImport of importData) {
        try {
          // Create or update the donor
          const donor = await storage.createDonor({
            email: donorImport.email,
            first_name: donorImport.first_name,
            last_name: donorImport.last_name,
            phone: donorImport.phone,
            external_id: donorImport.external_id,
          });
          
          // Process the donor's donations if any
          if (donorImport.donations && donorImport.donations.length > 0) {
            for (const donationImport of donorImport.donations) {
              // Convert amount to numeric if it's a string
              const amount = typeof donationImport.amount === 'string' 
                ? parseFloat(donationImport.amount) 
                : donationImport.amount;
              
              // Convert timestamp to Date if it's a string
              const timestamp = typeof donationImport.timestamp === 'string'
                ? new Date(donationImport.timestamp)
                : donationImport.timestamp;
              
              // Create the donation linked to the donor
              await storage.createDonation({
                amount: amount.toString(),
                timestamp,
                email: donorImport.email,
                donor_id: donor.id,
                external_donation_id: donationImport.external_donation_id,
                imported: 1, // Mark as imported
              });
            }
          }
          
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import donor ${donorImport.email}: ${error}`);
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error importing donors:", error);
      res.status(400).json({ error: 'Invalid import data' });
    }
  });
  
  // In-memory storage for segments (in a real app, this would be in the database)
  const segmentsMap = new Map();

  // API endpoint for donor segmentation
  app.post('/api/segmentation', async (req, res) => {
    try {
      const criteriaSchema = z.object({
        donationMin: z.number().optional(),
        donationMax: z.number().optional(),
        donationFrequency: z.string().optional(),
        dateRange: z.string().optional(),
        includeNoEmail: z.boolean().optional(),
        name: z.string().optional(),
      });
      
      const criteria = criteriaSchema.parse(req.body);
      
      // Get all donations
      const donations = await storage.getDonations();
      
      // Map donations to donor IDs with amount and date
      const donorDonationsMap = new Map();
      
      donations.forEach(donation => {
        const donorId = donation.donor_id;
        if (!donorId) return; // Skip donations without donor
        
        const amount = parseFloat(donation.amount.toString());
        
        // Apply donation amount filters
        if (criteria.donationMin && amount < criteria.donationMin) return;
        if (criteria.donationMax && amount > criteria.donationMax) return;
        
        // Apply date range filters
        const donationDate = new Date(donation.timestamp);
        const now = new Date();
        
        if (criteria.dateRange === 'lastYear') {
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          if (donationDate < oneYearAgo) return;
        } else if (criteria.dateRange === 'lastQuarter') {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          if (donationDate < threeMonthsAgo) return;
        }
        
        // Add to map
        if (!donorDonationsMap.has(donorId)) {
          donorDonationsMap.set(donorId, {
            donations: [],
            totalAmount: 0
          });
        }
        
        const donorData = donorDonationsMap.get(donorId);
        donorData.donations.push({
          amount,
          date: donationDate
        });
        donorData.totalAmount += amount;
      });
      
      // Apply frequency filters
      if (criteria.donationFrequency === 'single') {
        Array.from(donorDonationsMap.entries()).forEach(([donorId, data]) => {
          if (data.donations.length > 1) {
            donorDonationsMap.delete(donorId);
          }
        });
      } else if (criteria.donationFrequency === 'multiple') {
        Array.from(donorDonationsMap.entries()).forEach(([donorId, data]) => {
          if (data.donations.length <= 1) {
            donorDonationsMap.delete(donorId);
          }
        });
      }
      
      // Get donor details for each matching donor
      const segmentDonors = [];
      const processedDonorIds = Array.from(donorDonationsMap.keys());
      
      for (const donorId of processedDonorIds) {
        const donor = await storage.getDonor(donorId);
        
        if (!donor) continue;
        
        // Skip donors without email if includeNoEmail is false
        if (!criteria.includeNoEmail && !donor.email) continue;
        
        const donorData = donorDonationsMap.get(donorId);
        const lastDonation = donorData.donations.sort((a: {date: Date}, b: {date: Date}) => b.date.getTime() - a.date.getTime())[0];
        
        segmentDonors.push({
          id: donor.id,
          email: donor.email,
          name: donor.first_name && donor.last_name 
            ? `${donor.first_name} ${donor.last_name}` 
            : donor.first_name || undefined,
          totalDonations: donorData.totalAmount,
          lastDonation: lastDonation.date
        });
      }
      
      // Create segment result
      const segmentResult: SegmentResult = {
        id: `segment-${Date.now()}`,
        name: criteria.name || `Segment ${new Date().toISOString().split('T')[0]}`,
        criteria,
        donorCount: segmentDonors.length,
        donors: segmentDonors
      };
      
      // Store the segment for later retrieval
      segmentsMap.set(segmentResult.id, segmentResult);
      
      res.json(segmentResult);
    } catch (error) {
      console.error("Error segmenting donors:", error);
      res.status(400).json({ error: 'Invalid segmentation criteria' });
    }
  });
  
  // API endpoint to retrieve a segment by ID
  app.get('/api/segmentation/:segmentId', async (req, res) => {
    try {
      const { segmentId } = req.params;
      
      // Retrieve the segment from the map
      const segment = segmentsMap.get(segmentId);
      
      if (!segment) {
        return res.status(404).json({ error: 'Segment not found' });
      }
      
      res.json(segment);
    } catch (error) {
      console.error("Error retrieving segment:", error);
      res.status(500).json({ error: 'Failed to retrieve segment' });
    }
  });
  
  // API endpoint to upload Excel file and import donors
  app.post('/api/import/excel', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Get the file buffer
      const buffer = req.file.buffer;
      
      // Parse the Excel file
      const importData = parseExcelDonors(buffer);
      
      if (importData.length === 0) {
        return res.status(400).json({ error: 'No valid donor data found in the file' });
      }
      
      const result = {
        total: importData.length,
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };
      
      // Process each donor
      for (const donorImport of importData) {
        try {
          // Create or update the donor
          const donor = await storage.createDonor({
            email: donorImport.email,
            first_name: donorImport.first_name,
            last_name: donorImport.last_name,
            phone: donorImport.phone,
            external_id: donorImport.external_id,
          });
          
          // Process the donor's donations if any
          if (donorImport.donations && donorImport.donations.length > 0) {
            for (const donationImport of donorImport.donations) {
              // Convert amount to numeric if it's a string
              const amount = typeof donationImport.amount === 'string' 
                ? parseFloat(donationImport.amount) 
                : donationImport.amount;
              
              // Convert timestamp to Date if it's a string
              const timestamp = typeof donationImport.timestamp === 'string'
                ? new Date(donationImport.timestamp)
                : donationImport.timestamp;
              
              // Create the donation linked to the donor
              await storage.createDonation({
                amount: amount.toString(),
                timestamp,
                email: donorImport.email,
                donor_id: donor.id,
                external_donation_id: donationImport.external_donation_id,
                imported: 1, // Mark as imported
              });
            }
          }
          
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import donor ${donorImport.email}: ${error}`);
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error importing Excel file:", error);
      res.status(500).json({ error: 'Failed to process Excel file' });
    }
  });
  
  // API endpoint to generate wrapped impact reports for a segment
  app.post('/api/segments/:segmentId/generate-wrapped', async (req, res) => {
    try {
      const { segmentId } = req.params;
      
      // Retrieve the segment from the map
      const segment = segmentsMap.get(segmentId);
      
      if (!segment) {
        return res.status(404).json({ error: 'Segment not found' });
      }
      const donorIds = segment.donors.map((donor: any) => donor.id);
      
      console.log(`Generating impact reports for ${donorIds.length} donors in segment ${segmentId}`);
      
      // In a real application, this would generate and store impact reports for each donor
      // Here we'll simulate success after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all donations for each donor in the segment
      const processedDonors = [];
      
      for (const donorId of donorIds) {
        const donations = await storage.getDonorDonations(donorId);
        
        if (donations.length === 0) continue;
        
        // Calculate total donation amount
        const totalAmount = donations.reduce((sum, donation) => {
          return sum + parseFloat(donation.amount.toString());
        }, 0);
        
        // Generate impact data for the donor's total contributions
        const impact = calculateImpact(totalAmount);
        
        // Enhance with creative comparisons
        const enrichedImpact = await generateCreativeComparisons(impact);
        
        // Store the impact report (in a real application)
        // For now, just add to the processed list
        processedDonors.push({
          donorId,
          totalAmount,
          impact: enrichedImpact
        });
      }
      
      res.json({ 
        success: true,
        count: processedDonors.length,
        message: `Generated ${processedDonors.length} impact reports`
      });
    } catch (error) {
      console.error("Error generating wrapped reports:", error);
      res.status(500).json({ error: 'Failed to generate wrapped reports' });
    }
  });
  
  // API endpoint to send wrapped impact report emails for a segment
  app.post('/api/segments/:segmentId/send-wrapped-emails', async (req, res) => {
    try {
      const { segmentId } = req.params;
      
      // Retrieve the segment from the map
      const segment = segmentsMap.get(segmentId);
      
      if (!segment) {
        return res.status(404).json({ error: 'Segment not found' });
      }
      const donors = segment.donors.filter((donor: any) => donor.email);
      
      console.log(`Sending impact report emails to ${donors.length} donors in segment ${segmentId}`);
      
      // In a real application, this would send emails to each donor
      // Here we'll simulate success after a short delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json({ 
        success: true,
        count: donors.length,
        message: `Sent ${donors.length} impact report emails`
      });
    } catch (error) {
      console.error("Error sending wrapped report emails:", error);
      res.status(500).json({ error: 'Failed to send wrapped report emails' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
