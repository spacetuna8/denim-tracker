# Denim Tracker

A small offline web app for logging wears, washes and fade photos of raw / selvedge denim.
One HTML file, no framework, no build step. It runs as a home-screen app on iPhone and works offline.

- Data: pairs, wear and wash dates live in `localStorage` (`denim_tracker_v1`); fade photos live in IndexedDB (`denim_tracker_photos`). Nothing is sent to a server.
- Files: `index.html` (the app), `sw.js` (offline cache), `manifest.json`, `icon-180.png`, `icon-512.png`, `fonts/`.

## Install on iPhone

1. Open `https://<user>.github.io/<repo>/` in Safari.
2. Share → **Add to Home Screen**.
3. Open it from the home screen from then on.

Home-screen apps on iOS keep their own storage, separate from Safari. Your data lives inside the home-screen app, so:
- **Don't delete the home-screen icon** without exporting a backup first.
- **Don't move the app to a different URL** (repo name, folder or Pages source). A new URL means a new, empty app.

## Updating

1. Change `index.html` and/or `sw.js`.
2. Bump `CACHE` in `sw.js` (e.g. `denim-v41` → `denim-v42`) **and** `APP_VERSION` in `index.html` to the same value.
3. Push. GitHub Pages deploys within a minute or two.
4. Open the app on the iPhone. It picks up the new version on launch and reloads itself once.
   Check **Ledger › Data & backup → Version** to confirm which version is running.

The app's data is never touched by an update; only the cached app files are replaced.

## Backup and restore

- **Backup:** Ledger › Data & backup → **Export JSON** → Save to Files (iCloud Drive). The file contains every pair, every wear and wash date, the calendar colours and all fade photos (embedded). With many photos the file gets large (about 0.4 MB per photo).
- **Restore / new phone:** install the app, then Ledger › Data & backup → **Import JSON** and pick the backup. Restoring replaces the pairs currently in the app. Photos are moved back into IndexedDB automatically.
- **Export CSV** is for spreadsheets only (wears and washes, no photos); it can't be imported back.

Make a backup regularly. iOS can clear website storage, and the backup is the only copy outside the phone.

## Privacy

Don't commit backups, CSV exports, photos or screenshots. `.gitignore` excludes them.
