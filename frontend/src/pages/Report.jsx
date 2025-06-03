import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { isLoggedIn } from '../utils/authUtils';
import { getSavedBills } from '../utils/billStorage';
import { getSavedServices } from '../utils/serviceStorage';
import { getSavedCustomers } from '../utils/customerStorage';

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');
  const [bills, setBills] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/');
    } else {
      loadData();
      setLoading(false);
    }
  }, [navigate]);

  const loadData = () => {
    setBills(getSavedBills());
    setServices(getSavedServices());
    setCustomers(getSavedCustomers());
  };
  
  // Simple React-based chart component for bar chart
  const BarChart = ({ data, height }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    const labels = data.labels;
    const chartValues = data.datasets[0].data;
    const chartColor = data.datasets[0].backgroundColor || '#3b82f6';
    
    return (
      <div className="w-full" style={{ height }}>
        <div className="relative h-full flex items-end">
          {chartValues.map((value, index) => {
            const heightPercent = (value / maxValue) * 100;
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center justify-end h-full px-1"
              >
                <div 
                  style={{ 
                    height: `${heightPercent}%`,
                    backgroundColor: Array.isArray(chartColor) ? chartColor[index] : chartColor
                  }}
                  className="w-full rounded-t-md relative group hover:opacity-90 transition-opacity"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {value.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{labels[index].substring(0, 3)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Calculate revenue data from bills
  const getRevenueData = () => {
    const monthlyRevenue = Array(12).fill(0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    bills.forEach(bill => {
      const date = new Date(bill.date);
      const month = date.getMonth();
      const total = parseFloat(bill.total) || 0;
      monthlyRevenue[month] += total;
    });

    return {
      labels: monthNames,
      datasets: [{
        label: 'Revenue',
        data: monthlyRevenue,
        backgroundColor: '#3b82f6',
      }]
    };
  };

  // Calculate service data
  const getServiceTypeData = () => {
    const serviceTypes = {};
    services.forEach(service => {
      serviceTypes[service.service] = (serviceTypes[service.service] || 0) + 1;
    });

    const labels = Object.keys(serviceTypes);
    const data = Object.values(serviceTypes);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return {
      labels,
      datasets: [{
        label: 'Service Count',
        data,
        backgroundColor: colors.slice(0, labels.length),
      }]
    };
  };

  // Calculate customer data
  const getCustomerData = () => {
    const customerTypes = {};
    customers.forEach(customer => {
      customerTypes[customer.type] = (customerTypes[customer.type] || 0) + 1;
    });

    const labels = Object.keys(customerTypes);
    const data = Object.values(customerTypes);
    const colors = ['#10b981', '#3b82f6', '#8b5cf6'];

    return {
      labels,
      datasets: [{
        label: 'Customer Types',
        data,
        backgroundColor: colors.slice(0, labels.length),
      }]
    };
  };

  // Calculate summary statistics
  const getTotalRevenue = () => {
    return bills.reduce((sum, bill) => sum + (parseFloat(bill.total) || 0), 0);
  };

  const getAverageMonthlyRevenue = () => {
    const totalRevenue = getTotalRevenue();
    const months = new Set(bills.map(bill => new Date(bill.date).getMonth())).size;
    return months > 0 ? totalRevenue / months : 0;
  };
  
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

  const revenueData = getRevenueData();
  const serviceTypeData = getServiceTypeData();
  const customerData = getCustomerData();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h1>
            <p className="text-gray-600">View and analyze your business performance</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-3">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setActiveTab('revenue')} 
                  variant={activeTab === 'revenue' ? 'primary' : 'secondary'}
                >
                  Revenue Report
                </Button>
                <Button 
                  onClick={() => setActiveTab('services')} 
                  variant={activeTab === 'services' ? 'primary' : 'secondary'}
                >
                  Services Report
                </Button>
                <Button 
                  onClick={() => setActiveTab('customers')} 
                  variant={activeTab === 'customers' ? 'primary' : 'secondary'}
                >
                  Customer Report
                </Button>
                
              </div>
            </Card>
            
            {activeTab === 'revenue' && (
              <>
                <Card title="Monthly Revenue" className="lg:col-span-3">
                  <div className="h-80">
                    <BarChart data={revenueData} height={300} />
                  </div>
                </Card>
                
                <Card title="Revenue Summary">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="font-semibold">₹{getTotalRevenue().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Monthly</span>
                      <span className="font-semibold">₹{getAverageMonthlyRevenue().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Bills</span>
                      <span className="font-semibold">{bills.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paid Bills</span>
                      <span className="text-green-600 font-semibold">{bills.filter(b => b.status === 'Paid').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Bills</span>
                      <span className="text-yellow-600 font-semibold">{bills.filter(b => b.status === 'Pending').length}</span>
                    </div>
                  </div>
                </Card>
                
                <Card title="Recent Bills" className="lg:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bills.slice(0, 5).map((bill) => (
                          <tr key={bill.id}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{bill.invoiceNumber}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{bill.customer}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">₹{parseFloat(bill.total).toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                bill.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {bill.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
            
            {activeTab === 'services' && (
              <>
                <Card title="Services by Type" className="lg:col-span-2">
                  <div className="h-80">
                    <BarChart data={serviceTypeData} height={300} />
                  </div>
                </Card>
                
                <Card title="Service Summary">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Services</span>
                      <span className="font-semibold">{services.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold">{services.filter(s => s.status === 'Completed').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">In Progress</span>
                      <span className="font-semibold">{services.filter(s => s.status === 'In Progress').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Scheduled</span>
                      <span className="font-semibold">{services.filter(s => s.status === 'Scheduled').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cancelled</span>
                      <span className="font-semibold">{services.filter(s => s.status === 'Cancelled').length}</span>
                    </div>
                  </div>
                </Card>
                
                <Card title="Recent Services" className="lg:col-span-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {services.slice(0, 10).map((service) => (
                          <tr key={service.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.customer}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.service}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.technician}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                service.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                service.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                service.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {service.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
            
            {activeTab === 'customers' && (
              <>
                <Card title="Customer Types" className="lg:col-span-2">
                  <div className="h-80">
                    <BarChart data={customerData} height={300} />
                  </div>
                </Card>
                
                <Card title="Customer Summary">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Customers</span>
                      <span className="font-semibold">{customers.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Residential</span>
                      <span className="font-semibold">{customers.filter(c => c.type === 'Residential').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Commercial</span>
                      <span className="font-semibold">{customers.filter(c => c.type === 'Commercial').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Multi-unit</span>
                      <span className="font-semibold">{customers.filter(c => c.type === 'Multi-unit').length}</span>
                    </div>
                  </div>
                </Card>
                
                <Card title="Recent Customers" className="lg:col-span-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customers.slice(0, 10).map((customer) => (
                          <tr key={customer.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                customer.type === 'Residential' ? 'bg-green-100 text-green-800' :
                                customer.type === 'Commercial' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {customer.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
