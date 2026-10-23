# Launching solo, offline

Everything below assumes one person, one machine, no internet.

---

## 0 · What you need

| | |
| --- | --- |
| **Node.js 18 or newer** | one-time install from [nodejs.org](https://nodejs.org) — LTS build. Nothing else. |
| **A modern browser** | Edge, Chrome, Firefox, Safari |
| **This folder** | ~6 MB, self-contained. No `npm install`, no build step, no packages. |

After Node is installed you never need the internet again.

---

## 1 · One-click launch (Windows)

Double-click **`start-offline.bat`**.

What it does, in order:

1. checks that `node` exists and tells you exactly what to install if not
2. checks whether the app is **already running** on port 4173 — if so it just opens the browser
3. starts the server in its own window titled *Atelier Archive - server*
4. polls `/health` until the server answers (up to 20 s)
5. opens `http://127.0.0.1:4173` in your default browser

**To stop:** close the *Atelier Archive - server* window, or press `Ctrl+C` in it.
**To restart:** double-click again.

Pick the browser explicitly if your default one misbehaves:

```
start-offline.bat --edge
start-offline.bat --chrome
```

---

## 2 · Launch from a terminal (any OS)

```bash
cd "C:\Users\Youssef\Desktop\Strategic d'affair Website"
node server.js
```

```
  ATELIER ARCHIVE — thrift & archive boutique
  serving C:\Users\Youssef\Desktop\Strategic d'affair Website
  → http://127.0.0.1:4173
```

Open that URL. `Ctrl+C` stops it.

Useful flags:

```bash
node server.js --port 4174          # if 4173 is taken
node server.js --host 0.0.0.0       # reachable from your phone on the same Wi-Fi
node server.js --port 8080 --host 0.0.0.0
```

---

## 3 · First 60 seconds — prove it works

Do this once so you know the whole thing is live:

1. **Home** loads with photography, the hero, the bento rail and the neighbourhood rail.
2. Top-right **Sign in → Demo account** → you become *Amelia Hart* with order history.
3. Click any card **Add to bag** → the bag badge increments.
4. Bag icon → **Checkout · Continue** → fill the address → **Continue**.
5. Coupon field: type `WELCOME10` → **Apply** → totals drop, tax recalculates.
6. **Continue** → **Payment** → *Use test card* → tick terms → **Continue** → **Place order**.
7. Confirmation shows an order id; **Order history** now lists it at the top.
8. **Refresh the page (F5)** — bag, vault, orders and profile are all still there.

If those eight steps work, the app is fully functional offline.

---

## 4 · What "offline" actually means here

Verified, not assumed — run this yourself any time:

```bash
node tools/offline-check.mjs
```

It blocks the entire public web, then walks 8 routes and audits every asset:

```
  ✓ /home                render= 87569
  ✓ /catalog             render= 72880
  ✓ /product/aa-3311     render= 29072
  ✓ /wishlist            render= 26968
  ✓ /checkout            render= 20463
  ✓ /events              render= 32610
  ✓ /support             render= 34774
  ✓ /account             render=  2445

ASSETS      referenced images: 21 (21 local, 0 remote)
  ✓ every local image resolves: 21/21

EXTERNAL CALLS
  · fonts.googleapis.com × 1 (optional webfont, safe to fail)

RUNTIME     ✓ uncaught exceptions: 0
OFFLINE-SAFE
```

| Loaded locally | Notes |
| --- | --- |
| HTML, CSS, all 30 JS modules | plain files from disk |
| Tailwind | vendored in `assets/vendor/tailwind.js` |
| 37 photographs | `assets/img/`, ~5 MB |
| Fonts | **not** local — see below |

**The only external request is Google Fonts.** It is loaded non-blocking, so offline the page paints
immediately and the type falls back to **Georgia** for display and **system sans** for UI. Everything
still reads correctly; it just loses the exact Fraunces letterforms. If that matters, see step 9.

---

## 5 · Where your data lives

There is no database and no server state. Everything is in your browser:

- **key:** `atelier.archive.v3`
- **origin:** `http://127.0.0.1:4173` (the port is part of the identity)

Reset everything to a fresh demo:

```js
// DevTools → Console
localStorage.removeItem('atelier.archive.v3');
location.reload();
```

Two things worth knowing:

- Running on a **different port starts empty** — `:4174` is a different origin with its own store.
- Opening in a **private window** or clearing site data wipes cart, orders and profile.

---

## 6 · Moving or backing it up

Copy the whole folder. That's it.

- No `node_modules`, no lockfile, no build output, no config.
- Works from a USB stick (first launch from USB can be slow to read the 5 MB of photos).
- To share: zip the folder, or hand over the drive. The recipient still needs Node.

---

## 7 · Your phone, same Wi-Fi, still no internet

```bash
node server.js --host 0.0.0.0
```

Find your machine's address:

```bash
ipconfig        # look for IPv4 Address, e.g. 192.168.1.42
```

Then on the phone: `http://192.168.1.42:4173`

Windows will ask about the firewall the first time — allow **private networks** only.
The phone keeps its own separate cart/orders (different origin).

---

## 8 · Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Port 4173 is already in use` | another copy is running | close that window, or `node server.js --port 4174` |
| Browser says *can't reach this page* | server window was closed | relaunch; keep the server window open |
| `'node' is not recognized` | Node missing or not on PATH | install Node LTS, then **reopen** the terminal |
| Blank page, no styling | stale cached modules from an older build | `Ctrl+Shift+R` |
| Photos show a grey placeholder | `assets/img` was partially copied | re-copy the folder — there should be 37 `.jpg` files |
| Type looks like Georgia | you're offline (expected) | see step 9 |
| Double-click does nothing | `.bat` blocked by policy | right-click → *Run*, or use the terminal method |
| Blank page, but works in Edge | Chrome extension or proxy intercepting `127.0.0.1` (console shows `ERR_CONNECTION_TIMED_OUT` on `app.css` / `app.js`) | test in Incognito (`Ctrl+Shift+N`); if it works, disable extensions or allow localhost. Check `chrome://settings/system` → proxy |
| One asset 200s, another times out | stale keep-alive socket in the tab | server now sends `Connection: close`; hard-refresh (`Ctrl+Shift+R`) or open a fresh tab |
| `cdn.tailwindcss.com should not be used in production` in console | expected — the vendored Play CDN prints this | ignore it |
| Curly quotes / fonts odd in print | webfont not loaded | cosmetic only |

---

## 9 · Optional: exact typography offline

Only if you want Fraunces while offline. Do this once **while connected**:

1. In a browser, open:
   `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&family=Inter:wght@300..600&display=swap`
2. View source. Copy every `https://fonts.gstatic.com/...woff2` URL, download them into
   `assets/fonts/`.
3. Save that CSS as `assets/css/fonts.css`, rewriting each `url(https://fonts.gstatic.com/.../x.woff2)`
   to `url(../fonts/x.woff2)`.
4. In `index.html`, delete the Google Fonts `<link>` tags and add
   `<link rel="stylesheet" href="assets/css/fonts.css" />` in their place.

Roughly 200 KB total, then the app makes **zero** external requests of any kind.
Ask me and I'll do this step and re-run the audit to confirm `EXTERNAL CALLS: none`.

---

## 10 · Autostart at login (optional, Windows)

Put a shortcut to `start-offline.bat` in:

```
shell:startup
```

(Paste that into the Run dialog, `Win+R`.) Your browser will open on the archive each session.

---

## 11 · What this is not

Be clear with yourself before you show it to anyone:

- **No backend.** Orders, coupons, rewards and chat are local simulations. Nothing is charged, nothing is sent.
- **Single-user per browser.** Two devices don't share a cart or an inventory.
- **Not internet-facing.** It binds to `127.0.0.1` (or your LAN with `--host 0.0.0.0`); it is a
  static file server, not hardened for the public web.
- **Stock is static.** Selling a piece doesn't remove it from the floor.

For a real multi-user shop you'd add an API + database; the front end is structured so the data
layer (`assets/js/data/*.js`) and the mutation layer (`actions` in `assets/js/core/state.js`) are the
only two places that would need to talk to it.
