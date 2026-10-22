/**
 * SVG Path Parser, Normalizer & Optimizer
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PathOptimizer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Tokenizes and parses an SVG path 'd' string into commands
   */
  function parsePath(d) {
    if (!d || typeof d !== 'string') return [];
    const commands = [];
    const regex = /([a-df-z])([^a-df-z]*)/gi;
    let match;

    while ((match = regex.exec(d)) !== null) {
      const type = match[1];
      const numbers = match[2]
        .trim()
        .replace(/-/g, ' -')
        .split(/[\s,]+/)
        .map(Number)
        .filter(n => !isNaN(n));

      commands.push({ type, args: numbers });
    }

    return commands;
  }

  /**
   * Converts all path segments to absolute Cubic Bezier segments:
   * M x y
   * C cp1x cp1y, cp2x cp2y, x y
   * Z
   */
  function normalizeToCubics(d) {
    const raw = parsePath(d);
    const cubics = [];
    let curX = 0, curY = 0;
    let startX = 0, startY = 0;

    raw.forEach(cmd => {
      const type = cmd.type;
      const isRel = type === type.toLowerCase();
      const uType = type.toUpperCase();
      const a = cmd.args;

      if (uType === 'M') {
        const x = isRel ? curX + a[0] : a[0];
        const y = isRel ? curY + a[1] : a[1];
        curX = x; curY = y;
        startX = x; startY = y;
        cubics.push({ type: 'M', x, y });
      } else if (uType === 'L') {
        const x = isRel ? curX + a[0] : a[0];
        const y = isRel ? curY + a[1] : a[1];
        // Line as cubic Bezier: control points lie along the line
        cubics.push({
          type: 'C',
          x1: curX + (x - curX) / 3,
          y1: curY + (y - curY) / 3,
          x2: curX + (2 * (x - curX)) / 3,
          y2: curY + (2 * (y - curY)) / 3,
          x: x,
          y: y
        });
        curX = x; curY = y;
      } else if (uType === 'C') {
        const x1 = isRel ? curX + a[0] : a[0];
        const y1 = isRel ? curY + a[1] : a[1];
        const x2 = isRel ? curX + a[2] : a[2];
        const y2 = isRel ? curY + a[3] : a[3];
        const x = isRel ? curX + a[4] : a[4];
        const y = isRel ? curY + a[5] : a[5];
        cubics.push({ type: 'C', x1, y1, x2, y2, x, y });
        curX = x; curY = y;
      } else if (uType === 'Z') {
        if (curX !== startX || curY !== startY) {
          cubics.push({
            type: 'C',
            x1: curX + (startX - curX) / 3,
            y1: curY + (startY - curY) / 3,
            x2: curX + (2 * (startX - curX)) / 3,
            y2: curY + (2 * (startY - curY)) / 3,
            x: startX,
            y: startY
          });
        }
        cubics.push({ type: 'Z', x: startX, y: startY });
        curX = startX; curY = startY;
      }
    });

    return cubics;
  }

  /**
   * Splits a cubic segment array into distinct subpaths (each starting with 'M')
   */
  function splitIntoSubpaths(cubics) {
    const subpaths = [];
    let current = [];

    cubics.forEach(seg => {
      if (seg.type === 'M' && current.length > 0) {
        subpaths.push(current);
        current = [];
      }
      current.push(seg);
    });

    if (current.length > 0) {
      subpaths.push(current);
    }

    return subpaths;
  }

  /**
   * Subdivides cubic segments so that path A and path B have identical segment counts
   */
  function equalizeSegments(cubicsA, cubicsB) {
    const subsA = splitIntoSubpaths(cubicsA);
    const subsB = splitIntoSubpaths(cubicsB);

    // Ensure both have identical subpath counts
    while (subsA.length < subsB.length) {
      const targetSub = subsB[subsA.length];
      const startPt = targetSub[0] || { x: 50, y: 50 };
      // Collapsed subpath at start point
      subsA.push([
        { type: 'M', x: startPt.x, y: startPt.y },
        { type: 'C', x1: startPt.x, y1: startPt.y, x2: startPt.x, y2: startPt.y, x: startPt.x, y: startPt.y },
        { type: 'Z', x: startPt.x, y: startPt.y }
      ]);
    }

    while (subsB.length < subsA.length) {
      const targetSub = subsA[subsB.length];
      const startPt = targetSub[0] || { x: 50, y: 50 };
      subsB.push([
        { type: 'M', x: startPt.x, y: startPt.y },
        { type: 'C', x1: startPt.x, y1: startPt.y, x2: startPt.x, y2: startPt.y, x: startPt.x, y: startPt.y },
        { type: 'Z', x: startPt.x, y: startPt.y }
      ]);
    }

    const equalizedA = [];
    const equalizedB = [];

    // Equalize each pair of corresponding subpaths
    for (let s = 0; s < subsA.length; s++) {
      let subA = subsA[s];
      let subB = subsB[s];

      const countCurves = (arr) => arr.filter(c => c.type === 'C').length;

      while (countCurves(subA) < countCurves(subB)) {
        subdivideLongestSegment(subA);
      }
      while (countCurves(subB) < countCurves(subA)) {
        subdivideLongestSegment(subB);
      }

      equalizedA.push(...subA);
      equalizedB.push(...subB);
    }

    return { a: equalizedA, b: equalizedB };
  }

  function subdivideLongestSegment(segments) {
    let maxIdx = -1;
    let maxLen = -1;

    for (let i = 0; i < segments.length; i++) {
      if (segments[i].type === 'C') {
        const prev = segments[i - 1] || { x: 0, y: 0 };
        const dx = segments[i].x - prev.x;
        const dy = segments[i].y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > maxLen) {
          maxLen = len;
          maxIdx = i;
        }
      }
    }

    if (maxIdx !== -1) {
      const seg = segments[maxIdx];
      const p0 = segments[maxIdx - 1] || { x: 0, y: 0 };
      const p1 = { x: seg.x1, y: seg.y1 };
      const p2 = { x: seg.x2, y: seg.y2 };
      const p3 = { x: seg.x, y: seg.y };

      // De Casteljau subdivision at t = 0.5
      const m1 = lerpPoint(p0, p1, 0.5);
      const m2 = lerpPoint(p1, p2, 0.5);
      const m3 = lerpPoint(p2, p3, 0.5);
      const q1 = lerpPoint(m1, m2, 0.5);
      const q2 = lerpPoint(m2, m3, 0.5);
      const mid = lerpPoint(q1, q2, 0.5);

      const firstHalf = {
        type: 'C',
        x1: m1.x, y1: m1.y,
        x2: q1.x, y2: q1.y,
        x: mid.x, y: mid.y
      };

      const secondHalf = {
        type: 'C',
        x1: q2.x, y1: q2.y,
        x2: m3.x, y2: m3.y,
        x: p3.x, y: p3.y
      };

      segments.splice(maxIdx, 1, firstHalf, secondHalf);
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpPoint(p1, p2, t) {
    return {
      x: lerp(p1.x, p2.x, t),
      y: lerp(p1.y, p2.y, t)
    };
  }

  /**
   * Serializes an array of cubic segments into clean SVG 'd' string
   */
  function serializeSegments(segments, precision = 2) {
    const f = (n) => Number(n).toFixed(precision).replace(/\.?0+$/, '');
    return segments.map(seg => {
      if (seg.type === 'M') return `M${f(seg.x)},${f(seg.y)}`;
      if (seg.type === 'C') return `C${f(seg.x1)},${f(seg.y1)} ${f(seg.x2)},${f(seg.y2)} ${f(seg.x)},${f(seg.y)}`;
      if (seg.type === 'Z') return 'Z';
      return '';
    }).filter(Boolean).join(' ');
  }

  /**
   * Linear interpolation between two equalized segment arrays at time t (0.0 .. 1.0)
   */
  function interpolateSegments(segsA, segsB, t) {
    const clampedT = Math.max(0, Math.min(1, t));
    const result = [];

    for (let i = 0; i < segsA.length; i++) {
      const a = segsA[i];
      const b = segsB[i] || a;

      if (a.type === 'M') {
        result.push({
          type: 'M',
          x: lerp(a.x, b.x, clampedT),
          y: lerp(a.y, b.y, clampedT)
        });
      } else if (a.type === 'C') {
        result.push({
          type: 'C',
          x1: lerp(a.x1, b.x1, clampedT),
          y1: lerp(a.y1, b.y1, clampedT),
          x2: lerp(a.x2, b.x2, clampedT),
          y2: lerp(a.y2, b.y2, clampedT),
          x: lerp(a.x, b.x, clampedT),
          y: lerp(a.y, b.y, clampedT)
        });
      } else if (a.type === 'Z') {
        result.push({ type: 'Z' });
      }
    }

    return result;
  }

  /**
   * Optimizes raw SVG path string: removes whitespace, clamps precision
   */
  function optimizePathString(d, precision = 2) {
    const cubics = normalizeToCubics(d);
    return serializeSegments(cubics, precision);
  }

  return {
    parsePath,
    normalizeToCubics,
    equalizeSegments,
    interpolateSegments,
    serializeSegments,
    optimizePathString,
    lerp
  };
});
