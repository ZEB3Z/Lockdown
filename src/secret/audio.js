// Audio synthesizer for The Maze secret game
import { getAudioContext, now } from '../audio/synth.js';

let customNoiseBuffer = null;

function getTearNoiseBuffer(ctx) {
  if (!customNoiseBuffer && ctx) {
    customNoiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = customNoiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Crackle + white noise distribution for realistic paper fiber tearing
      const isCrackle = Math.random() < 0.15;
      data[i] = (Math.random() * 2 - 1) * (isCrackle ? 1.0 : 0.4);
    }
  }
  return customNoiseBuffer;
}

/**
 * Procedural paper tearing sound on drag friction.
 */
export function playTearSound(intensity = 1.0) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const t = now();
  const noise = getTearNoiseBuffer(ctx);
  if (!noise) return;

  const duration = 0.08 * Math.max(0.6, intensity);
  const src = ctx.createBufferSource();
  src.buffer = noise;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200 + Math.random() * 1200, t);
  filter.Q.setValueAtTime(2.2, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(0.4 * Math.min(1.0, intensity), t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  src.start(t);
  src.stop(t + duration);
}

/**
 * Full dramatic paper tear sound (when tearing down the entire page).
 * Synthesizes a layered crunchy "CRRR-RRIIIP!" tear.
 */
export function playFullPaperRip() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const t = now();
  const noise = getTearNoiseBuffer(ctx);
  if (!noise) return;

  // 1. Granular tearing noise body (burst of 10 rapid fiber snaps)
  const burstCount = 10;
  for (let i = 0; i < burstCount; i++) {
    const burstTime = t + i * 0.03 + Math.random() * 0.015;
    const dur = 0.04 + Math.random() * 0.03;
    const src = ctx.createBufferSource();
    src.buffer = noise;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600 + Math.random() * 2200, burstTime);
    filter.Q.setValueAtTime(2.5, burstTime);

    const gain = ctx.createGain();
    const burstVol = (0.25 + (i / burstCount) * 0.35) * (0.8 + Math.random() * 0.4);
    gain.gain.setValueAtTime(0.001, burstTime);
    gain.gain.linearRampToValueAtTime(Math.min(0.7, burstVol), burstTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, burstTime + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start(burstTime);
    src.stop(burstTime + dur + 0.01);
  }

  // 2. Resonant rip scrape chirp (dropping from 850Hz to 220Hz)
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(850, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.38);

  const oscFilter = ctx.createBiquadFilter();
  oscFilter.type = 'lowpass';
  oscFilter.frequency.setValueAtTime(1400, t);
  oscFilter.frequency.linearRampToValueAtTime(600, t + 0.38);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.001, t);
  oscGain.gain.linearRampToValueAtTime(0.28, t + 0.04);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

  osc.connect(oscFilter);
  oscFilter.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.4);
}

/**
 * Classic retro buzzer sound when hitting a maze wall.
 */
export function playWallHit() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const t = now();
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(130, t);
  osc.frequency.linearRampToValueAtTime(80, t + 0.18);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.2);
}

/**
 * Success fanfare when clearing a level.
 */
export function playLevelWin() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const t = now();
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const noteTime = t + i * 0.09;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.18);
  });
}

function makeDistortionCurve(amount = 20) {
  const n = 44100;
  const curve = new Float32Array(n);
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/**
 * Terrifying, ear-splitting, maximum-volume scream for the iconic jump scare!
 * Layered with guttural throat roars, piercing banshee shrieks, FM roughness,
 * full-spectrum noise explosions, waveshaper saturation, and a chest-hitting sub-bass slam.
 */
export function playHorrorScream() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const t = now();

  // 1. Peak Limiter / Brickwall Compressor to push output to the absolute maximum ceiling without clipping
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -1; // Max volume headroom
  comp.knee.value = 2;
  comp.ratio.value = 20;
  comp.attack.value = 0.001;
  comp.release.value = 0.05;
  comp.connect(ctx.destination);

  // 2. Overdrive Waveshaper for maximum acoustic density and raw distorted scream texture
  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve(16);
  shaper.oversample = '4x';
  shaper.connect(comp);

  const screamMaster = ctx.createGain();
  screamMaster.gain.setValueAtTime(1.0, t);
  screamMaster.connect(shaper);

  // 3. High-pitch piercing banshee shrieks (1450Hz - 3450Hz) with extreme FM vibrato roughness
  const screechFreqs = [1480, 1850, 2380, 2920, 3450];
  screechFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq * 1.12, t + 0.25);
    osc.frequency.linearRampToValueAtTime(freq * 0.72, t + 3.2);

    // FM roughness modulator (50-80Hz) to simulate torn human vocal cords
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(50 + idx * 8, t);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220 + idx * 30, t);
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 3.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.65, t + 0.005);
    gain.gain.setValueAtTime(0.65, t + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.2);

    osc.connect(gain);
    gain.connect(screamMaster);

    osc.start(t);
    osc.stop(t + 3.4);
  });

  // 4. Guttural mid-range human throat scream & roar (320Hz, 480Hz, 720Hz, 960Hz)
  const roarFreqs = [320, 480, 720, 960];
  roarFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq * 1.18, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, t + 3.0);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(35 + idx * 10, t);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(90, t);
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 3.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.004);
    gain.gain.setValueAtTime(0.7, t + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

    osc.connect(gain);
    gain.connect(screamMaster);

    osc.start(t);
    osc.stop(t + 3.2);
  });

  // 5. Dual explosive noise bursts (full spectrum tear & air blast)
  const noise = getTearNoiseBuffer(ctx);
  if (noise) {
    // Burst A: High-pass screech hiss
    const nSrcA = ctx.createBufferSource();
    nSrcA.buffer = noise;
    nSrcA.loop = true;

    const nFilterA = ctx.createBiquadFilter();
    nFilterA.type = 'highpass';
    nFilterA.frequency.setValueAtTime(1400, t);
    nFilterA.Q.setValueAtTime(2.0, t);

    const nGainA = ctx.createGain();
    nGainA.gain.setValueAtTime(0.001, t);
    nGainA.gain.linearRampToValueAtTime(0.9, t + 0.003);
    nGainA.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    nSrcA.connect(nFilterA);
    nFilterA.connect(nGainA);
    nGainA.connect(screamMaster);

    nSrcA.start(t);
    nSrcA.stop(t + 2.6);

    // Burst B: Harsh resonant bandpass burst (2800Hz) for instant ear impact
    const nSrcB = ctx.createBufferSource();
    nSrcB.buffer = noise;
    nSrcB.loop = true;

    const nFilterB = ctx.createBiquadFilter();
    nFilterB.type = 'bandpass';
    nFilterB.frequency.setValueAtTime(2800, t);
    nFilterB.Q.setValueAtTime(3.0, t);

    const nGainB = ctx.createGain();
    nGainB.gain.setValueAtTime(0.001, t);
    nGainB.gain.linearRampToValueAtTime(0.85, t + 0.003);
    nGainB.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    nSrcB.connect(nFilterB);
    nFilterB.connect(nGainB);
    nGainB.connect(screamMaster);

    nSrcB.start(t);
    nSrcB.stop(t + 2.3);
  }

  // 6. Sub-bass shockwave thud (120Hz -> 25Hz) for physical chest impact
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(120, t);
  sub.frequency.exponentialRampToValueAtTime(24, t + 0.9);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(1.0, t);
  subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

  sub.connect(subGain);
  subGain.connect(comp); // Direct to limiter for maximum clean punch

  sub.start(t);
  sub.stop(t + 1.5);
}
