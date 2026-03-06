const totalTimeInput = document.getElementById("totalTime");
const playerTimeInput = document.getElementById("playerTime");

const totalDisplay = document.getElementById("totalDisplay");
const playerDisplay = document.getElementById("playerDisplay");
const statusText = document.getElementById("status");

const startBtn = document.getElementById("startBtn");
const changeBtn = document.getElementById("changeBtn");
const continueBtn = document.getElementById("continueBtn");
const resetBtn = document.getElementById("resetBtn");

let totalInitial = 0;
let playerInitial = 0;
let playerTurnLimit = 0;

let totalRemaining = 0;
let playerRemaining = 0;

let timer = null;
let isRunning = false;
let hasStarted = false;

function parseTime(value) {
  const text = value.trim();

  if (!text) return NaN;

  if (text.includes(":")) {
    const parts = text.split(":").map(Number);

    if (parts.some(isNaN)) return NaN;

    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    }

    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    }

    return NaN;
  }

  const secondsOnly = Number(text);
  return isNaN(secondsOnly) ? NaN : secondsOnly;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateDisplay() {
  totalDisplay.textContent = formatTime(totalRemaining);
  playerDisplay.textContent = formatTime(playerRemaining);
}

function updateButtons() {
  startBtn.disabled = hasStarted;
  changeBtn.disabled = !isRunning;
  continueBtn.disabled = !hasStarted || isRunning || totalRemaining <= 0;
}

function setStatus(message) {
  statusText.textContent = message;
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  isRunning = false;
  updateButtons();
}

function finishMatch() {
  stopTimer();
  totalRemaining = 0;
  playerRemaining = 0;
  updateDisplay();
  setStatus("Match finished. Press Reset to start again.");
}

function pauseForNextPlayer(message) {
  stopTimer();
  setStatus(message);
}

function startCountdown() {
  if (isRunning) return;

  isRunning = true;
  updateButtons();
  setStatus("Game is running...");

  timer = setInterval(() => {
    if (totalRemaining > 0) totalRemaining--;
    if (playerRemaining > 0) playerRemaining--;

    updateDisplay();

    if (totalRemaining <= 0) {
      finishMatch();
      return;
    }

    if (playerRemaining <= 0) {
      pauseForNextPlayer("Player time reached 24 seconds (or input limit). Click Continue Game.");
    }
  }, 1000);
}

startBtn.addEventListener("click", () => {
  const total = parseTime(totalTimeInput.value);
  const player = parseTime(playerTimeInput.value);

  if (isNaN(total) || isNaN(player) || total <= 0 || player <= 0) {
    alert("Please enter valid times.");
    return;
  }

  totalInitial = Math.floor(total);
  playerInitial = Math.floor(player);

  playerTurnLimit = Math.min(playerInitial, 24);

  totalRemaining = totalInitial;
  playerRemaining = playerTurnLimit;

  hasStarted = true;
  updateDisplay();
  updateButtons();

  if (playerInitial > 24) {
    setStatus("Game started. Player timer is capped at 24 seconds.");
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
  if (!hasStarted || totalRemaining <= 0) return;

  playerRemaining = playerTurnLimit;
  updateDisplay();
  startCountdown();
});

resetBtn.addEventListener("click", () => {
  stopTimer();

  totalInitial = 0;
  playerInitial = 0;
  playerTurnLimit = 0;
  totalRemaining = 0;
  playerRemaining = 0;
  hasStarted = false;

  updateDisplay();
  updateButtons();
  setStatus("Enter the times and press Start.");
});

updateDisplay();
updateButtons();