/**
 * Analyze Marketing Segmentation Excel File
 * 
 * This script analyzes the Excel file with marketing segmentation data
 * and prepares it for import into the system.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

async function analyzeExcelFile(filePath: string) {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File ${filePath} does not exist.`);
      process.exit(1);
    }
    
    console.log(`Reading Excel file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    
    // Parse the Excel file
    const workbook = XLSX.read(buffer);
    console.log(`Sheets in workbook: ${workbook.SheetNames.join(', ')}`);
    
    // Analyze each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      
      // Get the sheet data
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`\n==== Sheet: ${sheetName} ====`);
      console.log(`Rows: ${data.length}`);
      
      if (data.length > 0) {
        // Analyze the columns in the first row
        const firstRow = data[0];
        console.log(`Columns: ${Object.keys(firstRow).join(', ')}`);
        
        // Sample data from the first few rows
        console.log('\nSample data:');
        for (let i = 0; i < Math.min(3, data.length); i++) {
          console.log(`Row ${i + 1}: ${JSON.stringify(data[i])}`);
        }
      }
    }
    
    console.log('\nAnalysis complete!');
  } catch (error) {
    console.error('Error analyzing Excel file:', error);
    process.exit(1);
  }
}

// Get the file path from the arguments
const filePath = './attached_assets/03032025_Finalize Segmentation for Marketing.xlsx';

// Analyze the file
analyzeExcelFile(filePath);