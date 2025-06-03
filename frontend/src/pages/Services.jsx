import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { isLoggedIn } from '../utils/authUtils';
import { getSavedServices, saveService, deleteService, updateServiceStatus } from '../utils/serviceStorage';
import { getSavedTechnicians } from '../utils/technicianStorage';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    customer: '',
    service: '',
    date: '',
    address:'',
    phone:'',
  
    technician: '',
    status: 'Scheduled',
    notes: ''
  });
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/');
    } else {
      loadServices();
      loadTechnicians();
    }
  }, [navigate]);

  const loadServices = () => {
    const savedServices = getSavedServices();
    setServices(savedServices);
  };

  const loadTechnicians = () => {
    const savedTechnicians = getSavedTechnicians();
    setTechnicians(savedTechnicians);
  };
  
  useEffect(() => {
    let result = services;
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(service => service.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(service => 
        service.customer.toLowerCase().includes(query) ||
        service.service.toLowerCase().includes(query) ||
        service.technician?.toLowerCase().includes(query)
      );
    }
    
    setFilteredServices(result);
  }, [services, statusFilter, searchQuery]);

  const sendWhatsAppMessage = (phoneNumber, serviceDetails) => {
    const message = `New Service Assignment:
Customer: ${serviceDetails.customer}
Address: ${serviceDetails.address}
Phone: ${serviceDetails.phone}
Service: ${serviceDetails.service}
Date: ${serviceDetails.date}
Status: ${serviceDetails.status}
Notes: ${serviceDetails.notes || 'No additional notes'}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNewServiceSubmit = (e) => {
    e.preventDefault();
    if (newService.customer && newService.service && newService.date) {
      const savedService = saveService(newService);
      
      // Find technician and send WhatsApp message
      if (newService.technician) {
        const assignedTechnician = technicians.find(tech => tech.name === newService.technician);
        if (assignedTechnician && assignedTechnician.phone) {
          sendWhatsAppMessage(assignedTechnician.phone, savedService);
        }
      }
      
      setNewService({
        customer: '',
        service: '',
        address:'',
        phone:'',
        date: '',
        
        technician: '',
        status: 'Scheduled',
        notes: ''
      });
      setShowNewServiceForm(false);
      loadServices();
    }
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteService(serviceId);
      loadServices();
    }
  };

  const handleStatusChange = (serviceId, newStatus) => {
    updateServiceStatus(serviceId, newStatus);
    loadServices();
  };

  const statusOptions = ['All', 'Completed', 'In Progress', 'Scheduled', 'Cancelled'];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Services</h1>
              <p className="text-gray-600">Manage and track all your AC services</p>
            </div>
            
            <button
              className="mt-4 md:mt-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
              onClick={() => setShowNewServiceForm(!showNewServiceForm)}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Service
              </span>
            </button>
          </div>

          {/* New Service Form */}
          {showNewServiceForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Add New Service</h2>
              <form onSubmit={handleNewServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={newService.customer}
                    onChange={(e) => setNewService({...newService, customer: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
                  <input
                    type="text"
                    value={newService.address}
                    onChange={(e) => setNewService({...newService, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Customer Address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone No</label>
                  <input
                    type="number"
                    value={newService.phone}
                    onChange={(e) => setNewService({...newService, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter  Customer Phone No"
                    required
                  />
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <input
                    type="text"
                    value={newService.service}
                    onChange={(e) => setNewService({...newService, service: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter service type"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
                  <input
                    type="date"
                    value={newService.date}
                    onChange={(e) => setNewService({...newService, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                  <select
                    value={newService.technician}
                    onChange={(e) => setNewService({...newService, technician: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Technician</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.name}>{tech.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newService.status}
                    onChange={(e) => setNewService({...newService, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newService.notes}
                    onChange={(e) => setNewService({...newService, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                
                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-all"
                  >
                    Save Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewServiceForm(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Filter and search controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer or service..."
                  className="px-4 py-2 border border-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end md:col-span-2">
                <button
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all w-full"
                  onClick={() => {
                    setStatusFilter('All');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Service listing */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">
              Service Records ({filteredServices.length})
            </h2>
            
            {filteredServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No services found matching your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <tr key={service.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.service}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.date}</td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.technician}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={service.status}
                            onChange={(e) => handleStatusChange(service.id, e.target.value)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              service.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              service.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              service.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button 
                            onClick={() => handleDeleteService(service.id)}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Services;
