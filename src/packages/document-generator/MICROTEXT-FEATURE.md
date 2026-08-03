# Micro-Printing (Microtext) Security Feature

**Purpose of this document:** hand off the newly implemented **micro-printing** feature from the frontend (`@local/document-generator`) to the backend team so it can be integrated into the server-side transaction-PDF pipeline, and to record the **PPI/DPI limitations** and the **DOM rendering issue** (and how it was resolved) so the same pitfalls are not repeated.

> Assumption: the backend pipeline that builds the **PDF version of a transaction** is treated as
> **unchanged** for this integration. The only frontend package changes that were made to produce the
> POC are **reactivating the already-existing `GuillocheLayer` and `SecurityLayer`** (their original
> backend-activated forms). These two layers were re-enabled in the frontend so a Proof-of-Concept of
> micro-printing could be generated; the microtext work is layered **on top** of the already-existing
> security fiber geometry and does not alter how guilloché or security lines are geometrically produced.

---

## 1. What the feature is

Micro-printing replaces every **security fiber line** (the short wavy/straight stroked lines used as a
tamper-proof background) with **microtext that flows along the exact same geometric path**.

Under normal viewing the microtext is **below the resolution threshold of the eye/human print** and reads
as a continuous thin line. Under **PDF zoom** (the "virtual loupe") the line resolves into a **repeating
readable string**, e.g. `GOV-IL · A3F8C2D1 · 2025-06-01 ·` — the same banknote "embedded security thread"
technique, where the magnification is PDF zoom instead of a physical loupe.

This is a **dual-purpose** feature:

1. **Deterrent / authenticity** — counterfeiters need true micro-detail printing to replicate it.
2. **Machine-verifiable** — the content is derived deterministically from the transaction hash, so the
   underlying text is **cryptographically anchored** (same hash → same seed → same pattern → same microtext).

---

## 2. Cryptographic anchoring (facts)

The microtext content is fully deterministic and derived from the transaction/document hash:

```
seed          = hashToSeed(txHash)     # deterministic, from SecurityLayer
txHashFragment= first 8 hex chars of txHash, UPPERCASEd   (e.g. "A3F8C2D1")
path geometry = generateLines(txHash) → identical strokes every render
text unit     = "<institutionCode> · <txHashFragment> · <dateFragment> · "
```

- Same hash ⇒ same fiber geometry ⇒ same microtext ⇒ byte-for-byte reproducible.
- The institution can recompute the expected microtext from chain data and compare it to the issued
  document to **verify authenticity** without any private material.

---

## 3. Expected PPI / DPI limitations

Microtext is sized in **millimetres / SVG coordinate units** (`fontSize` ≈ 0.40–0.62 mm, with the POC
using an effective ~0.17–1.01 mm band). Legibility depends entirely on the **resolution of the viewing
or printing surface**. The table below is the canonical reference (fonte-size 0.50 mm, ≈ 1.4 pt):

| Surface / zoom | Effective glyph size | Result |
|---|---|---|
| PDF viewer @ 100% zoom | ~1.4 px / glyph | Characters **invisible** → reads as a line ✔ |
| PDF viewer @ 800% zoom | ~11 px / glyph | Bold monospace resolves → `GOV-IL · A3F8C2D1` legible |
| Printer @ **300 dpi** | ~5.9 px / glyph | Ink dots larger than glyph detail → **smeared line** (unreadable) |
| Printer @ **600 dpi** | ~11.8 px / glyph | Glyphs merge into **noise bands**; word unreadable |
| Printer @ **1200 dpi** | ~23.6 px / glyph | Marginal readability; **not adequate for forgery-grade reproduction** |

### Conversion reference
```
px_per_glyph ≈ fontSize_mm × dpi ÷ 25.4      (e.g. 0.50 mm @ 300 dpi ≈ 5.9 px)
fontSizeMin (≈0.40 mm) stays unresolved even at 1200 dpi.
```

### Practical conclusions for backend integration
1. **Retain vector geometry for as long as possible.** Rasterising to a bitmap and then printing loses
   the sub-pixel detail that makes microtext zoom-readable. Keep the microtext as **vector text** in the
   document layer until the very last rasterization point.
2. **Legibility is a feature, not a bug.** At 100% zoom the microtext must look like a clean fiber line;
   at high zoom it must resolve. Both requirements are met by the bold-monospace, `geometricPrecision`
   settings already applied.
3. Microtext acts as a **visual/counterfeit deterrent**, not a human-readable-on-paper element. Do not
   rely on it for data extraction; the readable payload is reproduced by the verifying party, not by any
   end-user printer.

---

## 4. The DOM rendering issue (and how we resolved it)

### Problem
The original implementation placed the text along the path with SVG `<textPath>`:

```html
<path id="rail" d="…" fill="none" stroke="none"/>            <!-- invisible geometric rail -->
<text>
  <textPath href="#rail" xlink:href="#rail">GOV · …</textPath>
</text>
```

`<textPath>` proved **unreliable** when the document DOM is re-serialized and replayed by the PDF toolchain
(`html2canvas` + `jsPDF`). Those rasterizers use their **own re-parsed SVG model** that does not reliably
support/position `<textPath>` — characters were dropped, misplaced, or not laid out along the curve at all.
Because the microtext is the whole point of the feature, a broken `<textPath>` meant micro-printing
silently vanished or garbled in the exported PDF.

### Resolution — decompose the path into per-character `<text>` nodes

Instead of one `<text><textPath>` we emit **one `<text>` element per character**, letting the browser /
renderer place ordinary text glyphs (universally supported):

1. Tokenize + parse the original SVG `d` path (supports `M L Q C Z` in absolute and relative form).
2. Resample the path into dense sample points (`samplePath`).
3. Compute a tangent at every point → `computeTangents` (angle per point).
4. Walk the curve accumulating arc length; place a glyph every `advancePerChar ≈ fontSize × 0.55`.
5. Emit each glyph as:
   ```html
   <text x="…" y="…" transform="rotate(angle x y)"
         font-size="…" font-family="…" font-weight="bold"
         fill="…" fill-opacity="…" stroke="…" stroke-width="…"
         paint-order="stroke fill"
         dominant-baseline="middle" text-anchor="middle">C</text>
   ```
6. Per-character `rotate(angle x, y)` keeps each glyph tangent-aligned to the curve with **no dependency on
   `<textPath>` support**.

### Why this fixes the DOM issue
- `paint-order="stroke fill"` plus a thin stroke widens each glyph slightly so the microtext column looks
  like a **continuous line** at a distance (the exact banknote effect).
- Each glyph is a trivial, well-supported `<text>` element — rendered correctly by the browser, by
  print/`@media print`, and by `html2canvas`/`jsPDF` SVG re-parsing.
- Spatial and geometric identity is preserved: characters still follow the **same encrypted path geometry**
  as a plain stroke fiber, so the visual fingerprint is unchanged while the content becomes readable text.

---

## 5. Current parameters (frontend POC — reference for backend defaults)

Final values used by `DocumentLibrary.createDocument(..., { previewOnly })`:

| Parameter | Value | Meaning |
|---|---|---|
| `useMicrotext` | `true` | microtext security layer (else legacy stroke fiber) |
| `lineCount` | `55` | number of security fibers to draw |
| `opacityMin` / `opacityMax` | `0.95` / `1.0` | fiber opacity band |
| `institutionCode` | `GOV` (configurable) | text prefix shown in microtext unit |
| `microtextFontSize` | `0.170` | baseline snapshot glyph height (mm units) |
| `microtextFontSizeMin` | `0.400` | smallest glyph (thinnest fibers) |
| `microtextFontSizeMax` | `1.010` | largest glyph (thickest fibers) |
| `microtextLetterSpacing` | `0.002` | slight positive pull for clean rhythm |
| `microtextStrokeScale` | `0.030` | glyph stroke-width relative to font-size |
| `contentRepeatCount` | `1` | unit repetition factor for path fill |
| `guillocheLayer` | `{ centerY: -45, arcRadius: 114 }` | **stroke-based guilloché** (NOT microtext) |

> **Rule:** microtext applies **only** to the **security fiber lines**. The **guilloché rosette** remains
> **stroke-based** — it is intentionally not converted to microtext.

---

## 6. Implementation steps (backend integration)

1. **Enable the security + guilloché layers** in the backend document pipeline (these were re-activated in
   the frontend for the POC; wire the same trigger in the server PDF builder).
2. **Inject microtext at the security layer only.** Port (or mirror) the `MicrotextEngine`,
   `MicrotextSecurityLayer`, and the `samplePath`/`computeTangents` path-sampling helpers into the backend
   renderer.
3. **Feed deterministic identity:**

   `institutionCode` (config), first‑8‑hex of the transaction hash, and the ISO date fragment.

4. **Respect the DPI rules (Section 3).** Keep microntext as vector text until final rasterization; never
   down-sample the geometry below the ~0.40 mm floor.
5. **Keep guilloché stroke-based;** only the security fibers are microtext. Confirm `buildGuillocheLayer`
   is still a plain `GuillocheLayer`.
6. **Verify in the PDF chain that uses `<text>`-per-glyph, not `<textPath>`.** Add a zoom test (≥800%) so
   microtext resolves to `GOV · <HASH> · <DATE>`.
7. **Verification endpoint (optional):** recompute the expected microtext string from the hash and compare
   it to the issued PDF's text layer for machine verification.

---

*See also: `src/layers/MicrotextEngine.js` (content & typography), `src/layers/MicrotextSecurityLayer.js`
(the solo `<text>`-per-glyph renderer), `src/layers/CanvasMicrotextRenderer.js` (path sampling/tangents),
`src/core/DocumentBuilder.js` (`buildSecurityLayer(useMicrotext:true)` switch).*