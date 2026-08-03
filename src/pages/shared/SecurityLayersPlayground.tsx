import { useEffect, useMemo, useRef, useState } from 'react';

function clampHash(value: string) {
  const v = value.trim();
  if (v.startsWith('0x') && v.length === 66) return v;
  const clean = v.replace(/^0x/i, '').replace(/[^a-fA-F0-9]/g, '');
  if (clean.length === 64) return `0x${clean.toLowerCase()}`;
  return v;
}

export default function SecurityLayersPlayground() {
  const [hash, setHash] = useState('0x' + '0'.repeat(64));
  const [institutionCode, setInstitutionCode] = useState('GOV-IL');
  const [dateFragment, setDateFragment] = useState(new Date().toISOString().slice(0, 10));

  const [useMicrotext, setUseMicrotext] = useState(true);

  const [centerY, setCenterY] = useState(-45);
  const [arcRadius, setArcRadius] = useState(114);

  const [lineCount, setLineCount] = useState(35);
  const [opacityMin, setOpacityMin] = useState(0.45);
  const [opacityMax, setOpacityMax] = useState(0.50);

  const [microtextFontSize, setMicrotextFontSize] = useState(0.370);
  const [microtextFontSizeMin, setMicrotextFontSizeMin] = useState(0.700);
  const [microtextFontSizeMax, setMicrotextFontSizeMax] = useState(1.010);
  const [microtextLetterSpacing, setMicrotextLetterSpacing] = useState(0.002);
  const [contentRepeatCount, setContentRepeatCount] = useState(10);
  const [strokeScale, setStrokeScale] = useState(0.050);

  const [scale, setScale] = useState(0.5);
  const [showSecurity, setShowSecurity] = useState(true);
  const [showGuilloche, setShowGuilloche] = useState(true);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const normalizedHash = useMemo(() => clampHash(hash), [hash]);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const worker = new Worker(new URL('../../workers/securityLayers.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<any>) => {
      const { id, bitmap: bmp, durationMs, error: err } = event.data ?? {};
      if (typeof id !== 'number' || id !== requestIdRef.current) return;
      if (bmp instanceof ImageBitmap) {
        setBitmap(prev => { if (prev) prev.close(); return bmp; });
        setErrorMessage(null);
      }
      if (err) setErrorMessage(String(err));
      setLastDurationMs(typeof durationMs === 'number' ? durationMs : null);
      setIsGenerating(false);
    };

    worker.onerror = (event: ErrorEvent) => {
      setErrorMessage(event.message || 'Worker error');
      setIsGenerating(false);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !bitmap) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = bitmap.width;
    canvasRef.current.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);
  }, [bitmap]);

  const generate = () => {
    const worker = workerRef.current;
    if (!worker) return;

    requestIdRef.current += 1;
    const id = requestIdRef.current;
    setIsGenerating(true);
    setErrorMessage(null);

    const baseConfig = {
      centerY,
      arcRadius,
      lineCount,
      opacityMin,
      opacityMax,
    };

    const microtextConfig = {
      ...baseConfig,
      institutionCode,
      dateFragment,
      microtextFontSize,
      microtextFontSizeMin,
      microtextFontSizeMax,
      microtextLetterSpacing,
      contentRepeatCount,
      microtextStrokeScale: strokeScale,
    };

    worker.postMessage({
      id,
      payload: {
        hash: normalizedHash,
        useMicrotext,
        showSecurity,
        showGuilloche,
        baseConfig,
        microtextConfig,
      },
    });

    // Safety timeout: reset generating state if worker doesn't respond in 30s
    setTimeout((expectedId: number) => {
      if (requestIdRef.current === expectedId) {
        setIsGenerating(false);
        setErrorMessage('Worker timed out after 30s');
      }
    }, 30000, id);
  };

  useEffect(() => {
    if (!autoGenerate) return;
    const t = window.setTimeout(() => {
      generate();
    }, 250);
    return () => {
      window.clearTimeout(t);
    };
  }, [
    arcRadius, autoGenerate, centerY, contentRepeatCount, dateFragment,
    institutionCode, lineCount, microtextFontSize, microtextFontSizeMax,
    microtextFontSizeMin, microtextLetterSpacing, normalizedHash,
    opacityMax, opacityMin, showGuilloche, showSecurity, strokeScale, useMicrotext,
  ]);

  useEffect(() => {
    generate();
  }, []);

  const displayWidth = 210 * scale;
  const displayHeight = 297 * scale;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6 text-[var(--color-text)]">
      <div className="mx-auto flex max-w-[1400px] gap-6">
        <div className="w-[420px] shrink-0 rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-5">
          <div className="mb-4 text-lg font-bold">Security Layers Playground</div>

          <label className="block text-sm font-semibold">Hash</label>
          <input
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 text-sm"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold">Institution Code</label>
              <input
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Date Fragment</label>
              <input
                value={dateFragment}
                onChange={(e) => setDateFragment(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--color-outine)] bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setUseMicrotext(v => !v)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 text-sm font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)]"
            >
              {useMicrotext ? 'μText-Security: ON' : 'μText-Security: OFF'}
            </button>
            <button
              type="button"
              onClick={() => setShowSecurity(v => !v)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 text-sm font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)]"
            >
              {showSecurity ? 'Security: ON' : 'Security: OFF'}
            </button>
            <button
              type="button"
              onClick={() => setShowGuilloche(v => !v)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 text-sm font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)]"
            >
              {showGuilloche ? 'Guilloche: ON' : 'Guilloche: OFF'}
            </button>
            <button
              type="button"
              onClick={() => setAutoGenerate(v => !v)}
              className="rounded-2xl border border-[var(--color-outine)] bg-transparent px-4 py-2 text-sm font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_90%)]"
            >
              {autoGenerate ? 'Auto: ON' : 'Auto: OFF'}
            </button>
            <button
              type="button"
              onClick={generate}
              className="rounded-2xl border border-[var(--color-outine)] bg-[color-mix(in_srgb,var(--color-action),transparent_85%)] px-4 py-2 text-sm font-semibold hover:bg-[color-mix(in_srgb,var(--color-action),transparent_75%)]"
            >
              {isGenerating ? 'Generating…' : 'Generate'}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <div className="font-semibold">CenterY</div>
                <div className="tabular-nums">{centerY}</div>
              </div>
              <input type="range" min={-120} max={20} step={1} value={centerY} onChange={(e) => setCenterY(Number(e.target.value))} className="mt-2 w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <div className="font-semibold">Arc Radius</div>
                <div className="tabular-nums">{arcRadius}</div>
              </div>
              <input type="range" min={40} max={160} step={1} value={arcRadius} onChange={(e) => setArcRadius(Number(e.target.value))} className="mt-2 w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <div className="font-semibold">Line Count</div>
                <div className="tabular-nums">{lineCount}</div>
              </div>
              <input type="range" min={5} max={120} step={1} value={lineCount} onChange={(e) => setLineCount(Number(e.target.value))} className="mt-2 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold">Opacity Min</div>
                  <div className="tabular-nums">{opacityMin.toFixed(2)}</div>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={opacityMin} onChange={(e) => setOpacityMin(Number(e.target.value))} className="mt-2 w-full" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold">Opacity Max</div>
                  <div className="tabular-nums">{opacityMax.toFixed(2)}</div>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={opacityMax} onChange={(e) => setOpacityMax(Number(e.target.value))} className="mt-2 w-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-outine)] p-3">
              <div className="mb-3 text-sm font-bold">Microtext Controls</div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold">Font Size</div>
                    <div className="tabular-nums">{microtextFontSize.toFixed(3)}</div>
                  </div>
                  <input type="range" min={0.2} max={3} step={0.01} value={microtextFontSize} onChange={(e) => setMicrotextFontSize(Number(e.target.value))} className="mt-2 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-semibold">Font Min</div>
                      <div className="tabular-nums">{microtextFontSizeMin.toFixed(3)}</div>
                    </div>
                    <input type="range" min={0.1} max={3} step={0.01} value={microtextFontSizeMin} onChange={(e) => setMicrotextFontSizeMin(Number(e.target.value))} className="mt-2 w-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-semibold">Font Max</div>
                      <div className="tabular-nums">{microtextFontSizeMax.toFixed(3)}</div>
                    </div>
                    <input type="range" min={0.1} max={3} step={0.01} value={microtextFontSizeMax} onChange={(e) => setMicrotextFontSizeMax(Number(e.target.value))} className="mt-2 w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold">Letter Spacing</div>
                    <div className="tabular-nums">{microtextLetterSpacing.toFixed(3)}</div>
                  </div>
                  <input type="range" min={-0.08} max={0.08} step={0.001} value={microtextLetterSpacing} onChange={(e) => setMicrotextLetterSpacing(Number(e.target.value))} className="mt-2 w-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold">Content Repeat</div>
                    <div className="tabular-nums">{contentRepeatCount}</div>
                  </div>
                  <input type="range" min={10} max={300} step={1} value={contentRepeatCount} onChange={(e) => setContentRepeatCount(Number(e.target.value))} className="mt-2 w-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold">Stroke Scale</div>
                    <div className="tabular-nums">{strokeScale.toFixed(3)}</div>
                  </div>
                  <input type="range" min={0} max={1} step={0.01} value={strokeScale} onChange={(e) => setStrokeScale(Number(e.target.value))} className="mt-2 w-full" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <div className="font-semibold">Preview Scale</div>
                <div className="tabular-nums">{scale.toFixed(2)}x</div>
              </div>
              <input type="range" min={0.1} max={3} step={0.01} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="mt-2 w-full" />
            </div>
          </div>
        </div>

          <div className="flex-1 overflow-hidden rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-bold">Preview</div>
              <div className="text-xs text-[var(--color-sub-text)]">
                {lastDurationMs !== null ? `${Math.round(lastDurationMs)}ms` : '—'} · {isGenerating ? 'busy' : 'idle'}
                {bitmap ? ` · ${bitmap.width}×${bitmap.height}px` : ''}
              </div>
            </div>
            {errorMessage && (
              <div className="mb-3 rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                Error: {errorMessage}
              </div>
            )}

          <div className="h-[calc(100vh-140px)] overflow-auto rounded-2xl border border-[var(--color-outine)] bg-[var(--color-bg)] p-5">
            <div
              className="relative mx-auto overflow-hidden rounded-xl bg-white shadow-[0_2px_30px_rgba(0,0,0,0.12)]"
              style={{ width: `${displayWidth}mm`, height: `${displayHeight}mm` }}
            >
              <canvas
                ref={canvasRef}
                className="block h-full w-full"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
