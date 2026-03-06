const totalTimeInput = document.getElementById("totalTime");
const playerTimeInput = document.getElementById("playerTime");

const totalDisplay = document.getElementById("totalDisplay");
const playerDisplay = document.getElementById("playerDisplay");
const statusText = document.getElementById("status");

const startBtn = document.getElementById("startBtn");
const changeBtn = document.getElementById("changeBtn");
const continueBtn = document.getElementById("continueBtn");
const resetBtn = document.getElementById("resetBtn");

let totalInitialMs = 0;
let playerInitialMs = 0;
let playerTurnLimitMs = 0;

let totalRemainingMs = 0;
let playerRemainingMs = 0;

let animationId = null;
let isRunning = false;
let hasStarted = false;
let lastTimestamp = null;

function parseTime(value) {
  const text = value.trim();

  if (!text) return NaN;

  if (text.includes(":")) {
    const parts = text.split(":");

    if (parts.length !== 2 && parts.length !== 3) return NaN;

    const nums = parts.map(Number);
    if (nums.some(num => Number.isNaN(num))) return NaN;

    if (parts.length === 2) {
      const [minutes, seconds] = nums;
      return (minutes * 60 + seconds) * 1000;
    }

    const [hours, minutes, seconds] = nums;
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  const secondsOnly = Number(text);
  return Number.isNaN(secondsOnly) ? NaN : secondsOnly * 1000;
}

function formatTime(ms) {
  const safeMs = Math.max(0, ms);
  const totalCentiseconds = Math.floor(safeMs / 10);

  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function updateDisplay() {
  totalDisplay.textContent = formatTime(totalRemainingMs);
  playerDisplay.textContent = formatTime(playerRemainingMs);
}

function updateButtons() {
  startBtn.disabled = hasStarted;
  changeBtn.disabled = !isRunning;
  continueBtn.disabled = !hasStarted || isRunning || totalRemainingMs <= 0;
}

function setStatus(message) {
  statusText.textContent = message;
}

function stopTimer() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  isRunning = false;
  lastTimestamp = null;
  updateButtons();
}

function finishMatch() {
  stopTimer();
  totalRemainingMs = 0;
  playerRemainingMs = 0;
  updateDisplay();
  setStatus("Match finished. Press Reset to start again.");
}

function pauseForNextPlayer(message) {
  stopTimer();
  setStatus(message);
}

function tick(timestamp) {
  if (!isRunning) return;

  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }

  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  totalRemainingMs = Math.max(0, totalRemainingMs - delta);
  playerRemainingMs = Math.max(0, playerRemainingMs - delta);

  updateDisplay();

  if (totalRemainingMs <= 0) {
    finishMatch();
    return;
  }

  if (playerRemainingMs <= 0) {
    playerRemainingMs = 0;
    updateDisplay();
    pauseForNextPlayer("Player time reached 24.00 seconds (or input limit). Click Continue Game.");
    return;
  }

  animationId = requestAnimationFrame(tick);
}

function startCountdown() {
  if (isRunning) return;

  isRunning = true;
  lastTimestamp = null;
  updateButtons();
  setStatus("Game is running...");
  animationId = requestAnimationFrame(tick);
}

startBtn.addEventListener("click", () => {
  const total = parseTime(totalTimeInput.value);
  const player = parseTime(playerTimeInput.value);

  if (Number.isNaN(total) || Number.isNaN(player) || total <= 0 || player <= 0) {
    alert("Please enter valid times.");
    return;
  }

  totalInitialMs = Math.floor(total);
  playerInitialMs = Math.floor(player);

  playerTurnLimitMs = Math.min(playerInitialMs, 24000);

  totalRemainingMs = totalInitialMs;
  playerRemainingMs = playerTurnLimitMs;

  hasStarted = true;
  updateDisplay();
  updateButtons();

  if (playerInitialMs > 24000) {
    setStatus("Game started. Player timer is capped at 24.00 seconds.");
  } else {
    setStatus("Game started.");
  }

  startCountdown();
});

changeBtn.addEventListener("click", () => {
  if (!hasStarted || !isRunning) return;
  pauseForNextPlayer("Game paused for changing player. Click Continue Game.");
});

continueBtn.addEventListener("click", () => {
  if (!hasStarted || totalRemainingMs <= 0) return;

  playerRemainingMs = playerTurnLimitMs;
  updateDisplay();
  startCountdown();
});

resetBtn.addEventListener("click", () => {
  stopTimer();

  totalInitialMs = 0;
  playerInitialMs = 0;
  playerTurnLimitMs = 0;
  totalRemainingMs = 0;
  playerRemainingMs = 0;
  hasStarted = false;

  updateDisplay();
  updateButtons();
  setStatus("Enter the times and press Start.");
});

updateDisplay();
updateButtons();