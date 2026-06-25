declare class Document {
  preview(): Window | null;
  print(): void;
  toPDF(filename?: string): Promise<void>;
  render(): string;
  renderToElement(): HTMLElement;
}

interface DocumentLibraryConfig {
  primaryColor?: string;
  fontFamily?: string;
  defaultLogo?: string;
  defaultStamp?: string;
}

export class DocumentLibrary {
  static instance: DocumentLibrary | null;
  constructor(config?: DocumentLibraryConfig);
  static getInstance(config?: DocumentLibraryConfig): DocumentLibrary;
  createDocument(rawData: Record<string, any>): Document;
}

export class DocumentBuilder {
  constructor();
  buildSecurityLayer(dataHash: string, config?: Record<string, any>): this;
  buildStaticLayer(data: Record<string, any>): this;
  buildDynamicLayer(data: Record<string, any>): this;
  setMetadata(metadata: Record<string, any>): this;
  setStyles(styles: Record<string, any>): this;
  build(): Document;
}

export class DataAdapter {
  static adapt(rawData: Record<string, any>): Record<string, any>;
}

export {};
