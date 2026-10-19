// Web Audio synth: no asset files. unlock() MUST be called from a tap.
let ctx, master, noiseBuf, drone = null, running = false, muted = false, reduced = false;
let nextStep = 0, nextBeat = 0, nextBreath = 0, slammed = false;
const MASTER = 0.7;
const vol = () => (reduced ? 0.5 : 1);
const now = () => ctx.currentTime;

export function unlock() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {} // iOS: ignore silent switch where supported
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : MASTER;
    const comp = ctx.createDynamicsCompressor(); // loudness safety net
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== 'running') ctx.resume();
  return true;
}
export function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : MASTER, now(), 0.03); }
export function setReduced(r) { reduced = r; }
export function setPaused(p) { if (ctx) (p ? ctx.suspend() : ctx.resume()); }

function env(g, t, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function noise(t, dur, type, freq, peak, q = 1, att = 0.005) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); env(g, t, att, peak * vol(), dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + att + dur + 0.05);
}
function tone(t, type, f0, f1, dur, peak) {
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain(); env(g, t, 0.005, peak * vol(), dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}

export function startRun() {
  if (!ctx) return;
  running = true; slammed = false;
  nextStep = nextBeat = nextBreath = now() + 1.2;
  const g = ctx.createGain(); g.gain.value = 0.0001;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
  const a = ctx.createOscillator(), b = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  a.type = b.type = 'sawtooth'; a.frequency.value = 55; b.frequency.value = 55.7;
  lfo.frequency.value = 0.12; lg.gain.value = 60; lfo.connect(lg); lg.connect(lp.frequency);
  a.connect(lp); b.connect(lp); lp.connect(g); g.connect(master);
  [a, b, lfo].forEach((o) => o.start());
  drone = { g, nodes: [a, b, lfo] };
}
export function stopRun() {
  running = false;
  if (!drone) return;
  const t = now(); drone.g.gain.setTargetAtTime(0.0001, t, 0.15);
  drone.nodes.forEach((o) => o.stop(t + 1)); drone = null;
}
/** Call every frame with proximity 0..100. Schedules footsteps, heartbeat, breathing, distant slam. */
export function update(p) {
  if (!ctx || !running) return;
  const t = now(), k = p / 100;
  drone.g.gain.setTargetAtTime((0.07 + 0.12 * k) * vol(), t, 0.5);
  if (t >= nextStep) { // footsteps: every 1.5s -> 0.35s
    noise(t, 0.12, 'lowpass', 200 + 300 * k, 0.1 + 0.6 * k);
    tone(t, 'sine', 70, 40, 0.15, 0.1 + 0.5 * k);
    nextStep = t + (1.5 - 1.15 * k) * (0.9 + Math.random() * 0.2);
  }
  if (k > 0.4 && t >= nextBeat) { // heartbeat 60 -> 150 bpm
    tone(t, 'sine', 55, 38, 0.14, 0.5 * (0.5 + k)); tone(t + 0.17, 'sine', 48, 34, 0.16, 0.4 * (0.5 + k));
    nextBeat = t + 60 / (60 + 90 * ((k - 0.4) / 0.6));
  }
  if (k > 0.6 && t >= nextBreath) { // heavy breathing
    noise(t, 0.9, 'bandpass', 900, 0.18 * k, 0.7, 0.5);
    nextBreath = t + 3.2 - 1.6 * k;
  }
  if (!slammed && k > 0.3) { slammed = true; slam(0.5); } // distant door slam, once
}
export function slam(p = 1) { if (!ctx) return; const t = now(); noise(t, 0.5, 'lowpass', 160, p); tone(t, 'sine', 80, 30, 0.45, 0.9 * p); }
export function creak() {
  if (!ctx) return; const t = now();
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.linearRampToValueAtTime(150, t + 0.8);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 8;
  const g = ctx.createGain(); env(g, t, 0.2, 0.18 * vol(), 0.7);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + 1.1);
}
export function strike() {
  if (!ctx) return; const t = now();
  noise(t, 0.35, 'bandpass', 1800, 0.9, 0.8);
  tone(t, 'sawtooth', 620, 590, 0.4, 0.3); tone(t, 'sawtooth', 659, 622, 0.4, 0.3); tone(t, 'sine', 60, 40, 0.5, 0.8);
}
export function scare() {
  if (!ctx) return; const t = now();
  tone(t, 'sawtooth', 1400, 220, 0.7, 0.45); tone(t, 'square', 1480, 230, 0.7, 0.25);
  noise(t, 0.8, 'highpass', 1200, 0.55); tone(t, 'sine', 50, 30, 0.8, 0.9);
}
export const caught = () => scare();
export function win() {
  if (!ctx) return; const t = now();
  slam(0.6); [220, 277, 330].forEach((f, i) => tone(t + 0.3 + i * 0.12, 'sine', f, f, 2.5, 0.18));
}
