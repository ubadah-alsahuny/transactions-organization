# @local/document-generator

Official document generator for the Syrian Arab Republic — produces printable/PDF official transaction documents with security layers (hash-based patterns & mathematical guilloché), static branding, and dynamic content.

## Architecture

The library follows a **layered architecture** with a **Builder pattern**:

```
                 ┌──────────────────┐
                 │  DocumentLibrary │  (Singleton – main entry point)
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │  DocumentBuilder │  (Builder pattern – fluent API)
                 └────────┬─────────┘
                          │ .build()
                 ┌────────▼─────────┐
                 │     Document     │  (Renders, prints, exports to PDF)
                 │  ┌─────────────┐ │
                 │  │GuillocheLayer│ │  (SVG rosette background pattern)
                 │  ├─────────────┤ │
                 │  │ SecurityLayer│ │  (Hash-based SVG pattern overlay)
                 │  ├─────────────┤ │
                 │  │ StaticLayer  │ │  (Republic name, logo, header)
                 │  ├─────────────┤ │
                 │  │ DynamicLayer │ │  (Citizen, transaction, notes, QR)
                 │  └─────────────┘ │
                 └──────────────────┘
                          │
                 ┌────────▼─────────┐
                 │   DataAdapter    │  (Transforms raw API → unified format)
                 └──────────────────┘
```

## Layers

### GuillocheLayer
Generates high-security **guilloché rosette background patterns** (concentric waves, fine rings, cross-hatching, Lissajous curves, radial spokes, spiral connectors, central medallions, moiré interference, and micro-dots) based on the transaction hash. Used to deter counterfeiting and ensure document authenticity.

```
GuillocheLayer(hash, config)
  ├── hashToSeed(hash)              → numeric seed
  ├── createRNG(seed)               → seeded PRNG
  ├── generateRosette(width,height) → SVG paths & dots
  └── renderSVG(width,height)       → SVG string
```

### SecurityLayer
Generates a unique **SVG pattern** of lines based on a blockchain/backend hash. The pattern is deterministic — the same hash always produces the same lines. Used as a semi-transparent background overlay for tamper verification.

```
SecurityLayer(hash)
  ├── hashToSeed(hash)      → numeric seed
  ├── createRNG(seed)       → seeded PRNG
  ├── generateLines(count)  → array of line objects
  └── renderSVG(width,height) → SVG string
```

### StaticLayer
Renders **fixed content** that doesn't change between documents:
- Republic name ("الجمهورية العربية السورية")
- Institution name (وزارة + institution name)
- Official document type label
- Syrian Government logo

### DynamicLayer
Renders **per-document data**:
- Citizen info (name, national ID, birth date, mother name, phone)
- Transaction info (ID, type, status, dates)
- Initial data (dynamic key-value pairs from the transaction template)
- Employee notes / step data
- Signature block (signer name, title, date, stamp image)
- QR code placeholder

## Data Flow

```
Raw API Data
    │
    ▼
DataAdapter.adapt(rawData)     ← normalises camelCase/snake_case, fills defaults
    │
    ├── citizen     → { name, nationalId, birthDate, motherName, phone }
    ├── request     → { id, type, status, createdAt, ... }
    ├── institution → { id, name, status, ... }
    ├── intialData  → { key: value }  (dynamic)
    ├── stepData    → { _allNotes[], _completedSteps, sectionName: {...} }
    ├── signature   → { name, title, date, stamp, isDigital }
    └── hash        → '0x...' (for SecurityLayer & GuillocheLayer)
    │
    ▼
DocumentBuilder
  └── .buildSecurityLayer(hash)
  └── .buildGuillocheLayer(hash, config)
  └── .buildStaticLayer({ institution, logo })
  └── .buildDynamicLayer({ citizen, request, intialData, stepData, signature })
  └── .setMetadata({ ... })
  └── .setStyles({ ... })
  └── .build()
    │
    ▼
Document
  ├── .render()           → full HTML string (RTL, Arabic)
  ├── .renderToElement()  → HTMLElement
  ├── .print()            → opens print dialog
  ├── .toPDF(filename)    → downloads PDF (via html2canvas + jspdf)
  └── .getVerificationData() → { hash, documentId, ... }
```

## Usage

```js
import { DocumentLibrary } from '@local/document-generator';

const lib = new DocumentLibrary({
  primaryColor: '#1a237e',
  fontFamily: 'Arial, sans-serif',
});

// Create document from raw API data
const doc = lib.createDocument(rawData);

// Print
doc.print();

// Export as PDF
await doc.toPDF('transaction-document.pdf');
```

## Events (DocumentLibrary)

```js
lib.on('beforeCreate', (data) => { ... });
lib.on('afterCreate', ({ document }) => { ... });
lib.on('beforeExport', ({ document, strategy }) => { ... });
lib.on('afterExport', ({ document, strategy, result }) => { ... });
lib.on('error', ({ error }) => { ... });
```

## Dependencies

- **html2canvas** — renders document DOM to canvas for PDF export
- **jspdf** — generates the PDF file from canvas data
- **qrcode** — (available for QR code generation when implemented)

## Project Structure

```
src/
├── index.js                 # Barrel exports
├── core/
│   ├── Document.js          # Main document (render, print, toPDF)
│   ├── DocumentBuilder.js   # Builder pattern (fluent construction)
│   └── DocumentLibrary.js   # Singleton entry point with events
├── layers/
│   ├── SecurityLayer.js     # Hash-based SVG security overlay
│   ├── GuillocheLayer.js    # Mathematical SVG rosette background pattern
│   ├── StaticLayer.js       # Republic name, logo, header
│   └── DynamicLayer.js      # Citizen, transaction, notes, signature
├── adapters/
│   └── DataAdapter.js       # API data → unified document format
├── observers/
│   └── EventManager.js      # Pub/sub event system
├── styles/
│   ├── document.css         # Document visual styles
│   ├── print.css            # Print-specific overrides
│   └── index.js             # Styles barrel export
├── utils/
│   ├── constants.js         # Colors, page sizes, Arabic texts
│   └── helpers.js           # Hash, date formatting, clean keys
└── assets/images/
    └── syria-logo.svg       # Syrian Government logo
```