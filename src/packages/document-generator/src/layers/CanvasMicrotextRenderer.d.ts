export class CanvasMicrotextRenderer {
  constructor(config?: Record<string, any>);
  renderTextPath(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    svgPathD: string,
    content: string,
    color: string,
    opacity: number,
    fontSizeMm: number
  ): void;
}
