"use strict";

const IDLE_HIDE_MS = 4500;
const MAX_FRAME_MS = 100;

const stage = document.querySelector("#stage");
const scenes = [...document.querySelectorAll(".scene")];
const segmentButtons = [...document.querySelectorAll(".segments [data-go]")];
const segmentFills = [...document.querySelectorAll(".segments .seg-bar i")];
const miniFills = [...document.querySelectorAll(".mini-progress i")];
const pauseButton = document.querySelector("#pauseBtn");
const statusLine = document.querySelector("#status");
const toast = document.querySelector("#toast");
const canvas = document.querySelector("#fx");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const config = scenes.map((scene) => ({
  duration: Number(scene.dataset.duration) || 24000,
  reveal: Number(scene.dataset.reveal) || 6000,
  page: scene.dataset.page,
  label: scene.dataset.label,
  steps: [...new Set([...scene.querySelectorAll("[data-step]")].map((el) => el.dataset.step))].sort(),
}));

let current = 0;
let elapsed = 0;
let paused = false;
let lastTick = performance.now();
let idleTimer;
let toastTimer;
let focusKey = "";

/* Fit the 1080 × 1920 stage to any display while maintaining vertical aspect ratio. */
function fitStage() {
  const scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
  stage.style.setProperty("--scale", scale.toString());
  resizeCanvas(scale);
}

function setSceneProgress(value) {
  segmentFills.forEach((el, i) => el.style.setProperty("--p", (i < current ? 1 : i === current ? value : 0).toFixed(4)));
  miniFills.forEach((el, i) => el.style.setProperty("--p", (i < current ? 1 : i === current ? value : 0).toFixed(4)));
}

function updateStatus() {
  const { page, label } = config[current];
  statusLine.textContent = `${paused ? "Paused" : "Playing"} · Page ${page} of 2 · ${label}`;
}

function activateScene(index) {
  const previous = scenes[current];
  if (index !== current) {
    previous.classList.remove("is-active", "has-focus");
    previous.classList.add("is-leaving");
    window.setTimeout(() => previous.classList.remove("is-leaving"), 1100);
  }
  current = index;
  elapsed = 0;
  focusKey = "";

  const scene = scenes[current];
  scene.classList.remove("is-leaving", "has-focus");
  scene.querySelectorAll(".is-focus").forEach((el) => el.classList.remove("is-focus"));
  scene.style.setProperty("--scene-dur", `${config[current].duration}ms`);

  // Restart CSS entrance animations cleanly
  scene.classList.remove("is-active");
  void scene.offsetWidth;
  scene.classList.add("is-active");

  segmentButtons.forEach((button, i) => {
    button.classList.toggle("is-current", i === current);
    button.setAttribute("aria-current", i === current ? "step" : "false");
  });
  updateStatus();
}

function goTo(index) {
  activateScene((index + scenes.length) % scenes.length);
  setSceneProgress(0);
  showHud();
}

/* Progressive step spotlight */
function updateFocus() {
  const { duration, reveal, steps } = config[current];
  const scene = scenes[current];
  if (elapsed < reveal || steps.length === 0) {
    if (focusKey !== "") {
      scene.classList.remove("has-focus");
      scene.querySelectorAll(".is-focus").forEach((el) => el.classList.remove("is-focus"));
      focusKey = "";
    }
    return;
  }
  const windowTime = (duration - reveal - 800) / steps.length;
  const index = Math.min(steps.length - 1, Math.max(0, Math.floor((elapsed - reveal) / windowTime)));
  const key = steps[index];
  if (key === focusKey) return;
  focusKey = key;
  scene.classList.add("has-focus");
  scene.querySelectorAll("[data-step]").forEach((el) => el.classList.toggle("is-focus", el.dataset.step === key));
}

function tick(now) {
  const dt = Math.min(now - lastTick, MAX_FRAME_MS);
  lastTick = now;

  if (!paused) {
    elapsed += dt;
    if (elapsed >= config[current].duration) {
      activateScene((current + 1) % scenes.length);
    }
    drawParticles(dt);
  }

  setSceneProgress(Math.min(elapsed / config[current].duration, 1));
  updateFocus();
  requestAnimationFrame(tick);
}

function togglePause(intent) {
  paused = typeof intent === "boolean" ? intent : !paused;
  stage.classList.toggle("is-paused", paused);
  pauseButton.setAttribute("aria-pressed", paused.toString());
  pauseButton.setAttribute("aria-label", paused ? "Resume playback" : "Pause playback");
  updateStatus();
  showToast(paused ? "Paused · Press Space to resume" : "Playing");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function showHud() {
  stage.classList.remove("hud-hidden");
  window.clearTimeout(idleTimer);
  if (!paused) {
    idleTimer = window.setTimeout(() => stage.classList.add("hud-hidden"), IDLE_HIDE_MS);
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/* Ambient Canvas Particles (Tech aesthetic) */
let ctx = canvas.getContext("2d");
let particles = [];
const PARTICLE_COUNT = 45;

function resizeCanvas(scale) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = 1080 * dpr;
  canvas.height = 1920 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  initParticles();
}

function initParticles() {
  particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * 1080,
    y: Math.random() * 1920,
    r: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 14,
    vy: -(Math.random() * 20 + 10),
    alpha: Math.random() * 0.45 + 0.15,
    hue: Math.random() > 0.6 ? 260 : 185,
  }));
}

function drawParticles(dt) {
  if (reducedMotion || !ctx) return;
  const seconds = dt / 1000;
  ctx.clearRect(0, 0, 1080, 1920);

  particles.forEach((p) => {
    p.x += p.vx * seconds;
    p.y += p.vy * seconds;
    if (p.y < -10) {
      p.y = 1930;
      p.x = Math.random() * 1080;
    }
    if (p.x < -10) p.x = 1090;
    if (p.x > 1090) p.x = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
    ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.8)`;
    ctx.shadowBlur = 10;
    ctx.fill();
  });
}

/* Keyboard and User Interactions */
window.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  if (e.code === "Space") {
    e.preventDefault();
    togglePause();
    showHud();
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    goTo(current + 1);
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    goTo(current - 1);
  } else if (e.key === "f" || e.key === "F") {
    e.preventDefault();
    toggleFullscreen();
  }
});

pauseButton.addEventListener("click", () => {
  togglePause();
  showHud();
});

segmentButtons.forEach((btn, idx) => {
  btn.addEventListener("click", () => goTo(idx));
});

window.addEventListener("pointermove", showHud);
window.addEventListener("pointerdown", showHud);
window.addEventListener("resize", fitStage);

window.goTo = goTo;
/* Initialization */
fitStage();
activateScene(0);
showHud();
requestAnimationFrame(tick);
