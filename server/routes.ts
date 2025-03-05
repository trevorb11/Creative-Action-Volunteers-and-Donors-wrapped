import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonationSchema, almanacData } from "@shared/schema";
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
      const donation = insertDonationSchema.parse(req.body);
      const savedDonation = await storage.createDonation(donation);
      
      res.json({ donation: savedDonation });
    } catch (error) {
      res.status(400).json({ error: 'Invalid donation data' });
    }
  });

  // API endpoint to get almanac data
  app.get('/api/almanac-data', (req, res) => {
    res.json({ data: almanacData });
  });
  
  // API endpoint to get donor information by identifier
  app.get('/api/donor/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      if (!identifier) {
        return res.status(400).json({ error: 'Identifier is required' });
      }
      
      // Decode the identifier (in case it's a URL-encoded email)
      const decodedIdentifier = decodeURIComponent(identifier);
      
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
      const impact = calculateImpact(amount);
      
      res.json({ 
        donation, 
        impact 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch donor information' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
