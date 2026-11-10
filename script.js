// ======================================
// 1. LIVE CLOCK
// ======================================

function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');

    document.getElementById('clock').textContent =
        `${hours}:${minutes}:${seconds}`;

    document.getElementById('ampm').textContent = ampm;

    document.getElementById('date').textContent =
        now.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
}

// Update every second
updateClock();
setInterval(updateClock, 1000);


// ======================================
// 2. COUNTDOWN TIMER
// ======================================

const timerMinutes = document.getElementById('timerMinutes');
const timerSeconds = document.getElementById('timerSeconds');
const timerDisplay = document.getElementById('timerDisplay');
const timerStatus = document.getElementById('timerStatus');

let remainingTime = 0;
let timerInterval = null;
let timerRunning = false;

function formatTimer(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showTimer() {
    timerDisplay.textContent = formatTimer(remainingTime);
}

document.getElementById('timerStart').addEventListener('click', function () {

    if (timerRunning) return;

    // Get time from input fields
    if (remainingTime === 0) {
        const mins = Number(timerMinutes.value);
        const secs = Number(timerSeconds.value);

        if (
            timerMinutes.value === '' ||
            timerSeconds.value === '' ||
            !Number.isInteger(mins) ||
            !Number.isInteger(secs) ||
            mins < 0 || mins > 999 ||
            secs < 0 || secs > 59 ||
            mins + secs === 0
        ) {
            timerStatus.textContent = 'Please enter a valid time!';
            return;
        }

        remainingTime = mins * 60 + secs;
    }

    timerRunning = true;
    timerStatus.textContent = 'Timer is running...';

    timerInterval = setInterval(function () {

        remainingTime--;
        showTimer();

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;
            remainingTime = 0;
            showTimer();

            timerStatus.textContent = 'Time is up! Great job! 🎉';
            playAlarmSound();
        }

    }, 1000);
});

// Pause Timer
document.getElementById('timerPause').addEventListener('click', function () {

    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;
        timerStatus.textContent = 'Timer paused.';
    }
});

// Reset Timer
document.getElementById('timerReset').addEventListener('click', function () {

    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
    remainingTime = 0;

    timerMinutes.value = 5;
    timerSeconds.value = 0;

    showTimer();
    timerStatus.textContent = 'Ready to focus?';
});


// ======================================
// 3. STOPWATCH
// ======================================

const stopwatchDisplay = document.getElementById('stopwatchDisplay');
const lapList = document.getElementById('lapList');

let stopwatchInterval = null;
let stopwatchStartTime = 0;
let elapsedTime = 0;
let lapCount = 0;

function formatStopwatch(time) {

    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return `${String(hours).padStart(2, '0')}:` +
           `${String(minutes).padStart(2, '0')}:` +
           `${String(seconds).padStart(2, '0')}.` +
           `${String(milliseconds).padStart(2, '0')}`;
}

function updateStopwatch() {
    const currentTime = elapsedTime + (Date.now() - stopwatchStartTime);
    stopwatchDisplay.textContent = formatStopwatch(currentTime);
}

// Start / Resume Stopwatch
document.getElementById('stopwatchStart').addEventListener('click', function () {

    if (stopwatchInterval !== null) return;

    stopwatchStartTime = Date.now();

    stopwatchInterval = setInterval(updateStopwatch, 10);
});

// Lap Button
document.getElementById('stopwatchLap').addEventListener('click', function () {

    if (stopwatchInterval === null) return;

    const currentTime = elapsedTime + (Date.now() - stopwatchStartTime);

    lapCount++;

    if (lapCount === 1) {
        lapList.innerHTML = '';
    }

    const li = document.createElement('li');
    const lapName = document.createElement('span');
    const lapTime = document.createElement('span');

    lapName.textContent = `Lap ${lapCount}`;
    lapTime.textContent = formatStopwatch(currentTime);

    li.append(lapName, lapTime);
    lapList.prepend(li);
});

// Reset Stopwatch
document.getElementById('stopwatchReset').addEventListener('click', function () {

    clearInterval(stopwatchInterval);
    stopwatchInterval = null;

    elapsedTime = 0;
    stopwatchStartTime = 0;
    lapCount = 0;

    stopwatchDisplay.textContent = '00:00:00.00';
    lapList.innerHTML = '<li>No laps recorded yet.</li>';
});

// Pause Stopwatch
// The same Start button will resume from the paused time.
document.getElementById('stopwatchStart').addEventListener('click', function () {
    // Handled by the Start listener above.
});

// Separate pause using a double-click is not needed;
// we will add a Pause button below in the HTML.


/* ======================================
   4. ALARM CLOCK
====================================== */

const alarmTime = document.getElementById('alarmTime');
const alarmStatus = document.getElementById('alarmStatus');

let activeAlarm = null;
let lastAlarmDate = '';
let audioContext = null;

// Prepare sound after a user click
function prepareAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Play alarm sound
function playAlarmSound() {

    if (!audioContext || audioContext.state !== 'running') {
        return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.8
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.8);
}

// Set Alarm
document.getElementById('setAlarm').addEventListener('click', function () {

    if (!alarmTime.value) {
        alarmStatus.textContent = 'Please select an alarm time!';
        return;
    }

    prepareAudio();

    activeAlarm = alarmTime.value;
    lastAlarmDate = '';

    alarmStatus.textContent = `Alarm set for ${activeAlarm} 🔔`;
});

// Clear Alarm
document.getElementById('clearAlarm').addEventListener('click', function () {

    activeAlarm = null;
    alarmTime.value = '';

    alarmStatus.textContent = 'Alarm cleared.';
});

// Check Alarm every half second
setInterval(function () {

    if (!activeAlarm) return;

    const now = new Date();

    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');

    const currentTime = `${currentHours}:${currentMinutes}`;

    const today = now.toDateString();

    if (currentTime === activeAlarm && lastAlarmDate !== today) {

        lastAlarmDate = today;

        alarmStatus.textContent = 'Wake up! Your alarm is ringing! 💗';

        playAlarmSound();

        // Repeat sound a few times
        setTimeout(playAlarmSound, 1000);
        setTimeout(playAlarmSound, 2000);
    }

}, 500);