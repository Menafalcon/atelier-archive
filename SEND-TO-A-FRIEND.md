# Atelier Archive — how to open this

This is a static web app. It has **no build step and no dependencies**, but it must be served
by a tiny local web server (browsers block ES modules opened directly from a file). Pick any
one of the three options below.

---

## Option 1 — Windows, one double-click

1. Double-click **`start-offline.bat`**.
2. It looks for Node.js, then for Python; if either is present it starts the site and opens your
   browser at http://127.0.0.1:4173.
3. If neither is installed, it tells you exactly which one to install (one download, next-next-
   finish) and you double-click again.

## Option 2 — any computer with Python

```bash
cd atelier-archive
python3 -m http.server 4173
```

Then open http://127.0.0.1:4173

## Option 3 — any computer with Node.js

```bash
cd atelier-archive
node server.js --port 4173
```

Then open http://127.0.0.1:4173

---

## What to try

- Click the **speaker icon** in the header to switch interface sound on/off.
- **Shop** in the menu opens the departments; **The Floor** is the full catalogue.
- Open a piece, **Add to bag** (the drawer slides in), then **Checkout**.
- In checkout press **Fill demo address**, apply `WELCOME10`, then place the demo order.
- Resize the window to phone width to see the mobile masthead and menu.

Everything is local: the photography and the three typefaces are inside `assets/`, so it works
with no internet connection. Checkout, payment and accounts are simulations — nothing is
charged, nothing leaves the browser.

---

## Publishing it as a link instead

Because it is fully static, the folder can go straight onto any static host:

- **GitHub Pages** — push the folder to a repository, then Settings → Pages → deploy from the
  branch root. The included `.nojekyll` file keeps the asset paths intact.
- **Netlify Drop** — drag the folder onto https://app.netlify.com/drop and you get a URL.
- **Vercel** — `vercel` in the folder, framework preset "Other".

No configuration, no environment variables, no server code required.
