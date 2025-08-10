import jsPDF from 'jspdf';
import { assets } from '../assets/assets';

// --- HELPER FUNCTIONS ---

function wrapText(pdf, text, maxWidth) {
  return pdf.splitTextToSize(text, maxWidth);
}

function getTextHeight(pdf, lines) {
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
    str += (str !== '' ? '' : '') + (a[Number(lastTwo)] || `${b[Number(lastTwo[0])]} ${a[Number(lastTwo[1])]}`);
  }

  return str.trim().toUpperCase();
}

// --- PDF GENERATOR ---

export const generateBillPDF = (bill) => {
  const pdf = new jsPDF();
  pdf.setFont('helvetica');

  if (assets.logo) {
    pdf.addImage(assets.logo, 'PNG', 0, 0, 210, 40); // x=0, width=210mm
  }

  let y = 30;
  pdf.setFontSize(16);
  pdf.text(bill.billtype, 105, 45, { align: 'center' });
  y += 30;

  pdf.setFontSize(10);
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

  const invoiceY = y - (addressLines.length + 2) * 5;
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
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setFillColor(255, 255, 255);

// Shift table a little to the left
const shiftLeft = -5;

const columns = [
  { title: 'SL NO', x: 18 + shiftLeft, width: 13 },
  { title: 'ITEM DESCRIPTION', x: 31 + shiftLeft, width: 47 },
  { title: 'HSN', x: 78 + shiftLeft, width: 15 },
  { title: 'QTY', x: 93 + shiftLeft, width: 15 },
  { title: 'RATE', x: 108 + shiftLeft, width: 15 },
  { title: 'GST', x: 123 + shiftLeft, width: 15 },
  { title: 'CGST', x: 138 + shiftLeft, width: 15 },
  { title: 'SGST', x: 153 + shiftLeft, width: 15 },
  { title: 'TOTAL AMT', x: 168 + shiftLeft, width: 38 },
];

const headerHeight = 10; // <-- declare before using

// Draw header background (shifted left too)
pdf.rect(20 + shiftLeft, y, 190, headerHeight, 'F');

columns.forEach(col => {
  pdf.rect(col.x, y, col.width, headerHeight);
  const centerX = col.x + col.width / 2;
  pdf.text(col.title, centerX, y + 7, { align: 'center' });
});


  y += headerHeight + 2;
  pdf.setFont('helvetica', 'normal');

  let grandTotal = 0;

  bill.additionalItems.forEach((item, index) => {
    const descriptionWrapped = wrapText(pdf, item.name || '', columns[1].width - 2);
    const rowHeight = Math.max(10, getTextHeight(pdf, descriptionWrapped) + 4);

    if (y + rowHeight > 270) {
      pdf.addPage();
      y = 20;
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

      if (i === 1) {
        // Centered multiline description, same font size as others
        const lines = wrapText(pdf, values[i], col.width - 2);
        const startY = y + (rowHeight - lines.length * 4) / 2;
        const centerX = col.x + col.width / 2;
        pdf.setFontSize(9); // same as other columns
        lines.forEach((line, idx) => {
            pdf.text(line, centerX, startY + idx * 4 + 3, { align: 'center' });
        });
    } else {
        const text = values[i];
        const textY = y + rowHeight / 2 + 2;
        const centerX = col.x + col.width / 2;
        pdf.setFontSize(9); // ensure same size for all
        pdf.text(text, centerX, textY, { align: 'center' });
    }    
    });

    grandTotal += parseFloat(item.totalAmount) || 0;
    y += rowHeight;
  });

// Grand Total
const totalRowHeight = 8;
const totalAmtCol = columns.find(col => col.title === 'TOTAL AMT');

// Draw left portion (all columns except the last one)
const labelX = columns[0].x;
const labelWidth = totalAmtCol.x - labelX;

pdf.setFont('helvetica', 'bold');
pdf.rect(labelX, y, labelWidth, totalRowHeight);
pdf.rect(totalAmtCol.x, y, totalAmtCol.width, totalRowHeight);

// Label cell centered
pdf.text('GRAND TOTAL', labelX + labelWidth / 2, y + 6, { align: 'center' });

// Value cell center-aligned (instead of right)
const totalText = `${grandTotal.toFixed(2)}`;
pdf.text(totalText, totalAmtCol.x + totalAmtCol.width / 2, y + 6, { align: 'center' });

  

  y += 15;

  // Notes
  if (bill.notes) {
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

    // --- After Grand Total ---
    const fixedBottomY = 210; // fixed starting point for bottom sections

    // Amount in Words
    pdf.setFont('helvetica', 'bold');
    pdf.text('Amount in Words:', 20, fixedBottomY);
    pdf.setFont('helvetica', 'normal');
    const amountInWords = convertToWords(Math.round(grandTotal));
    pdf.text(`${amountInWords} RUPEES ONLY`, 20, fixedBottomY + 5);
  
    // Declaration (Left side)
    const declarationY = fixedBottomY + 15;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Declaration:', 20, declarationY);
    pdf.setFont('helvetica', 'normal');
    const declaration = pdf.splitTextToSize(
      'We declare that this invoice shows the actual price of the Goods described and that all particulars are true and correct.',
      80
    );
    pdf.text(declaration, 20, declarationY + 5);
  
    // Bank Details (Right side, aligned with Declaration)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bank name:', 140, declarationY);
    pdf.setFont('helvetica', 'normal');
    pdf.text('HDFC bank', 170, declarationY);
  
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ac/no:', 140, declarationY + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('5010 0562 3633 08', 170, declarationY + 5);
  
    pdf.setFont('helvetica', 'bold');
    pdf.text('IFSC code:', 140, declarationY + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('HDFC0003760', 170, declarationY + 10);
  
    pdf.setFont('helvetica', 'bold');
    pdf.text('G PAY:', 140, declarationY + 15);
    pdf.setFont('helvetica', 'normal');
    pdf.text('9790811296', 170, declarationY + 15);
  
    // Signatures (slightly lower and fixed)
    const signY = 250;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Customer Signature:', 20, signY);
    pdf.text('Computer generated invoice requires no signature:', 75, signY);
    pdf.text('For VR TECH HVAC Solutions:', 150, signY);
  

  // Footer Image
  if (assets.footer) {
    pdf.addImage(assets.footer, 'PNG', 0, 268, 210, 30); // x=0, width=210mm
  }

  // Save
  pdf.save(`Invoice-${bill.invoice}.pdf`);
};
