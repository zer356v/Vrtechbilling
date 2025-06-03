/**
 * @typedef {Object} SavedTechnician
 * @property {string} id - Unique identifier for the technician
 * @property {string} name - Technician name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} createdAt - Creation timestamp
 */

const TECHNICIANS_STORAGE_KEY = 'saved_technicians';

/**
 * Save a new technician to local storage
 * @param {Object} technicianData - Technician data without id and createdAt
 * @returns {SavedTechnician} The saved technician with generated fields
 */
export const saveTechnician = (technicianData) => {
  const technicians = getSavedTechnicians();
  
  const newTechnician = {
    ...technicianData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };

  technicians.push(newTechnician);
  localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
  return newTechnician;
};

/**
 * Get all saved technicians from local storage
 * @returns {Array<SavedTechnician>} Array of saved technicians
 */
export const getSavedTechnicians = () => {
  const stored = localStorage.getItem(TECHNICIANS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Get a technician by its ID
 * @param {string} id - Technician ID
 * @returns {SavedTechnician|null} The technician if found, null otherwise
 */
export const getTechnicianById = (id) => {
  const technicians = getSavedTechnicians();
  return technicians.find(technician => technician.id === id) || null;
};

/**
 * Update an existing technician
 * @param {string} id - Technician ID
 * @param {Object} technicianData - Updated technician data
 */
export const updateTechnician = (id, technicianData) => {
  const technicians = getSavedTechnicians();
  const technicianIndex = technicians.findIndex(technician => technician.id === id);
  if (technicianIndex !== -1) {
    technicians[technicianIndex] = {
      ...technicians[technicianIndex],
      ...technicianData
    };
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
  }
};

/**
 * Delete a technician from storage
 * @param {string} id - Technician ID to delete
 * @returns {boolean} True if technician was found and deleted, false otherwise
 */
export const deleteTechnician = (id) => {
  const technicians = getSavedTechnicians();
  const technicianIndex = technicians.findIndex(technician => technician.id === id);
  
  if (technicianIndex !== -1) {
    technicians.splice(technicianIndex, 1);
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
    return true;
  }
  
  return false;
};
