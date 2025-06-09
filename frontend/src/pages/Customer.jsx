import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { exportCustomersToExcel } from '../utils/export';
import { getSavedBills2,deleteBill2  } from '../utils/billstorage2.js';

import { isLoggedIn } from '../utils/authUtils';
import { 
  getSavedCustomers, 
  saveCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../utils/customerStorage';

const Customers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [bills, setBills] = useState([]);


  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    invoice: '',
    address: '',
    
  });
  

   // Get real bill data from localStorage
   const allBills02 = getSavedBills2().map(bill => ({
    id: bill.id,
    date: bill.date,
    invoice: bill.invoice,
    customer: bill.customer,
    address:bill.address
  }));

  useEffect(() => {
  if (!isLoggedIn()) {
    navigate('/');
  } else {
    loadCustomers();
    loadBills(); // <-- load bills here
    setLoading(false);
  }
}, [navigate]);



  const loadBills = () => {
  const savedBills = getSavedBills2();
  setBills(savedBills);
};


const handleEditBill = (bill) => {
  setEditingCustomer(bill);
  setFormData({
    customer: bill.customer,
    date: bill.date,
    invoice: bill.invoice,
    address: bill.address,
  });
  setShowForm(true);
};


const handleDeleteBill = (billId) => {
  if (window.confirm('Are you sure you want to delete this bill?')) {
    deleteBill2(billId);
    loadBills();
  }
};




  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/');
    } else {  
      loadCustomers();
      setLoading(false);
    }
  }, [navigate]);

  const loadCustomers = () => {
    const savedCustomers = getSavedCustomers();
    setCustomers(savedCustomers);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer: customer.customer,
      date: customer.date,
      invoice: customer.invoice,
      address: customer.address,
     
    });
    setShowForm(true);
  };

  
  

  const handleDelete = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(customerId);
      loadCustomers();
    }
  };

  
  
  
  const handleFormSubmit = (e) => {
  e.preventDefault();

  if (editingCustomer && editingCustomer.invoiceNumber) {
    // It's a bill, not a customer (bills have invoiceNumber, customers don't)
    const updatedBills = bills.map((bill) =>
      bill.id === editingCustomer.id ? { ...bill, ...formData } : bill
    );
    localStorage.setItem('saved_bills02', JSON.stringify(updatedBills));
    loadBills();
  } else if (editingCustomer) {
    // Update customer
    updateCustomer(editingCustomer.id, formData);
    loadCustomers();
  } else {
    // New customer
    saveCustomer(formData);
    loadCustomers();
  }

  setShowForm(false);
  setEditingCustomer(null);
  setFormData({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    invoice: '',
    address: '',
  });
};


  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({
      customer: '',
      date: new Date().toISOString().split('T')[0],
      invoice: '',
      address: '',
      
    });
  };
  
 const filteredData = [...customers, ...bills].filter((item) => {
  const matchesSearch =
  (item.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
  (item.invoice?.toLowerCase() || "").includes(searchTerm.toLowerCase())

  const matchesFilter = filterType === 'All' || item.type === filterType;

  return matchesSearch && matchesFilter;
});

 
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
              <p className="text-gray-600">Manage your customer database</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className="mt-4 md:mt-0"
          >
            {showForm ? 'Cancel' : 'Add New Customer'}
          </Button>

          <Button 
            onClick={() => exportCustomersToExcel(customers)} 
            variant="secondary"
            className="mt-4 md:mt-0"
          >
            Export to Excel
          </Button>
        </div>

          </div>
          
          {showForm && (
            <Card title={editingCustomer ? 'Edit Customer' : 'Add New Customer'} className="mb-6">
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  name="customer"
                  value={formData.customer}
                  onChange={handleFormChange}
                  placeholder="Enter customer name"
                  required
                />
                 <Input
                  label="Invoice no"
                  name="invoice"
                  value={formData.invoice}
                  onChange={handleFormChange}
                  placeholder="Enter invoice no"
                  required
                />
                <Input
                  label=" Address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Enter  address"
                  required
                />
                
                <Input
                  label="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  placeholder="Enter date"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                  <Button type="button" variant="secondary" onClick={handleCancelForm}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingCustomer ? 'Update Customer' : 'Save Customer'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          <Card className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search customers by name or invoice no"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  name="search"
                />
              </div>
              
            </div>
            
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {customers.length === 0 
                  ? 'No customers found. Add your first customer using the "Add New Customer" button.'
                  : 'No customers found matching your filters.'
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">invoiceNo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{customer.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{customer.invoice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{customer.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{customer.address}</td>
                       
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                             onClick={() => customer.invoiceNumber ? handleEditBill(customer) : handleEdit(customer)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => customer.invoiceNumber ? handleDeleteBill(customer.id) : handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                 
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Customers;
