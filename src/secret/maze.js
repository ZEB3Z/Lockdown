// The Maze (Scary Maze Game Easter Egg)
// Recreates the authentic original Flash layouts with zero crookedness,
// featuring Level 1, Level 2, Level 3 (from original screenshot), and Level 4 (The Impossible Level).
import { playWallHit, playLevelWin, playHorrorScream } from './audio.js';
import { tearBackToLockdown, mountTearDownToLockdown } from './tear.js';

let activeContainer = null;
let currentLevelIndex = 0;
let isPlaying = false;
let hasStartedLevel = false;
let scareTriggered = false;
let onExitCallback = null;

// Small solid square player size (4px)
const SQUARE_SIZE = 4;
const HALF_SIZE = SQUARE_SIZE / 2;

// The authentic levels designed with exact right-angle geometric precision
const LEVELS = [
  // LEVEL 1: Wide, smooth S-path (50px)
  {
    title: 'Level 1',
    start: { x: 50, y: 290, w: 50, h: 50 },
    goal: { x: 50, y: 110, w: 50, h: 50 },
    labelPos: { x: 110, y: 135 },
    paths: [
      { x: 50, y: 290, w: 400, h: 50 },  // Bottom horizontal
      { x: 400, y: 110, w: 50, h: 230 }, // Right vertical
      { x: 50, y: 110, w: 400, h: 50 },  // Top horizontal to goal
    ],
    wallObstacles: [],
    scareZone: null,
  },

  // LEVEL 2: 3-tier winding corridors (40px) with seamless junctions
  {
    title: 'Level 2',
    start: { x: 50, y: 310, w: 40, h: 40 },
    goal: { x: 410, y: 130, w: 40, h: 40 },
    labelPos: { x: 410, y: 110 },
    paths: [
      { x: 50, y: 310, w: 400, h: 40 },  // Tier 1 (bottom) [50..450]
      { x: 410, y: 220, w: 40, h: 130 }, // Right vertical [410..450] x [220..350]
      { x: 50, y: 220, w: 400, h: 40 },  // Tier 2 (middle) [50..450] x [220..260]
      { x: 50, y: 130, w: 40, h: 130 },  // Left vertical [50..90] x [130..260]
      { x: 50, y: 130, w: 400, h: 40 },  // Tier 3 (top) to goal [50..450] x [130..170]
    ],
    wallObstacles: [],
    scareZone: null,
  },

  // LEVEL 3: Exact 1:1 replica of the original Flash level (Image 2)
  // Perfectly smooth right angles with no odd bumps or misalignment!
  {
    title: 'Level 3',
    start: { x: 50, y: 330, w: 36, h: 36 },
    goal: { x: 212, y: 8, w: 34, h: 32 },
    labelPos: { x: 254, y: 24 },
    paths: [
      { x: 50, y: 330, w: 380, h: 36 },  // Bottom horizontal [50..430] x [330..366]
      { x: 394, y: 240, w: 36, h: 126 }, // Right vertical [394..430] x [240..366]
      { x: 50, y: 240, w: 380, h: 36 },  // Middle horizontal [50..430] x [240..276]
      { x: 50, y: 150, w: 36, h: 126 },  // Left vertical [50..86] x [150..276]
      { x: 50, y: 150, w: 190, h: 36 },  // Top horizontal to center [50..240] x [150..186]
      // Clean, seamless chicane neck leading up to the goal (matching original photo):
      { x: 226, y: 104, w: 14, h: 50 },  // 1. Up from right edge: [226..240] x [104..154]
      { x: 206, y: 104, w: 34, h: 14 },  // 2. Jog left: [206..240] x [104..118]
      { x: 206, y: 64, w: 14, h: 48 },   // 3. Up on left: [206..220] x [64..112]
      { x: 206, y: 64, w: 32, h: 14 },   // 4. Jog right: [206..238] x [64..78]
      { x: 224, y: 36, w: 14, h: 34 },   // 5. Up into goal: [224..238] x [36..70]
    ],
    wallObstacles: [],
    scareZone: null,
  },

  // LEVEL 4: THE IMPOSSIBLE LEVEL
  // Completely unique, intricate, ominous spiral labyrinth!
  // In impossible mode, touching ANY wall regardless of location triggers the jumpscare!
  // Features a solid black wall completely sealing the path before the finish line!
  {
    title: 'Level 4',
    start: { x: 30, y: 30, w: 32, h: 32 },
    goal: { x: 236, y: 160, w: 34, h: 28 },
    labelPos: { x: 278, y: 174 },
    paths: [
      { x: 30, y: 30, w: 440, h: 32 },   // 1. Top border [30..470] x [30..62]
      { x: 438, y: 30, w: 32, h: 340 },  // 2. Right border [438..470] x [30..370]
      { x: 30, y: 338, w: 440, h: 32 },  // 3. Bottom border [30..470] x [338..370]
      { x: 30, y: 100, w: 32, h: 270 },  // 4. Left border [30..62] x [100..370]
      { x: 30, y: 100, w: 340, h: 28 },  // 5. Inner tier 1 [30..370] x [100..128]
      { x: 342, y: 100, w: 28, h: 180 }, // 6. Inner right vertical [342..370] x [100..280]
      { x: 110, y: 252, w: 260, h: 28 }, // 7. Inner bottom [110..370] x [252..280]
      { x: 110, y: 160, w: 28, h: 120 }, // 8. Inner left vertical [110..138] x [160..280]
      { x: 110, y: 160, w: 140, h: 28 }, // 9. Corridor to goal chamber [110..250] x [160..188]
    ],
    // The impassable solid black wall completely sealing the path before the finish line:
    wallObstacles: [
      { x: 218, y: 156, w: 16, h: 36 },
    ],
    // Approaching the barrier or goal triggers the exploit scare:
    scareZone: { x: 200, y: 150, w: 80, h: 50 },
    scarePrompt: 'did you really think an exploit would save you?',
  },
];

/**
 * Open and launch The Maze game in the given root app container.
 */
export function openTheMaze(app, onExit) {
  onExitCallback = onExit;
  document.body.classList.add('maze-active');
  activeContainer = document.createElement('div');
  activeContainer.className = 'maze-wrapper';
  app.appendChild(activeContainer);

  renderStartMenu();
}

function renderStartMenu() {
  if (!activeContainer) return;
  activeContainer.innerHTML = `
    <div class="maze-menu">
      <div class="maze-title-group">
        <h1 class="maze-title">The Maze<span class="tm">TM</span></h1>
      </div>
      <div class="maze-instructions">
        <p>Test your skills!</p>
        <p>Try to reach the goal without touching the walls</p>
        <p>How steady is your hand?</p>
        <p>Let's find out! Try and beat all four levels!</p>
      </div>
      <p class="maze-sound-cue">sound effects will help</p>
      <button type="button" class="maze-play-btn" id="maze-play-btn">
        <span>PLAY</span>
      </button>
    </div>
  `;

  // The tear to exit ONLY shows up in the menus!
  mountTearDownToLockdown(activeContainer, closeTheMaze);

  activeContainer.querySelector('#maze-play-btn').onclick = () => {
    currentLevelIndex = 0;
    startLevel(currentLevelIndex);
  };
}

function startLevel(idx) {
  currentLevelIndex = idx;
  const level = LEVELS[idx];
  isPlaying = true;
  hasStartedLevel = false;
  scareTriggered = false;

  // While playing the game, the tear to exit MUST NOT show up at all!
  const tearTab = activeContainer.querySelector('#maze-corner-tear');
  if (tearTab) tearTab.remove();

  activeContainer.innerHTML = `
    <div class="maze-game-container">
      <div class="maze-hud">
        <h2 class="maze-level-title">${level.title}</h2>
        <span class="maze-hud-tip">Hover START to begin!</span>
      </div>
      <div class="maze-canvas-frame">
        <canvas class="maze-canvas" width="500" height="400" id="maze-canvas"></canvas>
        <div class="maze-toast" id="maze-toast">TOUCHED WALL! RESTARTING...</div>
      </div>
    </div>
  `;

  const canvas = activeContainer.querySelector('#maze-canvas');
  const toast = activeContainer.querySelector('#maze-toast');
  setupCanvas(canvas, toast, level);
}

function setupCanvas(canvas, toast, level) {
  const ctx = canvas.getContext('2d');
  canvas.style.cursor = 'default';
  const tip = activeContainer?.querySelector('.maze-hud-tip');
  if (tip) tip.textContent = 'Hover START to begin!';

  let playerPos = {
    x: level.start.x + level.start.w / 2,
    y: level.start.y + level.start.h / 2,
  };

  function isInsideStart(x, y) {
    return (
      x >= level.start.x &&
      x <= level.start.x + level.start.w &&
      y >= level.start.y &&
      y <= level.start.y + level.start.h
    );
  }

  function draw() {
    // 1. Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Cyan walkable paths (Authentic #00e5ff)
    ctx.fillStyle = '#00e5ff';
    level.paths.forEach((p) => {
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // 3. Wall obstacles (e.g., Level 4 impossible barrier)
    if (level.wallObstacles && level.wallObstacles.length > 0) {
      ctx.fillStyle = '#000000';
      level.wallObstacles.forEach((w) => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
      });
    }

    // 4. Start Area indicator (Hover to activate)
    if (!hasStartedLevel) {
      ctx.fillStyle = 'rgba(0, 180, 80, 0.4)';
      ctx.fillRect(level.start.x, level.start.y, level.start.w, level.start.h);
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.strokeRect(level.start.x, level.start.y, level.start.w, level.start.h);

      ctx.fillStyle = '#002200';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('START', level.start.x + level.start.w / 2, level.start.y + level.start.h / 2);
    } else {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(level.start.x, level.start.y, level.start.w, level.start.h);
    }

    // 5. Red Goal
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(level.goal.x, level.goal.y, level.goal.w, level.goal.h);

    // 6. White Level label next to the goal (matching Image 2)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(level.title, level.labelPos.x, level.labelPos.y);

    // 7. Player: Small solid dark blue square with crisp white outline
    ctx.fillStyle = '#001a99';
    ctx.fillRect(
      playerPos.x - HALF_SIZE,
      playerPos.y - HALF_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      playerPos.x - HALF_SIZE,
      playerPos.y - HALF_SIZE,
      SQUARE_SIZE,
      SQUARE_SIZE
    );
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function isPointInside(x, y) {
    // If inside a blocking wall obstacle -> it's a wall!
    if (level.wallObstacles) {
      for (const w of level.wallObstacles) {
        if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) {
          return false;
        }
      }
    }
    // Inside start area
    if (x >= level.start.x && x <= level.start.x + level.start.w &&
        y >= level.start.y && y <= level.start.y + level.start.h) {
      return true;
    }
    // Inside paths
    for (const p of level.paths) {
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) {
        return true;
      }
    }
    // Inside goal
    if (x >= level.goal.x && x <= level.goal.x + level.goal.w &&
        y >= level.goal.y && y <= level.goal.y + level.goal.h) {
      return true;
    }
    return false;
  }

  function isSquareInside(cx, cy) {
    // Center point
    if (!isPointInside(cx, cy)) return false;
    // Four corners of the small square
    if (!isPointInside(cx - HALF_SIZE, cy - HALF_SIZE)) return false;
    if (!isPointInside(cx + HALF_SIZE, cy - HALF_SIZE)) return false;
    if (!isPointInside(cx - HALF_SIZE, cy + HALF_SIZE)) return false;
    if (!isPointInside(cx + HALF_SIZE, cy + HALF_SIZE)) return false;
    return true;
  }

  function checkGoal(x, y) {
    return (
      x >= level.goal.x &&
      x <= level.goal.x + level.goal.w &&
      y >= level.goal.y &&
      y <= level.goal.y + level.goal.h
    );
  }

  function checkScare(x, y) {
    if (!level.scareZone) return false;
    const z = level.scareZone;
    return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
  }

  function resetToStart() {
    hasStartedLevel = false;
    canvas.style.cursor = 'default';
    if (tip) tip.textContent = 'Hover START to begin!';
    playerPos = {
      x: level.start.x + level.start.w / 2,
      y: level.start.y + level.start.h / 2,
    };
    draw();
    playWallHit();
    toast.classList.add('show');
    setTimeout(() => toast?.classList.remove('show'), 900);
  }

  function onPointerMove(e) {
    if (!isPlaying || scareTriggered) return;
    const { x, y } = getCanvasCoords(e);
    playerPos = { x, y };

    // 1. Before START has been hovered:
    // User can move cursor anywhere without triggering ANY wall hits or penalties!
    if (!hasStartedLevel) {
      if (isInsideStart(x, y)) {
        hasStartedLevel = true;
        if (tip) tip.textContent = 'Guide your square to the red goal!';
        draw();
        return; // Safe activation: do not check walls on the transition frame!
      } else {
        draw();
        return;
      }
    }

    // 2. Start has been hovered: active gameplay is running!
    // In Level 4 (Impossible Level): ANY approach to barrier/goal triggers the scare!
    if (currentLevelIndex === 3) {
      if (checkGoal(x, y) || checkScare(x, y) || (x >= 200 && y >= 150 && y <= 200)) {
        scareTriggered = true;
        isPlaying = false;
        triggerScreamer('did you really think an exploit would save you?', 'There was never a way through.<br>Did your heart skip a beat?');
        return;
      }
    } else if (checkScare(x, y)) {
      scareTriggered = true;
      isPlaying = false;
      triggerScreamer(level.scarePrompt || 'DID YOU REALLY THINK AN EXPLOIT WOULD SAVE YOU?');
      return;
    }

    // 3. Check wall collision for the small square
    if (!isSquareInside(x, y)) {
      // IN IMPOSSIBLE LEVEL (Level 4): Touching ANY wall triggers the jumpscare REGARDLESS!
      if (currentLevelIndex === 3) {
        scareTriggered = true;
        isPlaying = false;
        triggerScreamer('did you really think an exploit would save you?', 'There was never a way through.<br>Did your heart skip a beat?');
        return;
      }
      // IN LEVEL 3: Touching wall near the end (the narrow zigzag section) triggers the jumpscare!
      if (currentLevelIndex === 2 && y <= 165) {
        scareTriggered = true;
        isPlaying = false;
        triggerScreamer('YOU WERE WARNED', 'You touched the wall near the end.<br>Did your heart skip a beat?');
        return;
      }
      resetToStart();
      return;
    }

    // 4. Check goal reached
    if (checkGoal(x, y)) {
      if (currentLevelIndex === 3) {
        // Level 4 is completely impossible to finish
        scareTriggered = true;
        isPlaying = false;
        triggerScreamer('did you really think an exploit would save you?', 'There was never a way through.<br>Did your heart skip a beat?');
        return;
      }
      isPlaying = false;
      playLevelWin();
      if (currentLevelIndex < LEVELS.length - 1) {
        toast.textContent = 'LEVEL CLEARED! NEXT LEVEL...';
        toast.style.borderColor = '#00ff44';
        toast.style.color = '#00ff44';
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          toast.textContent = 'TOUCHED WALL! RESTARTING...';
          toast.style.borderColor = '#ff3333';
          toast.style.color = '#ff3333';
          startLevel(currentLevelIndex + 1);
        }, 1100);
      }
      return;
    }

    draw();
  }

  function onPointerLeave() {
    // Never trigger wall hit or restart if level hasn't been started yet!
    if (!hasStartedLevel || !isPlaying || scareTriggered) return;
    if (currentLevelIndex === 3) {
      // In Impossible Level, leaving the canvas triggers the jumpscare immediately!
      scareTriggered = true;
      isPlaying = false;
      triggerScreamer('did you really think an exploit would save you?', 'There was never a way through.<br>Did your heart skip a beat?');
      return;
    }
    if (currentLevelIndex === 2 && playerPos.y <= 165) {
      scareTriggered = true;
      isPlaying = false;
      triggerScreamer('YOU WERE WARNED', 'You touched the wall near the end.<br>Did your heart skip a beat?');
      return;
    }
    resetToStart();
  }

  function onCanvasClick(e) {
    if (!isPlaying || scareTriggered || !hasStartedLevel) return;
    const { x, y } = getCanvasCoords(e);
    if (currentLevelIndex === 3) {
      // In Impossible Level, ANY click anywhere on canvas triggers the jumpscare!
      scareTriggered = true;
      isPlaying = false;
      triggerScreamer('did you really think an exploit would save you?', 'There was never a way through.<br>Did your heart skip a beat?');
      return;
    }
    if (currentLevelIndex === 2 && y <= 165) {
      if (!isSquareInside(x, y)) {
        scareTriggered = true;
        isPlaying = false;
        triggerScreamer('YOU WERE WARNED', 'You touched the wall near the end.<br>Did your heart skip a beat?');
      }
    }
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('click', onCanvasClick);

  draw();
}

/**
 * Trigger the horrifying fullscreen scream jump scare!
 */
export function triggerScreamer(customPrompt, customSubtitle) {
  if (!activeContainer) return;

  // 1. Play blood-curdling screeching stinger safely
  try {
    playHorrorScream();
  } catch (err) {
    console.error('Audio playback error:', err);
  }

  // 2. Heavy physical vibration
  try {
    navigator.vibrate?.([150, 40, 250, 40, 600, 50, 800]);
  } catch {}

  // 3. Inject full-screen violent screamer takeover
  const screamerEl = document.createElement('div');
  screamerEl.className = 'screamer-fullscreen';
  screamerEl.innerHTML = `
    <img class="screamer-image" src="/screamer.jpg" alt="SCREAMER JUMPSCARE">
  `;
  activeContainer.appendChild(screamerEl);

  // 4. After 3.5s of terror, cut to the game over screen
  setTimeout(() => {
    screamerEl.remove();

    const gameOverEl = document.createElement('div');
    gameOverEl.className = 'screamer-gameover';
    gameOverEl.innerHTML = `
      <h1 class="screamer-title" style="font-size: clamp(26px, 6vw, 44px); text-transform: uppercase;">
        ${customPrompt || 'YOU WERE WARNED'}
      </h1>
      <p class="screamer-subtitle">${customSubtitle || 'There was never a way through.<br>Did your heart skip a beat?'}</p>
      <div class="screamer-actions">
        <button type="button" class="screamer-btn primary" id="screamer-again">TRY AGAIN</button>
      </div>
    `;
    activeContainer.appendChild(gameOverEl);

    // Mount the tear tab on this menu screen so player can tear down to exit
    mountTearDownToLockdown(activeContainer, closeTheMaze);

    gameOverEl.querySelector('#screamer-again').onclick = () => {
      gameOverEl.remove();
      renderStartMenu();
    };
  }, 3600);
}

export function closeTheMaze() {
  document.body.classList.remove('maze-active');
  if (activeContainer) {
    activeContainer.remove();
    activeContainer = null;
  }
  isPlaying = false;
  hasStartedLevel = false;
  scareTriggered = false;
  if (onExitCallback) {
    onExitCallback();
  }
}
