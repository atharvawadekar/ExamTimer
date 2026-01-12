// DOM Elements
const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');

const btnSet = document.getElementById('btn-set');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');

const timeInputModal = document.getElementById('time-input-modal');
const inputMinutes = document.getElementById('input-minutes');
const btnConfirmTime = document.getElementById('confirm-time');
const btnCancelTime = document.getElementById('cancel-time');

// State
let totalSeconds = 0;
let remainingSeconds = 0;
let timerInterval = null;
let isRunning = false;
let isPaused = false;

// Helpers
function formatTime(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return {
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0')
    };
}

function updateDisplay() {
    const time = formatTime(remainingSeconds);
    hoursDisplay.textContent = time.h;
    minutesDisplay.textContent = time.m;
    secondsDisplay.textContent = time.s;

    // Change color when time is low (optional visual cue)
    const timerDisplay = document.querySelector('.timer-display');
    if (remainingSeconds < 60 && remainingSeconds > 0) {
        timerDisplay.style.color = '#ff6b6b'; // Reddish for urgency
        timerDisplay.style.textShadow = '0 0 20px rgba(255, 107, 107, 0.3)';
    } else {
        timerDisplay.style.color = 'var(--secondary-color)';
        timerDisplay.style.textShadow = '0 0 20px rgba(100, 255, 218, 0.1)';
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    updateControls();
}

function startTimer() {
    if (remainingSeconds <= 0) return;

    if (isRunning && !isPaused) return;

    isRunning = true;
    isPaused = false;
    updateControls();

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();

        if (remainingSeconds <= 0) {
            stopTimer();
            // Optional: Play sound or flash screen
            alert("Time is up!");
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isPaused = true;
    updateControls();
}

function resetTimer() {
    stopTimer();
    remainingSeconds = totalSeconds;
    updateDisplay();
}

function updateControls() {
    if (isRunning && !isPaused) {
        btnStart.disabled = true;
        btnPause.disabled = false;
        btnSet.disabled = true;
    } else if (isPaused) {
        // Resume state - logic handled by same button, visual indication could be opacity or separate icon
        btnStart.disabled = false;
        btnPause.disabled = true;
        btnSet.disabled = true;
    } else {
        // Stopped or initial state
        btnStart.disabled = remainingSeconds <= 0;
        btnPause.disabled = true;
        btnSet.disabled = false;
    }
}

// Event Listeners
btnSet.addEventListener('click', () => {
    timeInputModal.classList.remove('hidden');
    inputMinutes.focus();
});

btnCancelTime.addEventListener('click', () => {
    timeInputModal.classList.add('hidden');
});

btnConfirmTime.addEventListener('click', () => {
    const mins = parseInt(inputMinutes.value);
    if (!isNaN(mins) && mins > 0) {
        totalSeconds = mins * 60;
        remainingSeconds = totalSeconds;
        updateDisplay();
        timeInputModal.classList.add('hidden');
        inputMinutes.value = '';
        updateControls();
    }
});

btnStart.addEventListener('click', startTimer);
btnPause.addEventListener('click', pauseTimer);
btnReset.addEventListener('click', resetTimer);

// Initial Setup
updateDisplay();
updateControls();
