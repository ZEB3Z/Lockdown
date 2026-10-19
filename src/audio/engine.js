// Unified Web Audio Engine facade: synthesizes all sound via Web Audio API.
import { getAudioContext, setMuted, setGentle, setPaused, dropout, playNoise, playTone, now } from './synth.js';
import { startAmbience, stopAmbience, updateAmbience } from './ambience.js';
import * as effects from './effects.js';
import * as stingers from './stingers.js';

export { setMuted, setPaused, dropout };

export function unlock() {
  try {
    if (typeof navigator !== 'undefined' && navigator.audioSession) {
      navigator.audioSession.type = 'playback';
    }
  } catch {}
  const ctx = getAudioContext();
  if (ctx && ctx.state !== 'running') {
    ctx.resume();
  }
  return Boolean(ctx);
}

export function setReduced(r) {
  setGentle(r);
}

export function startRun() {
  unlock();
  startAmbience();
}

export function stopRun() {
  stopAmbience();
}

export function update(proximity, remainingSec = 240, strikes = 0) {
  updateAmbience(proximity, remainingSec, strikes);
}

export function strike() {
  const t = now();
  playNoise(t, 0.35, 'bandpass', 1800, 0.9, 0.8);
  playTone(t, 'sawtooth', 620, 590, 0.4, 0.3);
  playTone(t, 'sawtooth', 659, 622, 0.4, 0.3);
  playTone(t, 'sine', 60, 40, 0.5, 0.8);
}

export function creak() {
  effects.creak();
}

export function slam(p = 1) {
  effects.slam(p);
}

export function scare(index) {
  stingers.playRandomStinger(index);
}

export function caught() {
  scare(0);
  setTimeout(() => {
    stingers.playTinnitus();
  }, 900);
}

export function win() {
  effects.slam(0.6);
  const t = now();
  [220, 277, 330, 440].forEach((f, i) => {
    playTone(t + 0.3 + i * 0.12, 'sine', f, f, 2.5, 0.18);
  });
}

export function playEffect(name) {
  if (typeof effects[name] === 'function') {
    effects[name]();
  }
}
