// Date formatting utilities for consistent date display across the app

/**
 * Format date to DD/MM/YYYY format
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format date to DD/MM/YYYY HH:MM format
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
