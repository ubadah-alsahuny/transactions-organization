// File: src/core/DocumentBuilder.js

import { SecurityLayer } from '../layers/SecurityLayer';
import { StaticLayer } from '../layers/StaticLayer';
import { DynamicLayer } from '../layers/DynamicLayer';
import { DataAdapter } from '../adapters/DataAdapter';
import { Document } from './Document';

/**
 * DocumentBuilder - Builder Pattern for constructing documents
 * Fluent interface for building documents step by step
 */
export class DocumentBuilder {
  constructor() {
    this.reset();
  }

  /**
   * Reset builder to initial state
   * @returns {DocumentBuilder} This instance for chaining
   */
  reset() {
    this.documentData = {
      securityLayer: null,
      staticLayer: null,
      dynamicLayer: null,
      metadata: {},
      styles: {},
      components: {}
    };
    return this;
  }

  /**
   * Build security layer with hash
   * @param {string} dataHash - Hash from blockchain/backend
   * @param {Object} config - Security layer configuration
   * @returns {DocumentBuilder} This instance for chaining
   */
  buildSecurityLayer(dataHash, config = {}) {
    this.documentData.securityLayer = new SecurityLayer(dataHash, config);
    this.documentData.metadata.hash = dataHash;
    return this;
  }

  /**
   * Build static layer (logo, header, republic name)
   * @param {Object} data - Static layer data
   * @returns {DocumentBuilder} This instance for chaining
   */
  buildStaticLayer(data) {
    this.documentData.staticLayer = new StaticLayer(data);
    this.documentData.metadata.institution = data.institution;
    return this;
  }

  /**
   * Build dynamic layer (citizen data, transaction data)
   * @param {Object} data - Dynamic layer data
   * @returns {DocumentBuilder} This instance for chaining
   */
  buildDynamicLayer(data) {
    this.documentData.dynamicLayer = new DynamicLayer(data);
    return this;
  }

  /**
   * Set document metadata
   * @param {Object} metadata - Metadata key-value pairs
   * @returns {DocumentBuilder} This instance for chaining
   */
  setMetadata(metadata) {
    this.documentData.metadata = {
      ...this.documentData.metadata,
      ...metadata
    };
    return this;
  }

  /**
   * Set document styles
   * @param {Object} styles - Style overrides
   * @returns {DocumentBuilder} This instance for chaining
   */
  setStyles(styles) {
    this.documentData.styles = {
      ...this.documentData.styles,
      ...styles
    };
    return this;
  }

  /**
   * Add custom component to document
   * @param {string} name - Component name
   * @param {Object} component - Component data
   * @returns {DocumentBuilder} This instance for chaining
   */
  addComponent(name, component) {
    this.documentData.components[name] = component;
    return this;
  }

  /**
   * Build final Document instance
   * @returns {Document} The constructed document
   * @throws {Error} If required layers are missing
   */
  build() {
    // Validate required layers
    if (!this.documentData.securityLayer) {
      throw new Error('Security layer is required. Call buildSecurityLayer() first.');
    }
    if (!this.documentData.staticLayer) {
      throw new Error('Static layer is required. Call buildStaticLayer() first.');
    }
    if (!this.documentData.dynamicLayer) {
      throw new Error('Dynamic layer is required. Call buildDynamicLayer() first.');
    }

    // Create Document instance
    const document = new Document(this.documentData);
    
    // Reset builder for next use
    this.reset();
    
    return document;
  }

  /**
   * Quick build method for common use case
   * @param {Object} data - Complete document data
   * @returns {Document} The constructed document
   */
  static quickBuild(data) {
    const adapted = DataAdapter.adapt(data);
    
    return new DocumentBuilder()
      .buildSecurityLayer(adapted.hash)
      .buildStaticLayer({
        institution: adapted.institution,
        logo: data.logo || adapted.logo
      })
      .buildDynamicLayer({
        citizen: adapted.citizen,
        request: adapted.request,
        intialData: adapted.intialData,
        stepData: adapted.stepData,
        signature: adapted.signature
      })
      .setMetadata({
        version: '1.0',
        createdAt: new Date().toISOString()
      })
      .build();
  }
}

export default DocumentBuilder;