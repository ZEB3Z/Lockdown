import { now, playNoise, playTone, getAudioContext } from './synth.js';

/**
 * 6 distinct normalized stingers.
 * Master dynamics compressor normalizes peak levels to prevent pain.
 */

export function stingerShriek() {
  const t = now();
  playTone(t, 'sawtooth', 1420, 220, 0.7, 0.45);
  playTone(t, 'square', 1490, 240, 0.7, 0.28);
  playNoise(t, 0.75, 'highpass', 1400, 0.55);
  playTone(t, 'sine', 55, 30, 0.8, 0.85);
}

export function stingerImpact() {
  const t = now();
  playTone(t, 'sine', 120, 28, 0.7, 0.95, 0.002);
  playTone(t, 'triangle', 75, 25, 0.6, 0.7);
  playNoise(t, 0.45, 'lowpass', 240, 0.85, 1.2, 0.002);
}

export function stingerGlass() {
  const t = now();
  const freqs = [2400, 3100, 4200, 5600];
  freqs.forEach((f) => playTone(t, 'triangle', f, f * 0.7, 0.35, 0.25, 0.001));
  playNoise(t, 0.4, 'highpass', 2800, 0.65, 2.0, 0.002);
  playTone(t, 'sine', 70, 35, 0.5, 0.75);
}

export function stingerSwell() {
  const t = now();
  playTone(t, 'sawtooth', 90, 850, 0.6, 0.5, 0.45);
  playNoise(t, 0.6, 'bandpass', 600, 0.45, 2, 0.45);
  // Crash at peak
  playTone(t + 0.6, 'sine', 110, 30, 0.5, 0.9);
  playNoise(t + 0.6, 0.5, 'lowpass', 350, 0.8);
}

export function stingerScreech() {
  const t = now();
  playTone(t, 'sawtooth', 1850, 1600, 0.5, 0.4);
  playTone(t, 'sawtooth', 1890, 1620, 0.5, 0.4);
  playNoise(t, 0.5, 'bandpass', 2200, 0.6, 9.0);
  playTone(t, 'sine', 80, 40, 0.55, 0.75);
}

export function stingerOrchestral() {
  const t = now();
  const chord = [65.41, 77.78, 98.0, 123.47]; // C2, Eb2, G2, B2 dissonant minor-major hit
  chord.forEach((freq) => {
    playTone(t, 'sawtooth', freq, freq * 0.95, 0.65, 0.35, 0.005);
  });
  playTone(t, 'sine', 45, 25, 0.7, 0.9);
  playNoise(t, 0.35, 'bandpass', 450, 0.7, 1.5, 0.005);
}

export function playTinnitus() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = now();
  // 4000 Hz pure high tone ringing slowly fading away
  playTone(t, 'sine', 4000, 4000, 4.0, 0.18, 0.05);
}

export const STINGERS = [
  stingerShriek,
  stingerImpact,
  stingerGlass,
  stingerSwell,
  stingerScreech,
  stingerOrchestral,
];

export function playRandomStinger(index) {
  if (typeof index === 'number') {
    const fn = STINGERS[Math.abs(index) % STINGERS.length];
    fn();
  } else {
    const fn = STINGERS[Math.floor(Math.random() * STINGERS.length)];
    fn();
  }
}
