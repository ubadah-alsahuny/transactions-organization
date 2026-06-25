// File: src/index.js

import { DocumentLibrary } from './core/DocumentLibrary';
import { DocumentBuilder } from './core/DocumentBuilder';
import { Document } from './core/Document';
import { SecurityLayer } from './layers/SecurityLayer';
import { StaticLayer } from './layers/StaticLayer';
import { DynamicLayer } from './layers/DynamicLayer';
import { DataAdapter } from './adapters/DataAdapter';
import { constants } from './utils/constants';
import { default as helpers } from './utils/helpers';

export {
  DocumentLibrary,
  DocumentBuilder,
  Document,
  SecurityLayer,
  StaticLayer,
  DynamicLayer,
  DataAdapter,
  constants,
  helpers
};

// Styles (imported for bundling)
import './styles/document.css';
import './styles/print.css';

export default {
  DocumentLibrary,
  DocumentBuilder,
  Document,
  SecurityLayer,
  StaticLayer,
  DynamicLayer,
  DataAdapter,
  constants,
  helpers
};