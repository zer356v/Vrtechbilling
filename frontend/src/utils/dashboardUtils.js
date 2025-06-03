import { getSavedServices } from './serviceStorage';
import { getCustomers } from './chartData';

// Calculate service completion data
export const calculateServiceCompletion = () => {
  const services = getSavedServices();
  
  const statusCounts = services.reduce((counts, service) => {
    counts[service.status] = (counts[service.status] || 0) + 1;
    return counts;
  }, {});
  
  return {
    labels: ['Completed', 'In Progress', 'Scheduled', 'Cancelled'],
    datasets: [
      {
        data: [
          statusCounts['Completed'] || 0,
          statusCounts['In Progress'] || 0,
          statusCounts['Scheduled'] || 0,
          statusCounts['Cancelled'] || 0,
        ],
        backgroundColor: [
          '#22c55e',  // Green
          '#3b82f6',  // Blue
          '#f59e0b',  // Orange
          '#ef4444'   // Red
        ],
        hoverOffset: 4
      }
    ]
  };
};

// Generate dashboard statistics based on current data
export const generateDashboardStats = () => {
  const services = getSavedServices();
  const customers = getCustomers();
  
  const totalRevenue = services.reduce((sum, service) => sum + (service.value || 0), 0);
  
  // Calculate current month's revenue
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthRevenue = services
    .filter(service => {
      const serviceDate = new Date(service.date);
      return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
    })
    .reduce((sum, service) => sum + (service.value || 0), 0);
  
  // Calculate previous month's revenue for growth calculation
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const previousMonthRevenue = services
    .filter(service => {
      const serviceDate = new Date(service.date);
      return serviceDate.getMonth() === previousMonth && serviceDate.getFullYear() === previousYear;
    })
    .reduce((sum, service) => sum + (service.value || 0), 0);
  
  // Calculate month-over-month growth
  const monthlyGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : 0;
  
  // Count services by status
  const pendingServices = services.filter(service => 
    service.status === 'In Progress' || service.status === 'Scheduled'
  ).length;
  
  // Count unique customers (active)
  const activeCustomerIds = new Set();
  services.forEach(service => {
    const customerName = service.customer;
    const customer = customers.find(c => c.name === customerName);
    if (customer) {
      activeCustomerIds.add(customer.id);
    } else {
      // If customer not found in mock data, still count them
      activeCustomerIds.add(customerName);
    }
  });
  
  // Calculate service completion rate
  const completedServices = services.filter(service => service.status === 'Completed').length;
  const completionRate = services.length > 0 ? Math.round((completedServices / services.length) * 100) : 0;
  
  // Calculate average service value
  const averageServiceValue = services.length > 0 
    ? Math.round(totalRevenue / services.length) 
    : 0;
  
  return {
    totalRevenue,
    monthlyRevenue: currentMonthRevenue,
    totalServices: services.length,
    pendingServices,
    activeCustomers: activeCustomerIds.size,
    completionRate,
    averageServiceValue,
    monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1))
  };
};

// Get recent services (latest 5)
export const getRecentServicesData = () => {
  try {
    const services = getSavedServices();
    
    if (!services || !Array.isArray(services)) {
      console.error("Services data is not available or not an array");
      return [];
    }
    
    // Make a copy of the array to avoid mutation issues
    return [...services]
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Check for invalid dates
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn("Invalid date encountered in services data");
          return 0;
        }
        
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  } catch (error) {
    console.error("Error in getRecentServicesData:", error);
    return [];
  }
};
