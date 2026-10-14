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
  duration: Number(scene.dataset.duration),
  reveal: Number(scene.dataset.reveal),
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

/* Fit the 1080 × 1920 stage to any screen while keeping the portrait aspect ratio. */
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
  // Restart CSS entrance animations on every visit.
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

/* After the entrance choreography, spotlight each step in turn so the page keeps telling its story. */
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
  const window_ = (duration - reveal - 800) / steps.length;
  const index = Math.min(steps.length - 1, Math.max(0, Math.floor((elapsed - reveal) / window_)));
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

function flashToast(label) {
  toast.innerHTML = `<span>${label}</span>`;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 950);
}

function togglePause() {
  paused = !paused;
  stage.classList.toggle("is-paused", paused);
  pauseButton.setAttribute("aria-pressed", String(paused));
  pauseButton.setAttribute("aria-label", paused ? "Resume playback" : "Pause playback");
  updateStatus();
  flashToast(paused ? "Paused" : "Play");
  showHud();
}

/* The control bar stays out of the way on a public display and returns on any interaction. */
function showHud() {
  stage.classList.remove("hud-hidden");
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    if (!paused) stage.classList.add("hud-hidden");
  }, IDLE_HIDE_MS);
}

segmentButtons.forEach((button) => {
  button.addEventListener("click", () => goTo(Number(button.dataset.go)));
});

pauseButton.addEventListener("click", () => {
  togglePause();
  pauseButton.blur();
});

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (event.code === "Space") {
    event.preventDefault();
    if (!event.repeat) togglePause();
    return;
  }
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    if (event.repeat) return;
    goTo(current + (event.key === "ArrowRight" ? 1 : -1));
    flashToast(event.key === "ArrowRight" ? "Next" : "Back");
    return;
  }
  if (event.key.toLowerCase() === "f" && document.fullscreenEnabled) {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch((error) => console.error("Unable to enter fullscreen.", error));
    showHud();
  }
});

["mousemove", "pointerdown", "touchstart"].forEach((name) => window.addEventListener(name, showHud, { passive: true }));
window.addEventListener("resize", fitStage);
document.addEventListener("visibilitychange", () => { lastTick = performance.now(); });

/* ───────── Ambient neural-network particles (the v2 hero motif) ───────── */
const ctx = canvas.getContext("2d");
const NODE_COUNT = 58;
const LINK_DISTANCE = 190;
let canvasScale = 1;
const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
  x: Math.random() * 1080,
  y: Math.random() * 1920,
  vx: (Math.random() - 0.5) * 0.22,
  vy: (Math.random() - 0.5) * 0.22,
  r: 1.2 + Math.random() * 2,
  hue: i % 3 === 0 ? "192,132,252" : "0,212,255",
}));

function resizeCanvas(scale) {
  canvasScale = scale * (window.devicePixelRatio || 1);
  canvas.width = Math.round(1080 * canvasScale);
  canvas.height = Math.round(1920 * canvasScale);
  drawParticles(0);
}

function drawParticles(dt) {
  if (reducedMotion) dt = 0;
  ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  ctx.clearRect(0, 0, 1080, 1920);

  for (const n of nodes) {
    n.x += n.vx * dt * 0.06 * 16;
    n.y += n.vy * dt * 0.06 * 16;
    if (n.x < -20) n.x = 1100;
    if (n.x > 1100) n.x = -20;
    if (n.y < -20) n.y = 1940;
    if (n.y > 1940) n.y = -20;
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < LINK_DISTANCE) {
        ctx.strokeStyle = `rgba(${nodes[i].hue},${(1 - dist / LINK_DISTANCE) * 0.22})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  for (const n of nodes) {
    ctx.fillStyle = `rgba(${n.hue},0.55)`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

fitStage();
activateScene(0);
setSceneProgress(0);
showHud();
requestAnimationFrame((now) => {
  lastTick = now;
  tick(now);
});
