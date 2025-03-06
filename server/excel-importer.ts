import * as XLSX from 'xlsx';
import { ImportDonor } from '../shared/schema';

interface ExcelDonor {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  external_id?: string;
  donation_amount?: string | number;
  donation_date?: string | Date;
  external_donation_id?: string;
}

/**
 * Parse Excel file with donor data and convert to ImportDonor format
 */
export function parseExcelDonors(buffer: Buffer): ImportDonor[] {
  // Parse Excel file
  const workbook = XLSX.read(buffer);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert to JSON
  const rawData = XLSX.utils.sheet_to_json<ExcelDonor>(worksheet);
  
  // Map Excel data to ImportDonor format
  return rawData
    .filter(row => row.email) // Ensure email exists
    .map(row => {
      const importDonor: ImportDonor = {
        email: row.email,
        first_name: row.first_name || undefined,
        last_name: row.last_name || undefined,
        phone: row.phone || undefined,
        external_id: row.external_id || undefined,
        donations: []
      };

      // Add donation if amount exists
      if (row.donation_amount) {
        const amount = typeof row.donation_amount === 'number' 
          ? row.donation_amount.toString() 
          : row.donation_amount;
        
        let timestamp = new Date();
        if (row.donation_date) {
          if (typeof row.donation_date === 'string') {
            timestamp = new Date(row.donation_date);
          } else {
            timestamp = row.donation_date;
          }
        }

        // Initialize donations array if it doesn't exist
        if (!importDonor.donations) {
          importDonor.donations = [];
        }

        importDonor.donations.push({
          amount,
          timestamp,
          external_donation_id: row.external_donation_id || undefined
        });
      }

      return importDonor;
    });
}