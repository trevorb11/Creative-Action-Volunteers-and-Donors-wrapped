import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonationSchema, insertDonorSchema, almanacData, importDonorSchema } from "@shared/schema";
import { z } from "zod";
import { generateCreativeComparisons } from "./llm-storyteller";

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

  const httpServer = createServer(app);

  return httpServer;
}
