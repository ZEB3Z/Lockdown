// Heartbeat-style vibration pulse that speeds up with killer proximity (matches audio heartbeat BPM). iOS: no-op.
let next = 0;
export const reset = () => { next = 0; };
export function update(p, nowMs) {
  if (typeof navigator === 'undefined' || !navigator.vibrate || p < 40 || nowMs < next) return;
  const k = (p - 40) / 60;                       // 0..1
  try { navigator.vibrate([35, 90, 35]); } catch {}
  next = nowMs + 60000 / (60 + 90 * k);          // 60 -> 150 bpm
}
export function stop() { try { navigator.vibrate?.(0); } catch {} }
