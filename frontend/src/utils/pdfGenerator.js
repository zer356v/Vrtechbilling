import jsPDF from 'jspdf';
import { assets } from '../assets/assets';

// Convert number to words
function convertToWords(n) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((n = n.toString()).length > 9) return 'Overflow';

  const padded = ('000000000' + n).slice(-9);
  const num = padded.match(/^(\d{2})(\d{2})(\d{2})(\d{3})$/);

  if (!num) return '';

  let str = '';

  const formatPair = (pair) => {
    if (!pair || pair.length !== 2) return '';
    if (pair[0] === '0') return a[Number(pair[1])];
    return a[Number(pair)] || `${b[Number(pair[0])]} ${a[Number(pair[1])]}`;
  };

  str += num[1] !== '00' ? `${formatPair(num[1])} Crore ` : '';
  str += num[2] !== '00' ? `${formatPair(num[2])} Lakh ` : '';
  str += num[3] !== '00' ? `${formatPair(num[3])} Thousand ` : '';
  str += num[4][0] !== '0' ? `${a[Number(num[4][0])]} Hundred ` : '';
  const lastTwo = num[4].slice(1);
  if (lastTwo !== '0') {
    str += (str !== '' ? '' : '') + (a[Number(lastTwo)] || `${b[Number(lastTwo[0])]} ${a[Number(lastTwo[1])]}`);
  }

  return str.trim().toUpperCase();
}

/**
 * Generate a PDF from a bill and trigger download
 * @param {Object} bill - The bill to generate a PDF for
 */
export const generateBillPDF = (bill) => {
  const pdf = new jsPDF();
  
  // Set font
  pdf.setFont('helvetica');
  
  // Header - Logo
if (assets.logo) {
  // Add logo image to header
  pdf.addImage(assets.logo, 'PNG', 20, 0, 170, 40);
}
let y = 30; // keep y the same if the image fits above

  // Invoice title
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text(bill.billtype, 105, 45, { align: 'center' });
  y +=30;
  
  
  // Customer and Invoice details
  pdf.setFontSize(10);
  
  // TO section (left side)
  pdf.setFont('helvetica', 'bold');
  pdf.text('TO:', 20, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text(bill.customer, 20, y);
  y += 5;
  // Handle multi-line address
  const addressLines = bill.address.split('\n').filter(line => line.trim() !== '');
  addressLines.forEach(line => {
    pdf.text(line.trim(), 20, y);
    y += 5;
  });
  
  pdf.text(`${bill.city}, ${bill.state} - ${bill.zip}`, 20, y);
  
  // Invoice details (right side)
  const invoiceY = y - 15;
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE NO:', 150, invoiceY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(bill.invoice, 173, invoiceY);

  pdf.setFont('helvetica', 'bold');
  pdf.text('DATE:', 150, invoiceY + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(bill.date, 165, invoiceY + 5);
  
  y += 20;
  
 // Table Header
pdf.setFillColor(255, 255, 255);
pdf.setFontSize(9);
pdf.setFont('helvetica', 'bold');

// Define columns
const columns = [
  { title: 'SL NO', x: 20, width: 13 },
  { title: 'ITEM DESCRIPTION', x: 33, width: 47 },
  { title: 'HSN', x: 80, width: 15 },
  { title: 'UNIT', x: 95, width: 15 },
  { title: 'RATE', x: 110, width: 15 },
  { title: 'GST', x: 125, width: 15 },
  { title: 'CGST', x: 140, width: 15 },
  { title: 'SGST', x: 155, width: 15 },
  { title: 'TOTAL AMT', x: 170, width: 25 },
];

// Draw header background and borders
const headerHeight = 10;
pdf.rect(20, y, 190, headerHeight, 'F');
columns.forEach(col => {
  pdf.rect(col.x, y, col.width, headerHeight);
  pdf.text(col.title, col.x + 1.5, y + 7);
});

y += headerHeight + 2;

// Table Body
pdf.setFont('helvetica', 'normal');
let grandTotal = 0;

bill.additionalItems.forEach((item, index) => {
  const rowHeight = 8;
  const values = [
    item.sno.toString(),
    item.name,
    item.hsn,
    item.units.toString(),
    `${item.price}`,
    item.gst && item.gst !== '0' ? `${item.gst}%` : '-',
    item.cgst && item.cgst !== '0.00' ? `${item.cgst}` : '-',
    item.sgst && item.sgst !== '0.00' ? `${item.sgst}` : '-',
    `${item.totalAmount}`,
  ];

  columns.forEach((col, i) => {
    pdf.rect(col.x, y, col.width, rowHeight);
    pdf.text(values[i], col.x + 1.5, y + 6);
  });

  grandTotal += parseFloat(item.totalAmount) || 0;
  y += rowHeight;
});

// Grand Total Row (with custom 2-column border)
const totalRowHeight = 8;
const labelWidth = 135;
const valueWidth = 40;

pdf.setFont('helvetica', 'bold');

// Draw the two bordered boxes
pdf.rect(20, y, labelWidth, totalRowHeight);               // Label box
pdf.rect(20 + labelWidth, y, valueWidth, totalRowHeight);  // Amount box

// Text inside the boxes
pdf.text('GRAND TOTAL', 22, y + 6);
const totalText = `${grandTotal.toFixed(2)}`;
const textWidth = pdf.getTextWidth(totalText);
pdf.text(totalText, 20 + labelWidth + (valueWidth - textWidth) / 2, y + 6);

y += 15;
// Amount in Words
pdf.setFont('helvetica', 'bold');
pdf.text('Amount in Words:', 20, y);
pdf.setFont('helvetica', 'normal');
const amountInWords = convertToWords(Math.round(grandTotal));
pdf.text(`${amountInWords} RUPEES ONLY`, 20, y + 5);
y += 20;

  
  // Declaration and Bank Details section
  pdf.setFontSize(9);
  
  // Declaration (left side)
  pdf.setFont('helvetica', 'bold');
  pdf.text('Declaration:', 20, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  const declaration = pdf.splitTextToSize(
    'We declare that this invoice shows the actual price of the Goods described and that all particulars are true and correct.',
    90
  );
  pdf.text(declaration, 20, y);
  
  // Bank Details (right side)
  const bankY = y - 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bank name:', 150, bankY);
  pdf.setFont('helvetica', 'normal');
  pdf.text('HDFC bank', 170, bankY);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ac/no:', 150, bankY + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.text('5010 0562 3633 08', 170, bankY + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('IFSC code:', 150, bankY + 10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('HDFC0003760', 170, bankY + 10);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('G PAY:', 150, bankY + 15);
  pdf.setFont('helvetica', 'normal');
  pdf.text('9790811296', 170, bankY + 15);
  
  y += 35;
  
  // Signatures section
  pdf.setFont('helvetica', 'normal');
  pdf.text('Customer Signature:',   20, 240);
  pdf.text('Computer generated invoice requires no signature:', 75, 240);
  pdf.text('For VR TECH HVAC Solutions:', 150, 240);
  
  y += 15;
  
  // Footer - Company Details
  
if (assets.footer) {
  // Add logo image to header
  pdf.addImage(assets.footer, 'PNG', 20, 268, 170, 30);
}
  
  // Download the PDF
  pdf.save(`Invoice-${bill.invoice}.pdf`);
};
