// Static slop rules. Each rule is a regex-level heuristic over source text,
// not a parser. Limits are documented in GUIDE.md.

import { parseColor, classifyHue, isKnownColorName } from './color.mjs';

export const DEFAULTS = {
  spacingScale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  shadowBlurMax: 30,
  radiusMinPx: 16,
  radiusRepeat: 3,
  centerRepeat: 4,
  motionMinMs: 150,
  motionMaxMs: 400,
  rules: {},
  ignore: [],
};

const STYLE = ['css', 'scss', 'less', 'html', 'htm', 'jsx', 'tsx', 'js', 'ts', 'vue', 'svelte', 'astro'];
const MARKUP = ['html', 'htm', 'jsx', 'tsx', 'vue', 'svelte', 'astro'];
const COPY = [...MARKUP, 'md', 'mdx', 'txt'];
const SCRIPTS = ['js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'astro'];

export const SUPPORTED_EXTS = new Set([...STYLE, ...COPY]);

// ---------- helpers ----------

function balanced(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')' && --depth === 0) return i;
  }
  return -1;
}

function splitTop(value, sep = ',') {
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === sep && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  return parts;
}

const COLOR_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'oklab', 'lab', 'lch', 'color-mix', 'var']);

function stripColors(value) {
  let output = '';
  for (let i = 0; i < value.length;) {
    const hex = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})\b/i.exec(value.slice(i));
    if (hex) { output += ' '; i += hex[0].length; continue; }
    const name = /^[a-z-]+/i.exec(value.slice(i));
    if (name && COLOR_FUNCTIONS.has(name[0].toLowerCase())) {
      let open = i + name[0].length;
      while (/\s/.test(value[open] ?? '')) open += 1;
      if (value[open] === '(') {
        const close = balanced(value, open);
        if (close >= 0) { output += ' '; i = close + 1; continue; }
      }
    }
    output += value[i];
    i += 1;
  }
  return output;
}

function toPx(num, unit) {
  const n = parseFloat(num);
  return unit === 'rem' ? n * 16 : n;
}

const fmt = (n) => String(Math.round(n * 100) / 100);

// ---------- rules ----------

const fontDefault = {
  id: 'font-default',
  severity: 'warn',
  exts: STYLE,
  summary: 'Inter or Roboto as the primary typeface.',
  check({ text, pos }) {
    const out = [];
    const hit = (idx, name) =>
      out.push({ ...pos(idx), message: `${name} as the primary font. Pick one display face (Fontshare, Uncut) plus one neutral body face.` });
    const first = (v) => v.split(',')[0].replace(/!important/i, '').trim().replace(/^['"]|['"]$/g, '');
    const isDefault = (n) => /^(inter|roboto)$/i.test(n);

    for (const m of text.matchAll(/(?<![\w-])font-family\s*:\s*([^;}\n]+)/gi)) {
      const n = first(m[1]);
      if (isDefault(n)) hit(m.index, n);
    }
    for (const m of text.matchAll(/\bfontFamily\s*:\s*(['"`])([^'"`]+)\1/g)) {
      const n = first(m[2]);
      if (isDefault(n)) hit(m.index, n);
    }
    for (const m of text.matchAll(/\bsans\s*:\s*\[\s*(['"])([^'"]+)\1/g)) {
      if (isDefault(m[2].trim())) hit(m.index, m[2].trim());
    }
    for (const m of text.matchAll(/fonts\.googleapis\.com\/[^"'`)\s]*/g)) {
      for (const f of m[0].matchAll(/family=([^:&"'`)\s;@]+)/g)) {
        const n = decodeURIComponent(f[1].replace(/\+/g, ' ')).trim();
        if (isDefault(n)) hit(m.index, n);
      }
    }
    for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]next\/font\/google['"]/g)) {
      const n = m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).find(isDefault);
      if (n) hit(m.index, n);
    }
    return out;
  },
};

const gradientPurpleBlue = {
  id: 'gradient-purple-blue',
  severity: 'warn',
  exts: STYLE,
  summary: 'Purple to blue (or purple to pink) gradients.',
  check({ text, pos }) {
    const out = [];
    const msg = 'Purple gradient. Use one solid color plus one accent, or monochrome plus one pop.';

    for (const m of text.matchAll(/(?:repeating-)?(?:linear|radial|conic)-gradient\(/g)) {
      const open = m.index + m[0].length - 1;
      const close = balanced(text, open);
      if (close === -1) continue;
      const body = text.slice(open + 1, close);
      const cats = [];
      for (const t of body.match(/#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?)\([^)]*\)|\b[a-zA-Z]+\b/g) ?? []) {
        if (/^[a-zA-Z]+$/.test(t) && !isKnownColorName(t)) continue;
        const rgb = parseColor(t);
        const cat = rgb && classifyHue(rgb);
        if (cat) cats.push(cat);
      }
      if (cats.includes('purple') && cats.length >= 2) out.push({ ...pos(m.index), message: msg });
    }

    const PURPLE = 'violet|purple|indigo|fuchsia';
    const gradient = /^(?:[a-z0-9]+:)*bg-(?:gradient|linear)-to-[a-z]+$/;
    const stop = new RegExp(`^(?:[a-z0-9]+:)*(?:from|via|to)-(${PURPLE}|blue|sky|cyan|pink|rose)-\\d{2,3}$`);
    for (const attr of text.matchAll(/\bclass(?:Name)?\s*=\s*(['"`])([\s\S]*?)\1/g)) {
      const tokens = [...attr[2].matchAll(/\S+/g)];
      const bodyOffset = attr.index + attr[0].indexOf(attr[2]);
      for (let i = 0; i < tokens.length; i += 1) {
        if (!gradient.test(tokens[i][0])) continue;
        const stops = [];
        for (let j = i + 1; j < tokens.length && !gradient.test(tokens[j][0]); j += 1) {
          const match = stop.exec(tokens[j][0]);
          if (match) stops.push(match[1]);
        }
        if (stops.length >= 2 && stops.some((s) => new RegExp(`^(${PURPLE})$`).test(s))) {
          out.push({ ...pos(bodyOffset + tokens[i].index), message: msg });
        }
      }
    }
    return out;
  },
};

function isPictograph(cp) {
  if (cp >= 0x1f1e6 && cp <= 0x1f1ff) return false; // flags
  if (cp >= 0x1f000) return true;
  if (cp === 0x2b50 || cp === 0x2b55 || cp === 0x231a || cp === 0x231b) return true;
  if (cp >= 0x23e9 && cp <= 0x23fa) return true;
  if (cp >= 0x2600 && cp <= 0x27bf) {
    const textSymbols = new Set([0x2605, 0x2606, 0x2610, 0x2611, 0x2612, 0x2713, 0x2714, 0x2715, 0x2716, 0x2717, 0x2718, 0x2726, 0x2727, 0x2736]);
    return !textSymbols.has(cp);
  }
  return false;
}

const emojiIcon = {
  id: 'emoji-icon',
  severity: 'warn',
  exts: MARKUP,
  summary: 'Emoji used as icons in markup.',
  check({ text, pos }) {
    const out = [];
    let lineStart = 0;
    for (const line of text.split('\n')) {
      let offset = 0;
      for (const ch of line) {
        if (isPictograph(ch.codePointAt(0))) {
          const idx = lineStart + offset;
          out.push({ ...pos(idx), message: `Emoji "${ch}" in markup. Use one icon set with a consistent 1.5-2px stroke.` });
          break;
        }
        offset += ch.length;
      }
      lineStart += line.length + 1;
    }
    return out;
  },
};

const cardGrid3 = {
  id: 'card-grid-3',
  severity: 'warn',
  exts: STYLE,
  summary: 'Three equal columns, the default feature-card row.',
  check({ text, pos }) {
    const hits = [
      ...text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*grid-cols-3(?![\w-])/g),
      ...text.matchAll(/grid-template-columns\s*:\s*repeat\(\s*3\s*,/g),
      ...text.matchAll(/grid-template-columns\s*:\s*(?:minmax\(0,\s*)?1fr\)?\s+(?:minmax\(0,\s*)?1fr\)?\s+(?:minmax\(0,\s*)?1fr\)?\s*[;}]/g),
    ].sort((a, b) => a.index - b.index);
    if (!hits.length) return [];
    return [{ ...pos(hits[0].index), message: `${hits.length} three-equal-column grid${hits.length > 1 ? 's' : ''}. Try an asymmetric, editorial, or bento layout.` }];
  },
};

function shadowBlurs(value) {
  const out = [];
  for (const layer of splitTop(value)) {
    const nums = [...stripColors(layer).matchAll(/(?<![\w.-])(-?\d*\.?\d+)(px|rem)?(?![\w%])/g)]
      .filter((n) => n[2] || parseFloat(n[1]) === 0)
      .map((n) => toPx(n[1], n[2]));
    if (nums.length >= 3) out.push(nums[2]);
  }
  return out;
}

const shadowHeavy = {
  id: 'shadow-heavy',
  severity: 'warn',
  exts: STYLE,
  summary: 'Large-blur drop shadows.',
  check({ text, pos, config }) {
    const out = [];
    const max = config.shadowBlurMax;
    const report = (idx, blur) =>
      out.push({ ...pos(idx), message: `${fmt(blur)}px shadow blur (limit ${max}px). Use a 1px border; keep shadows for interactive elements.` });

    for (const m of text.matchAll(/(?<![\w-])(?:box|text)-shadow\s*:\s*([^;}]+)/g)) {
      const big = shadowBlurs(m[1]).find((b) => b >= max);
      if (big !== undefined) report(m.index, big);
    }
    for (const m of text.matchAll(/\bboxShadow\s*:\s*(['"`])([^'"`]+)\1/g)) {
      const big = shadowBlurs(m[2]).find((b) => b >= max);
      if (big !== undefined) report(m.index, big);
    }
    for (const m of text.matchAll(/drop-shadow\(/g)) {
      const close = balanced(text, m.index + m[0].length - 1);
      if (close === -1) continue;
      const big = shadowBlurs(text.slice(m.index + m[0].length, close)).find((b) => b >= max);
      if (big !== undefined) report(m.index, big);
    }
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*shadow-\[([^\]]+)\]/g)) {
      const big = shadowBlurs(m[1].replace(/_/g, ' ')).find((b) => b >= max);
      if (big !== undefined) report(m.index, big);
    }
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*(?:drop-)?shadow-2xl(?![\w-])/g)) {
      report(m.index, 50);
    }
    return out;
  },
};

const radiusBlanket = {
  id: 'radius-blanket',
  severity: 'warn',
  exts: STYLE,
  summary: 'Large rounded corners repeated everywhere.',
  check({ text, pos, config }) {
    const hits = [];
    for (const m of text.matchAll(/(?<![\w-])border-radius\s*:\s*(\d*\.?\d+)(px|rem)/g)) {
      const px = toPx(m[1], m[2]);
      if (px >= config.radiusMinPx && px < 999) hits.push(m.index);
    }
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*rounded(?:-[a-z]{1,2})?-(?:2xl|3xl)(?![\w-])/g)) hits.push(m.index);
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*rounded(?:-[a-z]{1,2})?-\[(\d*\.?\d+)(px|rem)\]/g)) {
      const px = toPx(m[1], m[2]);
      if (px >= config.radiusMinPx && px < 999) hits.push(m.index);
    }
    if (hits.length < config.radiusRepeat) return [];
    hits.sort((a, b) => a - b);
    return [{ ...pos(hits[0]), message: `${hits.length} corner radii of ${config.radiusMinPx}px or more. Pick one: sharp (2px) or pill (999px).` }];
  },
};

const buzzwords = [
  [/\belevat(?:e|es|ed|ing)\s+(?:your|the|every|how)\b/i, 'name the concrete result instead'],
  [/\bseamless(?:ly)?\b/i, 'say what connects to what'],
  [/\bunlock(?:s|ed|ing)?\s+(?:(?:your|the|new|full|hidden|its|their)\s+)*(?:power|potential|insights?|value|growth|possibilities|productivity)\b/i, 'state the benefit with a number'],
  [/\bsuper-?charg(?:e|es|ed|ing)\b/i, 'state the measured gain'],
  [/\bgame-?chang(?:er|ing)\b/i, 'show what changed and by how much'],
  [/\bcutting-edge\b/i, 'name the technique or version'],
  [/\bnext-gen(?:eration)?\b/i, 'name what is new'],
  [/\brevolution(?:ize|izes|ized|ise|ises|ised|ary)\b/i, 'describe the actual change'],
  [/\bunleash(?:es|ed|ing)?\b/i, 'state the action'],
  [/\bempower(?:s|ed|ing)?\s+(?:you|your|teams?|users?|businesses|everyone)\b/i, 'say what they can now do'],
  [/\beffortless(?:ly)?\b/i, 'give the step count or time'],
  [/\bleverag(?:e|es|ed|ing)\s+(?:the\s+power|your|our|ai|cutting)/i, 'use "use" and name the thing'],
  [/\bdelv(?:e|es|ed|ing)\b/i, 'cut it'],
  [/\bin today['’]s\s+(?:fast-paced|digital|ever-changing|modern)\b/i, 'start with the point'],
  [/\bto the next level\b/i, 'state the target number'],
  [/\b(?:world-class|best-in-class|state-of-the-art)\b/i, 'prove it with a figure or name'],
  [/\bholistic\b/i, 'name the parts'],
  [/\bsynerg(?:y|ies|ize)\b/i, 'cut it'],
];

const buzzwordCopy = {
  id: 'buzzword-copy',
  severity: 'warn',
  exts: COPY,
  summary: 'Buzzword copy ("Elevate your workflow", "Seamless", "Unlock").',
  check({ text, pos }) {
    const out = [];
    let lineStart = 0;
    for (const line of text.split('\n')) {
      for (const [re, hint] of buzzwords) {
        const m = re.exec(line);
        if (m) {
          out.push({ ...pos(lineStart + m.index), message: `Buzzword "${m[0].trim()}": ${hint}. Prefer a concrete benefit with a number or name.` });
          break;
        }
      }
      lineStart += line.length + 1;
    }
    return out;
  },
};

const loremIpsum = {
  id: 'lorem-ipsum',
  severity: 'warn',
  exts: COPY,
  summary: 'Placeholder lorem ipsum text.',
  check({ text, pos }) {
    const m = /lorem ipsum|dolor sit amet|consectetur adipiscing/i.exec(text);
    return m ? [{ ...pos(m.index), message: 'Placeholder lorem ipsum. Write the real copy.' }] : [];
  },
};

const SPACING_PROP =
  /(?<![\w-])(?:padding|margin)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?|(?:Top|Right|Bottom|Left|Inline|Block)(?:Start|End)?)?\s*:|(?<![\w-])(?:row-|column-)?gap\s*:|\b(?:rowGap|columnGap)\s*:/g;

const spacingOffScale = {
  id: 'spacing-off-scale',
  severity: 'warn',
  exts: STYLE,
  summary: 'Spacing values outside the 4/8 scale.',
  check({ text, pos, config }) {
    const scale = new Set(config.spacingScale);
    const bad = []; // { idx, label }
    const check = (idx, px, label) => {
      if (!scale.has(Math.abs(px))) bad.push({ idx, label });
    };

    for (const m of text.matchAll(SPACING_PROP)) {
      const rest = text.slice(m.index + m[0].length).split(/[;}\n]/)[0];
      const value = stripColors(rest.replace(/(?:calc|clamp|min|max)\([^)]*\)/g, ' '));
      for (const t of value.matchAll(/(?<![\w.-])(-?\d*\.?\d+)(px|rem)\b/g)) {
        check(m.index, toPx(t[1], t[2]), `${t[1]}${t[2]}`);
      }
    }

    const TW = /(?<![A-Za-z0-9_-])(-?)(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(\d+(?:\.\d+)?|\[[^\]\s]+\])(?![\w.-])/g;
    for (const m of text.matchAll(TW)) {
      const raw = m[2];
      if (raw.startsWith('[')) {
        const t = /^\[(\d*\.?\d+)(px|rem)\]$/.exec(raw);
        if (t) check(m.index, toPx(t[1], t[2]), m[0]);
      } else {
        check(m.index, parseFloat(raw) * 4, m[0]);
      }
    }

    if (!bad.length) return [];
    bad.sort((a, b) => a.idx - b.idx);
    const sample = [...new Set(bad.map((b) => b.label))].slice(0, 4).join(', ');
    return [{ ...pos(bad[0].idx), message: `${bad.length} off-scale spacing value${bad.length > 1 ? 's' : ''} (${sample}). Scale: ${config.spacingScale.filter((n) => n).join(' ')}.` }];
  },
};

const centerAll = {
  id: 'center-all',
  severity: 'warn',
  exts: STYLE,
  summary: 'Center-aligned text on most sections.',
  check({ text, pos, config }) {
    const hits = [
      ...text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*text-center(?![\w-])/g),
      ...text.matchAll(/text-align\s*:\s*center/g),
    ].sort((a, b) => a.index - b.index);
    if (hits.length < config.centerRepeat) return [];
    return [{ ...pos(hits[0].index), message: `${hits.length} center-aligned blocks. Left-align body copy and keep lines to 65ch.` }];
  },
};

function durationsMs(value, { all }) {
  const out = [];
  for (const layer of splitTop(value)) {
    if (/\binfinite\b/.test(layer)) continue;
    const times = [...layer.matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)].map((t) => (t[2] === 's' ? parseFloat(t[1]) * 1000 : parseFloat(t[1])));
    if (all) out.push(...times);
    else if (times.length) out.push(times[0]);
  }
  return out;
}

const motionDuration = {
  id: 'motion-duration',
  severity: 'warn',
  exts: STYLE,
  summary: 'Transition or animation duration outside 150-400ms.',
  check({ text, pos, config }) {
    const out = [];
    const { motionMinMs: lo, motionMaxMs: hi } = config;
    const flag = (idx, ms) =>
      out.push({ ...pos(idx), message: `${fmt(ms)}ms motion (allowed ${lo}-${hi}ms). Keep one easing and short durations.` });
    const bad = (ms) => ms > 0 && (ms < lo || ms > hi);

    for (const m of text.matchAll(/(?<![\w-])(transition|animation)(-duration)?\s*:\s*([^;}]+)/g)) {
      const ms = durationsMs(m[3], { all: Boolean(m[2]) }).find(bad);
      if (ms !== undefined) flag(m.index, ms);
    }
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*duration-(\d+)(?![\w-])/g)) {
      const ms = parseInt(m[1], 10);
      if (bad(ms)) flag(m.index, ms);
    }
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*duration-\[(\d*\.?\d+)(ms|s)\]/g)) {
      const ms = m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
      if (bad(ms)) flag(m.index, ms);
    }
    return out;
  },
};

const pureBlackWhite = {
  id: 'pure-black-white',
  severity: 'warn',
  exts: STYLE,
  summary: 'Pure #000 backgrounds.',
  check({ text, pos }) {
    const out = [];
    const msg = 'Pure black background. Use a tint such as #0B0B0F, with #F7F6F3 instead of #fff.';
    for (const m of text.matchAll(/(?<![\w-])background(?:-color)?\s*:\s*(?:#000(?:000)?|black)(?![\w-])/gi)) out.push({ ...pos(m.index), message: msg });
    for (const m of text.matchAll(/(?<![A-Za-z0-9_-])(?:[a-z0-9]+:)*bg-(?:black(?![/\w-])|\[#000(?:000)?\])/g)) out.push({ ...pos(m.index), message: msg });
    return out;
  },
};

// Project-level rule. check() is a no-op; lint.mjs aggregates iconImports().
const iconMix = {
  id: 'icon-mix',
  severity: 'warn',
  exts: SCRIPTS,
  scope: 'project',
  summary: 'More than one icon set imported across the project.',
  check() { return []; },
};

export function iconFamily(mod) {
  const rules = [
    [/^(?:lucide(?:-[a-z]+)*|@lucide\/.+)$/, () => 'lucide'],
    [/^@heroicons\//, () => 'heroicons'],
    [/^(?:@phosphor-icons\/|phosphor-react)/, () => 'phosphor'],
    [/^(?:@tabler\/icons|tabler-icons)/, () => 'tabler'],
    [/^react-icons\/(\w+)/, (m) => ({ lu: 'lucide', hi: 'heroicons', hi2: 'heroicons', pi: 'phosphor', tb: 'tabler' })[m[1]] ?? `react-icons/${m[1]}`],
    [/^@radix-ui\/react-icons/, () => 'radix-icons'],
    [/^@fortawesome\//, () => 'fontawesome'],
    [/^(?:react-feather|feather-icons)/, () => 'feather'],
    [/^(?:remixicon|@remixicon\/)/, () => 'remix'],
    [/^@mui\/icons-material/, () => 'material'],
    [/^bootstrap-icons/, () => 'bootstrap'],
  ];
  for (const [re, name] of rules) {
    const m = re.exec(mod);
    if (m) return name(m);
  }
  return null;
}

export function iconImports(text) {
  const out = [];
  for (const m of text.matchAll(/(?:from\s*|import\s*|require\(\s*)(['"])([^'"]+)\1/g)) {
    const family = iconFamily(m[2]);
    if (family) out.push({ idx: m.index, family });
  }
  return out;
}

export const RULES = [
  fontDefault, gradientPurpleBlue, emojiIcon, buzzwordCopy, loremIpsum,
  cardGrid3, shadowHeavy, radiusBlanket, spacingOffScale, centerAll,
  motionDuration, pureBlackWhite, iconMix,
];

export const RULE_IDS = RULES.map((r) => r.id);
