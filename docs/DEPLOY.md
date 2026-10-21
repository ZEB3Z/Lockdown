# Deploy, QR, print (v3 · a D'SAITECH game)

## 1. Push to GitHub
```
git add . && git commit -m "LOCKDOWN: 4 doors, main menu, credits"
git push origin main
```
Commit `package-lock.json`. `node_modules/` and `dist/` are ignored.

## 2. Vercel
1. vercel.com > Add New > Project > import the repo.
2. Framework preset: **Vite** (auto). Build command: `npm run build` (runs `npm run validate` first, so broken rules cannot ship). Output: `dist`.
3. Deploy. Production URL: `lockdown-booth.vercel.app`.
4. Every push to `main` redeploys. Pushes that fail validation stay on the prior good build.
5. **Freeze deploys** before booth day (PLAYTEST.md, Day 3).

Supported browsers: iOS Safari 14.5+, Android Chrome 84+ (flex `gap`, module scripts).

Verify on a real phone:
- `/` shows the main menu (ENTER THE HOUSE, ESCAPEE'S INSTRUCTIONS, CREDITS), plays 4 doors (4:00 clock), theme toggle works, and every end screen has MAIN MENU.
- `/manual/` prints (6 pages, A4) and its MAIN MENU link returns to the game.
- `/admin/?case=K7-3-RED` shows solutions for all 4 doors.
- `/facilitator/` loads with the 4-door briefing.
- Offline: load `/` once online, switch to airplane mode, reload: starts offline via PWA cache `lockdown-v3` (the main menu's escapee instructions page is cached too).

## 3. QR code
```
npm run qr -- https://lockdown-booth.vercel.app/
```
Writes `qr/lockdown-qr.png` (1200px) and `.svg`.
- Encode the root URL only.
- Print at 5 x 5 cm minimum; 8 cm on booth signage. Black on white, matte paper.
- Test with two phones from visitor standing distance.

## 4. Print the manual
Open `/manual/` in Chrome or Edge, Print (`Ctrl + P`):
- Paper **A4**, scale **100%**, margins **Default** (the page carries its own margins), headers and footers **off**.
- Black & white: Background graphics **off**. Color (`/manual/?color=1`): Background graphics **on**.
- Must come out as **6 pages**. Ready-made PDFs live in `docs/print/`; regenerate with `node tools/manual-pdf.mjs`.
- Single-sided, staple top-left, 1 per station plus spares.
- Print `/facilitator/` (one page) for the staff table.

## 5. Event day checklist
- [ ] Deployed build is the tested v3 build. QR printed and scanned.
- [ ] 2 loaner phones: opened `/` once online, volume up, silent off, Auto-Lock off.
- [ ] Staff phone has `/admin/` and `/manual/` opened once (cached for offline).
- [ ] Manuals: 6 pages, 1 per station + 2 spares. Facilitator sheet on the table.
- [ ] Power banks, phone chargers, staff stopwatch.

---
LOCKDOWN · Blackthorn Manor is a game by D'SAITECH. See [CREDITS.md](../CREDITS.md). Replace the placeholder logo at `src/assets/logo.png` before printing.
