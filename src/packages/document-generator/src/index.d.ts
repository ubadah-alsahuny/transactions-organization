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
  createDocument(rawData: Record<string, any>, options?: Record<string, any>): Document;
}

export class GuillocheLayer {
  constructor(dataHash: string, config?: Record<string, any>);
  renderSVG(width?: number, height?: number): string;
}

export class SecurityLayer {
  constructor(dataHash: string, config?: Record<string, any>);
  renderSVG(width?: number, height?: number): string;
}

export class MicrotextGuillocheLayer extends GuillocheLayer {
  constructor(dataHash: string, config?: Record<string, any>);
}

export class MicrotextSecurityLayer extends SecurityLayer {
  constructor(dataHash: string, config?: Record<string, any>);
}

export class MicrotextEngine {
  constructor(config?: Record<string, any>);
  fontSizeFromThickness(strokeWidth: number): number;
  pathId(hashSlice: string, index: number): string;
  buildContent(repeatCount?: number): string;
  renderTextPathPair(
    id: string,
    pathData: string,
    color: string,
    opacity: number,
    fontSize?: number
  ): { def: string; text: string };
}

export class DocumentBuilder {
  constructor();
  buildSecurityLayer(dataHash: string, config?: Record<string, any>): this;
  buildGuillocheLayer(dataHash: string, config?: Record<string, any>): this;
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
