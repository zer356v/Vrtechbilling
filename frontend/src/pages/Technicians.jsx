import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { isLoggedIn } from '../utils/authUtils';
import { 
  getSavedTechnicians, 
  saveTechnician, 
  updateTechnician, 
  deleteTechnician 
} from '../utils/technicianStorage';

const Technicians = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/');
    } else {
      loadTechnicians();
      setLoading(false);
    }
  }, [navigate]);

  const loadTechnicians = () => {
    const savedTechnicians = getSavedTechnicians();
    setTechnicians(savedTechnicians);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEdit = (technician) => {
    setEditingTechnician(technician);
    setFormData({
      name: technician.name,
      email: technician.email,
      phone: technician.phone
    });
    setShowForm(true);
  };

  const handleDelete = (technicianId) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      deleteTechnician(technicianId);
      loadTechnicians();
    }
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (editingTechnician) {
      updateTechnician(editingTechnician.id, formData);
    } else {
      saveTechnician(formData);
    }
    
    loadTechnicians();
    setShowForm(false);
    setEditingTechnician(null);
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTechnician(null);
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
  };
  
  const filteredTechnicians = technicians.filter((technician) => {
    const matchesSearch = technician.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          technician.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
              <h1 className="text-2xl font-semibold text-gray-800">Technicians</h1>
              <p className="text-gray-600">Manage your technician database</p>
            </div>
            
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="mt-4 md:mt-0"
            >
              {showForm ? 'Cancel' : 'Add New Technician'}
            </Button>
          </div>
          
          {showForm && (
            <Card title={editingTechnician ? 'Edit Technician' : 'Add New Technician'} className="mb-6">
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Technician Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter technician name"
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button type="button" variant="secondary" onClick={handleCancelForm}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingTechnician ? 'Update Technician' : 'Save Technician'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          <Card className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search technicians by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  name="search"
                />
              </div>
            </div>
            
            {filteredTechnicians.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {technicians.length === 0 
                  ? 'No technicians found. Add your first technician using the "Add New Technician" button.'
                  : 'No technicians found matching your search.'
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTechnicians.map((technician) => (
                      <tr key={technician.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{technician.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>{technician.email}</div>
                          <div>{technician.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(technician)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(technician.id)}
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

export default Technicians;
