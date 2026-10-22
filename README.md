# 🌀 MorphSVG Studio Pro — SVG Path Morphing & Animator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Pure Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%2F%20Canvas%20%2F%20SVG-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Zero External Dependencies](https://img.shields.io/badge/Dependencies-Zero-10B981.svg)](package.json)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success.svg)]()

> **The definitive visual studio for creating fluid SVG path morphing animations.** Equalize anchor points, scrub transitions in real time, and export pure CSS keyframes, standalone animated SMIL SVG files, and Web Animations API code with zero external libraries.

---

## 🌐 English Description

### 🎯 The Problem
Morphing one vector icon into another (e.g. Hamburger menu into Close "X", Play into Pause) usually requires heavy JavaScript animation libraries (like GSAP MorphSVGPlugin, which requires an expensive commercial license) or manual math. When path command counts mismatch, standard CSS transitions produce ugly polygon glitches or refuse to animate altogether.

### 💡 The Solution
**MorphSVG Studio Pro** solves path morphing mathematically. It tokenizes SVG `d` paths, converts lines and curves into standardized cubic Bezier segments, uses De Casteljau subdivision to equalize segment counts, and smoothly interpolates anchors in real time. It generates copy-paste ready CSS `@keyframes`, standalone animated `.svg` files, and vanilla JavaScript loops.

---

### ✨ Features
- ⚡ **Automated Segment Equalization**:
  - Automatically handles different command counts between Shape A and Shape B.
  - Subdivides longest Bezier curves at midpoint `t=0.5` until segment counts match exactly.
  - Multi-subpath awareness (supports icons with multiple closed loops).
- 🎛️ **Live Scrubbing & Physics Timeline**:
  - Manual slider scrub (0% to 100%) to inspect the exact intermediate geometric states.
  - 60fps bidirectional looping animation with speed control (0.5x, 1.0x, 1.5x, 2.0x).
  - Configurable easing curves: `linear`, `ease-in-out`, and `elastic-out`.
- 🔍 **Interactive Anchor & Handle Visualizer**:
  - Canvas overlay rendering real-time anchor nodes (cyan) and Bezier control handles (pink) as they move through space.
- 📦 **Multi-Format Code Exporter**:
  - **CSS Keyframes**: modern `@keyframes` animating the `d: path('...')` property.
  - **Standalone SMIL SVG**: native `<animate attributeName="d">` that animates independently inside `<img>` tags and web browsers.
  - **Vanilla Web Animations API**: lightweight JavaScript snippet using `element.animate()`.
  - **Interpolated Path Data**: copy the static `d="..."` string at any scrubbed progress point.
- 🎨 **5 Curated Icon Morph Pairs**:
  - *Play ▷ to Pause ⏸* (two-piece Material Design transition)
  - *Menu ☰ to Close ✕* (mobile navigation toggle)
  - *Heart ♡ to Star ⭐* (favorite / rating micro-interaction)
  - *Sun ☀️ to Moon 🌙* (theme switcher transition)
  - *Checkmark ✓ to Cross ✗* (form validation feedback)

---

### 🚀 Quickstart (Run in 2 Clicks)

#### Option 1: Direct Browser Launch
Double-click `index.html` in your file explorer, or run:
```bash
# Windows PowerShell
Start-Process index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

#### Option 2: Local Server
```bash
npx serve .
# Or Python
python -m http.server 3000
```

#### Run Automated Test Suite
```bash
node test/morph.test.js
```

---

## 🇷🇺 Русское описание

### 🎯 Какую проблему решает?
Анимация превращения одной иконки в другую (морфинг) часто требует покупки дорогостоящих коммерческих плагинов (например, GSAP MorphSVG) или приводит к визуальным артефактам, если у двух контуров не совпадает количество опорных точек.

### 💡 Решение
**MorphSVG Studio Pro** решает задачу автоматически на чистом JavaScript. Алгоритм делит контуры на кубические кривые Безье, выравнивает количество сегментов через алгоритм де Кастельжо и плавно интерполирует форму в реальном времени.

---

### ✨ Главные возможности
1. **Автоматическое выравнивание сегментов**:
   - Превращает любые векторные контуры с разным числом точек в совместимые кривые.
2. **Интерактивный таймлайн**:
   - Ползунок ручной покадровой перемотки от 0% до 100%.
   - Зацикленное воспроизведение на 60 FPS с настройкой скорости и кривых Безье (Ease In-Out, Elastic, Linear).
3. **Визуализация опорных точек**:
   - Отображение контрольных узлов и направляющих Безье прямо поверх анимации.
4. **Экспорт в 4 формата**:
   - **CSS Keyframes**: современный CSS для свойств `d: path(...)`.
   - **Standalone SMIL SVG**: самостоятельный анимированный SVG-файл, работающий даже в теге `<img>`.
   - **Web Animations API**: чистый JS-скрипт без библиотек.
   - **Interpolated 'd' Path**: копирование сырого SVG-контура в любой промежуточной точке.
5. **5 готовых иконочных пар**:
   - Play / Pause, Меню / Закрыть, Сердце / Звезда, Солнце / Луна, Галочка / Крестик.

---

## 💰 Commercial & Monetization Potential

| Channel / Model | Description | Revenue Potential |
| :--- | :--- | :--- |
| **Micro-SaaS Animated Icon Library** | Package 100+ pre-morphed UI icons with web components as an interactive subscription or Lifetime Deal on ProductHunt. | **$19 – $39** per license |
| **Creative Dev Tool Lead Generator** | Free developer utility driving high organic search traffic from developers searching "GSAP MorphSVG free alternative" to custom agency development services. | **$3k – $15k** consulting leads |
| **Framer / Webflow Plugin Component** | Port the vanilla engine as a no-code interactive icon widget on Framer or Webflow marketplace. | **$15 – $29** per copy |

---

## 📄 License
MIT License. Free for commercial and personal projects.
