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
function cleanCurrencyString(currencyStr: string | undefined | number): number {
  if (currencyStr === undefined || currencyStr === null) return 0;
  
  // If it's already a number, return it
  if (typeof currencyStr === 'number') return currencyStr;
  
  // Remove $ and commas, then convert to number
  const cleanStr = currencyStr.replace(/[$,]/g, '').trim();
  return cleanStr ? parseFloat(cleanStr) : 0;
}

// Function to parse date values into a Date object
function parseDate(dateValue: string | number | undefined): Date | null {
  if (dateValue === undefined || dateValue === null) return null;
  
  // If it's a string, handle various string formats
  if (typeof dateValue === 'string') {
    if (dateValue.trim() === '') return null;
    
    // Parse dates in MM/DD/YYYY format
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // JS months are 0-based
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    // Try to parse as ISO date
    const isoDate = new Date(dateValue);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
  }
  
  // If it's a number, it might be Excel's date format (days since 1/1/1900 or 1/1/1904)
  // Excel uses different epoch depending on the system
  if (typeof dateValue === 'number') {
    // For Excel's 1900 date system (PC & modern Mac)
    // Subtracting 2 accounts for Excel's leap year bug
    const excelEpoch1900 = new Date(1900, 0, 1);
    const daysSince1900 = dateValue - 2;
    const date1900 = new Date(excelEpoch1900);
    date1900.setDate(excelEpoch1900.getDate() + daysSince1900);
    
    return date1900;
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
    
    // Create donations array
    const donations: Array<{ 
      amount: number;
      timestamp: Date | string;
      external_donation_id?: string;
    }> = [];
    
    // Add the most recent donation (if available)
    if (donor.lastGiftAmount) {
      donations.push({
        amount: donor.lastGiftAmount,
        timestamp: donor.lastGiftDate || new Date(),
        external_donation_id: `${donor.id}-last`
      });
    }
    
    // Add historical donations by fiscal year
    if (donor.recentGifts) {
      if (donor.recentGifts.fy22 && donor.recentGifts.fy22 > 0) {
        donations.push({
          amount: donor.recentGifts.fy22,
          timestamp: new Date('2022-01-01'),
          external_donation_id: `${donor.id}-fy22`
        });
      }
      
      if (donor.recentGifts.fy23 && donor.recentGifts.fy23 > 0) {
        donations.push({
          amount: donor.recentGifts.fy23,
          timestamp: new Date('2023-01-01'),
          external_donation_id: `${donor.id}-fy23`
        });
      }
      
      if (donor.recentGifts.fy24 && donor.recentGifts.fy24 > 0) {
        donations.push({
          amount: donor.recentGifts.fy24,
          timestamp: new Date('2024-01-01'),
          external_donation_id: `${donor.id}-fy24`
        });
      }
      
      if (donor.recentGifts.fy25 && donor.recentGifts.fy25 > 0) {
        donations.push({
          amount: donor.recentGifts.fy25,
          timestamp: new Date('2025-01-01'),
          external_donation_id: `${donor.id}-fy25`
        });
      }
    }
    
    // Make sure we have at least one donation
    if (donations.length === 0 && donor.lifetimeGiving > 0) {
      donations.push({
        amount: donor.lifetimeGiving,
        timestamp: new Date(),
        external_donation_id: `${donor.id}-lifetime`
      });
    }
    
    // Create the import donor object
    const importDonor: ImportDonor = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone: donor.phone,
      external_id: donor.id.toString(),
      donations: donations
    };
    
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
    const wrappedDonorData: WrappedDonorData[] = [];
    
    // Define a type for our CSV row data
    type CsvRow = {
      [key: string]: string | number | undefined;
    };
    
    // Process each row with error handling
    for (let i = 0; i < rawData.length; i++) {
      try {
        // Cast row to our expected type
        const row = rawData[i] as CsvRow;
        
        // Debug output for the first few rows
        if (i < 3) {
          console.log('Sample row:', JSON.stringify(row));
        }
        
        // Safely access properties with type checking
        const constituentId = row['Constituent ID'];
        const name = row['Name'] as string | undefined; 
        const location = row['Preferred City_ State'] as string | undefined;
        const email = row['Email Address'] as string | undefined;
        const phone = row['Phone Number'] as string | undefined;
        const totalGifts = row['Total Number of Gifts'];
        const lifetimeGiving = row['Lifetime Giving'];
        const lastGiftDate = row['Last Gift Date'];
        const lastGiftAmount = row['Last Gift Amount'];
        const firstGiftDate = row['First Gift Date'];
        const firstGiftAmount = row['First Gift Amount'];
        const largestGiftDate = row['Largest Gift Date'];
        const largestGiftAmount = row['Largest Gift Amount'];
        const totalGivingFY22 = row['Total Giving FY22'];
        const totalGivingFY23 = row['Total Giving FY23'];
        const totalGivingFY24 = row['Total Giving FY24'];
        const totalGivingFY25 = row['Total Giving FY25'];
        
        // Skip rows without a name
        if (!name) {
          console.log(`Skipping row ${i} - no name provided`);
          continue;
        }
        
        const donorData: WrappedDonorData = {
          id: constituentId || i,
          name: name,
          location: location,
          email: email,
          phone: phone,
          totalGifts: parseInt(String(totalGifts || '0'), 10),
          lifetimeGiving: cleanCurrencyString(lifetimeGiving),
          lastGiftDate: parseDate(lastGiftDate),
          lastGiftAmount: cleanCurrencyString(lastGiftAmount),
          firstGiftDate: parseDate(firstGiftDate),
          firstGiftAmount: cleanCurrencyString(firstGiftAmount),
          largestGiftDate: parseDate(largestGiftDate),
          largestGiftAmount: cleanCurrencyString(largestGiftAmount),
          recentGifts: {
            fy22: cleanCurrencyString(totalGivingFY22),
            fy23: cleanCurrencyString(totalGivingFY23),
            fy24: cleanCurrencyString(totalGivingFY24),
            fy25: cleanCurrencyString(totalGivingFY25)
          }
        };
        
        wrappedDonorData.push(donorData);
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        console.error('Row data:', rawData[i]);
      }
    }
    
    // Convert to import format
    const importDonors = convertToImportFormat(wrappedDonorData);
    
    console.log(`Converted ${importDonors.length} donors to import format`);
    
    // Write the full result to a JSON file
    const outputPath = 'wrapped-donors.json';
    fs.writeFileSync(outputPath, JSON.stringify(importDonors, null, 2));
    
    // Also create a sample version with just 100 donors for testing
    const sampleDonors = importDonors.slice(0, 100);
    const samplePath = 'wrapped-donors-sample.json';
    fs.writeFileSync(samplePath, JSON.stringify(sampleDonors, null, 2));
    
    console.log(`Conversion complete! Output saved to ${outputPath}`);
    console.log(`Sample file with 100 donors saved to ${samplePath}`);
    console.log(`For testing, use: tsx server/import-excel.ts ${samplePath}`);
    console.log(`For full import, use: tsx server/import-excel.ts ${outputPath}`);
    
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