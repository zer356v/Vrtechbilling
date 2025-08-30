import jsPDF from 'jspdf';
import { assets } from '../assets/assets';

// --- HELPER FUNCTIONS ---

function wrapText(pdf, text, maxWidth) {
  return pdf.splitTextToSize(text, maxWidth);
}

function getTextHeight(lines) {
  const lineHeight = 4;
  return lines.length * lineHeight;
}

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
    str += (a[Number(lastTwo)] || `${b[Number(lastTwo[0])]} ${a[Number(lastTwo[1])]}`);
  }

  return str.trim().toUpperCase();
}

// Draw text centered both horizontally and vertically
function drawCenteredText(pdf, text, x, y, width, height, isBold = false) {
  if (isBold) pdf.setFont('helvetica', 'bold');
  else pdf.setFont('helvetica', 'normal');

  const lines = Array.isArray(text) ? text : wrapText(pdf, String(text || ''), width - 4);
  const lineHeight = 4;
  const textBlockHeight = lines.length * lineHeight;

  const startY = y + (height - textBlockHeight) / 2 + 3; // fine-tune vertical
  lines.forEach((line, idx) => {
    const textWidth = pdf.getTextWidth(line);
    const textX = x + (width - textWidth) / 2; // horizontal center
    pdf.text(line, textX, startY + idx * lineHeight);
  });
}

// Draw the table header row
function drawTableHeader(pdf, columns, startY) {
  const headerHeight = 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setFillColor(255, 255, 255);

  pdf.rect(20, startY, 190, headerHeight, 'F');
  columns.forEach(col => {
    pdf.rect(col.x, startY, col.width, headerHeight);
    drawCenteredText(pdf, col.title, col.x, startY, col.width, headerHeight, true);
  });

  return startY + headerHeight + 2; // next row start
}

// --- PDF GENERATOR ---
export const generateBillPDF = (bill) => {
  const pdf = new jsPDF();
  pdf.setFont('helvetica');

  // Header logo
  if (assets.logo) {
    pdf.addImage(assets.logo, 'PNG', 20, 0, 170, 40);
  }

  let y = 30;

  // Title
  pdf.setFontSize(16);
  pdf.text(bill.billtype, 105, 45, { align: 'center' });
  y += 30;

  pdf.setFontSize(10);

  // Customer details
  pdf.setFont('helvetica', 'bold');
  pdf.text('TO:', 20, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text(bill.customer, 20, y);
  y += 5;

  const addressLines = bill.address.split('\n').filter(line => line.trim() !== '');
  addressLines.forEach(line => {
    pdf.text(line.trim(), 20, y);
    y += 5;
  });

  pdf.text(`${bill.city}, ${bill.state} - ${bill.zip}`, 20, y);

  // Invoice info (right side)
  const invoiceY = y - (addressLines.length + 2) * 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE NO:', 150, invoiceY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(bill.invoice, 173, invoiceY);

  pdf.setFont('helvetica', 'bold');
  pdf.text('DATE:', 150, invoiceY + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(bill.date, 165, invoiceY + 5);

  y +=5;

  // Table columns
  const columns = [
  { title: 'SL NO', x: 20, width: 13 },
  { title: 'ITEM DESCRIPTION', x: 33, width: 47 },
  { title: 'HSN', x: 80, width: 15 },
  { title: 'QTY', x: 95, width: 15 },
  { title: 'RATE', x: 110, width: 15 },
  { title: 'GST', x: 125, width: 15 },
  { title: 'CGST', x: 140, width: 17.5 },
  { title: 'SGST', x: 157.5, width: 17.5 },
  { title: 'TOTAL AMT', x: 175, width: 20 },
];

  y = drawTableHeader(pdf, columns, y);

  let grandTotal = 0;

  // Table rows
  bill.additionalItems.forEach((item) => {
    const descriptionWrapped = wrapText(pdf, item.name || '', columns[1].width - 2);
    const rowHeight = Math.max(10, getTextHeight(descriptionWrapped) + 4);

    // Page break check
    if (y + rowHeight > 270) {
      pdf.addPage();
      y = drawTableHeader(pdf, columns, 20);
    }

    const values = [
      item.sno.toString(),
      item.name,
      item.hsn,
      item.units.toString() + item.quantityType.toString(),
      `${item.price}`,
      item.gst && item.gst !== '0' ? `${item.gst}%` : '-',
      item.cgst && item.cgst !== '0.00' ? `${item.cgst}` : '-',
      item.sgst && item.sgst !== '0.00' ? `${item.sgst}` : '-',
      `${item.totalAmount}`,
    ];

    columns.forEach((col, i) => {
      pdf.rect(col.x, y, col.width, rowHeight);
      drawCenteredText(pdf, values[i], col.x, y, col.width, rowHeight, false);
    });

    grandTotal += parseFloat(item.totalAmount) || 0;
    y += rowHeight;
  });

  // Grand total row
  const totalRowHeight = 8;
  const labelWidth = 135;
  const valueWidth = 40;

  pdf.setFont('helvetica', 'bold');
  pdf.rect(20, y, labelWidth, totalRowHeight);
  pdf.rect(20 + labelWidth, y, valueWidth, totalRowHeight);

  drawCenteredText(pdf, 'GRAND TOTAL', 20, y, labelWidth, totalRowHeight, true);
  drawCenteredText(pdf, `${grandTotal.toFixed(2)}`, 20 + labelWidth, y, valueWidth, totalRowHeight, true);

  y += 15;

  // Notes section
    if (bill.notes ) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Notes:', 20, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  const notesWrapped = wrapText(pdf, bill.notes, 170);
  notesWrapped.forEach(line => {
    pdf.text(line, 20, y);
    y += 4;
  });
  y += 5;
}


 

  // Amount in Words
  pdf.setFont('helvetica', 'bold');
  pdf.text('Amount in Words:', 20, y);
  pdf.setFont('helvetica', 'normal');
  const amountInWords = convertToWords(Math.round(grandTotal));
  pdf.text(`${amountInWords} RUPEES ONLY`, 20, y + 5);
  y += 20;

  // Declaration
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Declaration:', 20, y);
  y += 5;
  pdf.setFont('helvetica', 'normal');
  const declaration = pdf.splitTextToSize(
    'We declare that this invoice shows the actual price of the Goods described and that all particulars are true and correct.',
    90
  );
  pdf.text(declaration, 20, y);

  // Bank Details
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

  y +=35;

  // --- Signatures (placed dynamically before footer) ---
const footerTopY = 268; // footer image starts here
const signatureY = footerTopY - 15; // 15px space above footer

pdf.setFont('helvetica', 'normal');
pdf.text('Customer Signature:', 20, signatureY);
pdf.text('Computer generated invoice requires no signature:', 75, signatureY);
pdf.text('For VR TECH HVAC Solutions:', 150, signatureY);

// Footer Image
if (assets.footer) {
  pdf.addImage(assets.footer, 'PNG', 20, footerTopY, 170, 30);
}

  // Save File
  pdf.save(`Invoice-${bill.invoice}.pdf`);
};
