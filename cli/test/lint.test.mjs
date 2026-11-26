import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, RULES, RULE_IDS } from '../lib/rules.mjs';
import { lintText, lintFiles } from '../lib/lint.mjs';
import { contrastRatio, parseColor } from '../lib/color.mjs';

const ids = (text, ext = 'css') => lintText(text, ext, DEFAULTS).findings.map((f) => f.rule);
const has = (text, rule, ext) => ids(text, ext).includes(rule);

test('font-default: flags a primary Inter or Roboto, ignores fallbacks and look-alikes', () => {
  assert.ok(has("body { font-family: 'Inter', sans-serif }", 'font-default'));
  assert.ok(has('body { font-family: Roboto, Arial }', 'font-default'));
  assert.ok(has("const s = { fontFamily: 'Inter, sans-serif' }", 'font-default', 'tsx'));
  assert.ok(has("theme: { fontFamily: { sans: ['Inter', 'sans-serif'] } }", 'font-default', 'js'));
  assert.ok(has('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400">', 'font-default', 'html'));
  assert.ok(has("import { Inter } from 'next/font/google'", 'font-default', 'tsx'));
  assert.ok(!has("body { font-family: system-ui, 'Inter', sans-serif }", 'font-default'));
  assert.ok(!has("body { font-family: 'Inter Tight', sans-serif }", 'font-default'));
  assert.ok(!has('<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono">', 'font-default', 'html'));
  assert.ok(!has('body { font-family: var(--font-body) }', 'font-default'));
});

test('gradient-purple-blue: hex, rgb, hsl, named and Tailwind forms', () => {
  assert.ok(has('a { background: linear-gradient(135deg, #7c3aed, #3b82f6) }', 'gradient-purple-blue'));
  assert.ok(has('a { background: linear-gradient(to right, rgb(124, 58, 237), rgba(59, 130, 246, .8)) }', 'gradient-purple-blue'));
  assert.ok(has('a { background: linear-gradient(90deg, hsl(270 80% 60%), hsl(220 90% 60%)) }', 'gradient-purple-blue'));
  assert.ok(has('a { background: linear-gradient(purple, blue) }', 'gradient-purple-blue'));
  assert.ok(has('a { background: linear-gradient(#8b5cf6, #ec4899) }', 'gradient-purple-blue'));
  assert.ok(has('<div class="bg-gradient-to-r from-purple-500 to-blue-500">', 'gradient-purple-blue', 'html'));
  assert.ok(has('<div className="bg-gradient-to-br from-indigo-500 via-purple-500\n to-pink-500">', 'gradient-purple-blue', 'tsx'));
  assert.ok(!has('a { background: linear-gradient(180deg, #f7f6f3, #e9e6df) }', 'gradient-purple-blue'));
  assert.ok(!has('a { background: linear-gradient(#ff4d00, #ffb000) }', 'gradient-purple-blue'));
  assert.ok(!has('<div class="bg-gradient-to-r from-orange-500 to-amber-500">', 'gradient-purple-blue', 'html'));
  assert.ok(!has('<div class="bg-gradient-to-r from-blue-500 to-cyan-500">', 'gradient-purple-blue', 'html'));
});

test('emoji-icon: flags pictographs in markup only, allows flags and text symbols', () => {
  assert.ok(has('<li>🚀 Fast</li>', 'emoji-icon', 'html'));
  assert.ok(has('<button>⚡ Go</button>', 'emoji-icon', 'tsx'));
  assert.ok(!has('<li>✓ Included</li>', 'emoji-icon', 'html'));
  assert.ok(!has('<span>🇮🇩</span>', 'emoji-icon', 'html'));
  assert.ok(!has("console.log('🚀 started')", 'emoji-icon', 'ts'));
  assert.ok(!has('<p>© 2026 ™</p>', 'emoji-icon', 'html'));
});

test('buzzword-copy and lorem-ipsum', () => {
  assert.ok(has('<h1>Elevate your workflow</h1>', 'buzzword-copy', 'html'));
  assert.ok(has('Seamless integration', 'buzzword-copy', 'md'));
  assert.ok(has('Unlock the full potential of your team', 'buzzword-copy', 'md'));
  assert.ok(has('A game-changing release', 'buzzword-copy', 'md'));
  assert.ok(!has('const door = unlock(key)', 'buzzword-copy', 'tsx'));
  assert.ok(!has('<p>Reconciles 9 of 10 bank lines automatically.</p>', 'buzzword-copy', 'html'));
  assert.ok(has('<p>Lorem ipsum dolor sit amet</p>', 'lorem-ipsum', 'html'));
  assert.ok(!has('<p>Real copy</p>', 'lorem-ipsum', 'html'));
});

test('card-grid-3', () => {
  assert.ok(has('.g { display:grid; grid-template-columns: repeat(3, 1fr) }', 'card-grid-3'));
  assert.ok(has('.g { grid-template-columns: 1fr 1fr 1fr; }', 'card-grid-3'));
  assert.ok(has('<div class="grid md:grid-cols-3 gap-8">', 'card-grid-3', 'html'));
  assert.ok(!has('.g { grid-template-columns: 2fr 1fr }', 'card-grid-3'));
  assert.ok(!has('<div class="grid grid-cols-2 lg:grid-cols-4">', 'card-grid-3', 'html'));
  assert.ok(!has('<div class="grid-cols-30">', 'card-grid-3', 'html'));
});

test('shadow-heavy: parses layers, colors and Tailwind', () => {
  assert.ok(has('.c { box-shadow: 0 20px 40px rgba(0,0,0,.25) }', 'shadow-heavy'));
  assert.ok(has('.c { box-shadow: 0 1px 2px #000, 0 30px 60px rgba(0,0,0,.3) }', 'shadow-heavy'));
  assert.ok(has('.c { filter: drop-shadow(0 20px 40px rgba(0,0,0,.4)) }', 'shadow-heavy'));
  assert.ok(has('<div class="shadow-2xl">', 'shadow-heavy', 'html'));
  assert.ok(has('<div class="shadow-[0_20px_50px_rgba(0,0,0,0.3)]">', 'shadow-heavy', 'html'));
  assert.ok(!has('.c { box-shadow: 0 2px 8px rgba(0,0,0,.2) }', 'shadow-heavy'));
  assert.ok(!has('.c { box-shadow: 0 0 0 1px rgba(0,0,0,.1) }', 'shadow-heavy'));
  assert.ok(!has('<div class="shadow-md">', 'shadow-heavy', 'html'));
});

test('radius-blanket needs repetition', () => {
  assert.ok(has('<a class="rounded-2xl"></a><b class="rounded-2xl"></b><i class="rounded-3xl"></i>', 'radius-blanket', 'html'));
  assert.ok(has('.a{border-radius:16px}.b{border-radius:20px}.c{border-radius:1.5rem}', 'radius-blanket'));
  assert.ok(!has('<a class="rounded-2xl"></a>', 'radius-blanket', 'html'));
  assert.ok(!has('.a{border-radius:999px}.b{border-radius:999px}.c{border-radius:9999px}', 'radius-blanket'));
  assert.ok(!has('.a{border-radius:2px}.b{border-radius:4px}.c{border-radius:8px}', 'radius-blanket'));
});

test('spacing-off-scale: CSS, rem and Tailwind', () => {
  assert.ok(has('.a { padding: 13px }', 'spacing-off-scale'));
  assert.ok(has('.a { margin: 0 auto; padding-top: 1.25rem }', 'spacing-off-scale'));
  assert.ok(has('<div class="p-5">', 'spacing-off-scale', 'html'));
  assert.ok(has('<div class="md:mt-10 gap-3.5">', 'spacing-off-scale', 'html'));
  assert.ok(has('<div class="p-[13px]">', 'spacing-off-scale', 'html'));
  assert.ok(!has('.a { padding: 16px 24px; margin: 0 auto; gap: 8px }', 'spacing-off-scale'));
  assert.ok(!has('.a { padding: 1rem 1.5rem; margin-top: -32px }', 'spacing-off-scale'));
  assert.ok(!has('.a { padding: clamp(1rem, 4vw, 3rem) }', 'spacing-off-scale'));
  assert.ok(!has('<div class="p-4 md:px-6 gap-8 mt-12 mx-auto">', 'spacing-off-scale', 'html'));
  assert.ok(!has('.a { border: 1px solid; width: 13px; top: 5px }', 'spacing-off-scale'));
});

test('center-all counts repeats', () => {
  assert.ok(has('<i class="text-center"></i>'.repeat(4), 'center-all', 'html'));
  assert.ok(!has('<i class="text-center"></i>'.repeat(3), 'center-all', 'html'));
});

test('motion-duration: shorthand, longhand, delay and Tailwind', () => {
  assert.ok(has('a { transition: all 0.8s ease }', 'motion-duration'));
  assert.ok(has('a { transition: opacity 200ms ease, transform 1s ease }', 'motion-duration'));
  assert.ok(has('a { transition-duration: 600ms }', 'motion-duration'));
  assert.ok(has('<div class="duration-700">', 'motion-duration', 'html'));
  assert.ok(has('<div class="duration-[1.2s]">', 'motion-duration', 'html'));
  assert.ok(!has('a { transition: opacity 200ms ease 1s }', 'motion-duration'));
  assert.ok(!has('a { transition: color 150ms ease-out }', 'motion-duration'));
  assert.ok(!has('a { animation: spin 1s linear infinite }', 'motion-duration'));
  assert.ok(!has('<div class="duration-300">', 'motion-duration', 'html'));
});

test('pure-black-white', () => {
  assert.ok(has('body { background: #000 }', 'pure-black-white'));
  assert.ok(has('body { background-color: black }', 'pure-black-white'));
  assert.ok(has('<body class="bg-black">', 'pure-black-white', 'html'));
  assert.ok(!has('<div class="bg-black/50">', 'pure-black-white', 'html'));
  assert.ok(!has('body { background: #0b0b0f }', 'pure-black-white'));
});

test('suppression comments', () => {
  const bad = "body { font-family: 'Inter' }";
  assert.deepEqual(ids(`/* killslop-disable-file */\n${bad}`), []);
  assert.deepEqual(ids(`/* killslop-disable-file font-default */\n${bad}`), []);
  assert.deepEqual(ids(`${bad} /* killslop-disable-line */`), []);
  assert.deepEqual(ids(`/* killslop-disable-next-line font-default */\n${bad}`), []);
  assert.deepEqual(ids(`/* killslop-disable-next-line card-grid-3 */\n${bad}`), ['font-default']);
  assert.deepEqual(ids(`${bad}\n/* killslop-disable-next-line */\n${bad}`), ['font-default']);
});

test('config can turn rules off and change severity', () => {
  const config = { ...DEFAULTS, rules: { 'font-default': 'off', 'card-grid-3': 'error' } };
  const r = lintText("body { font-family: Inter } .g { grid-template-columns: repeat(3, 1fr) }", 'css', config).findings;
  assert.deepEqual(r.map((f) => [f.rule, f.severity]), [['card-grid-3', 'error']]);
});

test('findings carry accurate line and column', () => {
  const f = lintText("a { color: red }\n\nbody { font-family: Inter }", 'css', DEFAULTS).findings[0];
  assert.equal(f.line, 3);
  assert.equal(f.col, 8);
});

test('icon-mix is project level', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ks-icons-'));
  fs.writeFileSync(path.join(dir, 'a.tsx'), "import { Home } from 'lucide-react';\n");
  fs.writeFileSync(path.join(dir, 'b.tsx'), "import { HomeIcon } from '@heroicons/react/24/outline';\n");
  const mixed = lintFiles([path.join(dir, 'a.tsx'), path.join(dir, 'b.tsx')], DEFAULTS, dir);
  assert.deepEqual(mixed.map((f) => f.rule), ['icon-mix']);
  assert.match(mixed[0].message, /lucide, heroicons/);
  fs.writeFileSync(path.join(dir, 'b.tsx'), "import { X } from 'react-icons/lu';\n");
  assert.deepEqual(lintFiles([path.join(dir, 'a.tsx'), path.join(dir, 'b.tsx')], DEFAULTS, dir), []);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('every rule id is covered by this suite', () => {
  assert.equal(RULE_IDS.length, 13);
});

test('all built-in heuristic rules default to advisory warnings', () => {
  assert.ok(RULES.every((rule) => rule.severity === 'warn'));
});

test('Tailwind gradient detection stays within each class attribute', () => {
  const separated = '<div class="bg-gradient-to-r from-purple-500"></div><div class="from-green-500 to-blue-500"></div>';
  assert.ok(!has(separated, 'gradient-purple-blue', 'html'));
});

test('emoji locations account for astral characters before the finding', () => {
  const finding = lintText('<p>😀 🚀</p>', 'html', DEFAULTS).findings.find((item) => item.rule === 'emoji-icon');
  assert.equal(finding.line, 1);
  assert.equal(finding.col, 4);
});

test('contrast math matches known WCAG values', () => {
  assert.equal(contrastRatio(parseColor('#000'), parseColor('#fff')).toFixed(2), '21.00');
  assert.equal(contrastRatio(parseColor('#777'), parseColor('#fff')).toFixed(2), '4.48');
  assert.equal(contrastRatio(parseColor('rgb(0 0 0)'), parseColor('hsl(0 0% 100%)')).toFixed(2), '21.00');
  assert.equal(parseColor('nonsense'), null);
});

test('color parser rejects malformed and out-of-range CSS values', () => {
  for (const value of [
    'rgb(999 -1 0)', 'rgb(1foo 2 3)', 'rgb(256 0 0)', 'rgb(1 2 3 / 101%)',
    'rgba(1, 2, 3, 2)', 'hsl(0 200% -10%)', 'hsl(0 80 60%)', 'hsl(foo 50% 50%)',
  ]) assert.equal(parseColor(value), null, value);
  assert.equal(parseColor('rgb(100% 0% 0% / 100%)').r, 255);
  assert.equal(parseColor('hsl(1turn 100% 50%)').r, 255);
});

test('transparent colors cannot be treated as a single contrast ratio', () => {
  const transparent = parseColor('rgba(0, 0, 0, .5)');
  assert.equal(transparent.a, 0.5);
  assert.throws(() => contrastRatio(transparent, parseColor('#fff')), /composited/i);
  assert.equal(parseColor('#0008').a, 136 / 255);
});
