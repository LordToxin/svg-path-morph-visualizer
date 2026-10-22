/**
 * MorphSVG Studio Engine
 * Pure JavaScript SVG path parser, cubic Bézier converter, segment equalizer, and interpolator.
 * Zero external dependencies. Works in modern browsers and Node.js.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MorphEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- EASING FUNCTIONS ---
  const EASING = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    easeOutBack: (t) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeOutBounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    },
  };

  /**
   * Tokenize SVG path string into command letters and numeric parameters.
   */
  function tokenizePath(pathStr) {
    if (!pathStr || typeof pathStr !== 'string') return [];
    const tokens = [];
    const regex = /([MmLlHhVvCcSsQqTtAaZz])|([+-]?(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?)/g;
    let match;
    while ((match = regex.exec(pathStr)) !== null) {
      if (match[1]) {
        tokens.push(match[1]);
      } else if (match[2]) {
        tokens.push(parseFloat(match[2]));
      }
    }
    return tokens;
  }

  /**
   * Parse token stream into normalized absolute Cubic Bézier segments:
   * Array of segments: [ { type: 'M', x, y }, { type: 'C', x1, y1, x2, y2, x, y }, ... ]
   */
  function pathToCubicSegments(pathStr) {
    const tokens = tokenizePath(pathStr);
    const segments = [];
    let curX = 0;
    let curY = 0;
    let startX = 0;
    let startY = 0;
    let lastControlX = 0;
    let lastControlY = 0;
    let i = 0;
    let cmd = 'M';

    while (i < tokens.length) {
      if (typeof tokens[i] === 'string') {
        cmd = tokens[i++];
      }

      const isRelative = cmd === cmd.toLowerCase() && cmd !== 'z' && cmd !== 'Z';
      const upperCmd = cmd.toUpperCase();

      if (upperCmd === 'M') {
        let x = tokens[i++];
        let y = tokens[i++];
        if (isRelative) {
          x += curX;
          y += curY;
        }
        curX = x;
        curY = y;
        startX = x;
        startY = y;
        segments.push({ type: 'M', x, y });
        // Subsequent coords without command are treated as L / l
        cmd = isRelative ? 'l' : 'L';
      } else if (upperCmd === 'L') {
        let x = tokens[i++];
        let y = tokens[i++];
        if (isRelative) {
          x += curX;
          y += curY;
        }
        // Linear curve represented as cubic
        segments.push({
          type: 'C',
          x1: curX + (x - curX) / 3,
          y1: curY + (y - curY) / 3,
          x2: curX + ((x - curX) * 2) / 3,
          y2: curY + ((y - curY) * 2) / 3,
          x,
          y,
        });
        curX = x;
        curY = y;
      } else if (upperCmd === 'H') {
        let x = tokens[i++];
        if (isRelative) x += curX;
        segments.push({
          type: 'C',
          x1: curX + (x - curX) / 3,
          y1: curY,
          x2: curX + ((x - curX) * 2) / 3,
          y2: curY,
          x,
          y: curY,
        });
        curX = x;
      } else if (upperCmd === 'V') {
        let y = tokens[i++];
        if (isRelative) y += curY;
        segments.push({
          type: 'C',
          x1: curX,
          y1: curY + (y - curY) / 3,
          x2: curX,
          y2: curY + ((y - curY) * 2) / 3,
          x: curX,
          y,
        });
        curY = y;
      } else if (upperCmd === 'C') {
        let x1 = tokens[i++];
        let y1 = tokens[i++];
        let x2 = tokens[i++];
        let y2 = tokens[i++];
        let x = tokens[i++];
        let y = tokens[i++];
        if (isRelative) {
          x1 += curX;
          y1 += curY;
          x2 += curX;
          y2 += curY;
          x += curX;
          y += curY;
        }
        segments.push({ type: 'C', x1, y1, x2, y2, x, y });
        lastControlX = x2;
        lastControlY = y2;
        curX = x;
        curY = y;
      } else if (upperCmd === 'S') {
        let x2 = tokens[i++];
        let y2 = tokens[i++];
        let x = tokens[i++];
        let y = tokens[i++];
        if (isRelative) {
          x2 += curX;
          y2 += curY;
          x += curX;
          y += curY;
        }
        // Smooth cubic: first control point is reflection of previous
        const x1 = 2 * curX - lastControlX;
        const y1 = 2 * curY - lastControlY;
        segments.push({ type: 'C', x1, y1, x2, y2, x, y });
        lastControlX = x2;
        lastControlY = y2;
        curX = x;
        curY = y;
      } else if (upperCmd === 'Q') {
        let qx = tokens[i++];
        let qy = tokens[i++];
        let x = tokens[i++];
        let y = tokens[i++];
        if (isRelative) {
          qx += curX;
          qy += curY;
          x += curX;
          y += curY;
        }
        // Quadratic to cubic conversion
        const x1 = curX + (2 / 3) * (qx - curX);
        const y1 = curY + (2 / 3) * (qy - curY);
        const x2 = x + (2 / 3) * (qx - x);
        const y2 = y + (2 / 3) * (qy - y);
        segments.push({ type: 'C', x1, y1, x2, y2, x, y });
        lastControlX = qx;
        lastControlY = qy;
        curX = x;
        curY = y;
      } else if (upperCmd === 'Z') {
        if (curX !== startX || curY !== startY) {
          segments.push({
            type: 'C',
            x1: curX + (startX - curX) / 3,
            y1: curY + (startY - curY) / 3,
            x2: curX + ((startX - curX) * 2) / 3,
            y2: curY + ((startY - curY) * 2) / 3,
            x: startX,
            y: startY,
          });
          curX = startX;
          curY = startY;
        }
        segments.push({ type: 'Z' });
      } else {
        // Fallback: skip unknown/complex token
        i++;
      }
    }

    return segments;
  }

  /**
   * Split a single Cubic Bézier segment into two at parameter t (de Casteljau's algorithm).
   */
  function splitCubic(x0, y0, x1, y1, x2, y2, x3, y3, t) {
    const x01 = x0 + (x1 - x0) * t;
    const y01 = y0 + (y1 - y0) * t;
    const x12 = x1 + (x2 - x1) * t;
    const y12 = y1 + (y2 - y1) * t;
    const x23 = x2 + (x3 - x2) * t;
    const y23 = y2 + (y3 - y2) * t;

    const x012 = x01 + (x12 - x01) * t;
    const y012 = y01 + (y12 - y01) * t;
    const x123 = x12 + (x23 - x12) * t;
    const y123 = y12 + (y23 - y12) * t;

    const x0123 = x012 + (x123 - x012) * t;
    const y0123 = y012 + (y123 - y012) * t;

    return [
      { type: 'C', x1: x01, y1: y01, x2: x012, y2: y012, x: x0123, y: y0123 },
      { type: 'C', x1: x123, y1: y123, x2: x23, y2: y23, x: x3, y: y3 },
    ];
  }

  /**
   * Subdivide segments so both paths have identical number of 'C' segments.
   */
  function equalizeSegments(segsA, segsB) {
    const a = JSON.parse(JSON.stringify(segsA));
    const b = JSON.parse(JSON.stringify(segsB));

    function countCurves(segs) {
      return segs.filter((s) => s.type === 'C').length;
    }

    function addSubdivisions(segs, targetCount) {
      while (countCurves(segs) < targetCount) {
        let maxLen = -1;
        let bestIdx = -1;
        let prevX = 0;
        let prevY = 0;

        for (let i = 0; i < segs.length; i++) {
          const s = segs[i];
          if (s.type === 'M') {
            prevX = s.x;
            prevY = s.y;
          } else if (s.type === 'C') {
            const dx = s.x - prevX;
            const dy = s.y - prevY;
            const lenSq = dx * dx + dy * dy;
            if (lenSq > maxLen) {
              maxLen = lenSq;
              bestIdx = i;
            }
            prevX = s.x;
            prevY = s.y;
          }
        }

        if (bestIdx !== -1) {
          const target = segs[bestIdx];
          const prev = bestIdx > 0 ? segs[bestIdx - 1] : { x: 0, y: 0 };
          const pX = prev.x || 0;
          const pY = prev.y || 0;
          const [part1, part2] = splitCubic(pX, pY, target.x1, target.y1, target.x2, target.y2, target.x, target.y, 0.5);
          segs.splice(bestIdx, 1, part1, part2);
        } else {
          break;
        }
      }
    }

    const countA = countCurves(a);
    const countB = countCurves(b);

    if (countA < countB) {
      addSubdivisions(a, countB);
    } else if (countB < countA) {
      addSubdivisions(b, countA);
    }

    return [a, b];
  }

  /**
   * Interpolate between two equalized segment arrays at parameter t (0.0 to 1.0).
   */
  function interpolateSegments(segsA, segsB, t) {
    const safeT = Math.max(0, Math.min(1, t));
    const result = [];
    const len = Math.min(segsA.length, segsB.length);

    for (let i = 0; i < len; i++) {
      const a = segsA[i];
      const b = segsB[i];

      if (a.type === 'M' && b.type === 'M') {
        result.push({
          type: 'M',
          x: a.x + (b.x - a.x) * safeT,
          y: a.y + (b.y - a.y) * safeT,
        });
      } else if (a.type === 'C' && b.type === 'C') {
        result.push({
          type: 'C',
          x1: a.x1 + (b.x1 - a.x1) * safeT,
          y1: a.y1 + (b.y1 - a.y1) * safeT,
          x2: a.x2 + (b.x2 - a.x2) * safeT,
          y2: a.y2 + (b.y2 - a.y2) * safeT,
          x: a.x + (b.x - a.x) * safeT,
          y: a.y + (b.y - a.y) * safeT,
        });
      } else if (a.type === 'Z' || b.type === 'Z') {
        result.push({ type: 'Z' });
      }
    }

    return result;
  }

  /**
   * Format segments back to standard SVG path string 'd'.
   */
  function segmentsToPathString(segments, decimals = 2) {
    const round = (num) => Number(num.toFixed(decimals));
    let str = '';

    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (s.type === 'M') {
        str += `M ${round(s.x)} ${round(s.y)} `;
      } else if (s.type === 'C') {
        str += `C ${round(s.x1)} ${round(s.y1)}, ${round(s.x2)} ${round(s.y2)}, ${round(s.x)} ${round(s.y)} `;
      } else if (s.type === 'Z') {
        str += 'Z ';
      }
    }

    return str.trim();
  }

  /**
   * High-level MorphInterpolator instance for a pair of paths.
   */
  class MorphInterpolator {
    constructor(pathAStr, pathBStr) {
      this.rawA = pathAStr;
      this.rawB = pathBStr;
      this.segsA = pathToCubicSegments(pathAStr);
      this.segsB = pathToCubicSegments(pathBStr);
      const [eqA, eqB] = equalizeSegments(this.segsA, this.segsB);
      this.equalA = eqA;
      this.equalB = eqB;
      this.normalizedPathA = segmentsToPathString(this.equalA);
      this.normalizedPathB = segmentsToPathString(this.equalB);
    }

    at(t, easingName = 'linear') {
      const easeFn = EASING[easingName] || EASING.linear;
      const easedT = easeFn(t);
      const interpolated = interpolateSegments(this.equalA, this.equalB, easedT);
      return segmentsToPathString(interpolated);
    }

    getStats() {
      return {
        initialCurvesA: this.segsA.filter((s) => s.type === 'C').length,
        initialCurvesB: this.segsB.filter((s) => s.type === 'C').length,
        equalizedCurves: this.equalA.filter((s) => s.type === 'C').length,
      };
    }

    generateCSS(duration = 1.5, animationName = 'morphAnimation') {
      return `/* Pure CSS SVG Path Morph Keyframes */
@keyframes ${animationName} {
  0% {
    d: path("${this.normalizedPathA}");
  }
  50% {
    d: path("${this.normalizedPathB}");
  }
  100% {
    d: path("${this.normalizedPathA}");
  }
}

.morph-vector {
  animation: ${animationName} ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}`;
    }

    generateSMIL(duration = 1.5) {
      return `<!-- Native Standalone SVG SMIL Animation -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path d="${this.normalizedPathA}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <animate
      attributeName="d"
      dur="${duration}s"
      repeatCount="indefinite"
      values="${this.normalizedPathA}; ${this.normalizedPathB}; ${this.normalizedPathA}"
      keyTimes="0; 0.5; 1"
    />
  </path>
</svg>`;
    }

    generateWAAPI(duration = 1500) {
      return `// Web Animations API (WAAPI) JavaScript Snippet
const pathElement = document.querySelector('path.morph-target');

pathElement.animate(
  [
    { d: 'path("${this.normalizedPathA}")' },
    { d: 'path("${this.normalizedPathB}")' }
  ],
  {
    duration: ${duration},
    direction: 'alternate',
    iterations: Infinity,
    easing: 'ease-in-out'
  }
);`;
    }
  }

  return {
    EASING,
    tokenizePath,
    pathToCubicSegments,
    equalizeSegments,
    interpolateSegments,
    segmentsToPathString,
    MorphInterpolator,
  };
});
