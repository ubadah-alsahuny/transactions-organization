export class SecurityLayer {
  constructor(dataHash: string, config?: Record<string, any>);
  renderSVG(width?: number, height?: number): string;
  generateLines(count?: number | null): Array<Record<string, any>>;
  lineToPathData(line: Record<string, any>, width: number, height: number): string;
}

