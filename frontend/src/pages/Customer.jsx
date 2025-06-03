import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { exportCustomersToExcel } from '../utils/export';

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
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'Residential'
  });
  
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
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      type: customer.type
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
    
    if (editingCustomer) {
      // Update existing customer
      updateCustomer(editingCustomer.id, formData);
    } else {
      // Create new customer
      saveCustomer(formData);
    }
    
    loadCustomers();
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'Residential'
    });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'Residential'
    });
  };
  
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || customer.type === filterType;
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
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter customer name"
                  required
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                  required
                />
                
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  required
                />
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Customer Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Multi-unit">Multi-unit</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Enter full address"
                    required
                  />
                </div>
                
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
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  name="search"
                />
              </div>
              <div className="w-48">
                <select
                  value={filterType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Multi-unit">Multi-unit</option>
                </select>
              </div>
            </div>
            
            {filteredCustomers.length === 0 ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>{customer.email}</div>
                          <div>{customer.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{customer.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.type === 'Residential' ? 'bg-green-100 text-green-800' :
                            customer.type === 'Commercial' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {customer.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(customer)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(customer.id)}
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
