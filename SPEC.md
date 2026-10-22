# SPEC: MorphSVG Studio Pro (`svg-path-morph-visualizer`)

## 1. Executive Summary & Vision
`svg-path-morph-visualizer` is a zero-dependency web application and visual development studio for creating smooth vector SVG path animations, Bézier curve morphs, and production-ready CSS/SMIL/GSAP animation code. It solves the mathematical problem of interpolating between vector paths of differing segment lengths and curve topologies.

## 2. Target Audience & Market Fit
- **Frontend Engineers & UI Designers**: Need micro-interactions (hamburger to X, play to pause, sun to moon) without bulky 500KB third-party runtime animation libraries.
- **Micro-SaaS Builders**: Elevating UX fidelity with lightweight, high-performance inline vector motion.

## 3. Architecture & File Structure
```
svg-path-morph-visualizer/
├── index.html            # Studio workspace with dual-canvas, timeline & controls
├── css/style.css         # Modern dark-mode interface with glassmorphism touches
├── js/
│   ├── morph.js          # Core path parser, segment equalizer, cubic Bézier interpolator
│   ├── presets.js        # Curated transition pairs (Menu/Close, Play/Pause, Sun/Moon, etc.)
│   └── app.js            # UI controller, 60fps requestAnimationFrame loop, code generators
├── test/
│   └── morph.test.js     # Unit test suite for math, normalization, and code outputs
├── package.json          # Package definition with test and start scripts
├── Dockerfile            # Nginx container for instant edge deployment
├── docker-compose.yml    # Local container runner
├── README.md             # Commercial documentation & monetization guide
└── LICENSE               # MIT License
```

## 4. Key Functional Features
1. **Mathematical Path Equalization**:
   - Parses SVG path command strings (`M`, `L`, `H`, `V`, `C`, `S`, `Q`, `T`, `A`, `Z`).
   - Normalizes commands to cubic Bézier curves (`C`).
   - Equalizes point counts via subdivision so arbitrary paths can morph losslessly.
2. **Interactive Animation Preview**:
   - Continuous playback, scrubber slider, reverse toggle, duration control (0.2s - 4.0s).
   - Easing functions: Linear, Ease-In, Ease-Out, Ease-In-Out, Cubic Elastic, Soft Bounce.
3. **Multi-Target Code Generator**:
   - Pure CSS `@keyframes` with `d: path('...')` (Chromium / Safari standard).
   - Pure SVG SMIL (`<animate attributeName="d" ...>`) working in all standalone SVG files without JavaScript.
   - Web Animations API (WAAPI) JavaScript snippet.
   - Clean standalone SVG download.
4. **Preset Library**:
   - Hamburger Menu ⇄ Close Cross (X)
   - Play Circle ⇄ Pause Bars
   - Sun ⇄ Moon
   - Search Magnifier ⇄ Clear Cross
   - Heart ⇄ Star

## 5. Monetization Strategy
- **Freemium Micro-SaaS ($7/mo or $39 lifetime)**:
  - Free tier: 2-path morphing, SMIL / CSS export, standard presets.
  - Pro tier: Multi-path keyframe sequences (Path A -> B -> C -> D -> A), Lottie JSON export, Figma Plugin synchronization, React/Vue component generator.
- **Digital Asset Packs ($19 - $49 on Gumroad / UI8)**:
  - Commercial vector UI icon morph packs ready to paste into web projects.
