/**
 * SVG Path Morph Presets (Normalized on 100x100 ViewBox)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MorphPresets = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PRESETS = {
    playPause: {
      name: 'Play ▷ to Pause ⏸',
      description: 'Media player state transition for music and video UI.',
      pathA: 'M30 20 L55 35 L55 65 L30 80 Z M55 35 L80 50 L80 50 L55 65 Z', // Two halves of Play triangle
      pathB: 'M25 20 L45 20 L45 80 L25 80 Z M55 20 L75 20 L75 80 L55 80 Z' // Two Pause bars
    },
    menuClose: {
      name: 'Menu ☰ to Close ✕',
      description: 'Classic mobile navigation hamburger toggle animation.',
      pathA: 'M20 30 L80 30 L80 36 L20 36 Z M20 47 L80 47 L80 53 L20 53 Z M20 64 L80 64 L80 70 L20 70 Z',
      pathB: 'M25 25 L75 75 L70 80 L20 30 Z M50 50 L50 50 L50 50 L50 50 L50 50 Z M75 25 L25 75 L30 80 L80 30 Z'
    },
    heartStar: {
      name: 'Heart ♡ to Star ⭐',
      description: 'Favorite, like, and rating micro-interaction.',
      // Heart
      pathA: 'M50 82 C20 60 12 40 18 24 C24 8 42 12 50 26 C58 12 76 8 82 24 C88 40 80 60 50 82 Z',
      // 5-Point Star
      pathB: 'M50 15 L61 38 L86 42 L68 59 L72 85 L50 73 L28 85 L32 59 L14 42 L39 38 Z'
    },
    sunMoon: {
      name: 'Sun ☀️ to Moon 🌙',
      description: 'Dark / Light mode theme toggle button transformation.',
      // Sun (Circle with outer radius)
      pathA: 'M50 20 C66 20 80 34 80 50 C80 66 66 80 50 80 C34 80 20 66 20 50 C20 34 34 20 50 20 Z',
      // Crescent Moon
      pathB: 'M50 20 C66 20 80 34 80 50 C70 45 60 50 55 60 C50 70 55 80 50 80 C34 80 20 66 20 50 C20 34 34 20 50 20 Z'
    },
    checkCross: {
      name: 'Checkmark ✓ to Cross ✗',
      description: 'Success and error validation status badge morph.',
      // Checkmark
      pathA: 'M20 52 L42 74 L82 26 L76 20 L42 62 L26 46 Z',
      // Cross
      pathB: 'M26 20 L50 44 L74 20 L80 26 L56 50 L80 74 L74 80 L50 56 L26 80 L20 74 L44 50 L20 26 Z'
    }
  };

  return {
    PRESETS,
    getDefaultPreset: () => JSON.parse(JSON.stringify(PRESETS.playPause))
  };
});
