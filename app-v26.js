const USE_EXTERNAL_AUDIO_FILES = false;
const AUDIO_FILES = {
  // Si cambias USE_EXTERNAL_AUDIO_FILES a true, la app intentará cargar estos archivos.
  accent: "audio/acento.wav",
  pulse: "audio/pulso.wav",
};

const PALMAS_SAMPLE_FILES = {
  accent: "audio/samples/palma-acento.wav",
  pulse: "audio/samples/palma-pulso.wav",
};

const PERCUSSION_SAMPLE_FILES = {
  madera: "audio/samples/cajon-agudo.wav",
  cajon: "audio/samples/cajon-grave.wav",
};

const PALMAS_LOOP_FILES = {
  rumbas: { url: "audio/palmas-rumba-100.wav", sourceBeats: 16 },
  tangos: { url: "audio/palmas-tangos-188.wav", sourceBeats: 80 },
  bulerias: { url: "audio/palmas-bulerias-90.wav", sourceBeats: 48 },
  buleriasClasica: { url: "audio/palmas-bulerias-90.wav", sourceBeats: 48 },
  alegrias: { url: "audio/palmas-alegrias-80.wav", sourceBeats: 36 },
  fandangos: { url: "audio/palmas-fandangos-142.wav", sourceBeats: 48 },
  sevillanas: { url: "audio/palmas-sevillanas-150.wav", sourceBeats: 156 },
};

const FREE_DEMO_BARS = 8; // Cambia a Infinity para quitar la limitación en la versión completa.
const MERCADO_PAGO_URL = "https://www.mercadopago.com.mx/";
const MIN_BPM = 40;
const MAX_BPM = 240;
const WEAK_BEAT_VOLUME = 0.12;
const SCHEDULER_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.14;
const HAPTIC_DURATION_MS = 16;

const soundPresets = {
  palmas: {
    label: "Palmas",
    kind: "palmas",
  },
  madera: {
    label: "Madera",
    kind: "madera",
  },
  cajon: {
    label: "Cajón",
    kind: "cajon",
  },
};

const palos = {
  rumbas: {
    label: "Rumbas",
    bpm: 188,
    beats: ["1", "2", "3", "4"],
    accents: ["4"],
    weakBeats: ["1"],
  },
  tangos: {
    label: "Tangos",
    bpm: 100,
    beats: ["1", "2", "3", "4"],
    accents: ["4"],
    weakBeats: ["1"],
  },
  bulerias: {
    label: "Bulerías 12-3-7-8-10",
    bpm: 90,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "7", "8", "10"],
  },
  buleriasClasica: {
    label: "Bulerías 12-3-6-8-10",
    bpm: 90,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "6", "8", "10"],
  },
  alegrias: {
    label: "Alegrías",
    bpm: 150,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "6", "8", "10"],
    ornaments: [
      { beat: "2", offsetBeats: 0.5, volume: 0.24 },
      { beat: "5", offsetBeats: 0.5, volume: 0.24 },
      { beat: "7", offsetBeats: 0.5, volume: 0.28 },
      { beat: "9", offsetBeats: 0.5, volume: 0.24 },
    ],
  },
  soleaPorBuleria: {
    label: "Soleá por Bulería",
    bpm: 126,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "7", "8", "10"],
    weakBeats: ["1", "2", "4", "5", "6", "9", "11"],
    ornaments: [
      { beat: "3", offsetBeats: 0.5, volume: 0.18 },
      { beat: "7", offsetBeats: 0.5, volume: 0.2 },
      { beat: "10", offsetBeats: 0.5, volume: 0.18 },
    ],
  },
  seguiriyas: {
    label: "Seguiriyas",
    bpm: 110,
    beats: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    accents: ["1", "3", "5", "8", "11"],
  },
  fandangos: {
    label: "Fandangos",
    bpm: 142,
    beats: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    accents: ["1", "4", "7", "10"],
  },
  sevillanas: {
    label: "Sevillanas",
    bpm: 150,
    beats: ["1", "2", "3"],
    accents: ["1"],
  },
};

const elements = {
  paloSelect: document.querySelector("#paloSelect"),
  soundSelect: document.querySelector("#soundSelect"),
  decreaseBpm: document.querySelector("#decreaseBpm"),
  increaseBpm: document.querySelector("#increaseBpm"),
  transportBpmMinus: document.querySelector("[data-bpm-minus]"),
  transportBpmPlus: document.querySelector("[data-bpm-plus]"),
  bpmValue: document.querySelector("#bpmValue"),
  bpmSlider: document.querySelector("#bpmSlider"),
  startButton: document.querySelector("#startButton"),
  stopButton: document.querySelector("#stopButton"),
  beatGrid: document.querySelector("#beatGrid"),
  patternName: document.querySelector("#patternName"),
  barsCounter: document.querySelector("#barsCounter"),
  barsLimit: document.querySelector("#barsLimit"),
  demoModal: document.querySelector("#demoModal"),
  modalClose: document.querySelector("#modalClose"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsPanel: document.querySelector("#settingsPanel"),
  themeOptions: document.querySelectorAll("[data-theme]"),
  unlockButton: document.querySelector("#unlockButton"),
};

let selectedPaloKey = "rumbas";
let selectedSoundKey = "palmas";
let bpm = palos[selectedPaloKey].bpm;
let audioContext;
let audioBuffers = { accent: null, pulse: null };
let palmasSampleBuffers = { accent: null, pulse: null };
let percussionSampleBuffers = { madera: null, cajon: null };
let palmasLoopBuffers = {};
let activePalmasLoop = null;
let noiseBuffer = null;
let schedulerTimer = null;
let demoFinishTimer = null;
let nextNoteTime = 0;
let currentBeatIndex = 0;
let completedBars = 0;
let isPlaying = false;
let customSelectsReady = false;
let playSessionId = 0;

function init() {
  elements.barsLimit.textContent = Number.isFinite(FREE_DEMO_BARS) ? String(FREE_DEMO_BARS) : "∞";

  populateSelect(elements.paloSelect, palos);
  populateSelect(elements.soundSelect, soundPresets);

  elements.paloSelect.value = selectedPaloKey;
  elements.soundSelect.value = selectedSoundKey;
  elements.unlockButton.href = MERCADO_PAGO_URL;
  applySavedTheme();
  enhanceSelect(elements.paloSelect);
  enhanceSelect(elements.soundSelect);
  bindEvents();
  updatePalo(selectedPaloKey);
  registerServiceWorker();
}

function populateSelect(select, items) {
  [...select.options].forEach((option) => {
    const item = items[option.value];
    if (item) option.textContent = item.label;
    if (!item) option.remove();
  });
}

function enhanceSelect(select) {
  const wrap = select.closest(".select-wrap");
  if (!wrap || wrap.querySelector(".custom-select-trigger")) return;

  select.classList.add("native-select");

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "custom-select-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  wrap.append(trigger, menu);
  refreshCustomSelect(select);

  trigger.addEventListener("click", () => {
    vibrate();
    const willOpen = menu.hidden;
    closeCustomSelects();
    menu.hidden = !willOpen;
    trigger.setAttribute("aria-expanded", String(willOpen));
  });

  select.addEventListener("change", () => refreshCustomSelect(select));

  if (!customSelectsReady) {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".select-wrap")) closeCustomSelects();
    });
    customSelectsReady = true;
  }
}

function refreshCustomSelect(select) {
  const wrap = select.closest(".select-wrap");
  const trigger = wrap.querySelector(".custom-select-trigger");
  const menu = wrap.querySelector(".custom-select-menu");
  const selected = select.options[select.selectedIndex];

  if (!trigger || !menu) return;

  trigger.textContent = selected?.textContent || "";
  menu.replaceChildren();

  [...select.options].forEach((option) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "custom-select-option";
    item.textContent = option.textContent;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(option.value === select.value));
    item.addEventListener("click", () => {
      vibrate();
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      closeCustomSelects();
    });
    menu.append(item);
  });
}

function closeCustomSelects() {
  document.querySelectorAll(".custom-select-menu").forEach((menu) => {
    menu.hidden = true;
  });
  document.querySelectorAll(".custom-select-trigger").forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "file:") return;

  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.warn("No se pudo activar el modo instalable/offline.", error);
  });
}

function bindEvents() {
  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a, .custom-select-trigger, .custom-select-option")) vibrate();
  });

  elements.paloSelect.addEventListener("change", (event) => updatePalo(event.target.value));
  elements.soundSelect.addEventListener("change", (event) => {
    selectedSoundKey = event.target.value;
  });

  elements.decreaseBpm.addEventListener("click", () => setBpm(bpm - 1));
  elements.increaseBpm.addEventListener("click", () => setBpm(bpm + 1));
  elements.transportBpmMinus.addEventListener("click", () => setBpm(bpm - 1));
  elements.transportBpmPlus.addEventListener("click", () => setBpm(bpm + 1));
  elements.bpmSlider.addEventListener("input", (event) => setBpm(Number(event.target.value)));
  elements.startButton.addEventListener("click", startMetronome);
  elements.stopButton.addEventListener("click", () => stopMetronome({ resetVisual: true }));
  elements.modalClose.addEventListener("click", () => {
    elements.demoModal.hidden = true;
    elements.startButton.focus();
  });
  elements.settingsButton.addEventListener("click", () => {
    elements.settingsPanel.hidden = !elements.settingsPanel.hidden;
  });
  elements.themeOptions.forEach((button) => {
    button.addEventListener("click", () => setTheme(button.dataset.theme));
  });
}

function vibrate() {
  if ("vibrate" in navigator) navigator.vibrate(HAPTIC_DURATION_MS);
}

function applySavedTheme() {
  setTheme(localStorage.getItem("metronomo-theme") || "dark", { save: false });
}

function setTheme(theme, options = {}) {
  const { save = true } = options;
  const lightMode = theme === "light";
  document.body.classList.toggle("light-mode", lightMode);
  elements.themeOptions.forEach((button) => {
    const active = button.dataset.theme === theme;
    button.setAttribute("aria-pressed", String(active));
  });
  if (save) localStorage.setItem("metronomo-theme", theme);
}

function updatePalo(key) {
  selectedPaloKey = key;
  const palo = palos[selectedPaloKey];
  stopMetronome({ resetVisual: true, hideModal: true });
  setBpm(palo.bpm);
  if (elements.patternName) elements.patternName.textContent = palo.label;
  renderBeatGrid();
  refreshCustomSelect(elements.paloSelect);
}

function setBpm(value) {
  bpm = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)));
  elements.bpmValue.value = bpm;
  elements.bpmValue.textContent = bpm;
  elements.bpmSlider.value = bpm;
  const clockBpm = document.querySelector(".clock-bpm");
  if (clockBpm) clockBpm.textContent = bpm;
}

function renderBeatGrid() {
  const palo = palos[selectedPaloKey];
  elements.beatGrid.replaceChildren();
  elements.beatGrid.dataset.count = String(palo.beats.length);

  const clockCore = document.createElement("div");
  clockCore.className = "clock-core";
  clockCore.innerHTML = `
    <svg class="palmas-icon" viewBox="0 0 112 112" aria-hidden="true">
      <path class="palm-fill" d="M45 68c-5-7-9-15-12-23-2-6 6-10 10-4l11 17V22c0-7 10-7 10 0v31l4-37c1-7 11-6 10 1l-3 38 8-31c2-7 11-4 9 3l-8 34 8-17c3-6 12-2 9 4L88 76c-7 16-26 23-41 12-6-5-11-10-15-17-3-6 5-11 10-6l3 3Z"/>
      <path class="palm-line" d="M55 58V22M65 56l4-39M75 58l8-32M84 62l8-18M46 68l-13-23"/>
      <path class="palm-line rays" d="M81 16l8-10M94 31l12-4M96 48l12 5M34 23l-9-11M24 41l-14-3"/>
    </svg>
    <strong class="clock-bpm">${bpm}</strong>
    <span>BPM</span>
  `;
  elements.beatGrid.append(clockCore);

  palo.beats.forEach((beatLabel, index) => {
    const beat = document.createElement("div");
    beat.className = "beat";
    beat.textContent = beatLabel;
    beat.dataset.index = String(index);
    setClockPosition(beat, index, palo.beats.length);

    if (palo.accents.includes(beatLabel)) beat.classList.add("accent");
    if (palo.rests?.includes(beatLabel)) {
      beat.classList.add("rest");
      beat.title = "Silencio";
    }
    if (palo.weakBeats?.includes(beatLabel)) {
      beat.classList.add("weak");
      beat.title = "Tiempo débil";
    }

    elements.beatGrid.append(beat);
  });

  updateVisualBeat(-1);
  updateBarsCounter();
}

function setClockPosition(element, index, totalBeats) {
  const angle = (index / totalBeats) * Math.PI * 2 - Math.PI / 2;
  const radius = totalBeats <= 4 ? 34 : 39;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;

  element.style.setProperty("--beat-x", `${x}%`);
  element.style.setProperty("--beat-y", `${y}%`);
}

async function startMetronome() {
  if (isPlaying) return;

  const sessionId = ++playSessionId;
  elements.demoModal.hidden = true;
  window.clearTimeout(demoFinishTimer);
  await ensureAudioReady();
  if (sessionId !== playSessionId) return;

  isPlaying = true;
  completedBars = 0;
  currentBeatIndex = 0;
  nextNoteTime = audioContext.currentTime + 0.16;
  if (sessionId !== playSessionId) return;
  updateBarsCounter();
  schedulerTimer = window.setInterval(scheduler, SCHEDULER_INTERVAL_MS);
  scheduler();
}

async function ensureAudioReady() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    await Promise.race([
      audioContext.resume(),
      new Promise((resolve) => window.setTimeout(resolve, 180)),
    ]);
  }
  if (USE_EXTERNAL_AUDIO_FILES) await loadAudioBuffers();
  if (selectedSoundKey === "palmas") await loadPalmasSamples();
  if (selectedSoundKey === "madera" || selectedSoundKey === "cajon") await loadPercussionSamples();
  if (!noiseBuffer) noiseBuffer = createNoiseBuffer();
}

function createNoiseBuffer() {
  const sampleRate = audioContext.sampleRate;
  const length = Math.floor(sampleRate * 0.22);
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    const taper = 1 - i / length;
    data[i] = white * (0.65 + taper * 0.35);
  }

  return buffer;
}

async function loadAudioBuffers() {
  await Promise.all(
    Object.entries(AUDIO_FILES).map(async ([name, url]) => {
      if (audioBuffers[name]) return;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers[name] = await audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.warn(`${url} no está disponible. Se usará el sonido generado por la app.`, error);
      }
    })
  );
}

async function loadPalmasSamples() {
  await Promise.all(
    Object.entries(PALMAS_SAMPLE_FILES).map(async ([name, url]) => {
      if (palmasSampleBuffers[name]) return;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        palmasSampleBuffers[name] = await audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.warn(`${url} no está disponible. Se usarán palmas generadas.`, error);
        palmasSampleBuffers[name] = null;
      }
    })
  );
}

async function loadPercussionSamples() {
  await Promise.all(
    Object.entries(PERCUSSION_SAMPLE_FILES).map(async ([name, url]) => {
      if (percussionSampleBuffers[name]) return;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        percussionSampleBuffers[name] = await audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.warn(`${url} no está disponible. Se usará el sonido generado por la app.`, error);
        percussionSampleBuffers[name] = null;
      }
    })
  );
}

async function loadPalmasLoop(paloKey) {
  const loop = PALMAS_LOOP_FILES[paloKey];
  if (!loop || palmasLoopBuffers[paloKey]) return palmasLoopBuffers[paloKey] || null;

  try {
    const response = await fetch(loop.url);
    if (!response.ok) throw new Error(`No se pudo cargar ${loop.url}`);
    const arrayBuffer = await response.arrayBuffer();
    palmasLoopBuffers[paloKey] = await audioContext.decodeAudioData(arrayBuffer);
    loop.sourceBpm = (loop.sourceBeats / palmasLoopBuffers[paloKey].duration) * 60;
    return palmasLoopBuffers[paloKey];
  } catch (error) {
    console.warn(`${loop.url} no está disponible. Se usarán palmas generadas.`, error);
    palmasLoopBuffers[paloKey] = null;
    return null;
  }
}

async function startPalmasLoop(time = audioContext.currentTime + 0.02, sessionId = playSessionId) {
  stopPalmasLoop();
  if (selectedSoundKey !== "palmas") return;

  const loop = PALMAS_LOOP_FILES[selectedPaloKey];
  const buffer = await loadPalmasLoop(selectedPaloKey);
  if (sessionId !== playSessionId || !isPlaying) return;
  if (!loop || !buffer) return;

  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  source.loop = true;
  source.playbackRate.setValueAtTime(1, time);
  gain.gain.setValueAtTime(0.72, time);
  source.connect(gain).connect(audioContext.destination);
  source.start(time);
  activePalmasLoop = { source, gain, loop };
}

function restartPalmasLoop() {
  stopPalmasLoop();
  if (selectedSoundKey === "palmas" && isPlaying) {
    syncBpmToPalmasLoop();
    startPalmasLoop(audioContext.currentTime + 0.08);
  }
}

function stopPalmasLoop() {
  if (!activePalmasLoop) return;
  try {
    activePalmasLoop.gain.gain.cancelScheduledValues(audioContext.currentTime);
    activePalmasLoop.gain.gain.setValueAtTime(0, audioContext.currentTime);
    activePalmasLoop.source.stop(audioContext.currentTime);
    activePalmasLoop.source.disconnect();
    activePalmasLoop.gain.disconnect();
  } catch (error) {
    // El source puede estar ya detenido; no hace falta interrumpir la app por eso.
  }
  activePalmasLoop = null;
}

function getPalmasLoopBpm() {
  const loop = PALMAS_LOOP_FILES[selectedPaloKey];
  if (!loop || !loop.sourceBpm) return null;
  return Math.round(loop.sourceBpm);
}

function syncBpmToPalmasLoop() {
  if (selectedSoundKey !== "palmas") return;
  const loopBpm = getPalmasLoopBpm();
  if (!loopBpm) return;
  bpm = Math.min(MAX_BPM, Math.max(MIN_BPM, loopBpm));
  elements.bpmValue.value = bpm;
  elements.bpmValue.textContent = bpm;
  elements.bpmSlider.value = bpm;
  const clockBpm = document.querySelector(".clock-bpm");
  if (clockBpm) clockBpm.textContent = bpm;
}

function scheduler() {
  if (!isPlaying) return;

  while (nextNoteTime < audioContext.currentTime + SCHEDULE_AHEAD_SECONDS) {
    scheduleBeat(currentBeatIndex, nextNoteTime);
    advanceBeat();
  }
}

function scheduleBeat(beatIndex, time) {
  const palo = palos[selectedPaloKey];
  const beatLabel = palo.beats[beatIndex];
  const isAccent = palo.accents.includes(beatLabel);
  const isRest = palo.rests?.includes(beatLabel);
  const isWeak = palo.weakBeats?.includes(beatLabel);

  if (!isRest) playSound(isAccent ? "accent" : "pulse", time, isAccent, isWeak ? WEAK_BEAT_VOLUME : 1);

  const secondsPerBeat = 60 / bpm;
  palo.ornaments
    ?.filter((ornament) => ornament.beat === beatLabel)
    .forEach((ornament) => {
      playSound("pulse", time + secondsPerBeat * ornament.offsetBeats, false, ornament.volume);
    });

  window.setTimeout(() => updateVisualBeat(beatIndex), Math.max(0, (time - audioContext.currentTime) * 1000));
}

function isPalmasLoopActive() {
  return selectedSoundKey === "palmas" && !!activePalmasLoop;
}

function playSound(type, time, isAccent, volume = 1) {
  const buffer = audioBuffers[type];

  if (buffer) {
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime((isAccent ? 1 : 0.74) * volume, time);
    source.connect(gain).connect(audioContext.destination);
    source.start(time);
    return;
  }

  const preset = soundPresets[selectedSoundKey];
  if (preset.kind === "palmas") {
    playSampledPalmas(time, isAccent, volume);
    return;
  }
  if (preset.kind === "cajon") {
    playSampledPercussion("cajon", time, isAccent, volume);
    return;
  }

  playSampledPercussion("madera", time, isAccent, volume);
}

function playSampledPercussion(kind, time, isAccent, volume = 1) {
  const buffer = percussionSampleBuffers[kind];

  if (!buffer) {
    if (kind === "cajon") playCajon(time, isAccent, volume);
    else playMadera(time, isAccent, volume);
    return;
  }

  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(1, time);
  filter.type = "highshelf";
  filter.frequency.setValueAtTime(kind === "madera" ? 1600 : 900, time);
  filter.gain.setValueAtTime(isAccent ? 1.8 : -0.8, time);
  gain.gain.setValueAtTime((isAccent ? 0.96 : 0.58) * volume, time);
  source.connect(filter).connect(gain).connect(audioContext.destination);
  source.start(time);
}

function playSampledPalmas(time, isAccent, volume = 1) {
  const buffer = palmasSampleBuffers[isAccent ? "accent" : "pulse"];

  if (!buffer) {
    playPalmas(time, isAccent, volume);
    return;
  }

  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(1, time);
  gain.gain.setValueAtTime((isAccent ? 1 : 0.72) * volume, time);
  source.connect(gain).connect(audioContext.destination);
  source.start(time);
}

function playPalmas(time, isAccent, volume = 1) {
  const humanOffset = (Math.random() - 0.5) * 0.004;
  const bursts = isAccent
    ? [
        { offset: 0, gain: 0.42, band: 2600, duration: 0.038, q: 0.5 },
        { offset: 0.007, gain: 0.26, band: 3400, duration: 0.034, q: 0.55 },
        { offset: 0.018, gain: 0.16, band: 1850, duration: 0.044, q: 0.45 },
      ]
    : [
        { offset: 0, gain: 0.23, band: 2450, duration: 0.032, q: 0.48 },
        { offset: 0.009, gain: 0.13, band: 3200, duration: 0.026, q: 0.5 },
      ];

  bursts.forEach((burst) => {
    playNoiseHit({
      time: time + burst.offset + humanOffset,
      duration: burst.duration,
      band: burst.band,
      lowpass: 7600,
      highpass: 760,
      noiseGain: burst.gain * volume,
      bodyFrequency: 460,
      bodyGain: 0.012 * volume,
      q: burst.q,
    });
  });
}

function playMadera(time, isAccent, volume = 1) {
  const peak = (isAccent ? 0.28 : 0.18) * volume;
  playNoiseHit({
    time,
    duration: isAccent ? 0.07 : 0.052,
    band: isAccent ? 1550 : 1250,
    lowpass: 4200,
    highpass: 240,
    noiseGain: peak,
    bodyFrequency: isAccent ? 620 : 480,
    bodyGain: (isAccent ? 0.16 : 0.09) * volume,
    q: 1.45,
  });
}

function playCajon(time, isAccent, volume = 1) {
  playNoiseHit({
    time,
    duration: isAccent ? 0.125 : 0.082,
    band: isAccent ? 980 : 1450,
    lowpass: isAccent ? 4200 : 5200,
    highpass: 95,
    noiseGain: (isAccent ? 0.3 : 0.18) * volume,
    bodyFrequency: isAccent ? 118 : 185,
    bodyGain: (isAccent ? 0.24 : 0.07) * volume,
    q: isAccent ? 0.72 : 0.8,
  });
  playNoiseHit({
    time: time + 0.006,
    duration: isAccent ? 0.048 : 0.035,
    band: isAccent ? 2700 : 2300,
    lowpass: 6500,
    highpass: 850,
    noiseGain: (isAccent ? 0.17 : 0.09) * volume,
    bodyFrequency: 280,
    bodyGain: 0,
    q: 0.58,
  });
}

function playNoiseHit({ time, duration, band, lowpass: lowpassFrequency, highpass: highpassFrequency = 60, noiseGain: peakNoise, bodyFrequency, bodyGain: peakBody, q }) {
  const noise = audioContext.createBufferSource();
  const highpass = audioContext.createBiquadFilter();
  const bandpass = audioContext.createBiquadFilter();
  const lowpass = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();
  const body = audioContext.createOscillator();
  const bodyGain = audioContext.createGain();
  const master = audioContext.createGain();

  noise.buffer = noiseBuffer;
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(highpassFrequency, time);
  bandpass.type = "bandpass";
  bandpass.frequency.setValueAtTime(band, time);
  bandpass.Q.setValueAtTime(q, time);
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(lowpassFrequency, time);

  noiseGain.gain.setValueAtTime(0.0001, time);
  noiseGain.gain.linearRampToValueAtTime(Math.max(0.0002, peakNoise), time + 0.004);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  body.type = "sine";
  body.frequency.setValueAtTime(bodyFrequency, time);
  body.frequency.exponentialRampToValueAtTime(Math.max(50, bodyFrequency * 0.62), time + duration);
  bodyGain.gain.setValueAtTime(0.0001, time);
  bodyGain.gain.linearRampToValueAtTime(Math.max(0.0002, peakBody), time + 0.004);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.88);

  master.gain.setValueAtTime(0.84, time);

  noise.connect(highpass).connect(bandpass).connect(lowpass).connect(noiseGain).connect(master).connect(audioContext.destination);
  body.connect(bodyGain).connect(master);
  noise.start(time);
  body.start(time);
  noise.stop(time + duration);
  body.stop(time + duration);
}

function advanceBeat() {
  const palo = palos[selectedPaloKey];
  const secondsPerBeat = getSecondsPerBeat();

  nextNoteTime += secondsPerBeat;
  currentBeatIndex += 1;

  if (currentBeatIndex >= palo.beats.length) {
    currentBeatIndex = 0;
    completedBars += 1;
    updateBarsCounter();

    if (completedBars >= FREE_DEMO_BARS) scheduleDemoFinish(nextNoteTime);
  }
}

function scheduleDemoFinish(time) {
  isPlaying = false;
  stopPalmasLoop();
  window.clearInterval(schedulerTimer);
  schedulerTimer = null;

  demoFinishTimer = window.setTimeout(() => {
    stopMetronome({ resetVisual: true });
    elements.demoModal.hidden = false;
    elements.modalClose.focus();
  }, Math.max(0, (time - audioContext.currentTime) * 1000));
}

function stopMetronome(options = {}) {
  const { resetVisual = false, hideModal = false } = options;

  playSessionId += 1;
  isPlaying = false;
  stopPalmasLoop();
  window.clearInterval(schedulerTimer);
  window.clearTimeout(demoFinishTimer);
  schedulerTimer = null;
  demoFinishTimer = null;
  currentBeatIndex = 0;
  completedBars = 0;
  updateBarsCounter();

  if (resetVisual) updateVisualBeat(-1);
  if (hideModal) elements.demoModal.hidden = true;
}

function updateVisualBeat(activeIndex) {
  elements.beatGrid.querySelectorAll(".beat").forEach((beat) => {
    beat.classList.toggle("active", Number(beat.dataset.index) === activeIndex);
  });
}

function updateBarsCounter() {
  elements.barsCounter.textContent = String(Math.min(completedBars, FREE_DEMO_BARS));
}

function getSecondsPerBeat() {
  return 60 / bpm;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
