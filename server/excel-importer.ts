import * as XLSX from 'xlsx';
import * as path from 'path';
import { ImportDonor } from '../shared/schema';

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
  'First name'?: string;
  last_name?: string;
  'Last Name'?: string;
  lastname?: string;
  LastName?: string;
  'Last name'?: string;
  phone?: string;
  Phone?: string;
  'Phone Number'?: string;
  'phone number'?: string;
  external_id?: string;
  'External ID'?: string;
  id?: string;
  ID?: string;
  amount?: string | number;
  Amount?: string | number;
  'Donation Amount'?: string | number;
  donation_amount?: string | number;
  'donation amount'?: string | number;
  value?: string | number;
  Value?: string | number;
  date?: string | Date;
  Date?: string | Date;
  'Donation Date'?: string | Date;
  donation_date?: string | Date;
  'donation date'?: string | Date;
  timestamp?: string | Date;
  Timestamp?: string | Date;
  donation_id?: string;
  'Donation ID'?: string;
  external_donation_id?: string;
  'External Donation ID'?: string;
}

/**
 * Parse Excel or CSV file with donor data and convert to ImportDonor format
 * This function is flexible and handles various column name formats
 */
export function parseExcelDonors(buffer: Buffer, filePath?: string): ImportDonor[] {
  // Determine file extension
  const fileExt = filePath ? path.extname(filePath).toLowerCase() : '';
  
  // Parse the file (Excel or CSV)
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    raw: fileExt === '.csv'
  });
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert to JSON
  const rawData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
  console.log(`Found ${rawData.length} rows in ${fileExt || 'spreadsheet'} file`);
  
  if (rawData.length > 0) {
    console.log('Sample row:', JSON.stringify(rawData[0], null, 2));
  }
  
  // Map data to ImportDonor format with flexible column naming
  const importDonors: ImportDonor[] = [];
  
  for (const row of rawData) {
    // Extract email with fallbacks for different column names
    const email = row.email || row.Email || row['Email Address'] || row['email address'];
    if (!email) {
      console.log('Skipping row without email');
      continue;
    }
    
    // Extract name with fallbacks
    const firstName = row.first_name || row['First Name'] || row.firstname || row.FirstName || row['First name'];
    const lastName = row.last_name || row['Last Name'] || row.lastname || row.LastName || row['Last name'];
    const phone = row.phone || row.Phone || row['Phone Number'] || row['phone number'];
    const externalId = row.external_id || row['External ID'] || row.id || row.ID;
    
    // Create donor record
    const importDonor: ImportDonor = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      external_id: externalId,
      donations: []
    };
    
    // Look for donation information
    const amountRaw = row.amount || row.Amount || row['Donation Amount'] || row.donation_amount || 
                   row['donation amount'] || row.value || row.Value;
    
    if (amountRaw) {
      let amount: string | number;
      
      // Handle if amount is a string with currency symbol or commas
      if (typeof amountRaw === 'string') {
        const cleanAmount = amountRaw.replace(/[$,]/g, '');
        amount = cleanAmount;
      } else if (typeof amountRaw === 'number') {
        amount = amountRaw;
      } else {
        amount = "0";  // Default if unparseable
      }
      
      // Handle donation date
      let timestamp: Date | string = new Date();
      const dateRaw = row.date || row.Date || row['Donation Date'] || row.donation_date || 
                    row['donation date'] || row.timestamp || row.Timestamp;
                    
      if (dateRaw) {
        if (typeof dateRaw === 'string') {
          // Try to parse the date
          const parsedDate = new Date(dateRaw);
          if (!isNaN(parsedDate.getTime())) {
            timestamp = parsedDate;
          } else {
            // If parsing fails, keep as string for later handling
            timestamp = dateRaw;
          }
        } else if (dateRaw instanceof Date) {
          timestamp = dateRaw;
        }
      }
      
      const externalDonationId = row.donation_id || row['Donation ID'] || 
                              row.external_donation_id || row['External Donation ID'];
      
      if (importDonor.donations) {
        importDonor.donations.push({
          amount,
          timestamp,
          external_donation_id: externalDonationId
        });
      }
    }
    
    importDonors.push(importDonor);
  }
  
  console.log(`Processed ${importDonors.length} valid donor records`);
  return importDonors;
}