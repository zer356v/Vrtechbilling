/**
 * @typedef {Object} SavedService
 * @property {string} id - Unique identifier for the service
 * @property {string} customer - Customer name
 * @property {string} phone - Customer phone number
 * @property {string} address - Customer address
 * @property {string} service - Service type
 * @property {string} date - Service date
 
 * @property {string} technician - Technician assigned
 * @property {'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'} status - Service status
 * @property {string} notes - Additional notes
 * @property {string} createdAt - Creation timestamp
 */

const SERVICES_STORAGE_KEY = 'saved_services';

/**
 * Save a new service to local storage
 * @param {Omit<SavedService, 'id' | 'createdAt'>} serviceData - Service data without id and createdAt
 * @returns {SavedService} The saved service with generated fields
 */
export const saveService = (serviceData) => {
  const services = getSavedServices();
  
  const newService = {
    ...serviceData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };

  services.push(newService);
  localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  return newService;
};

/**
 * Get all saved services from local storage
 * @returns {Array<SavedService>} Array of saved services
 */
export const getSavedServices = () => {
  const stored = localStorage.getItem(SERVICES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Get a service by its ID
 * @param {string} id - Service ID
 * @returns {SavedService|null} The service if found, null otherwise
 */
export const getServiceById = (id) => {
  const services = getSavedServices();
  return services.find(service => service.id === id) || null;
};

/**
 * Update the status of a service
 * @param {string} id - Service ID
 * @param {'Scheduled'|'In Progress'|'Completed'|'Cancelled'} status - New status
 */
export const updateServiceStatus = (id, status) => {
  const services = getSavedServices();
  const index = services.findIndex(service => service.id === id);
  if (index !== -1) {
    services[index].status = status;
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  }
};

/**
 * Delete a service from storage
 * @param {string} id - Service ID to delete
 * @returns {boolean} True if service was found and deleted, false otherwise
 */
export const deleteService = (id) => {
  const services = getSavedServices();
  const index = services.findIndex(service => service.id === id);
  if (index !== -1) {
    services.splice(index, 1);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    return true;
  }
  return false;
};
