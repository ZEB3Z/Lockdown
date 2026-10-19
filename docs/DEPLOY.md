# Deploy, QR, print

## 1. Push to GitHub
```
git init && git add . && git commit -m "LOCKDOWN"
git branch -M main
git remote add origin https://github.com/<you>/lockdown.git
git push -u origin main
```
Commit `package-lock.json`. `node_modules/` and `dist/` are ignored.

## 2. Vercel
1. vercel.com > Add New > Project > import the repo.
2. Framework preset: **Vite** (auto). Build command: `npm run build` (runs `npm run validate` first, so broken rules cannot ship). Output: `dist`.
3. Deploy. Rename the project to something short (`lockdown-booth` gives `lockdown-booth.vercel.app`): shorter URL = simpler QR.
4. Every push to `main` redeploys. Branches get preview URLs: test risky changes there.
5. **Freeze deploys** before the event (PLAYTEST.md, Day 3). After the freeze, only push a blocker fix, then re-test on a phone.

Run `npm test` before every push (validator + jsdom smoke test). Supported browsers: iOS Safari 14.5+, Android Chrome 84+ (flex `gap`, module scripts).

Verify on a real phone: `/` plays, `/manual/` prints, `/admin/?case=K7-3-RED` shows an answer, `/facilitator/` loads.
Offline: load `/` once online, switch to airplane mode, reload: it must still start (needs the deployed HTTPS URL or localhost).

## 3. QR code
```
npm run qr -- https://lockdown-booth.vercel.app/
```
Writes `qr/lockdown-qr.png` (1200px) and `.svg`. Error correction Q, 4-module quiet zone.
- Encode the **root URL only** (no `?case=`, never `/admin/`).
- Print at **5 x 5 cm minimum**; 8 cm on a booth sign is better. Black on white, matte paper (no glare), keep the white border.
- Test with two phones (one low-end Android, one iPhone) from the distance a visitor will stand. Print the short URL under it as a backup.

## 4. Print the manual
Open `/manual/` in Chrome or Edge, Print:
- Paper **A4**, scale **100%**, margins **Default**, headers and footers **off**.
- Black and white (default page): Background graphics **off**. Color (`/manual/?color=1`): Background graphics **on**.
- Must come out as **9 pages**. If 10+, a page overflowed: tell me which.
- Single-sided, staple top-left, one per station plus spares. Sleeves or lamination survive an evening of use.
- Check one copy at arm's length in dim light, especially the glyph columns (page 7).
- Print `/facilitator/` (one page). Keep PDF copies of both on a phone or USB.

## 5. Event day checklist
- [ ] Deployed build is the one you tested. QR printed and tested on 2 phones.
- [ ] 2 loaner phones: opened `/` once online, volume up, silent off, Auto-Lock off, brightness up.
- [ ] Staff phone has `/admin/` and `/manual/` opened once (cached for offline).
- [ ] Manuals: 1 per station + 2 spares, page 1 on top. Facilitator sheet at the booth.
- [ ] Charger or power bank for loaners. A timer or watch for staff.
