import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { isLoggedIn, getCurrentUser, logoutUser } from '../utils/authUtils';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Manager'
  });
  
  // Company form state
  const [companyForm, setCompanyForm] = useState({
    companyName: 'AC Billing Solutions',
    address: '123 Business Avenue, Tech City, CA 94043',
    phone: '(555) 123-4567',
    email: 'contact@acbilling.com',
    website: 'www.acbilling.com',
    taxId: '12-3456789'
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    serviceReminders: true,
    billingNotifications: true,
    marketingEmails: false
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/');
    } else {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: '(555) 987-6543',
        position: 'Administrator'
      });
      setLoading(false);
    }
  }, [navigate]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm({
      ...companyForm,
      [name]: value
    });
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({
      ...notifications,
      [name]: checked
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handleSaveProfile = (e) => {
    e.preventDefault();
    // In a real app, save to API
    alert('Profile updated successfully!');
  };
  
  const handleSaveCompany = (e) => {
    e.preventDefault();
    // In a real app, save to API
    alert('Company information updated successfully!');
  };
  
  const handleSaveNotifications = (e) => {
    e.preventDefault();
    // In a real app, save to API
    alert('Notification preferences updated successfully!');
  };
  
  const handleChangePassword = (e) => {
    e.preventDefault();
    // In a real app, validate and change password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match!');
      return;
    }
    alert('Password updated successfully!');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const handleLogout = () => {
    logoutUser();
    navigate('/');
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
            <p className="text-gray-600">Manage your account and application preferences</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="w-full md:w-64 space-y-2">
              <Button 
                onClick={() => setActiveTab('profile')} 
                variant={activeTab === 'profile' ? 'primary' : 'outline'} 
                fullWidth
              >
                Profile Settings
              </Button>
              
              <Button 
                onClick={() => setActiveTab('company')} 
                variant={activeTab === 'company' ? 'primary' : 'outline'} 
                fullWidth
              >
                Company Information
              </Button>
              
              <Button 
                onClick={() => setActiveTab('notifications')} 
                variant={activeTab === 'notifications' ? 'primary' : 'outline'} 
                fullWidth
              >
                Notification Settings
              </Button>
              
              <Button 
                onClick={() => setActiveTab('security')} 
                variant={activeTab === 'security' ? 'primary' : 'outline'} 
                fullWidth
              >
                Security
              </Button>
              
              <div className="pt-4">
                <Button 
                  onClick={handleLogout} 
                  variant="danger" 
                  fullWidth
                >
                  Logout
                </Button>
              </div>
            </div>
            
            {/* Settings Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <Card title="Profile Settings">
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {profileForm.name.split(' ').map(name => name[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{profileForm.name}</h3>
                        <p className="text-gray-500">{profileForm.position}</p>
                        <button type="button" className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                          Change Profile Picture
                        </button>
                      </div>
                    </div>
                    
                    <Input
                      label="Full Name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      required
                    />
                    
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email"
                      required
                    />
                    
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Position
                      </label>
                      <select
                        name="position"
                        value={profileForm.position}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Manager">Manager</option>
                        <option value="Technician">Technician</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Receptionist">Receptionist</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" variant="primary">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
              
              {activeTab === 'company' && (
                <Card title="Company Information">
                  <form onSubmit={handleSaveCompany} className="space-y-4">
                    <Input
                      label="Company Name"
                      name="companyName"
                      value={companyForm.companyName}
                      onChange={handleCompanyChange}
                      placeholder="Enter company name"
                      required
                    />
                    
                    <Input
                      label="Address"
                      name="address"
                      value={companyForm.address}
                      onChange={handleCompanyChange}
                      placeholder="Enter company address"
                      required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number"
                        name="phone"
                        value={companyForm.phone}
                        onChange={handleCompanyChange}
                        placeholder="Enter company phone"
                        required
                      />
                      
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={companyForm.email}
                        onChange={handleCompanyChange}
                        placeholder="Enter company email"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Website"
                        name="website"
                        value={companyForm.website}
                        onChange={handleCompanyChange}
                        placeholder="Enter company website"
                      />
                      
                      <Input
                        label="Tax ID / EIN"
                        name="taxId"
                        value={companyForm.taxId}
                        onChange={handleCompanyChange}
                        placeholder="Enter tax ID or EIN"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" variant="primary">
                        Save Company Information
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
              
              {activeTab === 'notifications' && (
                <Card title="Notification Preferences">
                  <form onSubmit={handleSaveNotifications} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="emailAlerts"
                          name="emailAlerts"
                          type="checkbox"
                          checked={notifications.emailAlerts}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="emailAlerts" className="ml-2 block text-sm text-gray-900">
                          Email alerts for service requests
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="serviceReminders"
                          name="serviceReminders"
                          type="checkbox"
                          checked={notifications.serviceReminders}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="serviceReminders" className="ml-2 block text-sm text-gray-900">
                          Service reminders and follow-ups
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="billingNotifications"
                          name="billingNotifications"
                          type="checkbox"
                          checked={notifications.billingNotifications}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="billingNotifications" className="ml-2 block text-sm text-gray-900">
                          Billing and payment notifications
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="marketingEmails"
                          name="marketingEmails"
                          type="checkbox"
                          checked={notifications.marketingEmails}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="marketingEmails" className="ml-2 block text-sm text-gray-900">
                          Marketing emails and newsletters
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button type="submit" variant="primary">
                        Save Preferences
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
              
              {activeTab === 'security' && (
                <Card title="Security Settings">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                    />
                    
                    <Input
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      required
                    />
                    
                    <Input
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      required
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" variant="primary">
                        Change Password
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
