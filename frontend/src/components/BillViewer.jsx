import React from 'react';
import { assets } from '../assets/assets';

/**
 * BillViewer component for displaying a bill in a modal
 * @param {Object} props - Component props
 * @param {import('../utils/billStorage').SavedBill} props.bill - The bill to display
 * @param {Function} props.onClose - Function to call when closing the viewer
 * @param {Function} props.onDownload - Function to call when downloading the bill
 */
const BillViewer = ({ bill, onClose, onDownload }) => {
  const convertToWords = (n) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (isNaN(n)) return '';

  if ((n = parseInt(n).toString()).length > 9) return 'Overflow';

  const num = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!num) return '';

  let str = '';
  str += (num[1] != '00') ? (a[Number(num[1])] || b[num[1][0]] + ' ' + a[num[1][1]]) + ' Crore ' : '';
  str += (num[2] != '00') ? (a[Number(num[2])] || b[num[2][0]] + ' ' + a[num[2][1]]) + ' Lakh ' : '';
  str += (num[3] != '00') ? (a[Number(num[3])] || b[num[3][0]] + ' ' + a[num[3][1]]) + ' Thousand ' : '';
  str += (num[4] != '0') ? a[Number(num[4])] + ' Hundred ' : '';
  str += (num[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(num[5])] || b[num[5][0]] + ' ' + a[num[5][1]]) : '';

  return str.trim().toUpperCase();
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Bill View - {bill.invoice}</h2>
          <div className="flex gap-2">
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
        <div className='printable bg-white  '>
        <div className="invoice-content">
            <img className='logo w-90' src={assets.logo} alt="" />
        <h2 className="text-xl font-bold text-center -mt-4">{bill.billtype}</h2>
        <div className='flex justify-between -mt-2 text-sm'>
        <div className='px-12'>
            <p><strong>TO:</strong></p>
            <p>{bill.customer}</p>
            <p>{bill.address}</p>
            <p>{bill.city}, {bill.state} - {}</p>
        </div>
        <div className='px-12'>
            <p><strong>INVOICE NO:</strong> {bill.invoice}</p>
            <p><strong>DATE:</strong> {bill.date}</p>
        </div>
        </div>
        <table className=" ml-20 w-82  border-collapse text-center text-sm mt-8 ">
            <thead>
                <tr className=''>
                    
                    <th className="border p-5">SL NO</th>
                    <th className="border p-2">ITEM DESCRIPTION</th>
                    <th className="border p-2">HSN</th>
                    <th className="border p-2">UNIT</th>
                    <th className="border p-2">RATE</th>
                    <th className="border p-2">GST</th>
                    <th className="border p-2">CGST</th>
                    <th className="border p-2">SGST</th>
                    <th className="border p-2">TOTAL AMOUNT</th>
                </tr>
            </thead>
            <tbody>

                    
                        {bill.additionalItems.map((item, index) => (
                    <tr key={index} className="border-b">
                       <td className="border p-2 text-center font-bold">{item.sno}</td>
                      <td className="border p-2 text-center font-bold">{item.name}</td>
                      <td className="border p-2 text-center font-bold">{item.hsn}</td>
                      <td className='border p-2 text-center font-bold'>{item.units}</td>
                      <td className="border p-2 text-center font-bold">₹{item.price}</td>
                      <td className="border p-2 text-center font-bold">{item.gst}%</td>
                      <td className="border p-2 text-center font-bold">₹{item.cgst}</td>
                      <td className="border p-2 text-center font-bold">₹{item.sgst}</td>
                      <td className="border p-2 text-center font-bold">₹{item.totalAmount}</td>
                    </tr>
                        ))}
                    <tr>
                        <td colSpan="3" className="border p-2  text-right font-bold">GRAND TOTAL</td>
                        <td className="border p-2 text-center font-bold">{bill.total}</td>
                    </tr>
            </tbody>
        </table>
        <p className="mt-12 text-sm px-12"><strong className='text-sm'>Amount in Words :</strong> {convertToWords(bill.total)}</p>
        </div>
        <div className="invoice-footer">
            <div className='flex justify-between text-sm w-84 '>
                <div className='px-12'>
                <p className='dev'><strong>Declaration :</strong></p>
                <p className='w-96'>We declare that this invoice shows the actual price of the Goods described and that all particulars are true and correct.</p>
                </div>
                <div className='text-sm px-12 ' >
                    <p><strong>Bank name:</strong> HDFC bank</p>
                    <p><strong>Ac/no:</strong> 5010 0562 3633 08</p>
                    <p><strong>IFSC code :</strong> HDFC0003760</p>
                    <p><strong>G PAY:</strong> 9790811296</p>
                </div>
            </div>
            <div className="flex justify-between text-sm px-12 gap-9 mt-12">
                <p>Customer Signature :</p>
                <p>Computer generated invoice requires no signature :</p>
                <p>For VR TECH HVAC Solutions :</p>
            </div>
            <img className='w-90 mt-24' src={assets.footer} alt="" />
        </div>
    </div> 
        
      </div>
    </div>
  );
};

export default BillViewer;
