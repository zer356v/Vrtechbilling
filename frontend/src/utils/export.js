import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export customers to an Excel file
 * @param {Array<Object>} customers - List of customers
 */
export const exportCustomersToExcel = (customers) => {
  const worksheet = XLSX.utils.json_to_sheet(customers.map(c => ({
    Name: c.name,
    Email: c.email,
    Phone: c.phone,
    Address: c.address,
    Type: c.type,
    CreatedAt: c.createdAt,
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  saveAs(fileBlob, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
