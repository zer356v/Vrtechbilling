// Mock data for charts and statistics

// Monthly revenue data for the current year
const getMonthlyRevenueData = () => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Revenue',
          data: [12000, 19000, 15000, 22000, 25000, 30000, 28000, 32000, 35000, 29000, 33000, 37000],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  // Monthly expenses data for the current year
  const getMonthlyExpensesData = () => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Expenses',
          data: [8000, 10000, 9500, 12000, 15000, 18000, 16000, 19000, 20000, 17000, 19500, 21000],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };
  
  // Service completion data
  const getServiceCompletionData = () => {
    return {
      labels: ['Completed', 'In Progress', 'Scheduled', 'Cancelled'],
      datasets: [
        {
          data: [65, 20, 10, 5],
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
  
  // Customer satisfaction data
  const getCustomerSatisfactionData = () => {
    return {
      labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
      datasets: [
        {
          label: 'Customer Feedback',
          data: [45, 30, 20, 5],
          backgroundColor: [
            '#22c55e',  // Green
            '#3b82f6',  // Blue
            '#f59e0b',  // Orange
            '#ef4444'   // Red
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Dashboard overview statistics
  const getDashboardStats = () => {
    return {
      totalRevenue: 317000,
      monthlyRevenue: 37000,
      totalServices: 1245,
      pendingServices: 28,
      activeCustomers: 156,
      completionRate: 92,
      averageServiceValue: 550,
      monthlyGrowth: 8.5
    };
  };
  
  // Recent services
  const getRecentServices = () => {
    return [
      { id: 1, customer: 'Johnson Residence', service: 'AC Installation', date: '2023-05-02', value: 2500, status: 'Completed' },
      { id: 2, customer: 'Tech Solutions Inc.', service: 'Commercial Maintenance', date: '2023-05-02', value: 1800, status: 'In Progress' },
      { id: 3, customer: 'Sarah Williams', service: 'AC Repair', date: '2023-05-01', value: 350, status: 'Completed' },
      { id: 4, customer: 'Riverdale Apartments', service: 'HVAC Overhaul', date: '2023-04-29', value: 5200, status: 'Scheduled' },
      { id: 5, customer: 'Cornerstone Office', service: 'Duct Cleaning', date: '2023-04-28', value: 1200, status: 'Completed' }
    ];
  };
  
  // Service types
  const getServiceTypes = () => {
    return [
      { id: 1, name: 'AC Installation', price: '1200-3500', duration: '4-8 hours' },
      { id: 2, name: 'AC Repair', price: '250-800', duration: '1-4 hours' },
      { id: 3, name: 'Routine Maintenance', price: '150-300', duration: '1-2 hours' },
      { id: 4, name: 'Duct Cleaning', price: '300-1500', duration: '3-5 hours' },
      { id: 5, name: 'HVAC System Replacement', price: '3000-10000', duration: '1-3 days' },
      { id: 6, name: 'Air Quality Testing', price: '200-500', duration: '1-2 hours' },
      { id: 7, name: 'Commercial Servicing', price: '500-2500', duration: '4-8 hours' },
      { id: 8, name: 'Emergency Repair', price: '350-1000', duration: '1-3 hours' },
    ];
  };
  
  // All services data (for services page)
  const getAllServices = () => {
    return [
      { id: 101, customer: 'Johnson Residence', service: 'AC Installation', date: '2023-05-02', value: 2500, status: 'Completed', technician: 'Mike Rogers', notes: 'Installed new energy efficient unit' },
      { id: 102, customer: 'Tech Solutions Inc.', service: 'Commercial Maintenance', date: '2023-05-02', value: 1800, status: 'In Progress', technician: 'Sarah Chen', notes: 'Quarterly maintenance for office building' },
      { id: 103, customer: 'Sarah Williams', service: 'AC Repair', date: '2023-05-01', value: 350, status: 'Completed', technician: 'David Kim', notes: 'Repaired compressor issue' },
      { id: 104, customer: 'Riverdale Apartments', service: 'HVAC Overhaul', date: '2023-04-29', value: 5200, status: 'Scheduled', technician: 'James Wilson', notes: 'Complete system upgrade needed' },
      { id: 105, customer: 'Cornerstone Office', service: 'Duct Cleaning', date: '2023-04-28', value: 1200, status: 'Completed', technician: 'Lisa Morgan', notes: 'Full duct system cleaning' },
      { id: 106, customer: 'Peterson Family', service: 'AC Installation', date: '2023-04-26', value: 2800, status: 'Completed', technician: 'Mike Rogers', notes: 'New unit installed in main and upper floor' },
      { id: 107, customer: 'Downtown Café', service: 'Commercial Repair', date: '2023-04-25', value: 750, status: 'Completed', technician: 'Sarah Chen', notes: 'Fixed freezing issue in kitchen unit' },
      { id: 108, customer: 'Lakeside Hotel', service: 'HVAC Maintenance', date: '2023-04-24', value: 3200, status: 'Completed', technician: 'Team Assignment', notes: 'Annual maintenance for 45 room units' },
      { id: 109, customer: 'Thompson Residence', service: 'Air Quality Testing', date: '2023-04-22', value: 350, status: 'Completed', technician: 'Lisa Morgan', notes: 'Detected mold issue, recommended cleaning' },
      { id: 110, customer: 'City Library', service: 'Duct Replacement', date: '2023-04-20', value: 4200, status: 'In Progress', technician: 'Team Assignment', notes: 'Replacing deteriorated duct sections' }
    ];
  };
  
  // Customer data for bill generation
  const getCustomers = () => {
    return [
      { id: 1, name: 'Johnson Residence', address: '123 Maple Street, Springfield', email: 'johnson@example.com', phone: '555-123-4567' },
      { id: 2, name: 'Tech Solutions Inc.', address: '456 Business Park, Springfield', email: 'contact@techsolutions.com', phone: '555-987-6543' },
      { id: 3, name: 'Sarah Williams', address: '789 Oak Avenue, Springfield', email: 'sarah@example.com', phone: '555-234-5678' },
      { id: 4, name: 'Riverdale Apartments', address: '101 River Road, Springfield', email: 'manager@riverdale.com', phone: '555-345-6789' },
      { id: 5, name: 'Cornerstone Office', address: '202 Main Street, Springfield', email: 'admin@cornerstone.com', phone: '555-456-7890' },
      { id: 6, name: 'Peterson Family', address: '303 Pine Lane, Springfield', email: 'peterson@example.com', phone: '555-567-8901' },
      { id: 7, name: 'Downtown Café', address: '404 Center Street, Springfield', email: 'info@downtowncafe.com', phone: '555-678-9012' },
      { id: 8, name: 'Lakeside Hotel', address: '505 Lake Drive, Springfield', email: 'reservations@lakesidehotel.com', phone: '555-789-0123' }
    ];
  };
  
  export {
    getMonthlyRevenueData,
    getMonthlyExpensesData,
    getServiceCompletionData,
    getCustomerSatisfactionData,
    getDashboardStats,
    getRecentServices,
    getServiceTypes,
    getAllServices,
    getCustomers
  };
  