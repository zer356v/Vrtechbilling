/**
 * @typedef {Object} SavedCustomer
 * @property {string} id - Unique identifier for the customer
 * @property {string} name - Customer name
 * @property {string} email - Customer email
 * @property {string} phone - Customer phone number
 * @property {string} address - Customer address
 * @property {'Residential' | 'Commercial' | 'Multi-unit'} type - Customer type
 * @property {string} createdAt - Creation timestamp
 */

const CUSTOMERS_STORAGE_KEY = 'saved_customers';

/**
 * Save a new customer to local storage
 * @param {Object} customerData - Customer data without id and createdAt
 * @returns {SavedCustomer} The saved customer with generated fields
 */
export const saveCustomer = (customerData) => {
  const customers = getSavedCustomers();
  
  const newCustomer = {
    ...customerData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };

  customers.push(newCustomer);
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  return newCustomer;
};

/**
 * Get all saved customers from local storage
 * @returns {Array<SavedCustomer>} Array of saved customers
 */
export const getSavedCustomers = () => {
  const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Get a customer by its ID
 * @param {string} id - Customer ID
 * @returns {SavedCustomer|null} The customer if found, null otherwise
 */
export const getCustomerById = (id) => {
  const customers = getSavedCustomers();
  return customers.find(customer => customer.id === id) || null;
};

/**
 * Update a customer's information
 * @param {string} id - Customer ID
 * @param {Object} customerData - Updated customer data
 * @returns {boolean} True if customer was found and updated, false otherwise
 */
export const updateCustomer = (id, customerData) => {
  const customers = getSavedCustomers();
  const customerIndex = customers.findIndex(customer => customer.id === id);
  
  if (customerIndex !== -1) {
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...customerData
    };
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    return true;
  }
  
  return false;
};

/**
 * Delete a customer from storage
 * @param {string} id - Customer ID to delete
 * @returns {boolean} True if customer was found and deleted, false otherwise
 */
export const deleteCustomer = (id) => {
  const customers = getSavedCustomers();
  const customerIndex = customers.findIndex(customer => customer.id === id);
  
  if (customerIndex !== -1) {
    customers.splice(customerIndex, 1);
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    return true;
  }
  
  return false;
};
