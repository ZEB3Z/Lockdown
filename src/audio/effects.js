import { now, playNoise, playTone, vol, env, getMaster, getAudioContext, registerVoice } from './synth.js';

export function creak() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = now();
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(85, t);
  o.frequency.linearRampToValueAtTime(145, t + 0.8);

  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 420;
  f.Q.value = 7;

  const g = ctx.createGain();
  env(g, t, 0.2, 0.18 * vol(), 0.7);

  o.connect(f);
  f.connect(g);
  g.connect(getMaster());

  o.start(t);
  o.stop(t + 1.1);
  registerVoice(o, t + 1.1);
}

export function slam(p = 1) {
  const t = now();
  playNoise(t, 0.48, 'lowpass', 160, 0.9 * p);
  playTone(t, 'sine', 85, 28, 0.45, 0.95 * p);
}

export function thud() {
  const t = now();
  playNoise(t, 0.25, 'lowpass', 120, 0.6);
  playTone(t, 'sine', 65, 30, 0.28, 0.7);
}

export function scratch() {
  const t = now();
  for (let i = 0; i < 3; i++) {
    playNoise(t + i * 0.14, 0.12, 'bandpass', 1800 + i * 300, 0.4, 4.0);
  }
}

export function chains() {
  const t = now();
  for (let i = 0; i < 4; i++) {
    playTone(t + i * 0.09, 'triangle', 800 + Math.random() * 400, 300, 0.08, 0.35);
    playNoise(t + i * 0.09, 0.06, 'highpass', 2400, 0.3);
  }
}

export function handleRattle() {
  const t = now();
  for (let i = 0; i < 5; i++) {
    playTone(t + i * 0.06, 'square', 140, 90, 0.04, 0.4);
    playNoise(t + i * 0.06, 0.05, 'bandpass', 650, 0.45, 3);
  }
}

export function knifeScrape() {
  const t = now();
  playTone(t, 'sawtooth', 2100, 1850, 0.55, 0.4);
  playNoise(t, 0.5, 'bandpass', 3200, 0.35, 8.0);
}

export function whisper() {
  const t = now();
  // Formant-filtered noise simulating eerie unintelligible whispering
  playNoise(t, 0.8, 'bandpass', 750, 0.25, 4.0, 0.1);
  playNoise(t + 0.1, 0.7, 'bandpass', 1800, 0.2, 5.0, 0.15);
  playNoise(t + 0.2, 0.6, 'bandpass', 2600, 0.18, 6.0, 0.1);
}

export function musicBox() {
  const t = now();
  const notes = [587.33, 523.25, 440.0, 392.0]; // D5, C5, A4, G4 - detuned
  notes.forEach((freq, idx) => {
    playTone(t + idx * 0.38, 'sine', freq + (Math.random() * 6 - 3), freq, 0.45, 0.35, 0.01);
  });
}

export function phoneRing() {
  const t = now();
  for (let pulse = 0; pulse < 2; pulse++) {
    const pt = t + pulse * 0.55;
    playTone(pt, 'sine', 440, 440, 0.35, 0.2);
    playTone(pt, 'sine', 480, 480, 0.35, 0.2);
  }
}

// ---- Execution Switch sounds
export function switchTick() {
  const t = now();
  playTone(t, 'square', 900, 700, 0.03, 0.05);
}

export function switchTickLow() {
  const t = now();
  playTone(t, 'square', 1500, 1500, 0.05, 0.09);
}

export function switchClunk() {
  const t = now();
  playNoise(t, 0.1, 'bandpass', 900, 0.35, 3);
  playTone(t, 'square', 180, 90, 0.08, 0.35);
}

/** Wrong switch or bad timing: electrical arc, a dying wail, then heavy footsteps closing in. */
export function switchFault() {
  const t = now();
  for (let i = 0; i < 5; i++) {
    playNoise(t + i * 0.045, 0.05, 'highpass', 3200, 0.5, 2);
  }
  playTone(t, 'sawtooth', 420, 70, 0.9, 0.3, 0.02);
  playTone(t, 'sawtooth', 447, 66, 0.9, 0.28, 0.02);
  playTone(t + 0.1, 'sine', 1180, 310, 0.8, 0.14, 0.05);
  [0.55, 0.95, 1.3].forEach((d, i) => {
    playNoise(t + d, 0.22, 'lowpass', 140, 0.5 + i * 0.12);
    playTone(t + d, 'sine', 70, 28, 0.25, 0.55 + i * 0.12);
  });
}
