// Web Audio synthesis foundation: safety limiter, voice manager, master compressor.
let ctx = null;
let masterGain = null;
let compressor = null;
let noiseBuffer = null;
let activeVoices = [];
const MAX_VOICES = 8;
const MASTER_PEAK = 0.7; // Hard master ceiling: loud but never clipping or painful

let isMuted = false;
let isGentle = false;

export function getAudioContext() {
  if (!ctx && typeof window !== 'undefined') {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = isMuted ? 0 : MASTER_PEAK;

      // Master dynamics compressor as safety net
      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 20;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      // Pre-allocate 1-second white noise buffer
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
  }
  return ctx;
}

export function now() {
  return ctx ? ctx.currentTime : 0;
}

export function getNoiseBuffer() {
  return noiseBuffer;
}

export function getMaster() {
  return masterGain;
}

export function vol() {
  return isGentle ? 0.45 : 1.0;
}

export function setMuted(m) {
  isMuted = Boolean(m);
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : MASTER_PEAK, now(), 0.03);
  }
}

export function setGentle(g) {
  isGentle = Boolean(g);
}

export function setPaused(p) {
  if (ctx) {
    if (p && ctx.state === 'running') ctx.suspend();
    else if (!p && ctx.state === 'suspended') ctx.resume();
  }
}

export function registerVoice(node, stopTime) {
  activeVoices = activeVoices.filter((v) => v.stopTime > now());
  if (activeVoices.length >= MAX_VOICES) {
    // Evict oldest voice to stay strictly under the 8-voice concurrency cap
    const oldest = activeVoices.shift();
    try {
      oldest.node.stop?.();
      oldest.node.disconnect?.();
    } catch {}
  }
  activeVoices.push({ node, stopTime });
}

export function env(gainNode, t, attack, peak, decay) {
  gainNode.gain.setValueAtTime(0.0001, t);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

export function dropout(durationSec = 1.5) {
  if (!masterGain || !ctx || isMuted) return;
  const t = now();
  masterGain.gain.setValueAtTime(masterGain.gain.value, t);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  masterGain.gain.setValueAtTime(0.0001, t + durationSec);
  masterGain.gain.exponentialRampToValueAtTime(MASTER_PEAK, t + durationSec + 0.15);
}

export function playNoise(t, dur, filterType, freq, peak, q = 1, attack = 0.005) {
  if (!ctx || !noiseBuffer) return;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer;
  s.loop = true;

  const f = ctx.createBiquadFilter();
  f.type = filterType;
  f.frequency.setValueAtTime(freq, t);
  f.Q.setValueAtTime(q, t);

  const g = ctx.createGain();
  env(g, t, attack, peak * vol(), dur);

  s.connect(f);
  f.connect(g);
  g.connect(masterGain);

  const stopTime = t + attack + dur + 0.05;
  s.start(t);
  s.stop(stopTime);
  registerVoice(s, stopTime);
}

export function playTone(t, type, f0, f1, dur, peak, attack = 0.005) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) {
    o.frequency.exponentialRampToValueAtTime(Math.max(10, f1), t + dur);
  }

  const g = ctx.createGain();
  env(g, t, attack, peak * vol(), dur);

  o.connect(g);
  g.connect(masterGain);

  const stopTime = t + attack + dur + 0.05;
  o.start(t);
  o.stop(stopTime);
  registerVoice(o, stopTime);
}
