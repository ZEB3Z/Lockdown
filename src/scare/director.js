// Scare Director: orchestrates scares across the 5 doors.
// Balances intensity, cooldowns, gameplay readability, and safety rails.
import { mulberry32, xmur3 } from '../core/rng.js';

let rand = Math.random;
let V = null;
let A = null;
let H = null;
let gentle = false;

let lastMajorScareMs = -99999;
let pendingFakeOut = null;
let scheduledBeats = {};
let lastDoorSeen = -1;

export function initScareDirector(seedStr, visuals, audio, haptics, isGentle = false) {
  V = visuals;
  A = audio;
  H = haptics;
  gentle = Boolean(isGentle);
  if (seedStr) {
    rand = mulberry32(xmur3(seedStr + ':scare')());
  } else {
    rand = Math.random;
  }
  resetScareDirector();
}

export function resetScareDirector() {
  lastMajorScareMs = -99999;
  pendingFakeOut = null;
  scheduledBeats = {
    door1_alive: false,
    door3_hard: false,
    door4_fakeout: false,
    door4_real: false,
    door5_relentless: false,
    last20_final: false,
  };
  lastDoorSeen = -1;
}

export function setGentleMode(g) {
  gentle = Boolean(g);
}

/**
 * Called on every animation frame during active play.
 */
export function updateScareDirector(nowMs, run) {
  if (!run || run.over || run.paused) return;

  const door = run.door; // 0..4
  const proximity = run.proximity(); // 0..100
  const rem = run.remaining(); // seconds
  const doorTimeMs = run.activeMs - (run.marks[door - 1] ? run.marks[door - 1] * 1000 : 0);

  if (door !== lastDoorSeen) {
    lastDoorSeen = door;
  }

  // Safety rule: never fire scares in first 3 seconds of a new door so Escapee reads the plate name!
  if (doorTimeMs < 3000) {
    return;
  }

  // Process pending fake-out real scare if scheduled
  if (pendingFakeOut && nowMs >= pendingFakeOut.triggerAtMs) {
    const fn = pendingFakeOut.execute;
    pendingFakeOut = null;
    fn();
    return;
  }

  // Guaranteed Beat 1: Door 1 (~4s in) -> house is alive (whisper + wall scratch)
  if (door === 0 && doorTimeMs >= 4000 && !scheduledBeats.door1_alive) {
    scheduledBeats.door1_alive = true;
    A?.playEffect?.('whisper');
    V?.triggerMinorEffect?.('shadow');
    return;
  }

  // Guaranteed Beat 2: Door 3 -> hard scare (hand slam on glass / cracks)
  if (door === 2 && doorTimeMs >= 4500 && !scheduledBeats.door3_hard) {
    if (canFireMajorScare(nowMs)) {
      scheduledBeats.door3_hard = true;
      executeMajorScare(nowMs, 'slam_glass');
      return;
    }
  }

  // Guaranteed Beat 3: Door 4 -> fake-out then real scare 3-6s later
  if (door === 3 && doorTimeMs >= 4000 && !scheduledBeats.door4_fakeout) {
    scheduledBeats.door4_fakeout = true;
    // Fake-out cue: doorknob rattle / dropout
    A?.playEffect?.('handleRattle');
    V?.triggerMinorEffect?.('shadow');
    if (!gentle) {
      // Schedule real scare 3.5s later
      pendingFakeOut = {
        triggerAtMs: nowMs + 3800,
        execute: () => {
          scheduledBeats.door4_real = true;
          executeMajorScare(nowMs, 'killer_silhouette');
        },
      };
    }
    return;
  }

  // Guaranteed Beat 4: Door 5 -> relentless presence (whispers + lurker)
  if (door === 4 && doorTimeMs >= 4500 && !scheduledBeats.door5_relentless) {
    scheduledBeats.door5_relentless = true;
    V?.triggerMinorEffect?.('corner_lurker');
    A?.playEffect?.('whisper');
    return;
  }

  // Guaranteed Beat 5: Final jump scare in last 20 seconds
  if (rem <= 20 && rem > 2 && !scheduledBeats.last20_final) {
    if (canFireMajorScare(nowMs)) {
      scheduledBeats.last20_final = true;
      executeMajorScare(nowMs, 'final_surge');
      return;
    }
  }

  // Ambient procedural scare chances (governed by intensity and cooldowns)
  // Major scare budget: >= 12s on average, never stacked within 4s
  if (canFireMajorScare(nowMs) && (nowMs - lastMajorScareMs >= 12000)) {
    const intensity = (proximity / 100) * 0.5 + (door / 4) * 0.3 + (run.strikes / 3) * 0.2;
    if (rand() < intensity * 0.02) {
      const candidates = ['face_glass', 'lights_dip', 'text_glitch', 'shadow'];
      const chosen = candidates[Math.floor(rand() * candidates.length)];
      if (chosen === 'lights_dip' && gentle) {
        // Skip blackout in gentle mode
        V?.triggerMinorEffect?.('shadow');
      } else {
        executeMajorScare(nowMs, chosen);
      }
    }
  }
}

function canFireMajorScare(nowMs) {
  // Hard cooldown: never stack two major scares within 4000ms
  return (nowMs - lastMajorScareMs) >= 4000;
}

function executeMajorScare(nowMs, type) {
  lastMajorScareMs = nowMs;

  switch (type) {
    case 'slam_glass':
      A?.playEffect?.('slam');
      A?.scare?.(1); // impact stinger
      V?.slamGlass?.();
      H?.pulseDouble?.();
      break;

    case 'killer_silhouette':
      A?.scare?.(0); // shriek stinger
      V?.scare?.();
      H?.pulseDouble?.();
      break;

    case 'face_glass':
      A?.playEffect?.('knifeScrape');
      V?.faceOnGlass?.();
      H?.pulseDouble?.();
      break;

    case 'lights_dip':
      if (!gentle) {
        A?.dropout?.(1.2);
        V?.lightsCutout?.();
      }
      break;

    case 'text_glitch':
      V?.textGlitch?.();
      break;

    case 'final_surge':
      A?.scare?.(2); // glass stinger
      V?.scare?.();
      H?.pulseDouble?.();
      break;

    default:
      A?.scare?.();
      V?.scare?.();
      break;
  }
}

export function onStrike(strikes) {
  // Visceral escalation on strikes
  V?.strike?.(strikes);
  if (strikes >= 2 && !gentle) {
    V?.scare?.();
  }
}

export function onDoorTransition(doorIndex) {
  // Fake-out chance during door transitions
  if (!gentle && rand() < 0.35) {
    V?.doorCoatFakeout?.();
  }
}
