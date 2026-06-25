// File: src/utils/helpers.js

/**
 * Generate a deterministic hash from a string
 * @param {string} str - Input string
 * @returns {string} Hex hash
 */
export function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clean object keys (remove special chars, convert to camelCase)
 * @param {Object} obj - Input object
 * @returns {Object} Cleaned object
 */
export function cleanKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = key
      .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
    cleaned[cleanKey] = value;
  }
  return cleaned;
}

/**
 * Check if string is valid UUID
 * @param {string} str - Input string
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export default {
  generateHash,
  formatDate,
  capitalize,
  cleanKeys,
  isValidUUID,
  deepClone,
  generateId
};