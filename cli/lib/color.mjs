// Color parsing and WCAG contrast. No dependencies.

const NAMED = {
  purple: '#800080', violet: '#ee82ee', indigo: '#4b0082', blueviolet: '#8a2be2',
  darkviolet: '#9400d3', mediumpurple: '#9370db', slateblue: '#6a5acd',
  mediumslateblue: '#7b68ee', rebeccapurple: '#663399', orchid: '#da70d6',
  magenta: '#ff00ff', fuchsia: '#ff00ff', blue: '#0000ff', royalblue: '#4169e1',
  dodgerblue: '#1e90ff', deepskyblue: '#00bfff', skyblue: '#87ceeb',
  cornflowerblue: '#6495ed', mediumblue: '#0000cd', darkblue: '#00008b',
  navy: '#000080', cyan: '#00ffff', pink: '#ffc0cb', hotpink: '#ff69b4',
  deeppink: '#ff1493', white: '#ffffff', black: '#000000',
};

const NUMBER = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
const numberRe = new RegExp(`^${NUMBER}$`, 'i');
const percentRe = new RegExp(`^(${NUMBER})%$`, 'i');

function parseAlpha(token) {
  const percent = percentRe.exec(token);
  const value = percent ? Number(percent[1]) / 100 : numberRe.test(token) ? Number(token) : NaN;
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function parseParts(body) {
  if (body.includes(',')) {
    if (body.includes('/')) return null;
    const parts = body.split(',').map((part) => part.trim());
    if ((parts.length !== 3 && parts.length !== 4) || parts.some((part) => !part)) return null;
    return { colors: parts.slice(0, 3), alpha: parts[3] ?? '1' };
  }
  const slash = body.split('/');
  if (slash.length > 2) return null;
  const colors = slash[0].trim().split(/\s+/).filter(Boolean);
  const alpha = slash[1]?.trim() ?? '1';
  if (colors.length !== 3 || !alpha || /\s/.test(alpha)) return null;
  return { colors, alpha };
}

function parseRgbChannel(token) {
  const percent = percentRe.exec(token);
  if (percent) {
    const value = Number(percent[1]);
    return Number.isFinite(value) && value >= 0 && value <= 100 ? (value / 100) * 255 : null;
  }
  if (!numberRe.test(token)) return null;
  const value = Number(token);
  return Number.isFinite(value) && value >= 0 && value <= 255 ? value : null;
}

function parseAngle(token) {
  const match = new RegExp(`^(${NUMBER})(deg|grad|rad|turn)?$`, 'i').exec(token);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  switch ((match[2] ?? 'deg').toLowerCase()) {
    case 'grad': return value * 0.9;
    case 'rad': return (value * 180) / Math.PI;
    case 'turn': return value * 360;
    default: return value;
  }
}

function hslToRgb(h, s, l, a) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255), a };
}

export function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  if (NAMED[s]) return parseColor(NAMED[s]);

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s);
  if (hex) {
    let value = hex[1];
    if (value.length <= 4) value = [...value].map((digit) => digit + digit).join('');
    const hasAlpha = value.length === 8;
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16),
      a: hasAlpha ? Number.parseInt(value.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = /^rgba?\((.*)\)$/i.exec(s);
  if (rgb) {
    const parts = parseParts(rgb[1]);
    if (!parts) return null;
    const channels = parts.colors.map(parseRgbChannel);
    const alpha = parseAlpha(parts.alpha);
    if (channels.some((channel) => channel === null) || alpha === null) return null;
    return { r: Math.round(channels[0]), g: Math.round(channels[1]), b: Math.round(channels[2]), a: alpha };
  }

  const hsl = /^hsla?\((.*)\)$/i.exec(s);
  if (hsl) {
    const parts = parseParts(hsl[1]);
    if (!parts) return null;
    const angle = parseAngle(parts.colors[0]);
    const saturation = percentRe.exec(parts.colors[1]);
    const lightness = percentRe.exec(parts.colors[2]);
    const sValue = saturation ? Number(saturation[1]) : NaN;
    const lValue = lightness ? Number(lightness[1]) : NaN;
    const alpha = parseAlpha(parts.alpha);
    if (angle === null || !Number.isFinite(sValue) || !Number.isFinite(lValue) ||
        sValue < 0 || sValue > 100 || lValue < 0 || lValue > 100 || alpha === null) return null;
    return hslToRgb(angle, sValue, lValue, alpha);
  }
  return null;
}

export function toHsl({ r, g, b }) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

// 'purple' | 'blue' | 'pink' | null. Hue bands are a review signal, not a design verdict.
export function classifyHue(rgb) {
  const { h, s, l } = toHsl(rgb);
  if (s < 0.25 || l < 0.12 || l > 0.92) return null;
  if (h >= 255 && h <= 315) return 'purple';
  if (h >= 190 && h < 255) return 'blue';
  if (h > 315 && h <= 345) return 'pink';
  return null;
}

function channel(v) {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance({ r, g, b }) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg, bg) {
  if ((fg.a ?? 1) !== 1 || (bg.a ?? 1) !== 1) {
    throw new TypeError('Translucent colors must be composited before calculating contrast.');
  }
  const a = luminance(fg), b = luminance(bg);
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export const isKnownColorName = (word) => Object.hasOwn(NAMED, word.toLowerCase());
