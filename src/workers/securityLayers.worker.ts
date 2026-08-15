import { GuillocheLayer } from '../packages/document-generator/src/layers/GuillocheLayer.js';
import { MicrotextSecurityLayer } from '../packages/document-generator/src/layers/MicrotextSecurityLayer.js';
import { SecurityLayer } from '../packages/document-generator/src/layers/SecurityLayer.js';
import { CanvasMicrotextRenderer } from '../packages/document-generator/src/layers/CanvasMicrotextRenderer.js';
import { MicrotextEngine } from '../packages/document-generator/src/layers/MicrotextEngine.js';

type Payload = {
  hash: string;
  useMicrotext: boolean;
  showSecurity: boolean;
  showGuilloche: boolean;
  baseConfig: Record<string, any>;
  microtextConfig: Record<string, any>;
};

type RequestMessage = { id: number; payload: Payload };
type ResponseMessage = { id: number; bitmap: ImageBitmap | null; durationMs: number; error?: string };

self.onmessage = (event: MessageEvent<RequestMessage>) => {
  const startedAt = performance.now();
  const { id, payload } = event.data;
  let bitmap: ImageBitmap | null = null;

  try {
    const { hash, useMicrotext, showGuilloche, showSecurity, baseConfig, microtextConfig } = payload;

    const W = 210;
    const H = 297;
    const GH = 80;
    const DPI = 300;
    const PX = DPI / 25.4;

    const cw = Math.ceil(W * PX);
    const ch = Math.ceil(H * PX);

    const canvas = new OffscreenCanvas(cw, ch);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);

    // ── Guilloche is ALWAYS stroke-based (no microtext) ──
    if (showGuilloche) {
      const g = new GuillocheLayer(hash, baseConfig);
      const { paths } = g.getPathData(W, GH);
      for (const p of paths) {
        const path2d = new Path2D(p.d);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.thickness * PX;
        ctx.globalAlpha = p.opacity;
        ctx.lineCap = (p.strokeLinecap || 'butt') as CanvasLineCap;
        ctx.lineJoin = (p.strokeLinejoin || 'round') as CanvasLineJoin;
        ctx.stroke(path2d);
      }
    }

    // ── Security layer: microtext OR stroke ──
    if (showSecurity) {
      if (useMicrotext) {
        const engine = new MicrotextEngine({
          institutionCode: microtextConfig.institutionCode || 'GOV',
          txHashFragment: hash.replace('0x', '').slice(0, 8).toUpperCase(),
          dateFragment: microtextConfig.dateFragment || '',
          fontSize: microtextConfig.microtextFontSize ?? 0.37,
          fontSizeMin: microtextConfig.microtextFontSizeMin ?? 0.70,
          fontSizeMax: microtextConfig.microtextFontSizeMax ?? 1.01,
          letterSpacing: microtextConfig.microtextLetterSpacing ?? 0.002,
          contentRepeatCount: microtextConfig.contentRepeatCount ?? 10,
          strokeScale: microtextConfig.microtextStrokeScale ?? 0.05,
        });
        const textContent = engine.buildContent();
        const fontSizeFn = (t: number) => engine.fontSizeFromThickness(t);
        const renderer = new CanvasMicrotextRenderer({
          dpi: DPI,
          letterSpacing: microtextConfig.microtextLetterSpacing ?? 0.002,
          strokeScale: microtextConfig.microtextStrokeScale ?? 0.05,
        });

        const s = new MicrotextSecurityLayer(hash, microtextConfig);
        const lines = s.generateLines();
        for (const line of lines) {
          const d = s.lineToPathData(line, W, H);
          const color = `hsl(${line.hue.toFixed(1)}, 40%, 35%)`;
          renderer.renderTextPath(ctx, d, textContent, color, line.opacity, fontSizeFn(line.thickness));
        }
      } else {
        const s = new SecurityLayer(hash, baseConfig);
        const lines = s.generateLines();
        for (const line of lines) {
          const d = s.lineToPathData(line, W, H);
          const path2d = new Path2D(d);
          const hue = typeof line.hue === 'number' ? line.hue : 200;
          ctx.strokeStyle = `hsla(${hue.toFixed(1)}, 40%, 35%, ${line.opacity})`;
          ctx.lineWidth = line.thickness * PX;
          if (line.dash && line.dash.length === 2) {
            ctx.setLineDash([line.dash[0] * PX, line.dash[1] * PX]);
          }
          ctx.stroke(path2d);
        }
        ctx.setLineDash([]);
      }
    }

    bitmap = canvas.transferToImageBitmap();
    (self as any).postMessage({ id, bitmap, durationMs: performance.now() - startedAt } as ResponseMessage, [bitmap]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    (self as any).postMessage({ id, bitmap: null, durationMs: performance.now() - startedAt, error: msg } as ResponseMessage);
  }
};
