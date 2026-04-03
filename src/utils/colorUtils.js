/* ───── Color Conversion Utilities ───── */

export function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  h = (((h % 360) + 360) % 360) / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 0.5) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToHex(h, s, l) {
  return rgbToHex(...hslToRgb(h, s, l));
}

export function hexToHsl(hex) {
  const [r, g, b] = hexToRgbArray(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
}

export function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export function hexToRgbArray(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hslHex(h, s, l) { return hslToHex(((h % 360) + 360) % 360, s, l); }

export function lerpRgb(r1, g1, b1, r2, g2, b2, t) {
  // Convert gamma to linear RGB
  const toLinear = (c) => Math.pow(c / 255, 2.2);
  const toGamma = (l) => Math.round(Math.pow(l, 1 / 2.2) * 255);

  const lr1 = toLinear(r1), lg1 = toLinear(g1), lb1 = toLinear(b1);
  const lr2 = toLinear(r2), lg2 = toLinear(g2), lb2 = toLinear(b2);

  // Interpolate in linear space
  const lr = lr1 + (lr2 - lr1) * t;
  const lg = lg1 + (lg2 - lg1) * t;
  const lb = lb1 + (lb2 - lb1) * t;

  return [toGamma(lr), toGamma(lg), toGamma(lb)];
}

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export function getColorName(hue) {
  const names = [
    [0, 'Red'], [15, 'Red-Orange'], [30, 'Orange'], [45, 'Amber'],
    [60, 'Yellow'], [75, 'Yellow-Green'], [90, 'Chartreuse'], [120, 'Green'],
    [150, 'Spring Green'], [165, 'Cyan-Green'], [180, 'Cyan'], [195, 'Sky Blue'],
    [210, 'Blue'], [255, 'Indigo'], [270, 'Violet'],
    [285, 'Purple'], [300, 'Magenta'], [315, 'Rose'], [330, 'Pink'],
    [345, 'Crimson'],
  ];
  let closest = names[0];
  let minDist = 999;
  for (const [h, name] of names) {
    const raw = Math.abs(hue - h);
    const dist = Math.min(raw, 360 - raw); // circular distance
    if (dist < minDist) { minDist = dist; closest = [h, name]; }
  }
  return closest[1];
}

export function copyHex(hex, onToast) {
  navigator.clipboard.writeText(hex).catch(() => {
    // Fallback for non-HTTPS or denied permissions
    try {
      const ta = document.createElement('textarea');
      ta.value = hex;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch { /* clipboard unavailable */ }
  });
  if (onToast) onToast(hex);
}

export function generateScheme(baseHex, schemeType) {
  const { h, s, l } = hexToHsl(baseHex);
  const wrap = (angle) => ((angle % 360) + 360) % 360;
  switch (schemeType) {
    case 'analogous':
      return [hslToHex(wrap(h - 30), s, l), hslToHex(wrap(h - 15), s, l), baseHex, hslToHex(wrap(h + 15), s, l), hslToHex(wrap(h + 30), s, l)];
    case 'complementary':
      return [baseHex, hslToHex(wrap(h + 180), s, l), hslToHex(h, Math.max(s - 20, 10), Math.min(l + 20, 90)), hslToHex(wrap(h + 180), Math.max(s - 20, 10), Math.min(l + 20, 90)), hslToHex(h, s, Math.min(l + 35, 95))];
    case 'triadic':
      return [baseHex, hslToHex(wrap(h + 120), s, l), hslToHex(wrap(h + 240), s, l), hslToHex(h, Math.max(s - 15, 10), Math.min(l + 15, 90)), hslToHex(wrap(h + 120), Math.max(s - 15, 10), Math.min(l + 15, 90))];
    case 'split-complementary':
      return [baseHex, hslToHex(wrap(h + 150), s, l), hslToHex(wrap(h + 210), s, l), hslToHex(h, s, Math.min(l + 20, 90)), hslToHex(wrap(h + 180), s, Math.min(l + 20, 90))];
    case 'tetradic':
      return [baseHex, hslToHex(wrap(h + 90), s, l), hslToHex(wrap(h + 180), s, l), hslToHex(wrap(h + 270), s, l), hslToHex(h, s, Math.min(l + 25, 90))];
    case 'monochromatic':
      return [hslToHex(h, s, Math.max(l - 30, 10)), hslToHex(h, s, Math.max(l - 15, 15)), baseHex, hslToHex(h, Math.max(s - 15, 10), Math.min(l + 15, 85)), hslToHex(h, Math.max(s - 30, 10), Math.min(l + 30, 92))];
    default:
      return [baseHex, baseHex, baseHex, baseHex, baseHex];
  }
}

export const DEFINITIONS = {
  'hue': { title: 'Hue', body: 'The pure color itself — its position on the color wheel (0°–360°). Red = 0°, Yellow = 60°, Green = 120°, Cyan = 180°, Blue = 240°, Magenta = 300°.' },
  'saturation': { title: 'Saturation', body: 'How vivid or grey a color is. 100% = pure, fully vivid color. 0% = completely grey.' },
  'lightness': { title: 'Lightness', body: 'How light or dark a color is. 50% = pure hue. 100% = white. 0% = black.' },
  'hex': { title: 'HEX Code', body: 'A 6-digit code representing a color. First 2 digits = Red, middle 2 = Green, last 2 = Blue. Each pair is base-16 (0–FF = 0–255).' },
  'rgb': { title: 'RGB Model', body: 'The additive color model used by screens. R, G, B channels range 0–255. All at 255 = white; all at 0 = black.' },
  'hsl': { title: 'HSL Model', body: 'A human-friendly way to describe color: Hue (what color), Saturation (how vivid), Lightness (how bright).' },
  'complementary': { title: 'Complementary', body: 'Two colors exactly opposite each other on the wheel (180° apart). Maximum contrast and visual tension.' },
  'analogous': { title: 'Analogous', body: 'Colors sitting next to each other on the wheel (~30° apart). Harmonious, serene look.' },
  'triadic': { title: 'Triadic', body: 'Three colors equally spaced 120° apart. Vibrant and balanced.' },
  'split': { title: 'Split-Complementary', body: 'A base color plus the two colors adjacent to its complement (150° & 210° away). Softer than complementary.' },
  'tetradic': { title: 'Tetradic (Square)', body: 'Four colors evenly spaced at 90° intervals. Maximum variety, hardest to balance.' },
  'mono': { title: 'Monochromatic', body: 'One hue in different tints, shades, and tones. Clean, cohesive, impossible to clash.' },
  'red-channel': { title: 'Red Channel', body: 'Amount of red light (0–255). Combined with green = yellow; with blue = magenta.' },
  'green-channel': { title: 'Green Channel', body: 'Amount of green light (0–255). Most perceptually bright channel. R+G = Yellow on screens.' },
  'blue-channel': { title: 'Blue Channel', body: 'Amount of blue light (0–255). Most perceptually dim. B+R = Magenta, B+G = Cyan.' },
  'subtractive': { title: 'Subtractive (Pigment)', body: 'How paint and ink mix. More pigments = darker. Traditional paint primaries: Red, Yellow, Blue (RYB). Modern printing uses CMYK: Cyan, Magenta, Yellow + Black.' },
  'additive': { title: 'Additive (Light)', body: 'How screens mix color. Adding light = brighter. R+G+B at full = white. Primary: Red, Green, Blue.' },
  'average-mix': { title: 'Average Mixing', body: 'Simple mathematical average of RGB values. Not physically accurate, but a useful neutral midpoint.' },
  'tints-shades': { title: 'Tints & Shades', body: 'Tints = color + white (lighter). Shades = color + black (darker). Both keep the same hue.' },
  'color-wheel': { title: 'Color Wheel', body: 'Circular arrangement of hues. Angle = Hue, Distance = Saturation. Scroll to change Lightness.' },
  'linear-gradient': { title: 'Linear Gradient', body: 'Color transitions in a straight line. Angle controls direction.' },
  'radial-gradient': { title: 'Radial Gradient', body: 'Color radiates outward from center in a circle.' },
  'conic-gradient': { title: 'Conic Gradient', body: 'Colors rotate around a center point like a color wheel.' },
};

// ── WCAG Contrast Ratio ──
export function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(r1, g1, b1, r2, g2, b2) {
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Color Blindness Simulation ──
export function simulateColorBlindness(r, g, b, type) {
  // Brettel/Viénot simulation matrices
  const matrices = {
    protanopia: [
      [0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]
    ],
    deuteranopia: [
      [0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]
    ],
    tritanopia: [
      [0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]
    ],
  };
  const m = matrices[type];
  if (!m) return [r, g, b];
  
  // Convert sRGB to linear RGB space (0-1) for simulation math
  const toLinear = (c) => {
    let cl = c / 255;
    return cl <= 0.04045 ? cl / 12.92 : Math.pow((cl + 0.055) / 1.055, 2.4);
  };
  
  // Convert linear simulation space back to sRGB (0-255)
  const toSRGB = (l) => {
    let ls = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
    return clamp(Math.round(ls * 255), 0, 255);
  };

  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);

  const cr = m[0][0] * lr + m[0][1] * lg + m[0][2] * lb;
  const cg = m[1][0] * lr + m[1][1] * lg + m[1][2] * lb;
  const cb = m[2][0] * lr + m[2][1] * lg + m[2][2] * lb;

  return [toSRGB(cr), toSRGB(cg), toSRGB(cb)];
}
