const SVG_COMMANDS = 'MLCQZmlcqz';

function tokenizePath(d) {
  const tokens = [];
  const re = /([MLCQZmlcqz])\s*|([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let match;
  while ((match = re.exec(d)) !== null) {
    if (match[1]) tokens.push({ type: 'command', value: match[1] });
    else if (match[2]) tokens.push({ type: 'number', value: parseFloat(match[2]) });
  }
  return tokens;
}

function parsePath(d) {
  const tokens = tokenizePath(d);
  const segments = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].type !== 'command') { i++; continue; }
    const cmd = tokens[i].value;
    i++;
    const params = [];
    const count = { M: 2, L: 2, C: 6, Q: 4, Z: 0, m: 2, l: 2, c: 6, q: 4, z: 0 }[cmd] || 0;
    for (let j = 0; j < count && i < tokens.length; j++) {
      if (tokens[i].type === 'number') { params.push(tokens[i].value); i++; }
    }
    segments.push({ command: cmd, params });
  }
  return segments;
}

function samplePath(pathD, samplesPerUnit) {
  const segments = parsePath(pathD);
  if (segments.length === 0) return [];

  const points = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;

  for (const seg of segments) {
    const cmd = seg.command;
    const p = seg.params;

    if (cmd === 'M' || cmd === 'm') {
      cx = cmd === 'M' ? p[0] : cx + p[0];
      cy = cmd === 'M' ? p[1] : cy + p[1];
      sx = cx; sy = cy;
      points.push([cx, cy]);
    } else if (cmd === 'L' || cmd === 'l') {
      const ex = cmd === 'L' ? p[0] : cx + p[0];
      const ey = cmd === 'L' ? p[1] : cy + p[1];
      const dx = ex - cx, dy = ey - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.ceil(len * samplesPerUnit));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        points.push([cx + dx * t, cy + dy * t]);
      }
      cx = ex; cy = ey;
    } else if (cmd === 'Q' || cmd === 'q') {
      const cpx = cmd === 'Q' ? p[0] : cx + p[0];
      const cpy = cmd === 'Q' ? p[1] : cy + p[1];
      const ex = cmd === 'Q' ? p[2] : cx + p[2];
      const ey = cmd === 'Q' ? p[3] : cy + p[3];
      const steps = 20;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps, mt = 1 - t;
        points.push([mt * mt * cx + 2 * mt * t * cpx + t * t * ex, mt * mt * cy + 2 * mt * t * cpy + t * t * ey]);
      }
      cx = ex; cy = ey;
    } else if (cmd === 'C' || cmd === 'c') {
      const c1x = cmd === 'C' ? p[0] : cx + p[0], c1y = cmd === 'C' ? p[1] : cy + p[1];
      const c2x = cmd === 'C' ? p[2] : cx + p[2], c2y = cmd === 'C' ? p[3] : cy + p[3];
      const ex = cmd === 'C' ? p[4] : cx + p[4], ey = cmd === 'C' ? p[5] : cy + p[5];
      const steps = 30;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps, mt = 1 - t;
        points.push([
          mt * mt * mt * cx + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * ex,
          mt * mt * mt * cy + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * ey
        ]);
      }
      cx = ex; cy = ey;
    } else if (cmd === 'Z' || cmd === 'z') {
      const dx = sx - cx, dy = sy - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.01) {
        const steps = Math.max(1, Math.ceil(len * samplesPerUnit));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          points.push([cx + dx * t, cy + dy * t]);
        }
      }
      cx = sx; cy = sy;
    }
  }
  return points;
}

function computeTangents(points) {
  if (points.length < 2) return points.map(p => ({ x: p[0], y: p[1], angle: 0 }));
  return points.map((_, i) => {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    return { x: points[i][0], y: points[i][1], angle: Math.atan2(next[1] - prev[1], next[0] - prev[0]) };
  });
}

function mmToPx(mm, dpi) {
  return mm * dpi / 25.4;
}

export class CanvasMicrotextRenderer {
  constructor(config = {}) {
    this.dpi = config.dpi ?? 300;
    this.fontFamily = config.fontFamily ?? "'Courier New', 'Lucida Console', monospace";
    this.samplesPerMm = config.samplesPerMm ?? 5;
    this.strokeScale = config.strokeScale ?? 0.22;
    const baseAdvRatio = 0.55;
    const letterSpacing = config.letterSpacing ?? 0;
    this._advRatio = baseAdvRatio + letterSpacing;
  }

  createCanvas(widthMm, heightMm) {
    return new OffscreenCanvas(Math.ceil(mmToPx(widthMm, this.dpi)), Math.ceil(mmToPx(heightMm, this.dpi)));
  }

  renderTextPath(ctx, pathD, text, color, opacity, fontSizeMm) {
    const scale = this.dpi / 25.4;
    const points = samplePath(pathD, this.samplesPerMm);
    if (points.length < 2) return;

    const tangents = computeTangents(points);
    const strokeWidthPx = fontSizeMm * this.strokeScale;
    const advancePerCharMm = fontSizeMm * this._advRatio;

    ctx.save();
    ctx.font = `bold ${fontSizeMm.toFixed(3)}px ${this.fontFamily}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = Math.min(1, Math.max(0, opacity));
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidthPx;

    let textIndex = 0, distance = 0;
    for (let i = 0; i < tangents.length; i++) {
      const pt = tangents[i];
      if (distance >= advancePerCharMm || i === 0) {
        const char = text[textIndex % text.length];
        textIndex++;
        const cos = Math.cos(pt.angle);
        const sin = Math.sin(pt.angle);
        ctx.setTransform(
          scale * cos, scale * sin,
          -scale * sin, scale * cos,
          pt.x * scale, pt.y * scale
        );
        if (strokeWidthPx > 0.001) ctx.strokeText(char, 0, 0);
        ctx.fillText(char, 0, 0);
        distance = 0;
      }
      if (i < tangents.length - 1) {
        const dx = tangents[i + 1].x - pt.x;
        const dy = tangents[i + 1].y - pt.y;
        distance += Math.sqrt(dx * dx + dy * dy);
      }
    }
    ctx.restore();
  }

  renderPathCollection(ctx, paths, text, fontSizeFn) {
    const sorted = [...paths].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    for (const p of sorted) {
      this.renderTextPath(ctx, p.d, text, p.color, p.opacity, fontSizeFn(p.thickness));
    }
  }

  renderToCanvas(widthMm, heightMm, paths, text, fontSizeFn) {
    const canvas = this.createCanvas(widthMm, heightMm);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.renderPathCollection(ctx, paths, text, fontSizeFn);
    return canvas;
  }
}

export { samplePath, computeTangents, mmToPx };
export default CanvasMicrotextRenderer;
