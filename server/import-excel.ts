/**
 * Spreadsheet Donor Data Import Script
 * 
 * This script can be run directly to import donor and donation data from Excel or CSV files.
 * Usage: tsx server/import-excel.ts <path-to-file>
 * 
 * Features:
 * - Supports both Excel (.xlsx, .xls) and CSV files
 * - Flexible column name detection
 * - Handles donor and donation data
 * - Updates existing donors or creates new ones
 * - Handles multiple sheets in the Excel file
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { storage } from './storage';
import { ImportDonor } from '../shared/schema';
import { parseExcelDonors } from './excel-importer';
import { setupDatabase } from './db-setup';

async function importData(filePath: string) {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File ${filePath} does not exist.`);
      process.exit(1);
    }
    
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Handle JSON files separately from Excel/CSV files
    let donors: ImportDonor[] = [];
    
    if (fileExt === '.json') {
      console.log(`Reading JSON file: ${filePath}`);
      const jsonData = fs.readFileSync(filePath, 'utf8');
      donors = JSON.parse(jsonData) as ImportDonor[];
      console.log(`Found ${donors.length} donor records in JSON file`);
    } else if (!['.xlsx', '.xls', '.csv'].includes(fileExt)) {
      console.error(`Error: Unsupported file format '${fileExt}'. Please use .xlsx, .xls, .csv, or .json files.`);
      process.exit(1);
    } else {
      console.log(`Reading ${fileExt.slice(1).toUpperCase()} file: ${filePath}`);
      const buffer = fs.readFileSync(filePath);
      
      // Parse Excel or CSV file
      donors = parseExcelDonors(buffer, filePath);
    }
    console.log(`Found ${donors.length} valid donor records`);
    
    // Create or update each donor
    let donorsCreated = 0;
    let donorsUpdated = 0;
    let donationsCreated = 0;
    
    for (const importDonor of donors) {
      try {
        // Check if donor already exists
        const existingDonor = await storage.getDonorByEmail(importDonor.email);
        
        if (existingDonor) {
          // Update existing donor
          await storage.updateDonor(existingDonor.id, {
            first_name: importDonor.first_name,
            last_name: importDonor.last_name,
            phone: importDonor.phone,
            external_id: importDonor.external_id
          });
          donorsUpdated++;
        } else {
          // Create new donor
          await storage.createDonor({
            email: importDonor.email,
            first_name: importDonor.first_name,
            last_name: importDonor.last_name,
            phone: importDonor.phone,
            external_id: importDonor.external_id
          });
          donorsCreated++;
        }
        
        // Process any donations
        const donor = await storage.getDonorByEmail(importDonor.email);
        
        if (donor && importDonor.donations && importDonor.donations.length > 0) {
          for (const donation of importDonor.donations) {
            if (!donation.amount) continue;
            
            // Convert timestamp to Date type if it's a string
            let donationDate: Date;
            if (typeof donation.timestamp === 'string') {
              donationDate = new Date(donation.timestamp);
            } else {
              donationDate = donation.timestamp || new Date();
            }
            
            await storage.createDonation({
              donor_id: donor.id,
              amount: String(donation.amount), // Ensure amount is a string
              email: importDonor.email,
              timestamp: donationDate,
              external_donation_id: donation.external_donation_id,
              imported: 1
            });
            donationsCreated++;
          }
        }
      } catch (error) {
        console.error(`Error processing donor ${importDonor.email}:`, error);
      }
    }
    
    console.log('Import completed successfully');
    console.log('=================================');
    console.log(`Donors created: ${donorsCreated}`);
    console.log(`Donors updated: ${donorsUpdated}`);
    console.log(`Donations added: ${donationsCreated}`);
    console.log('=================================');
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

async function main() {
  // Get the file path from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: No file specified.');
    console.error('Usage: tsx server/import-excel.ts <path-to-file>');
    console.error('Supports .xlsx, .xls, .csv, and .json file formats');
    process.exit(1);
  }
  
  let filePath = args[0];
  
  // Make the path absolute if it's relative
  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(process.cwd(), filePath);
  }
  
  console.log('Setting up database connection...');
  await setupDatabase();
  
  await importData(filePath);
}

// Run the script
main().catch(console.error);