// Heartbeat-style vibration pulse scaling with killer proximity and scare events. iOS: no-op.
let next = 0;

export const reset = () => {
  next = 0;
};

export function update(p, nowMs) {
  if (typeof navigator === 'undefined' || !navigator.vibrate || p < 40 || nowMs < next) return;
  const k = (p - 40) / 60; // 0..1
  try {
    navigator.vibrate([35, 90, 35]);
  } catch {}
  next = nowMs + 60000 / (60 + 100 * k); // 60 -> 160 bpm
}

export function pulseStrike() {
  try {
    navigator.vibrate?.([200]);
  } catch {}
}

export function pulseDouble() {
  try {
    navigator.vibrate?.([60, 45, 90]);
  } catch {}
}

export function stop() {
  try {
    navigator.vibrate?.(0);
  } catch {}
}
