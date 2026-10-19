import { now, playNoise, playTone, vol, getMaster, getAudioContext } from './synth.js';

let drone = null;
let running = false;
let nextStep = 0;
let nextBeat = 0;
let nextBreath = 0;

export function startAmbience() {
  const ctx = getAudioContext();
  if (!ctx) return;
  running = true;
  nextStep = nextBeat = nextBreath = now() + 1.2;

  const g = ctx.createGain();
  g.gain.value = 0.0001;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 180;

  const a = ctx.createOscillator();
  const b = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();

  a.type = b.type = 'sawtooth';
  a.frequency.value = 55;
  b.frequency.value = 55.7;

  lfo.frequency.value = 0.12;
  lg.gain.value = 60;
  lfo.connect(lg);
  lg.connect(lp.frequency);

  a.connect(lp);
  b.connect(lp);
  lp.connect(g);
  g.connect(getMaster());

  [a, b, lfo].forEach((o) => o.start());
  drone = { g, nodes: [a, b, lfo] };
}

export function stopAmbience() {
  running = false;
  if (!drone) return;
  const t = now();
  drone.g.gain.setTargetAtTime(0.0001, t, 0.15);
  drone.nodes.forEach((o) => {
    try { o.stop(t + 1); } catch {}
  });
  drone = null;
}

export function updateAmbience(proximity, remainingSec = 240, strikes = 0) {
  const ctx = getAudioContext();
  if (!ctx || !running || !drone) return;
  const t = now();
  const k = Math.min(1, Math.max(0, proximity / 100));

  // Drone volume rises with proximity
  drone.g.gain.setTargetAtTime((0.07 + 0.14 * k) * vol(), t, 0.5);

  // Footsteps on wood: interval 1.5s down to 0.35s (or rapid 0.22s in final 15s)
  const isSprinting = remainingSec < 15 && proximity > 60;
  if (t >= nextStep) {
    const pitch = 70 + Math.random() * 20;
    const creakFreq = 200 + 350 * k + (Math.random() * 60 - 30);
    playNoise(t, 0.11, 'lowpass', creakFreq, (0.12 + 0.58 * k));
    playTone(t, 'sine', pitch, pitch - 30, 0.14, (0.12 + 0.5 * k));

    if (isSprinting) {
      nextStep = t + 0.22 + Math.random() * 0.05;
    } else {
      nextStep = t + (1.5 - 1.15 * k) * (0.85 + Math.random() * 0.3);
    }
  }

  // Heartbeat: triggers above 35% proximity, speeds up from 60 to 160 BPM, amplified by strikes
  const strikeBoost = strikes * 0.08;
  if ((k > 0.35 || strikes > 0) && t >= nextBeat) {
    const intensity = Math.min(1, (k - 0.35) / 0.65 + strikeBoost);
    const bpm = 60 + 100 * intensity;
    const beatVol = (0.35 + 0.55 * intensity);

    playTone(t, 'sine', 55, 38, 0.14, beatVol);
    playTone(t + 0.17, 'sine', 48, 34, 0.15, beatVol * 0.85);

    nextBeat = t + 60 / bpm;
  }

  // Heavy breathing: triggers above 60% proximity
  if (k > 0.6 && t >= nextBreath) {
    const breathFreq = 850 + (Math.random() * 200 - 100);
    playNoise(t, 1.1, 'bandpass', breathFreq, 0.22 * k, 0.8, 0.4);
    nextBreath = t + 3.4 - 1.8 * k;
  }
}
