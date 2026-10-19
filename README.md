```text
    __    ____  ________ __ ____  ____ _       ___   __
   / /   / __ \/ ____/ //_// __ \/ __ \ |     / / | / /
  / /   / / / / /   / ,<  / / / / / / / | /| / /  |/ / 
 / /___/ /_/ / /___/ /| |/ /_/ / /_/ /| |/ |/ / /|  /  
/_____/\____/\____/_/ |_/_____/\____/ |__/|__/_/ |_/
```

> 🕯️ **CASE FILE · BLACKTHORN MANOR** · *A two-player slasher escape for a university Halloween booth.*
> One of you is locked inside. The other holds the only manual. **He is already in the house.**

![status](https://img.shields.io/badge/status-v2%20complete%20(5%20locks)-8c0f15) ![stack](https://img.shields.io/badge/stack-Vite%20%2B%20vanilla%20JS-050505) ![backend](https://img.shields.io/badge/backend-none-050505) ![bundle](https://img.shields.io/badge/game%20payload-~24%20KB%20gzip-050505)

---

## ☠ CONTENTS OF THE CASE FILE

| File | What's inside |
|---|---|
| [00 · The premise](#-file-00--the-premise) | What the game is and how a run plays out |
| [01 · What you need](#-file-01--what-you-need-from-scratch) | Software and accounts, installed from zero |
| [02 · Ritual I: summon it locally](#-file-02--ritual-i-summon-it-on-your-computer) | Install, validate, test, run, play |
| [03 · Ritual II: bind it to GitHub](#-file-03--ritual-ii-bind-it-to-github) | Git push instructions |
| [04 · Ritual III: release it on Vercel](#-file-04--ritual-iii-release-it-on-vercel) | Deploy, verify, PWA offline test |
| [05 · Ritual IV: the QR code](#-file-05--ritual-iv-the-qr-code) | Generate and print |
| [06 · Ritual V: print the manual](#-file-06--ritual-v-print-the-manual) | A4, 13 pages, B&W or color |
| [07 · Booth day](#-file-07--booth-day) | Checklist and the 20-second briefing |
| [08 · Anatomy](#-file-08--anatomy-of-the-house) | Folder and architecture map |
| [09 · The rules inside the rules](#-file-09--the-rules-inside-the-rules) | Case code, the five locks, clock |
| [10 · Dials and switches](#-file-10--dials-and-switches) | URL parameters, themes, gentle mode, config |
| [11 · Proving it works](#-file-11--proving-it-works) | Automated validation and smoke tests |
| [12 · Sound, light, scare director and safety](#-file-12--sound-light-scare-director-and-safety) | Scare director, Web Audio, flash limiter |
| [13 · Troubleshooting](#-file-13--troubleshooting) | Symptom, cause, fix |
| [14 · Known limits](#-file-14--known-limits-read-this) | Hardware and audio audit boundaries |

---

## 🩸 FILE 00 · THE PREMISE

**LOCKDOWN** is an asymmetric co-op game in the style of *Keep Talking and Nobody Explodes*. No servers, no accounts, no networking. Two players, one phone, one printed manual.

| Role | Holds | Sees | Does |
|---|---|---|---|
| 🔦 **The Escapee** | A phone (opened by QR code) | The five locks, case code, clock, killer proximity | Describes what is on screen. Operates locks based on instructions. |
| 📖 **The Handler** | A printed A4 manual (13 pages) | Only the manual, **never the screen** | Reads rules, asks questions, gives one instruction at a time. |

**A run, start to finish**

1. Escapee scans the QR code and taps **ENTER THE HOUSE**. A **case code** like `K7-3-RED` appears. The clock starts at **4:00** (240 seconds on normal).
2. Five locked doors in an order shuffled per case code: **BRASS TUMBLER**, **GLYPH PAD**, **FUSE BOX**, **EXECUTION SWITCH**, **DIAL SAFE**.
3. At each door the Escapee reads the **plate name** aloud. The Handler finds that page. The manual rules, plus case code and screen items, yield exactly one correct solution.
4. A wrong action is a **strike**. Each strike costs **15 seconds** and moves the killer closer with an audio burst. **Three strikes, or zero seconds, and he finds you.**
5. Escape through all five doors: **ESCAPED**, with remaining time in big numerals. Otherwise: **HE FOUND YOU**, with instant retry.

**3,888 deterministic case codes:** every puzzle is generated from the case code by a seeded RNG. The manual contains rules, not fixed answers. A validator script exhaustively proves all 3,888 seeds have exactly one valid solution.

**Decoys:** the manual includes 5 decoy pages (**IRON TUMBLER**, **NUMBER PAD**, **GAS VALVE**, **RELAY BOARD**, **VAULT WHEEL**). Escapee and Handler must communicate plate names exactly.

---

## 🗝 FILE 01 · WHAT YOU NEED (FROM SCRATCH)

Four free tools:
1. **Node.js** (LTS 20 or newer): [nodejs.org](https://nodejs.org). Verify with `node -v` and `npm -v`.
2. **Git**: [git-scm.com](https://git-scm.com) or GitHub Desktop.
3. **GitHub account**: [github.com](https://github.com).
4. **Vercel account**: [vercel.com](https://vercel.com).

---

## 🕯 FILE 02 · RITUAL I: SUMMON IT ON YOUR COMPUTER

```bash
# 1. Install dependencies
npm install

# 2. Run exhaustive tests (validator + smoke)
npm test

# 3. Start local dev server
npm run dev
```

Key testing URLs:
- `http://localhost:5173/` : Standard run
- `http://localhost:5173/?case=K7-3-RED` : Fixed seed run
- `http://localhost:5173/?case=K7-3-RED&debug` : Fixed seed with on-screen answer (staff only)
- `http://localhost:5173/?stats` : Shows per-door clearance times, theme, gentle mode, and quality status on end screen
- `http://localhost:5173/?theme=light` : Staff shortcut to test "Lights On" sickly yellow theme
- `http://localhost:5173/?gentle=1` : Staff shortcut for Gentle Mode
- `http://localhost:5173/manual/` : Rendered 13-page manual
- `http://localhost:5173/admin/?case=K7-3-RED` : 5-module answer key
- `http://localhost:5173/facilitator/` : 1-page booth briefing sheet

---

## 🔪 FILE 03 · RITUAL II: BIND IT TO GITHUB

```bash
git init
git add .
git commit -m "LOCKDOWN v2: complete 5-door horror escape"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lockdown.git
git push -u origin main
```

---

## 🩻 FILE 04 · RITUAL III: RELEASE IT ON VERCEL

1. Import repo into Vercel.
2. Build command override: `npm run build` (runs `validate.mjs` before Vite build).
3. Production domain: `lockdown-booth.vercel.app`.
4. Service worker cache version is `lockdown-v2`. Verify offline mode on phone via airplane mode.

---

## 🔦 FILE 05 · RITUAL IV: THE QR CODE

```bash
npm run qr -- https://lockdown-booth.vercel.app/
```
Writes `qr/lockdown-qr.png` (1200px) and `qr/lockdown-qr.svg`. Print at 8 cm minimum on matte cardstock.

---

## 📜 FILE 06 · RITUAL V: PRINT THE MANUAL

Open `https://YOUR-DOMAIN/manual/` in Chrome or Edge, print (`Ctrl + P`):
- Paper **A4**, Scale **100%**, Margins **Default**, Headers and Footers **OFF**.
- Black and White: Background graphics OFF. Color (`/manual/?color=1`): Background graphics ON.
- Page count: **13 pages**. Clean page breaks; no module splits across pages.

| Page | Content |
|---|---|
| 1 | Cover: Blackthorn Manor Case File |
| 2 | How to read this manual |
| 3 | Quick reference table & color/digit index |
| 4 | IRON TUMBLER *(decoy)* |
| 5 | **BRASS TUMBLER** |
| 6 | NUMBER PAD *(decoy)* |
| 7 | **GLYPH PAD** (6 columns of 6 glyphs) |
| 8 | GAS VALVE *(decoy)* |
| 9 | **FUSE BOX** |
| 10 | RELAY BOARD *(decoy)* |
| 11 | **EXECUTION SWITCH** (with a COLOR start table) |
| 12 | VAULT WHEEL *(decoy)* |
| 13 | **DIAL SAFE** (with 6 clue conversion tables) |

Also print `/facilitator/` (1 page) for the booth table.

---

## 🎃 FILE 07 · BOOTH DAY

- 2 loaner phones preloaded with game, volume at 80%, silent switch off, Auto-Lock disabled.
- 1 printed manual per station + 2 spare copies. Facilitator sheet on table.
- 20-second briefing:
  > *"You are locked in a killer's house. You have four minutes to escape through five locked doors. One of you is the Escapee holding the phone; one is the Handler with the case file. You cannot look at each other's materials—talk fast, describe what you see, and give clear orders. Three strikes and he finds you. Sound up. Tap ENTER."*

---

## 🏚 FILE 08 · ANATOMY OF THE HOUSE

```text
lockdown/
├─ index.html
├─ vite.config.js
├─ vercel.json
├─ public/
│  ├─ sw.js                 PWA cache v2 (offline support)
│  └─ manifest.webmanifest
├─ src/
│  ├─ config.js             4:00 clock, 5 doors, difficulty presets
│  ├─ main.js               entry point
│  ├─ style.css             dark and light themes, scare layers, lock views
│  ├─ core/
│  │  ├─ rng.js             seeded PRNG (mulberry32 + xmur3)
│  │  ├─ code.js            format, parse, 3,888 cases
│  │  ├─ plan.js            case code -> 5 shuffled doors
│  │  └─ run.js             state machine (remaining, proximity, strikes)
│  ├─ modules/
│  │  ├─ tumbler/           logic.js + view.js
│  │  ├─ glyphs/            logic.js + view.js + columns.js
│  │  ├─ fuse/              logic.js + view.js
│  │  ├─ switch/            logic.js + view.js
│  │  └─ dial/              logic.js + view.js
│  ├─ ui/
│  │  ├─ shell.js           HUD, pause/rotate holds, wake lock, theme toggle
│  │  ├─ visuals.js         scare overlays (glass slam, face, blackout, blood)
│  │  ├─ flash-limiter.js   photosensitivity safety rail (max 3 flashes/sec)
│  │  ├─ haptics.js         heartbeat vibration pulses + strike buzz
│  │  ├─ glyphs.js          SVG glyph definitions
│  │  └─ dom.js             button binding (with reusable support)
│  ├─ audio/
│  │  ├─ synth.js           core oscillators, noise buffers, master compressor
│  │  ├─ ambience.js        drone, footsteps, heartbeat, heavy breathing
│  │  ├─ effects.js         creaks, slams, whispers, music box, phone ring
│  │  ├─ stingers.js        6 normalized jump-scare stingers + tinnitus
│  │  └─ engine.js          unified audio facade
│  ├─ scare/
│  │  └─ director.js        intensity curve, beat scheduler, cooldowns
│  ├─ manual/               manual builder + manual.css
│  └─ admin/                5-module answer key
├─ tools/
│  ├─ validate.mjs          exhaustive 3,888 case validator
│  ├─ reference.mjs         independent rule reference interpreter
│  ├─ smoke.mjs             jsdom end-to-end smoke test
│  └─ qr.mjs                QR code generator
└─ docs/                    DEPLOY.md, PLAYTEST.md, CONTRIBUTING.md, playtest-log.csv
```

---

## 🧩 FILE 09 · THE RULES INSIDE THE RULES

### Case Code Format
`K7-3-RED` = LETTER (12 options) · SERIAL (1-9) · LAST (1-9) · COLOR (4 options). Total: 3,888 codes.

### The Five Locks
1. **BRASS TUMBLER**: 5 pins. Skull pin picked last. Count N matching COLOR. LAST digit odd = L to R, even = R to L. Pick order based on N.
2. **GLYPH PAD**: 4 glyphs. Locate the single matching column among 6 in manual. SERIAL odd = top to bottom, even = bottom to top.
3. **FUSE BOX**: 3 to 6 wires. Cut rules branch on wire count, warning tags, LAST digit parity, vowel letter, and case color.
4. **EXECUTION SWITCH**: A panel of 6 lettered switches and a looping countdown (20 down to 0, then restart). Which switch: the one showing the case LETTER (always on the panel). Which number: COLOR start (RED 2, BLUE 4, YELLOW 7, WHITE 10) plus SERIAL. The Escapee flips the switch while the countdown shows that number (window about 1.35 seconds: 0.1s early grace, 0.25s late grace). A wrong switch or a mistimed flip is a strike: 15s off the clock, an electrical arc and wail, and the killer's footsteps close in.
5. **DIAL SAFE**: Safe dial (0 to 39). Three wall clues (clock, painting, candles, calendar, portrait, handprints). Turn order fixed: TURN 1 = LEFT (CCW), TURN 2 = RIGHT (CW), TURN 3 = LEFT (CCW). Match clues to turns by COLOR. Look up base numbers in manual tables. If LAST digit odd, add SERIAL to each number (wrap mod 40). Dial to each number and tap SET.

---

## 🎛 FILE 10 · DIALS AND SWITCHES

### URL Parameters
- `?case=K7-3-RED`: Fix case code
- `?debug`: Shows answer in HUD and detailed end-screen statistics (staff only)
- `?stats`: Logs per-module timings, theme, gentle mode, and quality status on end screen
- `?theme=light|dark`: Overrides theme (`light` = Lights On, `dark` = Lights Out)
- `?gentle=1`: Enables Gentle Mode
- `?difficulty=easy|normal|hard`: Swaps preset

### Presets (`src/config.js`)
| Preset | Total Time | Strike Penalty | Killer Speed |
|---|---|---|---|
| `easy` | 300 s (5:00) | 10 s | 0.9 |
| `normal` | 240 s (4:00) | 15 s | 1.0 |
| `hard` | 200 s (3:20) | 20 s | 1.1 |

---

## 🧪 FILE 11 · PROVING IT WORKS

- `npm run validate`: Tests all 3,888 case codes across all five modules against independent reference interpreter, verifies no dead rules, statistical sanity (rug ratio 51.1%), and checks 13 manual pages verbatim.
- `npm run smoke`: Simulates perfect play and 3-strike failure in JSDOM, verifies flash limiter safety rules, and confirms mid-game theme toggling does not touch the clock.
- `npm run build`: Validates then produces production build in `dist/`.

---

## 🔊 FILE 12 · SOUND, LIGHT, SCARE DIRECTOR AND SAFETY

- **Scare Director (`src/scare/director.js`)**: Orchestrates atmospheric scares based on intensity (proximity, strikes, door number, time remaining). Features guaranteed beats:
  - Door 1 (~4s): Subtle house alive event (whisper + peripheral shadow).
  - Door 3: Hard scare (hand slam on glass, spreading cracks).
  - Door 4: Fake-out rattle followed 3.8s later by killer silhouette behind glass.
  - Door 5: Relentless atmosphere with corner lurker silhouette.
  - Final 20s: Final surge scare.
- **Safety Rails**:
  - Flash limiter utility (`src/ui/flash-limiter.js`): Enforces max 3 flashes per second anywhere in the game.
  - Master Dynamics Compressor in Web Audio engine protects hearing from piercing audio peaks.
  - Gentle Mode: Accessible via checkbox on start screen or `?gentle=1`. Eliminates all full strobes, blackouts, lunges, and softens audio stingers.
  - No scare ever covers puzzle text/controls for >0.6s; all scare layers have `pointer-events: none`.
  - Scares never trigger in the first 3s of a new door so the Escapee can read the plate name.
- **Adaptive Quality Guard**: Measures frame times during play; if 95th percentile exceeds 24 ms for 3 seconds, automatically disables film grain and heavy SVG filters, logging degradation in end-screen stats.
- **Themes**:
  - Dark ("Lights Out"): Pitch black, cold flashlight whites, blood red accents.
  - Light ("Lights On"): Dim sickly yellow bulb, peeling aged wallpaper, dark ochre surfaces, exposed feel.
  - Both themes pass WCAG AA contrast standards.

---

## 🧯 FILE 13 · TROUBLESHOOTING

- `npm test` fails: Inspect failing case code in error log.
- Audio silent: Mobile browsers require tapping `ENTER THE HOUSE` to unlock Web Audio. On iOS, verify physical silent switch is toggled off.
- Vibration missing: Expected on iOS Safari (Apple does not support Web Vibration API).
- PWA offline reload: Ensure game was loaded once online over HTTPS.

---

## ⚠ FILE 14 · KNOWN LIMITS (READ THIS)

**Automated Proofs:**
- Mathematical determinism and single-solution guarantee across all 3,888 seeds for all five modules.
- Independent reference implementation concordance.
- 13-page A4 manual print structure with 0 orphaned module sections.

**Requires On-Site Hardware Verification:**
- Audio levels on real mobile phone speakers vs wired headphones (conduct the scare audit in `docs/PLAYTEST.md`).
- Touch target accuracy on physical low-end Android screens under 360px viewport width.
- Booth ambient lighting impact on physical A4 manual readability.
