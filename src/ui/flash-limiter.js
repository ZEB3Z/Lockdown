// Flash Limiter: enforces safety rails across all visual effects.
// Safety rule: never flash more than 3 times in any 1-second window.
// Gentle mode: completely disables all high-intensity flashes.

let flashTimestamps = [];
let gentleMode = false;

export function setGentleMode(enabled) {
  gentleMode = Boolean(enabled);
}

export function isGentleMode() {
  return gentleMode;
}

export function resetFlashLimiter() {
  flashTimestamps = [];
}

/**
 * Returns true if a flash is permitted right now under the safety rails.
 * @param {number} nowMs Current timestamp in milliseconds (defaults to performance.now())
 */
export function canFlash(nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
  if (gentleMode) return false;
  // Prune timestamps older than 1000ms
  flashTimestamps = flashTimestamps.filter((t) => nowMs - t < 1000);
  return flashTimestamps.length < 3;
}

/**
 * Attempts to execute a flash effect function.
 * If permitted, records the flash and invokes the callback.
 * Returns true if the flash executed, false if blocked.
 */
export function requestFlash(callback, nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
  if (!canFlash(nowMs)) {
    return false;
  }
  flashTimestamps.push(nowMs);
  if (typeof callback === 'function') {
    callback();
  }
  return true;
}

export function getFlashCountInWindow(nowMs = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
  flashTimestamps = flashTimestamps.filter((t) => nowMs - t < 1000);
  return flashTimestamps.length;
}
