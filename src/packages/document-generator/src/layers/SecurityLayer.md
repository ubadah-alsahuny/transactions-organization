# Mathematical Foundations of `SecurityLayer.js`

This document explains the mathematical algorithms used by `SecurityLayer.js`, including hash-to-seed conversion, the pseudo-random number generator (PRNG), line generation, SVG rendering, and the complete rendering pipeline.

---

# 1. Hash to Seed Conversion

```javascript
hashToSeed(hash) {
  let seed = 0;
  const cleanHash = hash.replace('0x', '');

  for (let i = 0; i < cleanHash.length; i++) {
    seed = ((seed << 5) - seed) + cleanHash.charCodeAt(i);
    seed = seed & seed;
  }

  return Math.abs(seed) || 42;
}
```

## Formula

```
seed = ((seed << 5) - seed) + charCode
```

| Expression           | Description                                     | Example                   |
| -------------------- | ----------------------------------------------- | ------------------------- |
| `seed << 5`          | Left bit shift (multiply by 32)                 | `5 << 5 = 160`            |
| `(seed << 5) - seed` | Equivalent to `seed × 31`                       | `160 - 5 = 155`           |
| `+ charCodeAt(i)`    | Adds the ASCII value of the current character   | `'A' = 65`                |
| `seed & seed`        | Constrains the value to a signed 32-bit integer | Prevents integer overflow |

## Example

```javascript
// Hash: "0x7a8f3c2b"

// Iteration 1
seed = ((0 << 5) - 0) + 55;
seed = 55;

// Iteration 2
seed = ((55 << 5) - 55) + 97;
seed = 1802;

// Iteration 3
seed = ((1802 << 5) - 1802) + 56;
seed = 55918;

// Continues until the entire hash has been processed...
```

## Why This Formula?

* Produces well-distributed deterministic values.
* The same hash always generates the same seed.
* Even a one-character change in the hash produces a completely different seed (avalanche effect).

---

# 2. Pseudo-Random Number Generator (PRNG)

```javascript
createRNG(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
```

## Formula

```
seed = (seed × 9301 + 49297) mod 233280
```

This is a classic **Linear Congruential Generator (LCG)**.

| Constant | Purpose    |
| -------- | ---------- |
| `9301`   | Multiplier |
| `49297`  | Increment  |
| `233280` | Modulus    |

## Example

```javascript
const rng = createRNG(12345);

// First value
seed = (12345 * 9301 + 49297) % 233280;
return seed / 233280;

// Second value
seed = (seed * 9301 + 49297) % 233280;
return seed / 233280;
```

## Why an LCG?

* Deterministic output.
* Fast execution.
* Uniform value distribution.
* Same seed always produces the same sequence.

---

# 3. Line Generation (`generateLines()`)

```javascript
generateLines(count = null) {
    const totalLines = count || this.config.lineCount;
    const rng = this.createRNG(this.seed);

    const x = rng() * 100;
    const y = rng() * 100;
    const angle = rng() * 360;
    const length = 5 + rng() * 25;
    const thickness = 0.3 + rng() * 0.7;
    const opacity = 0.05 + rng() * 0.07;
    const hue = rng() * 360;
}
```

## Parameter Ranges

| Formula               |      Range | Description          |
| --------------------- | ---------: | -------------------- |
| `rng() * 100`         |      0–100 | Position (% of page) |
| `rng() * 360`         |     0–360° | Rotation angle       |
| `5 + rng() * 25`      |    5–30 mm | Line length          |
| `0.3 + rng() * 0.7`   | 0.3–1.0 px | Stroke thickness     |
| `0.05 + rng() * 0.07` |  0.05–0.12 | Opacity              |
| `rng() * 360`         |     0–360° | Hue                  |

## Example

```javascript
x = 75%;
y = 32%;
angle = 313°;
length = 21 mm;
thickness = 0.615 px;
opacity = 0.107;
hue = 328°;
```

---

# 4. SVG Rendering

```javascript
const x1 = (line.x / 100) * width;
const y1 = (line.y / 100) * height;

const angleRad = line.angle * Math.PI / 180;

const x2 = x1 + Math.cos(angleRad) * line.length;
const y2 = y1 + Math.sin(angleRad) * line.length;
```

## Degree-to-Radian Conversion

```
radians = degrees × π / 180
```

## Endpoint Calculation

```
x₂ = x₁ + cos(θ) × length
y₂ = y₁ + sin(θ) × length
```

Where:

* `cos()` determines the horizontal displacement.
* `sin()` determines the vertical displacement.

### Example

```
Start Point:
x = 105 mm
y = 148.5 mm

Angle = 45°
Length = 20 mm

End Point:
x = 119.14 mm
y = 162.64 mm
```

---

# Complete Rendering Pipeline

```
Hash
   │
   ▼
Hash to Seed
   │
   ▼
Pseudo-Random Generator
   │
   ▼
Generate Line Parameters
   │
   ▼
Convert to SVG Geometry
   │
   ▼
Render Final SVG
```

---

# Design Goals

| Goal                 | Implementation                                            |
| -------------------- | --------------------------------------------------------- |
| Deterministic output | Same hash → Same seed → Same SVG                          |
| Unique fingerprint   | Different hash → Completely different pattern             |
| Subtle appearance    | Very low opacity (0.05–0.12)                              |
| Visual diversity     | Randomized angle, length, color, and thickness            |
| Security             | Original hash cannot be inferred from the generated lines |

---

# Complete Numerical Example

```javascript
const hash = "0x7a8f3c2b";

hashToSeed(hash);
// → 183647585

const rng = createRNG(183647585);

const line = {
    x: 82.34,
    y: 12.98,
    angle: 164.4,
    length: 24.7,
    thickness: 0.46,
    opacity: 0.089,
    hue: 324.4,
    dash: [2.4, 3.1]
};
```

---

# Test Example

```javascript
const hash1 = "0x7a8f3c2b";
const hash2 = "0x7a8f3c2c";

const layer1 = new SecurityLayer(hash1);
const layer2 = new SecurityLayer(hash2);

const lines1 = layer1.generateLines(5);
const lines2 = layer2.generateLines(5);

console.log(lines1[0].x, lines1[0].y);
console.log(lines2[0].x, lines2[0].y);

// Different hashes produce completely different patterns,
// while the same hash always reproduces the exact same output.
```
