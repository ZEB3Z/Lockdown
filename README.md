```text
    __    ____  ________ __ ____  ____ _       ___   __
   / /   / __ \/ ____/ //_// __ \/ __ \ |     / / | / /
  / /   / / / / /   / ,<  / / / / / / / | /| / /  |/ / 
 / /___/ /_/ / /___/ /| |/ /_/ / /_/ /| |/ |/ / /|  /  
/_____/\____/\____/_/ |_/_____/\____/ |__/|__/_/ |_/
```

> 🕯️ **CASE FILE · BLACKTHORN MANOR** · *A two-player slasher escape for D'SAITECH's Halloween booth.*
> One of you is locked inside. The other holds the only manual. **He is already in the house.**

![status](https://img.shields.io/badge/status-v1%20built%2C%20needs%20real--phone%20playtests-8c0f15) ![stack](https://img.shields.io/badge/stack-Vite%20%2B%20vanilla%20JS-050505) ![backend](https://img.shields.io/badge/backend-none-050505) ![bundle](https://img.shields.io/badge/game%20payload-~13%20KB%20gzip-050505)

---

## ☠ CONTENTS OF THE CASE FILE

| File | What's inside |
|---|---|
| [00 · The premise](#-file-00--the-premise) | What the game is and how a run plays out |
| [01 · What you need](#-file-01--what-you-need-from-scratch) | Software and accounts, installed from zero |
| [02 · Ritual I: summon it locally](#-file-02--ritual-i-summon-it-on-your-computer) | Unzip, install, test, run, play |
| [03 · Ritual II: bind it to GitHub](#-file-03--ritual-ii-bind-it-to-github) | GitHub Desktop **or** command line |
| [04 · Ritual III: release it on Vercel](#-file-04--ritual-iii-release-it-on-vercel) | Deploy, verify, redeploy |
| [05 · Ritual IV: the QR code](#-file-05--ritual-iv-the-qr-code) | Generate, print, test |
| [06 · Ritual V: print the manual](#-file-06--ritual-v-print-the-manual) | A4, 9 pages, B&W or color |
| [07 · Booth day](#-file-07--booth-day) | Checklist and the 20-second briefing |
| [08 · Anatomy](#-file-08--anatomy-of-the-house) | Folder map |
| [09 · The rules inside the rules](#-file-09--the-rules-inside-the-rules) | Case code, the three locks, the clock |
| [10 · Dials and switches](#-file-10--dials-and-switches) | URL parameters, config, tuning |
| [11 · Proving it works](#-file-11--proving-it-works) | What the tests do and don't cover |
| [12 · Sound, light and safety](#-file-12--sound-light-and-safety) | Scares, flash limits, offline mode |
| [13 · Troubleshooting](#-file-13--troubleshooting) | Symptom, cause, fix |
| [14 · Known limits](#-file-14--known-limits-read-this) | What has **not** been verified |

---

## 🩸 FILE 00 · THE PREMISE

**LOCKDOWN** is an asymmetric co-op game in the style of *Keep Talking and Nobody Explodes*. No servers, no accounts, no networking. Two people, one phone, one printed manual.

| Role | Holds | Sees | Does |
|---|---|---|---|
| 🔦 **The Escapee** | A phone (opened by QR code) | The locks, the case code, the clock, the killer creeping closer | Describes what's on screen. Taps what they're told to tap. |
| 📖 **The Handler** | A printed A4 manual (9 pages) | Only the manual, **never the screen** | Reads rules, asks questions, gives one instruction at a time. |

**A run, start to finish**

1. Escapee scans the QR code and taps **ENTER THE HOUSE**. A **case code** like `K7-3-RED` appears. The clock starts at **3:00**.
2. Three locked doors, one after another, in an order that depends on the case code: **BRASS TUMBLER**, **GLYPH PAD**, **FUSE BOX**.
3. At each door the Escapee reads the **plate name** aloud. The Handler finds that page. The manual's rules, plus the case code and what's on screen, give exactly one correct answer.
4. A wrong tap is a **strike**. Each strike costs **15 seconds** and drags the killer closer. **Three strikes, or zero seconds, and he finds you.**
5. Escape through all three doors: **ESCAPED**, with your time remaining in big numbers. Otherwise: **HE FOUND YOU**, and a one-tap retry.

**Why one printed manual works for every run:** every puzzle is generated from the case code by a seeded random generator, and the manual contains *rules*, not answers. There are **3,888** possible case codes. A validator proves every single one has exactly one correct solution.

**Decoys:** the manual also has three pages that never apply (**IRON TUMBLER**, **NUMBER PAD**, **GAS VALVE**). The Handler must get the plate name right to know which page is real.

---

## 🗝 FILE 01 · WHAT YOU NEED (FROM SCRATCH)

You need four things. All are free.

| # | Tool | Why | Get it | Check it worked |
|---|---|---|---|---|
| 1 | **Node.js** (LTS, version 20 or newer) | Runs the tests and the dev server | [nodejs.org](https://nodejs.org) → download the **LTS** installer → keep every default | Open a terminal, run `node -v`. Expect `v20.x` or higher. Then `npm -v` |
| 2 | **Git** *(or just GitHub Desktop, which bundles it)* | Pushes the project to GitHub | [git-scm.com/downloads](https://git-scm.com/downloads) or [desktop.github.com](https://desktop.github.com) | `git --version` |
| 3 | **A GitHub account** | Vercel deploys from a GitHub repo | [github.com/signup](https://github.com/signup) | You can log in |
| 4 | **A Vercel account** | Hosts the game | [vercel.com/signup](https://vercel.com/signup) → **Continue with GitHub** | You see the Vercel dashboard |

Optional but handy: [VS Code](https://code.visualstudio.com) to open the folder and use its built-in terminal.

> 🩸 **How to open a terminal in the project folder**
> **Windows:** open the folder in File Explorer, click the address bar, type `cmd`, press Enter. *Or* open the folder in VS Code and use **Terminal → New Terminal**.
> **macOS:** right-click the folder → **New Terminal at Folder**. *Or* VS Code as above.
> Every command in this guide is typed **in that terminal, inside the `lockdown` folder**.

> ⚠ **Windows PowerShell says "running scripts is disabled"?** Use **Command Prompt** (`cmd`) instead, or run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then reopen the terminal.

---

## 🕯 FILE 02 · RITUAL I: SUMMON IT ON YOUR COMPUTER

**Step 1: Unzip.** Right-click the zip → **Extract All** (macOS: double-click). Put the `lockdown` folder somewhere simple like `Documents`. Don't run it from inside the zip.

**Step 2: Open a terminal in the folder** (see above). Confirm you're in the right place:

```bash
dir        # Windows. You should see package.json, index.html, src, tools ...
ls         # macOS / Linux. Same files.
```

**Step 3: Install the dependencies** (needs internet, takes under a minute):

```bash
npm install
```

You should end with something like `added 80 packages`. A few "deprecated" or "audit" notes are harmless. A red `ERR!` is not: see [Troubleshooting](#-file-13--troubleshooting).

**Step 4: Run the tests.** This is the "is the house structurally sound" check:

```bash
npm test
```

Expected, in order:

```text
codes checked: 3888/3888
...
PASS: every code yields exactly one solution; logic == reference; no dead rules; manual renders every rule.
part 1: 3888 codes, all 3 views clicked through the DOM
...
SMOKE PASS
```

If you see `FAILED` anywhere, **stop**: something about the rules or the game broke. The failing line names the exact case code and lock.

**Step 5: Start the game:**

```bash
npm run dev
```

The terminal prints `Local: http://localhost:5173/`. Open that address in Chrome or Edge.

**Step 6: Play it the way a tester would.** Add parameters so you get a fixed case and can see timings:

| Open this | What you get |
|---|---|
| `http://localhost:5173/` | A normal run with a random case code |
| `http://localhost:5173/?case=K7-3-RED` | The same puzzle every time (great for debugging) |
| `http://localhost:5173/?case=K7-3-RED&debug` | Same, and the **answer** is printed under the lock (**never use with real players**) |
| `http://localhost:5173/?stats` | Normal run, plus per-lock timings on the end screen, **no answers** (use for playtests) |
| `http://localhost:5173/manual/` | The printed manual, rendered |
| `http://localhost:5173/admin/?case=K7-3-RED` | The answer key page |
| `http://localhost:5173/facilitator/` | The one-page staff sheet |

Tick **Sound off** on the start screen if you're testing in a library. Press `Ctrl + C` in the terminal to stop the server.

**Step 7 (strongly recommended): try it on your phone.**

```bash
npm run dev -- --host
```

The terminal now also prints a `Network:` address like `http://192.168.1.23:5173/`. Put your phone on the **same wifi**, open that address. On Windows, allow Node through the firewall if asked (private networks).

> 🩸 Over plain `http://` on your LAN, **Wake Lock and the offline service worker don't work** (they need HTTPS). Use the LAN test for layout, touch and sound. Test the rest on your real Vercel link.

**Step 8 (optional): test the production build locally**, including offline mode:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173/`, wait a few seconds, then turn off your wifi and reload. The game should still load.

---

## 🔪 FILE 03 · RITUAL II: BIND IT TO GITHUB

Vercel deploys from a GitHub repository, so the project has to live there. Pick **one** option.

> 🩸 Before you start: `node_modules` and `dist` are already ignored by `.gitignore`. When you see the list of files to commit, it should be **around 48 files**, not thousands. If it's thousands, `.gitignore` is missing from the folder: stop and fix that first.

### Option A · GitHub Desktop (no terminal)

1. Install and open **GitHub Desktop**. Sign in with your GitHub account.
2. **File → Add local repository…** → choose the `lockdown` folder.
3. It says *"This directory does not appear to be a Git repository"*. Click **create a repository**.
   - Name: `lockdown`. Leave Description empty.
   - **Untick** "Initialize this repository with a README" (you already have one).
   - Git ignore: **None**. License: **None**. Click **Create repository**.
4. In the **Changes** tab you'll see about 48 files. Bottom-left, type a summary: `LOCKDOWN v1`. Click **Commit to main**.
5. Click **Publish repository** (top bar).
   - Name stays `lockdown`.
   - "Keep this code private": **your choice.** Vercel can deploy private repos. If you go public, remember the repo contains the rules and the answer-key code.
   - Click **Publish repository**.
6. Open the repository on github.com (**Repository → View on GitHub**) and check that you can see `package.json`, `src`, `docs`.

### Option B · Command line

First tell Git who you are (once per computer):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Create an **empty** repo on GitHub first: github.com → **+** (top right) → **New repository** → name `lockdown` → **do not** tick README, .gitignore or license → **Create repository**. Copy its URL, then in your terminal:

```bash
git init
git add .
git commit -m "LOCKDOWN v1"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lockdown.git
git push -u origin main
```

If it asks you to log in, use the browser prompt or a personal access token. Refresh the GitHub page: your files are there.

---

## 🩻 FILE 04 · RITUAL III: RELEASE IT ON VERCEL

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Dashboard → **Add New… → Project**.
3. Under **Import Git Repository**, find `lockdown` and click **Import**.
   - Not listed? Click **Adjust GitHub App Permissions** (or **Install**), grant Vercel access to the `lockdown` repo, come back.
4. **Configure Project** (this screen matters, read it slowly):

   | Setting | Value |
   |---|---|
   | **Project Name** | **Change it now.** Something short: `lockdown-booth`. This becomes your link: `lockdown-booth.vercel.app`. A shorter link makes a simpler QR code. If taken, Vercel adds a suffix. |
   | **Framework Preset** | **Vite** (auto-detected) |
   | **Root Directory** | `./` (leave) |
   | **Build Command** | Click **Override** and set `npm run build`. This runs the validator first, so **broken rules can never be deployed**. |
   | **Output Directory** | `dist` |
   | **Install Command** | leave default |
   | **Environment Variables** | none needed |

5. Click **Deploy**. Wait about a minute.
6. When it says **Congratulations**, click the preview image or **Continue to Dashboard**, then click your **production domain** (it ends in `.vercel.app`). This is the link for the QR code.

**Verify it, on a real phone, on mobile data or a different wifi:**

- [ ] `https://YOUR-NAME.vercel.app/` loads, shows the warning screen, **ENTER THE HOUSE** works
- [ ] You can finish a full run, including the sound and the end screen
- [ ] `/manual/` loads and prints (9 pages: see Ritual V)
- [ ] `/admin/?case=K7-3-RED` shows an answer
- [ ] `/facilitator/` loads
- [ ] **Offline test:** load the game once, switch to airplane mode, reload. It should still start.

> ⚠ **If you see a Vercel login page instead of the game:** Vercel's *Deployment Protection* is on. Open your project → **Settings → Deployment Protection** and make sure the **production** domain is publicly accessible. Always test in a private/incognito window or on a phone that isn't logged in to Vercel. **Use the production domain in your QR code, never a per-deployment link** (the ones with a random hash in the name).

**Updating later:** every push to `main` redeploys automatically (about a minute). Branches get their own preview links. The build runs the validator, so a push that breaks the rules **fails the deployment** and the old version stays live. Failed build? **Deployments** tab → click the failed one → read the log; the failing case code is named.

> 🩸 **Freeze before the event.** After your last playtest, stop pushing to `main` except to fix a blocker, and re-test on a phone after any push.

---

## 🔦 FILE 05 · RITUAL IV: THE QR CODE

```bash
npm run qr -- https://YOUR-NAME.vercel.app/
```

This writes `qr/lockdown-qr.png` (1200 px) and `qr/lockdown-qr.svg`. Rules for a code that scans in a dark, noisy hall:

- Encode the **root URL only**: no `?case=`, no `?debug`, **never `/admin/`**.
- Print it **at least 5 × 5 cm**; 8 cm on a booth sign is better. Black on white, matte paper (no glare), keep the white border.
- Scan it with **two different phones** (a cheap Android and an iPhone) from where a visitor will stand.
- Write the short URL under the QR as a backup.

---

## 📜 FILE 06 · RITUAL V: PRINT THE MANUAL

1. Open `https://YOUR-NAME.vercel.app/manual/` in **Chrome or Edge**.
2. Click **PRINT / SAVE PDF**, or `Ctrl + P`.
3. Settings:
   - Destination: your printer, or **Save as PDF**
   - Paper size: **A4**
   - Scale: **100%** (not "fit to page")
   - Margins: **Default**
   - **Headers and footers: OFF**
   - Black & white version: Background graphics **off**. Color version (`/manual/?color=1`): Background graphics **on**.
4. The preview must say **9 pages**. If it says 10 or more, a page overflowed: check scale and margins first.
5. Print single-sided. Staple top-left. One per station plus spares. Sleeves or lamination survive a whole evening of sticky fingers.
6. Read one copy **at arm's length, in dim light**. If the glyph columns on page 7 are hard to tell apart, tell the team before printing the rest.

Also print `/facilitator/` (one page) for the staff table.

| Page | Contents |
|---|---|
| 1 | Cover |
| 2 | How to read this manual |
| 3 | Quick reference and the plate-name index |
| 4 | IRON TUMBLER *(decoy)* |
| 5 | **BRASS TUMBLER** |
| 6 | NUMBER PAD *(decoy)* |
| 7 | **GLYPH PAD** (six glyph columns) |
| 8 | GAS VALVE *(decoy)* |
| 9 | **FUSE BOX** |

> ⚠ `/manual/` and `/admin/` are **public pages** on your site. They aren't linked from the game, but anyone who guesses the address can open them. For a booth that's a low risk. Don't print or show those URLs to visitors.

---

## 🎃 FILE 07 · BOOTH DAY

**Before doors open**

- [ ] The deployed version is the one you last tested. QR printed and scanned on 2 phones.
- [ ] **2 loaner phones**: opened the game once on wifi, volume up, **silent mode off**, Auto-Lock off, brightness up.
- [ ] Staff phone has `/admin/` and `/manual/` opened once (so they work offline).
- [ ] Manuals: 1 per station + 2 spares, page 1 on top. Facilitator sheet on the table.
- [ ] Charger or power bank. A watch or timer.

**The 20-second briefing**

> *"You are locked in a killer's house. One of you holds the phone: the Escapee. The other holds the manual: the Handler. You cannot see each other's screen, so talk fast and describe exactly. Three mistakes and he finds you. Silent mode off, volume up. Ready? Tap ENTER."*

**Stuck pair:** never give answers. Ladder: read the **plate name** aloud → read the **four case-code boxes** again → **describe shapes, don't guess names** → after 45 s stuck on one lock, use the answer key and give **one hint only**.

Full staff instructions live in `/facilitator/` and in [`docs/PLAYTEST.md`](docs/PLAYTEST.md).

---

## 🏚 FILE 08 · ANATOMY OF THE HOUSE

```text
lockdown/
├─ index.html                 the game page (+ #fx overlay layer)
├─ vite.config.js             builds 4 pages: game, manual, admin, facilitator
├─ vercel.json                cache headers (sw.js never cached, /assets immutable)
├─ public/
│  ├─ sw.js                   service worker: offline after first load
│  ├─ manifest.webmanifest    PWA manifest (portrait)
│  └─ icon.svg
├─ src/
│  ├─ config.js               ★ clock, strikes, penalty, killer speed, difficulty presets
│  ├─ main.js                 entry: pinch-block, service worker registration
│  ├─ style.css               palette, HUD, locks, atmosphere
│  ├─ core/
│  │  ├─ rng.js               seeded RNG (shared by game and validator)
│  │  ├─ code.js              case code: format, parse, all 3,888 codes
│  │  ├─ plan.js              case code -> door order + each lock's state
│  │  └─ run.js               run state machine: clock, strikes, proximity (no DOM)
│  ├─ modules/
│  │  ├─ index.js / views.js  registries (logic / views)
│  │  ├─ tumbler/             logic.js (pure) + view.js
│  │  ├─ glyphs/              logic.js + view.js + columns.js (frozen manual columns)
│  │  └─ fuse/                logic.js + view.js
│  ├─ ui/
│  │  ├─ shell.js             screens, HUD, pause/rotate holds, wake lock
│  │  ├─ visuals.js           grain, vignette, flicker, killer silhouette, scratches
│  │  ├─ haptics.js           vibration heartbeat
│  │  ├─ glyphs.js            the 18 SVG glyphs (game AND manual use these)
│  │  └─ dom.js               tap binding for lock views
│  ├─ audio/engine.js         Web Audio synth: drone, footsteps, heartbeat, stingers
│  ├─ manual/                 printed manual builder + print CSS
│  └─ admin/key.js            answer key page
├─ manual/ admin/ facilitator/  the three extra HTML pages
├─ tools/
│  ├─ validate.mjs            ★ exhaustive validator (also gates the Vercel build)
│  ├─ reference.mjs           independent interpreter of the manual rules
│  ├─ smoke.mjs               jsdom test of the real game flows
│  ├─ qr.mjs                  QR generator
│  └─ gen-columns.mjs         one-off: how the glyph columns were found
└─ docs/                      DEPLOY.md · PLAYTEST.md · CONTRIBUTING.md · playtest-log.csv
```

---

## 🧩 FILE 09 · THE RULES INSIDE THE RULES

### The case code

```text
K 7 - 3 - RED
│ │   │   └─ COLOR   RED · BLUE · YELLOW · WHITE
│ │   └───── LAST    digit 1-9   (odd / even matters)
│ └───────── SERIAL  digit 1-9   (odd / even matters)
└─────────── LETTER  A B C D E F G H J K M N   (vowels: A, E)
```

12 letters × 9 × 9 × 4 colors = **3,888** cases. `0`, `I`, `L`, `O`, `Q` are excluded so nothing gets misread aloud. Every random choice in a run is drawn from `makeRng(code + ":" + moduleId)`: **same code, same puzzle, on every phone**, and no module can disturb another's randomness.

### The three locks (the printed manual is generated from exactly these lines)

**BRASS TUMBLER** · 5 pins, numbered 1–5 left to right, each with a color and a symbol

1. A pin showing the **SKULL** is set aside and picked **last**.
2. Count the other pins whose color matches the case **COLOR**. Call it **N**.
3. **LAST** odd → direction is left→right. Even → right→left.
4. **N = 0:** all pins in direction order. **N = 1:** the COLOR pin first, then the rest in direction order. **N ≥ 2:** all non-COLOR pins in direction order, then the COLOR pins in direction order.

**GLYPH PAD** · 4 glyphs on screen; the manual has 6 columns of 6 glyphs

1. Find the **one** column containing all four glyphs. (The validator proves any two columns share ≤ 3 glyphs, so it's always exactly one.)
2. **SERIAL** odd → press them in that column's order, top to bottom. Even → bottom to top.

**FUSE BOX** · 3–6 wires numbered from the top; some carry a word label (GAS, EXIT, ATTIC, CELLAR, HALL, CRYPT)

| Wires | Cut |
|---|---|
| 3 | the topmost labeled wire; if none, wire 2 |
| 4 | **LAST** odd → wire 4. Even → the topmost wire of the case COLOR; if none, wire 1 |
| 5 | exactly one labeled wire → that wire. Otherwise **LETTER** A or E → wire 2, any other letter → wire 5 |
| 6 | two or more wires of the case COLOR → the second one from the top. Otherwise wire 3 |

### The clock and the killer

```text
remaining  = timeLimitSec - (elapsed × killerSpeed) - (strikes × strikePenaltySec)
proximity  = 100 × (1 - remaining / timeLimitSec)        →  at 100% he is on you
```

A strike doesn't move a separate meter. It deletes seconds from the clock, so the proximity bar **jumps** and the visible clock drops, always consistent. Progress inside a lock is **kept** after a strike.

| Proximity | What happens |
|---|---|
| ~30% | a distant door slam (once) |
| 40%+ | heartbeat in the audio and vibration pulses, speeding from 60 to 150 bpm |
| 55%+ | the killer's silhouette fades in at the screen edge |
| 60%+ | heavy breathing |
| 80% | the big scare: the silhouette lunges (once) |
| 2nd strike | another lunge |
| caught | the lunge, and the caught screen |

The clock **pauses** when the tab is hidden (tap to resume) and when the phone is held **sideways** (it asks you to rotate upright). Both holds stack: the clock restarts only when every hold is released.

---

## 🎛 FILE 10 · DIALS AND SWITCHES

### URL parameters (game page)

| Parameter | Effect | Safe for real players? |
|---|---|---|
| `?case=K7-3-RED` | Fix the case code (invalid codes are ignored) | Debugging only |
| `?debug` | Shows the answer (1-based) and the end-screen stats | **No** |
| `?stats` | Per-lock timings, strikes and time left on the end screen | Yes (use in playtests) |
| `?difficulty=easy` / `hard` | Swap to a difficulty preset | Yes |

### `src/config.js`

| Setting | Default | Meaning |
|---|---|---|
| `timeLimitSec` | 180 | Total clock |
| `maxStrikes` | 3 | Strikes before he catches you |
| `strikePenaltySec` | 15 | Seconds each strike removes |
| `killerSpeed` | 1.0 | Clock drain multiplier (1.2 = 20% faster) |
| `difficulty` | `normal` | Preset name |
| `doors` | tumbler, glyphs, fuse | The v1 run (order is shuffled per case code) |

| Preset | Time | Strike penalty | Killer speed |
|---|---|---|---|
| `easy` | 240 s | 10 s | 0.9 |
| `normal` | 180 s | 15 s | 1.0 |
| `hard` | 150 s | 20 s | 1.1 |

**Tuning order of operations:** playtest 5 pairs → read the numbers → change **one** thing → playtest 5 more. If strikes are what's killing people, the fault is usually an ambiguous rule, not the config. See [`docs/PLAYTEST.md`](docs/PLAYTEST.md) for the symptom → fix table and the 3-day schedule.

---

## 🧪 FILE 11 · PROVING IT WORKS

| Command | What it does |
|---|---|
| `npm test` | Validator **and** smoke test |
| `npm run validate` | The proof (below). Also runs inside `npm run build`, so Vercel refuses to deploy a broken rule set. |
| `npm run smoke` | Runs the real game in a simulated browser |
| `npm run build` | Validate, then produce `dist/` |
| `npm run preview` | Serve `dist/` locally (service worker works here) |
| `npm run dev` | Dev server with live reload |
| `npm run qr -- <url>` | QR code files |

**The validator checks, for all 3,888 case codes:** generation is deterministic; each lock yields exactly one valid answer; the real logic **matches an independently written interpreter of the manual rules** (`tools/reference.mjs`); every rule branch actually fires (no dead rules); the glyph columns are unambiguous; all glyph art exists; and the **printed manual contains every rule line verbatim**, every plate name and all 9 pages.

**The smoke test:** clicks every lock for every case code through the DOM, then plays complete runs through the real shell: win, three strikes, timeout, retry, tab backgrounding, rotating the phone, proximity vibration, the big scare, and difficulty presets. Zero runtime errors required.

**Neither test can tell you** whether the rules are *fast and clear to a human*, whether it looks right on your phone, or how the audio sounds. That's what the playtest is for. See [File 14](#-file-14--known-limits-read-this).

---

## 🔊 FILE 12 · SOUND, LIGHT AND SAFETY

- **The start screen warns** about jump scares, sudden loud sounds and flickering light. It has a **Reduced effects** checkbox (on by default if the phone asks for reduced motion). Reduced mode removes the grain motion, flicker, killer sway and the lunge, and halves stinger volume.
- **Flicker is capped** at about **1.3 dips per second**, each a 40% dimming rather than a white flash. The common safe limit is 3 flashes per second. The jump-scare silhouette **fades in** over ~150 ms; nothing strobes.
- **All audio is synthesized** in the browser (drone, footsteps, heartbeat, breathing, creaks, slams, stingers). There are no audio files. A limiter protects the master output. Audio only starts after the **ENTER THE HOUSE** tap, because phones block autoplay.
- **iPhone gotchas:** the **silent switch** can mute Web Audio, so the briefing says "silent mode off"; iOS has **no vibration**, so the heartbeat is audio-only there.
- **The staff mute button** is on the play screen (`MUTE`), and **Sound off** is on the start screen.
- **Offline mode:** after the first visit, a service worker (`public/sw.js`) keeps the page and its files so the game starts without wifi. The page itself is loaded network-first but falls back to the cache after 2.5 s on a bad connection.
  - After you redeploy, phones pick up the new version on their next online load. To force every phone to drop old caches, change `const V = 'lockdown-v1'` in `public/sw.js` to `'lockdown-v2'` and redeploy.
- **Keeping the screen awake:** Wake Lock is requested on every run (HTTPS only). Pull-to-refresh and pinch-zoom are blocked during play.
- If you're running this in front of a general audience, put a person near the booth who can stop a run immediately. Nobody has to finish.

---

## 🧯 FILE 13 · TROUBLESHOOTING

| Symptom | Likely cause | Fix |
|---|---|---|
| `'node' is not recognized` / `command not found: node` | Node isn't installed, or the terminal was opened before installing | Install Node LTS, **close and reopen** the terminal |
| `npm : File ...npm.ps1 cannot be loaded` | PowerShell script policy | Use Command Prompt, or `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `npm ERR! ENOENT ... package.json` | Terminal is in the wrong folder | `cd` into the `lockdown` folder; `dir` / `ls` must show `package.json` |
| `npm ERR!` with network / `ETIMEDOUT` | Slow or blocked connection | Retry; try a different wifi or phone hotspot |
| Engine / version warnings on install | Node older than 18 | Install the current LTS |
| `npm test` shows `FAILED` | A rule, glyph column or manual line is wrong | Read the first failure line: it names the case code and lock. Fix, re-run |
| `Port 5173 is already in use` | Another dev server is running | Close it, or Vite picks the next port; use the printed address |
| Page is blank in dev | JavaScript error | Press F12 → **Console**; paste the red error to your teammate |
| Sound doesn't play | Didn't tap ENTER; tab muted; **Sound off** ticked | Reload, untick, tap ENTER again. iPhone: turn off the silent switch |
| No vibration | iPhone, or desktop | Expected: iOS has no vibration API |
| "ROTATE YOUR PHONE UPRIGHT" | Phone is sideways | Rotate it back; the clock was paused meanwhile |
| "PAUSED. TAP TO CONTINUE" | The tab was backgrounded | Tap it. The clock didn't run while it was hidden |
| GitHub Desktop shows thousands of changed files | `.gitignore` missing, so `node_modules` is included | Put `.gitignore` (`node_modules` and `dist`) back, and re-add the repo |
| Vercel build fails | The validator found a problem, or install failed | Deployments → failed deploy → read the log. `npm test` locally reproduces it |
| Vercel shows a login screen | Deployment Protection | Settings → Deployment Protection → make production public; test in incognito |
| `/manual/` is a 404 on Vercel | Old deploy, or `vite.config.js` edited | Redeploy; check `vite.config.js` still lists all 4 pages |
| Phones show the **old** version after a redeploy | Cached page | Reload once online; or bump `V` in `public/sw.js` and redeploy |
| QR scans to the wrong place | Encoded a preview or per-deployment link | Regenerate with `npm run qr -- https://YOUR-NAME.vercel.app/` |
| QR won't scan in the hall | Too small, glossy, or low contrast | Print ≥ 5 cm, matte, black on white, keep the border |
| Manual prints as 10+ pages | Scale not 100%, margins not Default, or headers on | Fix the print settings (see File 06) |
| Offline test fails | Visited over `http://` on a LAN IP, or never loaded once online | Test on the HTTPS Vercel link: load once, then airplane mode |

---

## ⚠ FILE 14 · KNOWN LIMITS (READ THIS)

Honest accounting of what has and hasn't been proven:

**Proven by automated tests:** the rules are consistent and unambiguous for all 3,888 cases; the manual contains every rule; every lock responds correctly to taps; the game's run flows, clock, strikes, pause and rotate holds behave; the build succeeds.

**Not yet verified, because it needs people and real hardware:**

- **Real-phone behavior.** Frame rate on a cheap Android, layout on a small screen (around 360 × 640) and with iPhone Safari's toolbar showing, touch targets, wake lock, vibration feel.
- **Audio.** Nobody has *listened* to it. Levels, harshness and the iOS silent-switch behavior are unchecked.
- **Print.** The manual renders to 9 pages in a test print engine. A real printer, at arm's length in dim light, is still to be checked: especially the glyph page.
- **Timing and fairness.** Whether 180 seconds suits first-time pairs is unknown. I expect 210–240 s may be needed. The glyph shapes (e.g. bat vs crow) may be hard to describe aloud.
- **Browsers older than** iOS Safari 14.5 / Android Chrome 84.

**The stretch modules** (Flashlight Morse, Dial Safe) are **not built** and should wait until v1 passes the playtest targets in [`docs/PLAYTEST.md`](docs/PLAYTEST.md).

---

## 📚 MORE DOCUMENTS

| File | Read it when |
|---|---|
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | You want the short deploy / QR / print / event checklist |
| [`docs/PLAYTEST.md`](docs/PLAYTEST.md) | Planning the 3 days, measuring runs, tuning the config, splitting work |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Adding or changing a lock, or touching the rules |
| [`docs/playtest-log.csv`](docs/playtest-log.csv) | Recording playtest results |

> 🕯️ *The house is quiet. That's the worst part.*
