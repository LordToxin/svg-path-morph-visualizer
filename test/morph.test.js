/**
 * Unit Test Suite for MorphSVG Engine & Path Optimizer
 */
const assert = require('assert');
const optimizer = require('../js/path-optimizer.js');
const engine = require('../js/morph-engine.js');
const presets = require('../js/presets.js');

let passCount = 0;
let failCount = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failCount++;
  }
}

console.log('--- RUNNING MORPHSVG TEST SUITE ---');

it('parses raw SVG path commands into structured segments', () => {
  const d = 'M 10 20 L 30 40 Z';
  const parsed = optimizer.parsePath(d);
  assert.strictEqual(parsed.length, 3);
  assert.strictEqual(parsed[0].type, 'M');
  assert.deepStrictEqual(parsed[0].args, [10, 20]);
  assert.strictEqual(parsed[1].type, 'L');
  assert.deepStrictEqual(parsed[1].args, [30, 40]);
  assert.strictEqual(parsed[2].type, 'Z');
});

it('normalizes lines into cubic Bezier curves', () => {
  const d = 'M 0 0 L 30 30 Z';
  const cubics = optimizer.normalizeToCubics(d);
  assert.strictEqual(cubics[0].type, 'M');
  assert.strictEqual(cubics[1].type, 'C');
  assert.strictEqual(cubics[1].x, 30);
  assert.strictEqual(cubics[1].y, 30);
});

it('equalizes paths with different segment counts', () => {
  const pathA = 'M 0 0 L 100 0 Z'; // 1 line segment
  const pathB = 'M 0 0 L 50 20 L 100 0 L 100 50 Z'; // 3 segments

  const pair = engine.prepareMorphPair(pathA, pathB);
  assert.strictEqual(pair.a.length, pair.b.length, 'Both paths must have equal segment length');
  assert(pair.a.length >= 3, 'Must have at least 3 segments');
});

it('interpolates endpoints faithfully at t=0 and t=1', () => {
  const pathA = 'M 10 10 L 90 10 Z';
  const pathB = 'M 10 90 L 90 90 Z';

  const pair = engine.prepareMorphPair(pathA, pathB);
  const d0 = engine.getInterpolatedPath(pair, 0.0);
  const d1 = engine.getInterpolatedPath(pair, 1.0);

  assert(d0.includes('M10,10'), 'At t=0 start point should be y=10');
  assert(d1.includes('M10,90'), 'At t=1 start point should be y=90');
});

it('generates valid CSS keyframes rule', () => {
  const preset = presets.getDefaultPreset();
  const pair = engine.prepareMorphPair(preset.pathA, preset.pathB);
  const css = engine.generateCssKeyframes(pair, '1.5s', 'ease-in-out');

  assert(css.includes('@keyframes morphIcon'), 'Must declare @keyframes morphIcon');
  assert(css.includes('d: path('), 'Must include CSS d: path syntax');
  assert(css.includes('animation: morphIcon 1.5s ease-in-out infinite;'), 'Must apply animation');
});

it('generates standalone SMIL animated SVG', () => {
  const preset = presets.getDefaultPreset();
  const pair = engine.prepareMorphPair(preset.pathA, preset.pathB);
  const svg = engine.generateSmilSvg(pair, '1.2s', '#06b6d4', '#10b981');

  assert(svg.startsWith('<svg'), 'Must produce <svg tag');
  assert(svg.includes('<animate'), 'Must contain <animate element');
  assert(svg.includes('attributeName="d"'), 'Must animate d attribute');
  assert(svg.endsWith('</svg>\n') || svg.endsWith('</svg>'), 'Must terminate with </svg>');
});

it('generates Web Animations API script', () => {
  const preset = presets.getDefaultPreset();
  const pair = engine.prepareMorphPair(preset.pathA, preset.pathB);
  const js = engine.generateJsCode(pair);

  assert(js.includes('iconPath.animate('), 'Must invoke element.animate');
  assert(js.includes('iterations: Infinity'), 'Must loop infinitely');
});

it('verifies all 5 curated presets equalize and morph without errors', () => {
  for (const [key, preset] of Object.entries(presets.PRESETS)) {
    const pair = engine.prepareMorphPair(preset.pathA, preset.pathB);
    assert.strictEqual(pair.a.length, pair.b.length, `Preset ${key} must have equal segment counts`);

    const midPath = engine.getInterpolatedPath(pair, 0.5);
    assert(midPath.startsWith('M'), `Preset ${key} interpolated path must start with M`);
    assert(!midPath.includes('NaN'), `Preset ${key} must not contain NaN`);
  }
});

console.log(`\nTest results: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All MorphSVG tests passed successfully! ✨');
}
