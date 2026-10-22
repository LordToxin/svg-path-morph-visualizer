# ✨ MorphSVG Studio Pro (`svg-path-morph-visualizer`)

> **Interactive Vector SVG Path Morphing Studio, Bézier Curve Visualizer, and Code Generator for CSS Keyframes, SVG SMIL, and Web Animations API (WAAPI).**

[![Build Status](https://img.shields.io/badge/tests-6%20passed-brightgreen.svg)](test/morph.test.js)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Nginx Ready](https://img.shields.io/badge/docker-ready-blue.svg)](Dockerfile)

---

## ⚡ Overview

Animating vector SVG shapes (e.g. Hamburger Menu to Close X, Play to Pause, Sun to Moon) usually requires bulky 500KB external libraries like GSAP MorphSVG (which requires a paid Club GreenSock license for commercial usage) or difficult manual Bézier mathematics.

**MorphSVG Studio Pro** is an autonomous, **zero-dependency** web app and visual engineering tool:
- 📐 **Automatic Cubic Bézier Equalization**: Normalizes disparate SVG paths, breaks lines into curves, and applies de Casteljau subdivision so paths with unequal node counts morph smoothly at 60fps.
- 🎬 **Real-Time Interactive Timeline**: Scrubber slider, ping-pong loop, easing curves (Ease-In-Out, Linear, Bounce, Elastic).
- 📦 **Multi-Target Code Export in 1 Click**:
  - Pure CSS `@keyframes` with `d: path('...')` (100% native browser support without runtime scripts).
  - Standalone SVG SMIL `<animate attributeName="d" ...>` (runs directly inside any `.svg` file).
  - Web Animations API (WAAPI) JavaScript snippet.
- 🎨 **Curated Transition Presets**: Hamburger ⇄ Close, Play ⇄ Pause, Sun ⇄ Moon, Search ⇄ Clear, Heart ⇄ Star.

---

## 🚀 Quickstart in 10 Seconds

### Run locally in your browser:
Double-click `index.html` to open the studio directly. Works completely offline with zero external CDNs or dependencies!

### Or serve with Node:
```bash
npx serve .
```

### Run automated unit tests:
```bash
node test/morph.test.js
```

---

## 🐳 Docker Deployment

Deploy in an isolated lightweight Nginx container:

```bash
docker build -t morphsvg-studio .
docker run -d -p 8084:80 morphsvg-studio
```
Or via Docker Compose:
```bash
docker compose up -d
```
Access the studio at `http://localhost:8084`.

---

## 💻 Export Code Examples

### 1. Pure CSS `@keyframes`
```css
@keyframes morphAnimation {
  0% {
    d: path("M 20 30 C 40 30, 60 30, 80 30 ...");
  }
  50% {
    d: path("M 25 25 C 41.6 41.6, 58.3 58.3, 75 75 ...");
  }
  100% {
    d: path("M 20 30 C 40 30, 60 30, 80 30 ...");
  }
}

.morph-vector {
  animation: morphAnimation 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
```

### 2. Standalone SVG SMIL
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 20 30 ..." fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round">
    <animate
      attributeName="d"
      dur="1.5s"
      repeatCount="indefinite"
      values="PATH_A; PATH_B; PATH_A"
      keyTimes="0; 0.5; 1"
    />
  </path>
</svg>
```

---

## 💰 Monetization & Commercial Potential

MorphSVG Studio Pro directly solves a recurring problem for frontend developers, Web3/SaaS founders, and motion designers:

1. **Freemium Micro-SaaS ($7/mo or $39 lifetime license)**:
   - Free tier: 2-path morphing, CSS & SMIL export, standard presets.
   - Pro tier: Multi-path sequential morphing (State A ➔ B ➔ C ➔ D), animated Lottie JSON export, Figma Plugin live sync, React/Vue icon component generator.
2. **Turnkey Digital Product on Gumroad / UI8 / Creative Market ($19–$49)**:
   - Sell curated animated icon packs (navigation, media, e-commerce, alerts) generated using MorphSVG Studio.
3. **High-Intent Organic SEO Lead Magnet**:
   - Captures high-volume developer searches (`svg morph generator`, `css path morph without gsap`, `svg icon animation generator`) to monetize via developer ads (Carbon/EthicalAds) or promote consulting services.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
