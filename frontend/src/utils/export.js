import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getSavedBills2 } from './billstorage2';
import { getSavedCustomers } from './customerStorage';

/**
 * Export combined customerStorage + billStorage2 to one Excel sheet
 */
export const exportCustomersToExcel = () => {
  const customers = getSavedCustomers();
  const bills = getSavedBills2();

  // Standardize both into same structure
  const combined = [
    ...customers.map(c => ({
      Name: c.customer,
      Date: c.date,
      InvoiceNo: c.invoice,
      Address: c.address,
      CreatedAt: c.createdAt,
      
    })),
    ...bills.map(b => ({
      Name: b.customer,
      Date: b.date,
      InvoiceNo: b.invoice,
      Address: b.address,
      CreatedAt: b.createdAt,
     
    }))
  ];

  const worksheet = XLSX.utils.json_to_sheet(combined);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'customer data');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  saveAs(fileBlob, `combined_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
