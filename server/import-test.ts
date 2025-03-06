import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { db } from './db';
import { donors, donations } from '../shared/schema';
import { storage } from './storage';

// Define a type for Excel row data
interface ExcelRow {
  [key: string]: any;
  email?: string;
  Email?: string;
  'Email Address'?: string;
  'email address'?: string;
  first_name?: string;
  'First Name'?: string;
  firstname?: string;
  FirstName?: string;
  last_name?: string;
  'Last Name'?: string;
  lastname?: string;
  LastName?: string;
  phone?: string;
  Phone?: string;
  'Phone Number'?: string;
  amount?: string | number;
  Amount?: string | number;
  'Donation Amount'?: string | number;
  donation_amount?: string | number;
}

async function processExcelFile(filePath: string) {
  console.log(`Reading file: ${filePath}`);
  const fileBuffer = fs.readFileSync(filePath);
  
  // Parse Excel file
  const workbook = XLSX.read(fileBuffer);
  const sheetNames = workbook.SheetNames;
  
  console.log(`Sheets found: ${sheetNames.join(', ')}`);
  
  // Process each sheet
  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    console.log(`Processing sheet: ${sheetName}`);
    
    // Get all data as array of objects with header row as keys
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
    console.log(`Found ${data.length} rows of data`);
    
    if (data.length > 0) {
      // Display the first row to see structure
      console.log('Sample row structure:');
      console.log(JSON.stringify(data[0], null, 2));
      
      // Count how many have emails
      const withEmail = data.filter(row => row.email || row.Email || row['Email Address']).length;
      console.log(`Rows with email: ${withEmail}`);
      
      // Flexibility in column names - look for different variations
      for (const row of data) {
        try {
          // Extract email with fallbacks for different column names
          const email = row.email || row.Email || row['Email Address'] || row['email address'];
          if (!email) {
            console.log('Skipping row without email:', row);
            continue;
          }
          
          // Extract name with fallbacks
          const firstName = row.first_name || row['First Name'] || row.firstname || row.FirstName;
          const lastName = row.last_name || row['Last Name'] || row.lastname || row.LastName;
          const phone = row.phone || row.Phone || row['Phone Number'];
          
          // Extract amount with fallbacks
          const amountRaw = row.amount || row.Amount || row['Donation Amount'] || row.donation_amount;
          let amount: number | null = null;
          
          if (amountRaw) {
            // Handle if amount is a string with currency symbol or commas
            if (typeof amountRaw === 'string') {
              const cleanAmount = amountRaw.replace(/[$,]/g, '');
              amount = parseFloat(cleanAmount);
            } else if (typeof amountRaw === 'number') {
              amount = amountRaw;
            }
          }
          
          console.log(`Processing donor: ${email}, ${firstName} ${lastName}, amount: ${amount}`);
          
          // Create or update donor
          const donor = await storage.createDonor({
            email,
            first_name: firstName,
            last_name: lastName,
            phone
          });
          
          // Add donation if amount exists
          if (amount !== null) {
            await storage.createDonation({
              amount: amount.toString(),
              donor_id: donor.id,
              email,
              timestamp: new Date(),
              imported: 1
            });
            console.log(`Added donation of ${amount} for ${email}`);
          }
        } catch (err) {
          console.error('Error processing row:', err);
        }
      }
    }
  }
}

async function main() {
  try {
    const filePath = '../attached_assets/03032025_Finalize Segmentation for Marketing.xlsx';
    await processExcelFile(filePath);
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

main();