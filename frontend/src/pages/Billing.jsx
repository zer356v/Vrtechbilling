import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BillForm from '../components/BillForm';
import BillViewer from '../components/BillViewer';
import { isLoggedIn } from '../utils/authUtils';
import { getSavedBills, updateBillStatus, deleteBill } from '../utils/billStorage';
import { generateBillPDF } from '../utils/pdfGenerator';

const Billing = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    // Load saved bills on component mount
    setBills(getSavedBills());
  }, []);

  const handleBillSaved = () => {
    // Refresh the bills list when a new bill is saved
    setBills(getSavedBills());
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
  };

  const handleDownloadBill = (bill) => {
    generateBillPDF(bill);
  };

  const handleCloseBillViewer = () => {
    setSelectedBill(null);
  };

  const handleUpdateStatus = (billId, newStatus) => {
    updateBillStatus(billId, newStatus);
    setBills(getSavedBills());
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      deleteBill(billId);
      setBills(getSavedBills());
      // If the deleted bill was being viewed, close the viewer
      if (selectedBill && selectedBill.id === billId) {
        setSelectedBill(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Billing</h1>
            <p className="text-gray-600">Generate and manage bills for your services</p>
          </div>
          
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-gray-800">Create New Bill</h2>
                <p className="text-sm text-gray-600">Fill in the details to generate a professional bill</p>
              </div>
              
              <div className="p-6">
                <BillForm onBillSaved={handleBillSaved} />
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-gray-800">Recent Bills</h2>
                <p className="text-sm text-gray-600">View and manage recently generated bills</p>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bills.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No bills generated yet. Create your first bill above!
                          </td>
                        </tr>
                      ) : (
                        bills.map((bill) => (
                          <tr key={bill.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {bill.invoice}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.customer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{bill.total}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                                  {bill.status}
                                </span>
                                <select 
                                  className="ml-2 text-xs border rounded p-1"
                                  value={bill.status}
                                  onChange={(e) => handleUpdateStatus(bill.id, e.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Overdue">Overdue</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <button 
                                onClick={() => handleViewBill(bill)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleDownloadBill(bill)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Download
                              </button>
                              <button 
                                onClick={() => handleDeleteBill(bill.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {selectedBill && (
        <BillViewer
          bill={selectedBill}
          onClose={handleCloseBillViewer}
          onDownload={() => handleDownloadBill(selectedBill)}
        />
      )}
    </div>
  );
};

export default Billing;
