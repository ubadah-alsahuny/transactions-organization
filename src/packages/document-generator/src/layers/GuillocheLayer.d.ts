export class GuillocheLayer {
  constructor(dataHash: string, config?: Record<string, any>);
  renderSVG(width?: number, height?: number): string;
  getPathData(width?: number, height?: number): { paths: Array<Record<string, any>> };
}

