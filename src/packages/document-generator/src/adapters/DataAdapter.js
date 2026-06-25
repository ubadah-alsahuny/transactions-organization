// File: src/adapters/DataAdapter.js

import { generateHash, cleanKeys, formatDate } from '../utils/helpers';
import { constants } from '../utils/constants';

/**
 * DataAdapter - Transforms API data to unified document structure
 */
export class DataAdapter {
  /**
   * Main adapt method - converts raw API data to unified format
   * @param {Object} rawData - Raw data from API
   * @returns {Object} Unified document data
   */
  static adapt(rawData) {
    if (!rawData) {
      throw new Error('No data provided to adapt');
    }

    return {
      citizen: this.adaptCitizen(rawData.citizen || rawData.data?.citizen || {}),
      request: this.adaptRequest(rawData.request || rawData.data?.request || rawData.data || {}),
      institution: this.adaptInstitution(rawData.institution || rawData.data?.institution || {}),
      intialData: this.adaptInitialData(rawData.intialData || rawData.data?.intialData || {}),
      stepData: this.adaptStepData(rawData.stepData || rawData.data?.stepData || []),
      signature: this.adaptSignature(rawData.signature || rawData.data?.signature || {}),
      hash: rawData.dataHash || rawData.hash || this.generateHashFromData(rawData),
      metadata: this.adaptMetadata(rawData.metadata || rawData.data?.metadata || {})
    };
  }

  /**
   * Adapt citizen data
   * @param {Object} citizen - Raw citizen data
   * @returns {Object} Normalized citizen data
   */
  static adaptCitizen(citizen) {
    return {
      id: citizen.id || citizen.userId || null,
      name: citizen.fullName || citizen.name || citizen.full_name || '',
      nationalId: citizen.nationalId || citizen.national_id || citizen.nid || '',
      birthDate: citizen.dateOfBirth || citizen.birthDate || citizen.birth_date || '',
      motherName: citizen.motherName || citizen.mother_name || '',
      phone: citizen.phone || citizen.phoneNumber || citizen.phone_number || '',
      email: citizen.email || '',
      isActive: citizen.isActive !== undefined ? citizen.isActive : true
    };
  }

  /**
   * Adapt request/transaction data
   * @param {Object} request - Raw request data
   * @returns {Object} Normalized request data
   */
  static adaptRequest(request) {
    return {
      id: request.id || request.requestId || request.request_id || '',
      type: request.transactionName || request.type || request.name || '',
      status: request.requestStatus || request.status || constants.REQUEST_STATUS.PENDING,
      currentStep: request.currentStep || request.current_step || 0,
      createdAt: request.createdAt || request.created_at || new Date().toISOString(),
      updatedAt: request.updatedAt || request.updated_at || new Date().toISOString(),
      completedAt: request.completedAt || request.completed_at || null
    };
  }

  /**
   * Adapt institution data
   * @param {Object} institution - Raw institution data
   * @returns {Object} Normalized institution data
   */
  static adaptInstitution(institution) {
    return {
      id: institution.id || institution.institutionId || institution.institution_id || '',
      name: institution.name || '',
      status: institution.status || 'active',
      description: institution.description || '',
      sectionsCount: institution.sectionsCount || institution.sections_count || 0
    };
  }

  /**
   * Adapt initial data from transaction
   * @param {Object} data - Raw initial data (dynamic key-value pairs)
   * @returns {Object} Cleaned initial data
   */
  static adaptInitialData(data) {
    if (!data || typeof data !== 'object') return {};
    
    // Clean keys and keep values as-is
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      // Remove special characters, keep Arabic/English
      const cleanKey = key
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      cleaned[cleanKey] = value;
    }
    return cleaned;
  }

  /**
   * Adapt step data from transaction workflow
   * @param {Array} steps - Array of step objects
   * @returns {Object} Normalized step data with notes
   */
  static adaptStepData(steps) {
    if (!Array.isArray(steps)) return {};

    const result = {};
    const notes = [];

    steps.forEach((step, index) => {
      const sectionName = step.sectionName || step.section_name || `step_${step.stepOrder || index + 1}`;
      
      // Store in structured format
      result[sectionName] = {
        order: step.stepOrder || step.order || index + 1,
        sectionId: step.sectionId || step.section_id || '',
        status: step.status || 'pending',
        note: step.data?.note || step.note || '',
        description: step.data?.description || step.description || '',
        employee: step.employeeName || step.employee_name || '',
        employeeId: step.employeeId || step.employee_id || '',
        processedAt: step.processedAt || step.processed_at || null,
        data: step.data || {}
      };

      // Collect all notes for display
      if (result[sectionName].note) {
        notes.push({
          section: sectionName,
          note: result[sectionName].note,
          employee: result[sectionName].employee,
          date: result[sectionName].processedAt
        });
      }
    });

    // Add aggregated notes
    result._allNotes = notes;
    result._totalSteps = steps.length;
    result._completedSteps = steps.filter(s => s.status === 'approved' || s.status === 'completed').length;

    return result;
  }

  /**
   * Adapt signature data
   * @param {Object} signature - Raw signature data
   * @returns {Object} Normalized signature data
   */
  static adaptSignature(signature) {
    return {
      name: signature.signerName || signature.name || '',
      title: signature.signerTitle || signature.title || '',
      date: signature.signatureDate || signature.date || new Date().toISOString(),
      stamp: signature.stamp || signature.stampUrl || '',
      isDigital: signature.isDigital !== undefined ? signature.isDigital : false
    };
  }

  /**
   * Adapt metadata
   * @param {Object} metadata - Raw metadata
   * @returns {Object} Normalized metadata
   */
  static adaptMetadata(metadata) {
    return {
      version: metadata.version || '1.0',
      generator: metadata.generator || 'DocumentGenerator',
      generatedAt: metadata.generatedAt || new Date().toISOString(),
      ...metadata
    };
  }

  /**
   * Generate hash from data if not provided
   * @param {Object} data - Raw data
   * @returns {string} Generated hash
   */
  static generateHashFromData(data) {
    const str = JSON.stringify({
      citizen: data.citizen?.id || data.citizen?.nationalId,
      request: data.request?.id,
      institution: data.institution?.id,
      timestamp: Date.now()
    });
    return generateHash(str);
  }

  /**
   * Validate adapted data
   * @param {Object} data - Adapted data
   * @returns {Object} Validation result
   */
  static validate(data) {
    const errors = [];

    if (!data.citizen?.name) {
      errors.push('Citizen name is required');
    }
    if (!data.citizen?.nationalId) {
      errors.push('Citizen national ID is required');
    }
    if (!data.request?.id) {
      errors.push('Request ID is required');
    }
    if (!data.institution?.name) {
      errors.push('Institution name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default DataAdapter;