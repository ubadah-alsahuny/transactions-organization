import { DocumentBuilder } from './DocumentBuilder';
import { DataAdapter } from '../adapters/DataAdapter';
import { EventManager } from '../observers/EventManager';
import { constants } from '../utils/constants';

/**
 * DocumentLibrary - Singleton Pattern
 * Main entry point for document generation
 */
export class DocumentLibrary {
  static instance = null;

  constructor(config = {}) {
    if (DocumentLibrary.instance) {
      return DocumentLibrary.instance;
    }

    this.config = {
      defaultLogo: constants.DEFAULT_LOGO,
      defaultStamp: constants.DEFAULT_STAMP,
      primaryColor: constants.PRIMARY_COLOR,
      fontFamily: constants.FONT_FAMILY,
      ...config
    };

    this.events = new EventManager();
    DocumentLibrary.instance = this;
  }

  static getInstance(config) {
    if (!DocumentLibrary.instance) {
      DocumentLibrary.instance = new DocumentLibrary(config);
    }
    return DocumentLibrary.instance;
  }

  createDocument(rawData, options = {}) {
    try {
      this.events.notify('beforeCreate', { data: rawData });

      const adapted = DataAdapter.adapt(rawData);

      const builder = new DocumentBuilder()
        .buildStaticLayer({
          institution: adapted.institution,
          logo: adapted.logo || this.config.defaultLogo
        })
        .buildDynamicLayer({
          citizen: adapted.citizen,
          request: adapted.request,
          intialData: adapted.intialData,
          stepData: adapted.stepData,
          signature: adapted.signature
        })
        .setMetadata({
          id: adapted.request?.id || 'document',
          hash: adapted.hash,
          version: '1.0',
          createdAt: new Date().toISOString(),
          generator: 'DocumentLibrary',
          documentId: adapted.request?.id || '',
          citizen: adapted.citizen,
          institution: adapted.institution
        })
        .setStyles({
          primaryColor: this.config.primaryColor,
          fontFamily: this.config.fontFamily
        });

      // Security layers only for full PDF generation (not preview)
      if (!options.previewOnly) {
        builder.buildSecurityLayer(adapted.hash);
        builder.buildGuillocheLayer(adapted.hash);
      }

      const document = builder.build();

      this.events.notify('afterCreate', { document });
      return document;
    } catch (error) {
      this.events.notify('error', { error });
      throw error;
    }
  }

  async exportDocument(document, strategy = 'print', options = {}) {
    try {
      this.events.notify('beforeExport', { document, strategy });

      let result;
      switch (strategy) {
        case 'print':
          document.print();
          result = true;
          break;
        case 'pdf':
          await document.toPDF(options.filename || 'document.pdf');
          result = true;
          break;
        default:
          throw new Error(`Unknown strategy: ${strategy}`);
      }

      this.events.notify('afterExport', { document, strategy, result });
      return result;
    } catch (error) {
      this.events.notify('error', { error });
      throw error;
    }
  }

  on(event, callback) {
    return this.events.subscribe(event, callback);
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
    return this;
  }

  getConfig() {
    return { ...this.config };
  }
}

export default DocumentLibrary;