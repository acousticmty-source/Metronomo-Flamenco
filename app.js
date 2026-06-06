const USE_EXTERNAL_AUDIO_FILES = false;
const AUDIO_FILES = {
  // Si cambias USE_EXTERNAL_AUDIO_FILES a true, la app intentará cargar estos archivos.
  accent: "audio/acento.wav",
  pulse: "audio/pulso.wav",
};

const FREE_DEMO_BARS = 8; // Cambia a Infinity para quitar la limitación en la versión completa.
const MIN_BPM = 40;
const MAX_BPM = 240;
const WEAK_BEAT_VOLUME = 0.12;
const SCHEDULER_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.12;

const soundPresets = {
  palmas: {
    label: "Palmas secas",
    kind: "palmas",
  },
  madera: {
    label: "Madera",
    kind: "madera",
    accentBand: 1250,
    pulseBand: 960,
    accentBody: 260,
    pulseBody: 190,
    accentNoise: 0.34,
    pulseNoise: 0.2,
    accentBodyGain: 0.22,
    pulseBodyGain: 0.12,
    accentDuration: 0.11,
    pulseDuration: 0.078,
  },
  cajon: {
    label: "Cajón tapa",
    kind: "cajon",
  },
  clickSuave: {
    label: "Click suave",
    kind: "click",
    accentBand: 2600,
    pulseBand: 1900,
    accentBody: 300,
    pulseBody: 240,
    accentNoise: 0.24,
    pulseNoise: 0.14,
    accentBodyGain: 0.05,
    pulseBodyGain: 0.03,
    accentDuration: 0.055,
    pulseDuration: 0.043,
  },
};

const palos = {
  rumbas: {
    label: "Rumbas",
    bpm: 100,
    beats: ["1", "2", "3", "4"],
    accents: ["4"],
    weakBeats: ["1"],
  },
  tangos: {
    label: "Tangos",
    bpm: 120,
    beats: ["1", "2", "3", "4"],
    accents: ["4"],
    weakBeats: ["1"],
  },
  bulerias: {
    label: "Bulerías 12-3-7-8-10",
    bpm: 180,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "7", "8", "10"],
  },
  buleriasClasica: {
    label: "Bulerías 12-3-6-8-10",
    bpm: 180,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "6", "8", "10"],
  },
  alegrias: {
    label: "Alegrías",
    bpm: 140,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "6", "8", "10"],
  },
  soleaPorBuleria: {
    label: "Soleá por Bulería",
    bpm: 130,
    beats: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    accents: ["12", "3", "6", "8", "10"],
  },
  seguiriyas: {
    label: "Seguiriyas",
    bpm: 110,
    beats: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    accents: ["1", "3", "5", "8", "11"],
  },
  fandangos: {
    label: "Fandangos",
    bpm: 120,
    beats: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    accents: ["1", "4", "7", "10"],
  },
  sevillanas: {
    label: "Sevillanas",
    bpm: 120,
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
};

let selectedPaloKey = "rumbas";
let selectedSoundKey = "palmas";
let bpm = palos[selectedPaloKey].bpm;
let audioContext;
let audioBuffers = { accent: null, pulse: null };
let noiseBuffer = null;
let schedulerTimer = null;
let demoFinishTimer = null;
let nextNoteTime = 0;
let currentBeatIndex = 0;
let completedBars = 0;
let isPlaying = false;
let customSelectsReady = false;

function init() {
  elements.barsLimit.textContent = Number.isFinite(FREE_DEMO_BARS) ? String(FREE_DEMO_BARS) : "∞";

  Object.entries(palos).forEach(([key, palo]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = palo.label;
    elements.paloSelect.append(option);
  });

  Object.entries(soundPresets).forEach(([key, sound]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = sound.label;
    elements.soundSelect.append(option);
  });

  elements.paloSelect.value = selectedPaloKey;
  elements.soundSelect.value = selectedSoundKey;
  enhanceSelect(elements.paloSelect);
  enhanceSelect(elements.soundSelect);
  bindEvents();
  updatePalo(selectedPaloKey);
  registerServiceWorker();
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
  elements.paloSelect.addEventListener("change", (event) => {
    updatePalo(event.target.value);
  });
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
}

function updatePalo(key) {
  selectedPaloKey = key;
  const palo = palos[selectedPaloKey];
  stopMetronome({ resetVisual: true, hideModal: true });
  setBpm(palo.bpm);
  elements.patternName.textContent = palo.label;
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

  const shoeMark = document.createElement("span");
  shoeMark.className = "shoe-mark";
  shoeMark.setAttribute("aria-hidden", "true");
  elements.beatGrid.append(shoeMark);

  const clockCore = document.createElement("div");
  clockCore.className = "clock-core";
  clockCore.innerHTML = `
    <svg class="palmas-icon" viewBox="0 0 96 96" aria-hidden="true">
      <path d="M32 54c-4-6-7-12-9-18-1-4 4-7 7-3l10 15V20c0-5 7-5 7 0v26l3-30c1-5 8-4 7 1l-2 30 7-25c1-5 8-3 7 2l-6 28 6-14c2-5 9-2 7 3L66 63c-5 12-19 17-30 9-5-4-8-8-11-13-2-4 3-8 7-5Z"/>
      <path d="M69 17l6-8M78 28l9-3M78 42l10 4M26 20l-6-8M19 34l-10-2"/>
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

    if (palo.accents.includes(beatLabel)) {
      beat.classList.add("accent");
    }

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

  elements.demoModal.hidden = true;
  window.clearTimeout(demoFinishTimer);
  await ensureAudioReady();

  isPlaying = true;
  completedBars = 0;
  currentBeatIndex = 0;
  nextNoteTime = audioContext.currentTime + 0.06;
  updateBarsCounter();
  schedulerTimer = window.setInterval(scheduler, SCHEDULER_INTERVAL_MS);
  scheduler();
}

async function ensureAudioReady() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  if (USE_EXTERNAL_AUDIO_FILES) {
    await loadAudioBuffers();
  }

  if (!noiseBuffer) {
    noiseBuffer = createNoiseBuffer();
  }
}

function createNoiseBuffer() {
  const sampleRate = audioContext.sampleRate;
  const length = Math.floor(sampleRate * 0.18);
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
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

  if (!isRest) {
    playSound(isAccent ? "accent" : "pulse", time, isAccent, isWeak ? WEAK_BEAT_VOLUME : 1);
  }
  window.setTimeout(() => updateVisualBeat(beatIndex), Math.max(0, (time - audioContext.currentTime) * 1000));
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
    playPalmas(time, isAccent, volume);
    return;
  }
  if (preset.kind === "cajon") {
    playCajon(time, isAccent, volume);
    return;
  }

  playFilteredHit(preset, time, isAccent, volume);
}

function playPalmas(time, isAccent, volume = 1) {
  const bursts = isAccent
    ? [
        { offset: 0, gain: 0.32, band: 3150, duration: 0.034 },
        { offset: 0.009, gain: 0.2, band: 2450, duration: 0.032 },
        { offset: 0.018, gain: 0.13, band: 3750, duration: 0.026 },
      ]
    : [
        { offset: 0, gain: 0.18, band: 2850, duration: 0.03 },
        { offset: 0.01, gain: 0.1, band: 2250, duration: 0.024 },
      ];

  bursts.forEach((burst) => {
    playNoiseHit({
      time: time + burst.offset,
      duration: burst.duration,
      band: burst.band,
      lowpass: 6200,
      highpass: 900,
      noiseGain: burst.gain * volume,
      bodyFrequency: 420,
      bodyGain: 0,
      q: 0.58,
    });
  });
}

function playCajon(time, isAccent, volume = 1) {
  playNoiseHit({
    time,
    duration: isAccent ? 0.092 : 0.072,
    band: isAccent ? 1150 : 1500,
    lowpass: isAccent ? 3600 : 4300,
    highpass: 240,
    noiseGain: (isAccent ? 0.36 : 0.2) * volume,
    bodyFrequency: isAccent ? 150 : 185,
    bodyGain: (isAccent ? 0.12 : 0.055) * volume,
    q: isAccent ? 0.85 : 0.72,
  });
  playNoiseHit({
    time: time + 0.006,
    duration: isAccent ? 0.055 : 0.04,
    band: isAccent ? 2550 : 2200,
    lowpass: 5200,
    highpass: 700,
    noiseGain: (isAccent ? 0.2 : 0.1) * volume,
    bodyFrequency: 280,
    bodyGain: 0,
    q: 0.7,
  });
}

function playFilteredHit(preset, time, isAccent, volume = 1) {
  const duration = isAccent ? preset.accentDuration : preset.pulseDuration;
  playNoiseHit({
    time,
    duration,
    band: isAccent ? preset.accentBand : preset.pulseBand,
    lowpass: isAccent ? 3800 : 2800,
    noiseGain: (isAccent ? preset.accentNoise : preset.pulseNoise) * volume,
    bodyFrequency: isAccent ? preset.accentBody : preset.pulseBody,
    bodyGain: (isAccent ? preset.accentBodyGain : preset.pulseBodyGain) * volume,
    q: isAccent ? 1.1 : 0.9,
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
  noiseGain.gain.linearRampToValueAtTime(peakNoise, time + 0.006);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  body.type = "sine";
  body.frequency.setValueAtTime(bodyFrequency, time);
  body.frequency.exponentialRampToValueAtTime(bodyFrequency * 0.72, time + duration);
  bodyGain.gain.setValueAtTime(0.0001, time);
  bodyGain.gain.linearRampToValueAtTime(peakBody, time + 0.004);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.86);

  master.gain.setValueAtTime(0.82, time);

  noise.connect(highpass).connect(bandpass).connect(lowpass).connect(noiseGain).connect(master).connect(audioContext.destination);
  body.connect(bodyGai�).connect(master);
  noise.start(time);
  body.start(time);
  noise.stop(time + duration);
  body.stop(time + duration);
}

function advanceBeat() {
  const palo = palos[selectedPaloKey];
  const secondsPerBeat = 60 / bpm;

  nextNoteTime += secondsPerBeat;
  currentBeatIndex += 1;

  if (currentBeatIndex >= palo.beats.length) {
    currentBeatIndex = 0;
    completedBars += 1;
    updateBarsCounter();

    if (completedBars >= FREE_DEMO_BARS) {
      scheduleDemoFinish(nextNoteTime);
    }
  }
}

function scheduleDemoFinish(time) {
  isPlaying = false;
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

  isPlaying = false;
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

init();
