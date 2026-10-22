/**
 * MorphSVG Studio UI Controller
 */

(function () {
  'use strict';

  // DOM Elements
  const morphSvg = document.getElementById('morphSvg');
  const morphPath = document.getElementById('morphPath');
  const pathAInput = document.getElementById('pathAInput');
  const pathBInput = document.getElementById('pathBInput');
  const timeSlider = document.getElementById('timeSlider');
  const timeLabel = document.getElementById('timeLabel');
  const playBtn = document.getElementById('playBtn');
  const durationSelect = document.getElementById('durationSelect');
  const easingSelect = document.getElementById('easingSelect');
  const fillColorInput = document.getElementById('fillColor');
  const strokeColorInput = document.getElementById('strokeColor');
  const strokeWidthInput = document.getElementById('strokeWidth');
  const codeOutput = document.getElementById('codeOutput');
  const copyBtn = document.getElementById('copyBtn');
  const presetContainer = document.getElementById('presetPills');
  const statCurvesA = document.getElementById('statCurvesA');
  const statCurvesB = document.getElementById('statCurvesB');
  const statEqualized = document.getElementById('statEqualized');
  const tabBtns = document.querySelectorAll('.tab-btn');

  let interpolator = null;
  let isPlaying = true;
  let currentT = 0;
  let direction = 1;
  let activeTab = 'css';
  let lastTimestamp = 0;

  // Initialize Preset Buttons
  function initPresets() {
    presetContainer.innerHTML = '';
    const presetKeys = Object.keys(MORPH_PRESETS);

    presetKeys.forEach((key, idx) => {
      const preset = MORPH_PRESETS[key];
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `preset-pill ${idx === 0 ? 'active' : ''}`;
      pill.textContent = preset.name;
      pill.onclick = () => loadPreset(key, pill);
      presetContainer.appendChild(pill);
    });

    // Load first preset
    loadPreset(presetKeys[0], presetContainer.children[0]);
  }

  function loadPreset(key, pillElement) {
    document.querySelectorAll('.preset-pill').forEach((p) => p.classList.remove('active'));
    if (pillElement) pillElement.classList.add('active');

    const preset = MORPH_PRESETS[key];
    if (!preset) return;

    pathAInput.value = preset.pathA;
    pathBInput.value = preset.pathB;
    if (preset.fill && preset.fill !== 'none') fillColorInput.value = preset.fill;
    if (preset.stroke && preset.stroke !== 'none') strokeColorInput.value = preset.stroke;
    strokeWidthInput.value = preset.strokeWidth;

    updateStyles();
    rebuildInterpolator();
  }

  function updateStyles() {
    const fill = fillColorInput.value;
    const stroke = strokeColorInput.value;
    const strokeWidth = strokeWidthInput.value;

    morphPath.setAttribute('fill', strokeWidth > 0 && fill === '#000000' ? 'none' : fill);
    morphPath.setAttribute('stroke', stroke);
    morphPath.setAttribute('stroke-width', strokeWidth);
    morphPath.setAttribute('stroke-linecap', 'round');
    morphPath.setAttribute('stroke-linejoin', 'round');
  }

  function rebuildInterpolator() {
    try {
      const a = pathAInput.value.trim();
      const b = pathBInput.value.trim();
      if (!a || !b) return;

      interpolator = new MorphEngine.MorphInterpolator(a, b);
      const stats = interpolator.getStats();

      statCurvesA.textContent = stats.initialCurvesA;
      statCurvesB.textContent = stats.initialCurvesB;
      statEqualized.textContent = stats.equalizedCurves;

      renderFrame(currentT);
      updateCodeOutput();
    } catch (err) {
      console.warn('Morph rebuild failed:', err.message);
    }
  }

  function renderFrame(t) {
    if (!interpolator) return;
    const easing = easingSelect.value;
    const pathD = interpolator.at(t, easing);
    morphPath.setAttribute('d', pathD);
    timeSlider.value = Math.round(t * 100);
    timeLabel.textContent = `${Math.round(t * 100)}%`;
  }

  function updateCodeOutput() {
    if (!interpolator) return;
    const duration = parseFloat(durationSelect.value);

    if (activeTab === 'css') {
      codeOutput.textContent = interpolator.generateCSS(duration);
    } else if (activeTab === 'smil') {
      codeOutput.textContent = interpolator.generateSMIL(duration);
    } else if (activeTab === 'waapi') {
      codeOutput.textContent = interpolator.generateWAAPI(Math.round(duration * 1000));
    }
  }

  // Animation Loop (60fps)
  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying && interpolator) {
      const duration = parseFloat(durationSelect.value);
      const step = delta / duration;

      currentT += step * direction;

      if (currentT >= 1) {
        currentT = 1;
        direction = -1;
      } else if (currentT <= 0) {
        currentT = 0;
        direction = 1;
      }

      renderFrame(currentT);
    }

    requestAnimationFrame(animate);
  }

  // Event Listeners
  timeSlider.addEventListener('input', (e) => {
    isPlaying = false;
    playBtn.innerHTML = '▶ Play';
    currentT = parseInt(e.target.value, 10) / 100;
    renderFrame(currentT);
  });

  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.innerHTML = isPlaying ? '⏸ Pause' : '▶ Play';
  });

  pathAInput.addEventListener('input', rebuildInterpolator);
  pathBInput.addEventListener('input', rebuildInterpolator);
  durationSelect.addEventListener('change', updateCodeOutput);
  easingSelect.addEventListener('change', () => renderFrame(currentT));
  fillColorInput.addEventListener('input', updateStyles);
  strokeColorInput.addEventListener('input', updateStyles);
  strokeWidthInput.addEventListener('input', updateStyles);

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      updateCodeOutput();
    });
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeOutput.textContent);
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '✓ Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 1500);
    } catch {
      alert('Failed to copy to clipboard.');
    }
  });

  // Start app
  initPresets();
  requestAnimationFrame(animate);
})();
