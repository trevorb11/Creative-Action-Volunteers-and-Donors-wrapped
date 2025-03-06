/**
 * Seed Test Donors
 * 
 * This script creates test donor records in the database with donations
 * for testing the personalized impact visualization feature.
 */

import { storage } from './server/storage';
import { setupDatabase } from './server/db-setup';

async function main() {
  console.log('Setting up database...');
  await setupDatabase();
  console.log('Database setup completed.');
  
  // Test donors with their donation history
  const testDonors = [
    {
      email: 'ahillincolorado@gmail.com',
      first_name: 'Anne',
      last_name: 'Hill',
      donations: [
        {
          amount: 59.29,
          timestamp: new Date('2024-01-15')
        },
        {
          amount: 59.29,
          timestamp: new Date('2023-11-20')
        }
      ]
    },
    {
      email: 'jsmith@example.com',
      first_name: 'John',
      last_name: 'Smith',
      donations: [
        {
          amount: 100.00,
          timestamp: new Date('2024-02-01')
        },
        {
          amount: 75.50,
          timestamp: new Date('2023-12-15')
        },
        {
          amount: 50.00,
          timestamp: new Date('2023-08-10')
        }
      ]
    },
    {
      email: 'sarahc@example.com',
      first_name: 'Sarah',
      last_name: 'Cooper',
      donations: [
        {
          amount: 250.00,
          timestamp: new Date('2024-02-20')
        }
      ]
    }
  ];
  
  console.log('Creating test donors and donations...');
  
  for (const donorData of testDonors) {
    try {
      // Create donor
      const donor = await storage.createDonor({
        email: donorData.email,
        first_name: donorData.first_name,
        last_name: donorData.last_name
      });
      
      console.log(`Created donor: ${donor.first_name} ${donor.last_name} (${donor.email})`);
      
      // Create donations for this donor
      for (const donationData of donorData.donations) {
        const donation = await storage.createDonation({
          amount: donationData.amount.toString(),
          timestamp: donationData.timestamp,
          email: donorData.email,
          donor_id: donor.id
        });
        
        console.log(`  Added donation: $${donation.amount} on ${donation.timestamp.toISOString().split('T')[0]}`);
      }
    } catch (error) {
      console.error(`Error creating donor ${donorData.email}:`, error);
    }
  }
  
  console.log('Test donors created successfully.');
}

main().catch(console.error);