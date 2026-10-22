/**
 * MorphSVG Animation & Code Generation Engine
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./path-optimizer.js'));
  } else {
    root.MorphEngine = factory(root.PathOptimizer);
  }
})(typeof self !== 'undefined' ? self : this, function (Optimizer) {
  'use strict';

  // Easing Functions
  const EASING = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => t * (2 - t),
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    elasticOut: (t) => {
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
  };

  /**
   * Prepares equalized segment pair from raw SVG path strings
   */
  function prepareMorphPair(pathA, pathB) {
    const cubicsA = Optimizer.normalizeToCubics(pathA);
    const cubicsB = Optimizer.normalizeToCubics(pathB);
    return Optimizer.equalizeSegments(cubicsA, cubicsB);
  }

  /**
   * Interpolate path string at progress t
   */
  function getInterpolatedPath(equalizedPair, t, easingName = 'linear') {
    const easeFn = EASING[easingName] || EASING.linear;
    const easedT = easeFn(Math.max(0, Math.min(1, t)));
    const interpolated = Optimizer.interpolateSegments(equalizedPair.a, equalizedPair.b, easedT);
    return Optimizer.serializeSegments(interpolated, 2);
  }

  /**
   * Generates pure CSS @keyframes morph declaration
   */
  function generateCssKeyframes(equalizedPair, duration = '1.2s', easing = 'ease-in-out') {
    const dStart = Optimizer.serializeSegments(equalizedPair.a, 1);
    const dEnd = Optimizer.serializeSegments(equalizedPair.b, 1);

    return [
      `/* CSS Path Morph Animation */`,
      `@keyframes morphIcon {`,
      `  0%, 100% {`,
      `    d: path("${dStart}");`,
      `  }`,
      `  50% {`,
      `    d: path("${dEnd}");`,
      `  }`,
      `}`,
      ``,
      `.morph-icon path {`,
      `  animation: morphIcon ${duration} ${easing} infinite;`,
      `  transition: fill 0.3s ease;`,
      `}`
    ].join('\n');
  }

  /**
   * Generates standalone SMIL animated SVG graphic
   */
  function generateSmilSvg(equalizedPair, duration = '1.5s', strokeColor = '#38bdf8', fillColor = 'none') {
    const dStart = Optimizer.serializeSegments(equalizedPair.a, 1);
    const dEnd = Optimizer.serializeSegments(equalizedPair.b, 1);

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">`,
      `  <path d="${dStart}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`,
      `    <animate`,
      `      attributeName="d"`,
      `      dur="${duration}"`,
      `      repeatCount="indefinite"`,
      `      values="${dStart}; ${dEnd}; ${dStart}"`,
      `      keyTimes="0; 0.5; 1"`,
      `      calcMode="spline"`,
      `      keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"`,
      `    />`,
      `  </path>`,
      `</svg>`
    ].join('\n');
  }

  /**
   * Generates vanilla JS animation snippet
   */
  function generateJsCode(equalizedPair) {
    const dStart = Optimizer.serializeSegments(equalizedPair.a, 1);
    const dEnd = Optimizer.serializeSegments(equalizedPair.b, 1);

    return [
      `// Vanilla Web Animations API (WAAPI)`,
      `const iconPath = document.querySelector('#morph-path');`,
      ``,
      `iconPath.animate([`,
      `  { d: 'path("${dStart}")' },`,
      `  { d: 'path("${dEnd}")' },`,
      `  { d: 'path("${dStart}")' }`,
      `], {`,
      `  duration: 1200,`,
      `  iterations: Infinity,`,
      `  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'`,
      `});`
    ].join('\n');
  }

  return {
    EASING,
    prepareMorphPair,
    getInterpolatedPath,
    generateCssKeyframes,
    generateSmilSvg,
    generateJsCode
  };
});
