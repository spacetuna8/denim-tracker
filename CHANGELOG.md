# Changelog

## denim-v41 — 2026-11-17

Fixes
- Price field accepts a Swiss comma (`320,50`), `1'200` and `CHF 320`. An unreadable price no longer saves as empty and wipes the stored price; the form asks for a valid number instead.
- Adding a photo after the app sat in the background: when iOS has dropped the IndexedDB connection, the app reconnects instead of storing a full-size copy in localStorage (which filled storage and made "Wear today" fail). If IndexedDB is really unavailable, the fallback copy is kept small (640 px).
- Update reload no longer interrupts the photo viewer, a confirm dialog, an Undo/Save toast, or a running photo add, export or import. It waits until they're done.
- Export JSON builds the file photo by photo instead of as one giant string, so large backups don't run the iPhone out of memory. The file content is unchanged and imports as before.
- Service worker: with bad signal the app opens from the cache after 3 s instead of waiting for the network to time out; a GitHub Pages error page (e.g. 404 during a deploy) no longer replaces the app; installing a new version always stores the new `index.html`, not a copy from the HTTP cache.

Added
- Version label in Ledger › Data & backup (matches `CACHE` in `sw.js`).

Other
- Icons recompressed losslessly (512 px: 586 → 410 KB, 180 px: 74 → 52 KB, pixel-identical). `icon-512.png` is also declared as a maskable icon (Android; no change on iPhone).
