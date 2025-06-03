import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Input from '../components/Input';
import OverviewCard from '../components/OverviewCard';
import { isLoggedIn } from '../utils/authUtils';
import { getSavedBills } from '../utils/billStorage';
import { 
  calculateServiceCompletion,
  generateDashboardStats,
  getRecentServicesData
} from '../utils/dashboardUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentServices, setRecentServices] = useState([]);
  const [serviceStatusData, setServiceStatusData] = useState(null);
  const [showTotalRevenueBills, setShowTotalRevenueBills] = useState(false);
  const [showMonthlyRevenueBills, setShowMonthlyRevenueBills] = useState(false);
  
  // Add form state for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Get real bill data from localStorage
  const allBills = getSavedBills().map(bill => ({
    id: bill.id,
    date: bill.date,
    invoiceNo: bill.invoiceNumber,
    customer: bill.customer,
    grandTotal: parseFloat(bill.total) || 0
  }));

  // Get current month bills
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyBills = allBills.filter(bill => {
    const billDate = new Date(bill.date);
    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
  });
  
  // Calculate monthly revenue data from bills
  const calculateMonthlyRevenueFromBills = () => {
    const monthlyData = Array(12).fill(0);
    
    allBills.forEach(bill => {
      const date = new Date(bill.date);
      if (!isNaN(date.getTime())) {
        const month = date.getMonth();
        monthlyData[month] += bill.grandTotal;
      }
    });
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Revenue',
          data: monthlyData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/');
    } else {
      // Fetch live data from utilities
      refreshDashboardData();
    }
  }, [navigate]);

  // Function to refresh all dashboard data
  const refreshDashboardData = () => {
    // Get live stats from services and billing data
    setStats(generateDashboardStats());
    setRecentServices(getRecentServicesData());
    setServiceStatusData(calculateServiceCompletion());
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter status change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Handle revenue card clicks
  const handleTotalRevenueClick = () => {
    setShowTotalRevenueBills(!showTotalRevenueBills);
    setShowMonthlyRevenueBills(false);
  };

  const handleMonthlyRevenueClick = () => {
    setShowMonthlyRevenueBills(!showMonthlyRevenueBills);
    setShowTotalRevenueBills(false);
  };
  
  // Filter services based on search and filter
  const filteredServices = recentServices.filter(service => {
    const matchesSearch = service.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         service.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Revenue Bills Display Component
  const RevenueBillsDisplay = ({ bills, title }) => (
    <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">
        {bills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No bills found for this period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.invoiceNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{bill.grandTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Simple React-based chart component for line chart
  const LineChart = ({ data, height }) => {
    if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
      return <div className="flex  items-center justify-center h-full">No data available</div>;
    }
    
    const maxValue = Math.max(...data.datasets[0].data);
    const months = data.labels;
    const chartValues = data.datasets[0].data;
    const chartColor = data.datasets[0].borderColor || '#3b82f6';
    
    return (
      <div className="w-full" style={{ height }}>
        <div className="relative h-full flex items-end">
          {chartValues.map((value, index) => {
            const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center justify-end h-full px-1"
              >
                <div 
                  style={{ 
                    height: `${heightPercent}%`,
                    background: `linear-gradient(to top, ${chartColor}, ${chartColor}40)`
                  }}
                  className="w-full rounded-t-md relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {value > 0 ? value.toLocaleString() : '0'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{months[index].substring(0, 3)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Simple React-based chart component for doughnut chart
  const DoughnutChart = ({ data, height }) => {
    if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
      return <div className="flex items-center justify-center h-full">No data available</div>;
    }
    
    const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);
    const colors = data.datasets[0].backgroundColor;
    
    let startAngle = 0;
    
    return (
      <div className="flex flex-col items-center justify-center" style={{ height }}>
        <div className="relative w-40 h-40">
          {total > 0 ? (
            data.datasets[0].data.map((value, index) => {
              if (value === 0) return null;
              
              const percentage = (value / total) * 100;
              const degrees = (percentage / 100) * 360;
              const currentStartAngle = startAngle;
              startAngle += degrees;
              
              return (
                <div 
                  key={index}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    background: `conic-gradient(transparent ${currentStartAngle}deg, ${colors[index]} ${currentStartAngle}deg ${currentStartAngle + degrees}deg, transparent ${currentStartAngle + degrees}deg)`,
                    borderRadius: '50%',
                  }}
                />
              );
            })
          ) : (
            <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-gray-300 rounded-full"></div>
          )}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center"
            style={{ width: '60%', height: '60%' }}
          >
            <span className="text-gray-800 font-medium">{total}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.labels.map((label, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 mr-2 rounded-sm" 
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate real revenue from bills
  const totalRevenue = allBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const revenueData = calculateMonthlyRevenueFromBills();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome to your AC Billing dashboard overview</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div onClick={handleTotalRevenueClick} className="cursor-pointer">
              <OverviewCard
                title="Total Revenue"
                value={`₹${totalRevenue.toLocaleString()}`}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                }
                change={`${allBills.length} total bills`}
                changeType="positive"
              />
            </div>
            
            <div onClick={handleMonthlyRevenueClick} className="cursor-pointer">
              <OverviewCard
                title="Monthly Revenue"
                value={`₹${monthlyRevenue.toLocaleString()}`}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                }
                change={`${monthlyBills.length} bills this month`}
                changeType="positive"
              />
            </div>
            
            <OverviewCard
              title="Total Services"
              value={stats.totalServices}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              }
              change={`${stats.pendingServices} pending`}
              changeType="neutral"
            />
            
            <OverviewCard
              title="Active Customers"
              value={stats.activeCustomers}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              }
              change={`${stats.completionRate}% completion rate`}
              changeType={stats.completionRate >= 80 ? "positive" : stats.completionRate >= 60 ? "neutral" : "negative"}
            />
          </div>

          {/* Revenue Bills Display */}
          {showTotalRevenueBills && (
            <RevenueBillsDisplay bills={allBills} title="All Bills - Total Revenue" />
          )}
          
          {showMonthlyRevenueBills && (
            <RevenueBillsDisplay bills={monthlyBills} title="Current Month Bills - Monthly Revenue" />
          )}
          
          {/* Monthly Revenue Chart - Full Width */}
          <div className="overflow-x-auto">
            <div className="bg-white rounded-lg shadow-md p-5 w-96 mb-6 md:w-full">
              <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
              <div className="h-[300px]">
                <LineChart 
                  data={revenueData} 
                  height={300}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Service Status */}
            <div className="bg-white rounded-lg shadow-md p-5 ">
              <h2 className="text-lg font-semibold mb-4">Service Status</h2>
              <div className="h-64">
                <DoughnutChart 
                  data={serviceStatusData} 
                  height={280}
                />
              </div>
            </div>
            
            {/* Recent Services */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Services</h2>
                <button 
                  className="text-blue-500 hover:text-blue-700 text-sm"
                  onClick={() => navigate('/services')}
                >
                  View All
                </button>
              </div>
              
              {/* Add search and filter functionality */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1">
                  <input
                    placeholder="Search services or customers..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    name="search"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="w-48">
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <tr key={service.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.service}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.date}</td>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No services found matching your search
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
