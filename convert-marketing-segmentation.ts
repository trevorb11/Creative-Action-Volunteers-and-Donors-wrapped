/**
 * Convert Marketing Segmentation Data to System Format
 * 
 * This script converts the detailed marketing segmentation Excel file
 * into a format that can be imported into our donation impact system.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { ImportDonor } from './shared/schema';

interface SegmentationData {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  donorType: string;  // Major Donor, Gold, Bronze, etc.
  totalGifts: number;
  lifetimeGiving: number;
  lastGiftDate: Date | string;
  lastGiftAmount: number;
  firstGiftDate: Date | string;
  firstGiftAmount: number;
  largestGiftDate: Date | string;
  largestGiftAmount: number;
  recentGifts: {
    fy22?: number;
    fy23?: number;
    fy24?: number;
    fy25?: number;
  };
}

function excelDateToJSDate(excelDate: number) {
  // Excel date is number of days since 1900-01-01
  // JavaScript date is milliseconds since 1970-01-01
  // Need to adjust by the offset: 25569 days
  if (!excelDate) return null;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return new Date((excelDate - 25569) * millisecondsPerDay);
}

function convertToImportFormat(segmentationData: SegmentationData[]): ImportDonor[] {
  const importDonors: ImportDonor[] = [];
  
  for (const donor of segmentationData) {
    // Skip donors without names
    if (!donor.name) continue;
    
    // Generate a placeholder email if none exists
    const email = donor.email || `${donor.id}@placeholder.com`;
    
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
      donations: []
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

async function processExcelFile(filePath: string) {
  try {
    // Read the Excel file
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer);
    
    // Get the segmentation sheet
    const sheetName = 'Final Segmentation';
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Sheet '${sheetName}' not found in the workbook`);
    }
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${rawData.length} donors in the segmentation data`);
    
    // Convert the raw data to our segmentation format
    const segmentationData: SegmentationData[] = rawData.map((row: any) => {
      // Extract city and state from combined field
      let city = '';
      let state = '';
      
      if (row['Preferred City_ State']) {
        const parts = row['Preferred City_ State'].split(',');
        city = parts[0]?.trim() || '';
        state = parts[1]?.trim() || '';
      }
      
      return {
        id: row['Constituent ID'],
        name: row['Name'],
        // Generate email for testing since it's not in the data
        email: row['Constituent ID'] ? `donor-${row['Constituent ID']}@example.com` : undefined,
        phone: row['Phone Number'],
        city,
        state,
        zip: row['Preferred ZIP'],
        donorType: row['Constituency Code'] || 'Unknown',
        totalGifts: row['Total Number of Gifts'] || 0,
        lifetimeGiving: row['Lifetime Giving'] || 0,
        lastGiftDate: excelDateToJSDate(row['Last Gift Date']),
        lastGiftAmount: row['Last Gift Amount'] || 0,
        firstGiftDate: excelDateToJSDate(row['First Gift Date']),
        firstGiftAmount: row['First Gift Amount'] || 0,
        largestGiftDate: excelDateToJSDate(row['Largest Gift Date']),
        largestGiftAmount: row['Largest Gift Amount'] || 0,
        recentGifts: {
          fy22: row['Total Giving FY22'] || 0,
          fy23: row['Total Giving FY23'] || 0,
          fy24: row['Total Giving FY24'] || 0,
          fy25: row['Total Giving FY25'] || 0,
        }
      };
    });
    
    // Convert to import format
    const importDonors = convertToImportFormat(segmentationData);
    
    console.log(`Converted ${importDonors.length} donors to import format`);
    
    // Write the result to a JSON file for inspection
    const outputPath = path.join(path.dirname(filePath), 'converted-donors.json');
    fs.writeFileSync(outputPath, JSON.stringify(importDonors, null, 2));
    
    console.log(`Conversion complete! Output saved to ${outputPath}`);
    console.log(`Use this file with the import script: tsx server/import-excel.ts ${outputPath}`);
    
    // Example segmentation analytics
    const segmentStats = {
      totalDonors: segmentationData.length,
      byDonorType: {} as Record<string, number>,
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
    for (const donor of segmentationData) {
      // Count by donor type
      if (!segmentStats.byDonorType[donor.donorType]) {
        segmentStats.byDonorType[donor.donorType] = 0;
      }
      segmentStats.byDonorType[donor.donorType]++;
      
      // Sum lifetime giving
      segmentStats.totalLifetimeGiving += donor.lifetimeGiving || 0;
      
      // Sum giving by year
      segmentStats.recentGivingByYear.fy22 += donor.recentGifts.fy22 || 0;
      segmentStats.recentGivingByYear.fy23 += donor.recentGifts.fy23 || 0;
      segmentStats.recentGivingByYear.fy24 += donor.recentGifts.fy24 || 0;
      segmentStats.recentGivingByYear.fy25 += donor.recentGifts.fy25 || 0;
    }
    
    // Calculate average gift size
    const giftSizes = segmentationData
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
    
    console.log('\nSegmentation Analytics:');
    console.log(JSON.stringify(segmentStats, null, 2));
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    process.exit(1);
  }
}

// Get the file path from the arguments or use default
const filePath = './attached_assets/03032025_Finalize Segmentation for Marketing.xlsx';

// Process the file
processExcelFile(filePath);