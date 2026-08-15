export class MicrotextEngine {
  constructor(config?: Record<string, any>);
  buildContent(repeatCount?: number): string;
  fontSizeFromThickness(strokeWidth: number): number;
}

