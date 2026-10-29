/**
 * RoyalVegas — Web Audio API Procedural Synthesizer
 */
/**************************************************************
 * 1. WEB AUDIO SYNTHESIZER (No external audio files needed)
 **************************************************************/
let soundEnabled = true;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSfx(type) {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (type === 'tick') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.045);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'win') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.16, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.008, now + idx * 0.08 + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.26);
            });
        } else if (type === 'lose') {
            const notes = [300, 240];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(0.08, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.008, now + idx * 0.12 + 0.18);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.2);
            });
        } else if (type === 'card') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.065);
        }
    } catch (e) {
        // Ignore audio errors on restricted devices
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('soundIcon');
    icon.className = soundEnabled ? 'fa-solid fa-volume-high text-amber-400' : 'fa-solid fa-volume-xmark text-gray-500';
    showToast(soundEnabled ? 'Efek suara kasino diaktifkan' : 'Efek suara kasino dibisukan', 'info');
}

