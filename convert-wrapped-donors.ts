/**
 * Convert Wrapped Donor Info CSV to System Format
 * 
 * This script converts the CSV file with donor information 
 * into a format that can be imported into our donation impact system.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { ImportDonor } from './shared/schema';

interface WrappedDonorData {
  id: string | number;
  name: string;
  location?: string;
  email?: string;
  phone?: string;
  totalGifts: number;
  lifetimeGiving: number;
  lastGiftDate: Date | string | null;
  lastGiftAmount: number;
  firstGiftDate: Date | string | null;
  firstGiftAmount: number;
  largestGiftDate: Date | string | null;
  largestGiftAmount: number;
  recentGifts: {
    fy22?: number;
    fy23?: number;
    fy24?: number;
    fy25?: number;
  };
}

// Function to clean currency string (remove $ and commas)
function cleanCurrencyString(currencyStr: string | undefined): number {
  if (!currencyStr) return 0;
  
  // Remove $ and commas, then convert to number
  const cleanStr = currencyStr.replace(/[$,]/g, '').trim();
  return cleanStr ? parseFloat(cleanStr) : 0;
}

// Function to parse date string into a Date object
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Parse dates in MM/DD/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1; // JS months are 0-based
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  return null;
}

// Extract city and state from location string (e.g., "Boulder, CO")
function extractLocationParts(location: string | undefined): { city: string, state: string } {
  if (!location) return { city: '', state: '' };
  
  const parts = location.split(',');
  return {
    city: parts[0]?.trim() || '',
    state: parts[1]?.trim() || ''
  };
}

function convertToImportFormat(donorData: WrappedDonorData[]): ImportDonor[] {
  const importDonors: ImportDonor[] = [];
  
  for (const donor of donorData) {
    // Skip donors without names
    if (!donor.name) continue;
    
    // Generate a placeholder email if none exists
    const email = donor.email || `donor-${donor.id}@example.com`;
    
    // Extract first and last name
    const nameParts = donor.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Create the import donor object
    const importDonor: ImportDonor = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone: donor.phone,
      external_id: donor.id.toString(),
      donations: [] // Initialize empty donations array
    };
    
    // Add the most recent donation (if available)
    if (donor.lastGiftAmount) {
      importDonor.donations.push({
        amount: donor.lastGiftAmount,
        timestamp: donor.lastGiftDate || new Date(),
        external_donation_id: `${donor.id}-last`
      });
    }
    
    // Add historical donations by fiscal year
    if (donor.recentGifts) {
      if (donor.recentGifts.fy22 && donor.recentGifts.fy22 > 0) {
        importDonor.donations.push({
          amount: donor.recentGifts.fy22,
          timestamp: new Date('2022-01-01'),
          external_donation_id: `${donor.id}-fy22`
        });
      }
      
      if (donor.recentGifts.fy23 && donor.recentGifts.fy23 > 0) {
        importDonor.donations.push({
          amount: donor.recentGifts.fy23,
          timestamp: new Date('2023-01-01'),
          external_donation_id: `${donor.id}-fy23`
        });
      }
      
      if (donor.recentGifts.fy24 && donor.recentGifts.fy24 > 0) {
        importDonor.donations.push({
          amount: donor.recentGifts.fy24,
          timestamp: new Date('2024-01-01'),
          external_donation_id: `${donor.id}-fy24`
        });
      }
      
      if (donor.recentGifts.fy25 && donor.recentGifts.fy25 > 0) {
        importDonor.donations.push({
          amount: donor.recentGifts.fy25,
          timestamp: new Date('2025-01-01'),
          external_donation_id: `${donor.id}-fy25`
        });
      }
    }
    
    // Make sure we have at least one donation
    if (importDonor.donations.length === 0 && donor.lifetimeGiving > 0) {
      importDonor.donations.push({
        amount: donor.lifetimeGiving,
        timestamp: new Date(),
        external_donation_id: `${donor.id}-lifetime`
      });
    }
    
    importDonors.push(importDonor);
  }
  
  return importDonors;
}

async function processCsvFile(filePath: string) {
  try {
    // Read the CSV file using XLSX
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${rawData.length} donors in the CSV data`);
    
    // Convert the raw data to our wrapped donor format
    const wrappedDonorData: WrappedDonorData[] = rawData.map((row: any) => {
      // Extract the data from the CSV columns
      return {
        id: row['Constituent ID'],
        name: row['Name'],
        location: row['Preferred City_ State'],
        email: row['Email Address'],
        phone: row['Phone Number'],
        totalGifts: parseInt(row['Total Number of Gifts'] || '0', 10),
        lifetimeGiving: cleanCurrencyString(row['Lifetime Giving']),
        lastGiftDate: parseDate(row['Last Gift Date']),
        lastGiftAmount: cleanCurrencyString(row['Last Gift Amount']),
        firstGiftDate: parseDate(row['First Gift Date']),
        firstGiftAmount: cleanCurrencyString(row['First Gift Amount']),
        largestGiftDate: parseDate(row['Largest Gift Date']),
        largestGiftAmount: cleanCurrencyString(row['Largest Gift Amount']),
        recentGifts: {
          fy22: cleanCurrencyString(row['Total Giving FY22']),
          fy23: cleanCurrencyString(row['Total Giving FY23']),
          fy24: cleanCurrencyString(row['Total Giving FY24']),
          fy25: cleanCurrencyString(row['Total Giving FY25'])
        }
      };
    });
    
    // Convert to import format
    const importDonors = convertToImportFormat(wrappedDonorData);
    
    console.log(`Converted ${importDonors.length} donors to import format`);
    
    // Write the result to a JSON file for inspection
    const outputPath = 'wrapped-donors.json';
    fs.writeFileSync(outputPath, JSON.stringify(importDonors, null, 2));
    
    console.log(`Conversion complete! Output saved to ${outputPath}`);
    console.log(`Use this file with the import script: tsx server/import-excel.ts ${outputPath}`);
    
    // Example segmentation analytics
    const segmentStats = {
      totalDonors: wrappedDonorData.length,
      totalLifetimeGiving: 0,
      averageGiftSize: 0,
      medianGiftSize: 0,
      recentGivingByYear: {
        fy22: 0,
        fy23: 0,
        fy24: 0,
        fy25: 0
      }
    };
    
    // Calculate segment statistics
    for (const donor of wrappedDonorData) {
      // Sum lifetime giving
      segmentStats.totalLifetimeGiving += donor.lifetimeGiving || 0;
      
      // Sum giving by year
      segmentStats.recentGivingByYear.fy22 += donor.recentGifts.fy22 || 0;
      segmentStats.recentGivingByYear.fy23 += donor.recentGifts.fy23 || 0;
      segmentStats.recentGivingByYear.fy24 += donor.recentGifts.fy24 || 0;
      segmentStats.recentGivingByYear.fy25 += donor.recentGifts.fy25 || 0;
    }
    
    // Calculate average gift size
    const giftSizes = wrappedDonorData
      .filter(d => d.lastGiftAmount > 0)
      .map(d => d.lastGiftAmount);
    
    segmentStats.averageGiftSize = giftSizes.length > 0 
      ? giftSizes.reduce((sum, size) => sum + size, 0) / giftSizes.length
      : 0;
    
    // Calculate median gift size
    if (giftSizes.length > 0) {
      giftSizes.sort((a, b) => a - b);
      const middle = Math.floor(giftSizes.length / 2);
      
      if (giftSizes.length % 2 === 0) {
        segmentStats.medianGiftSize = (giftSizes[middle - 1] + giftSizes[middle]) / 2;
      } else {
        segmentStats.medianGiftSize = giftSizes[middle];
      }
    }
    
    console.log('\nDonor Statistics:');
    console.log(JSON.stringify(segmentStats, null, 2));
    
  } catch (error) {
    console.error('Error processing CSV file:', error);
    process.exit(1);
  }
}

// Get the file path
const filePath = './Wrapped donor info.csv';

// Process the file
processCsvFile(filePath);