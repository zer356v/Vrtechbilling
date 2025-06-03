// src/utils/authUtils.js

// Mock authentication functionality (would be replaced with real authentication later)
const USERS_STORAGE_KEY = 'ac_billing_users';
const CURRENT_USER_KEY = 'ac_billing_current_user';

// Initialize local storage with sample admin if empty
const initializeUsers = () => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  if (!users) {
    const initialUsers = [
      {
        id: 1,
        email: 'admin@acbilling.com',
        password: 'admin@123', // In a real app, this would be hashed
        name: 'Admin User',
        role: 'admin'
      }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
  }
};

// Get all users
const getUsers = () => {
  initializeUsers();
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
};

// Register a new user
const registerUser = (email, password, name) => {
  const users = getUsers();
  const existingUser = users.find(user => user.email === email);
  
  if (existingUser) {
    throw new Error('User already exists with this email');
  }
  
  const newUser = {
    id: users.length + 1,
    email,
    password, // In a real app, this would be hashed
    name,
    role: 'admin' // All users are admins for now
  };
  
  const updatedUsers = [...users, newUser];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  
  return { success: true, user: { ...newUser, password: undefined } };
};

// Login a user
const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Store current user in local storage (session)
  const userWithoutPassword = { ...user, password: undefined };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  
  return { success: true, user: userWithoutPassword };
};

// Check if user is logged in
const isLoggedIn = () => {
  return localStorage.getItem(CURRENT_USER_KEY) !== null;
};

// Get current user
const getCurrentUser = () => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  return JSON.parse(userJson);
};

// Logout user
const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  return { success: true };
};

export {
  initializeUsers,
  registerUser,
  loginUser,
  isLoggedIn,
  getCurrentUser,
  logoutUser
};
