# Atelier Archive

A peer-to-peer thrift market — half the rail curated and authenticated in studio, half listed
by neighbours with their own phone photos. Static SPA: no build step, no dependencies.

**Live at → http://127.0.0.1:4173**

---

## Run it

```bash
node server.js              # http://127.0.0.1:4173
node server.js --port 8080  # or any port
```

Windows: double-click **`start-offline.bat`** — it checks Node, starts the server in its own
window, waits for `/health`, then opens the browser.

Solo offline walkthrough, data locations, LAN/phone setup and troubleshooting: **[LAUNCH.md](LAUNCH.md)**.

---

## The marketplace model

This is C2C, not a boutique. Two kinds of listing share one floor:

| | Studio rail | Neighbourhood rail |
| --- | --- | --- |
| Who lists | Atelier Archive | individuals (`@maya.archive`, `@thriftgoblin`, …) |
| Photography | studio, consistent crop | phone shots, unedited, slight tilt + flash |
| Grading | two-person 40-point check | seller's own honest notes |
| Fulfilment | ships from studio, 2–4 days | ships direct, 3–6 days |
| Trust | authentication card | verified seller + buyer protection |

`assets/js/data/catalog.js` holds `SELLERS` and a `LISTINGS` map; each product is stamped with
its seller at load, so cards, product pages, checkout copy and the `soldBy` filter all read from
one source. Individual listings get the `photo-phone` treatment (warm flash, mild desaturation,
a 0.7° tilt) so they never look like studio product shots.

Filters include **Sold by → Atelier studio / Individual sellers**, and the landing page carries a
"The neighbourhood rail" section with seller profiles and a "Sell with us" call to action.

---

## Data footprint

All photography is mirrored locally in `assets/img/` (37 files, ~5 MB, one-time). The app makes
**zero external image requests** — no Unsplash CDN at runtime — and works offline. Source IDs are
kept in the `UNSPLASH` map in `catalog.js` for provenance, and every `<img>` still carries a
generated SVG fallback.

The only remaining optional network call is Google Fonts; the stack falls back to Georgia /
system sans if it is unavailable.

---

## What's inside

```
index.html                 app shell + Tailwind theme config
server.js                  zero-dependency static server
assets/
  css/app.css              design tokens, keyframes, phone-photo treatment, print styles
  img/                     37 mirrored product photographs
  vendor/tailwind.js       Tailwind Play CDN, vendored for offline use
  js/
    app.js                 bootstrap: router, delegation, overlays, chat
    core/                  state.js (store + pricing engine), router.js, dom.js, format.js
    data/                  catalog.js (12 pieces + sellers), content.js (editorial, commerce)
    components/            header, footer, drawers, auth modal, quick view, search, chat, toast
    views/                 home, catalog, product, wishlist, checkout, account, events, support
tools/
  smoke.mjs                network-free render + commerce assertions
  e2e.mjs                  headless browser flows (blocks remote assets)
  shots.mjs                screenshot capture with a warm cache profile
preview/                   build-time captures
```

### State & persistence

One store (`atelier.archive.v3` in localStorage) holds user, cart, wishlist, orders, RSVPs, chat
history, filters and the checkout draft. Every mutation goes through
`commit(mutator, { partial })`, naming the region to repaint (`view`, `header`, `drawers`,
`checkout-summary`, `toast`, …) — that is what keeps the search field focused and drawer
animations from replaying.

### Pricing engine

`computeTotals({ country, couponCode, express })` resolves the shipping zone, applies free-shipping
thresholds, validates the coupon against the ledger, then computes discount → shipping → tax.
Rates are per-zone (8.25% US, 20% GB, 21% EU, …).

### Accounts

Auth is mocked and local. **Demo account** in the sign-in modal enters as Amelia Hart with a seeded
order ledger, wallet vouchers and reward points. Any email works too.

---

## Design system

| Token | Use |
| --- | --- |
| `bg-stone-50/50` | page canvas, warm neutral |
| `bg-white` + `shadow-xl shadow-stone-200/40` | cards, no borders |
| `text-zinc-900` | charcoal type, never pure black |
| `clay-*` | single warm accent for price deltas and links |
| `rounded-[24px…32px]` | organic corner rhythm |
| `transition-all duration-300 ease-out` | every interactive surface |
| Fraunces / Inter | editorial display + neutral UI |

Product cards: `hover:-translate-y-1 hover:scale-[1.015] hover:shadow-2xl hover:shadow-stone-300/50`.

---

## Tests

```bash
node tools/smoke.mjs          # ~110 assertions, no browser, no network
node tools/e2e.mjs            # real browser, remote assets blocked, ~45 checks
node tools/offline-check.mjs  # blocks the public web, audits every asset
```

`smoke.mjs` renders every view and component and exercises the pricing engine, cart caps, auth,
checkout, marketplace data and persistence. `e2e.mjs` drives Edge over CDP: filters, cart badges,
drawers, auth, coupons, form validation, the full four-step purchase, chat replies.

---

## Notes

- Checkout is a simulation. No card is charged and nothing leaves the browser.
- `preview/` holds captures from the last design pass; regenerate with `node tools/shots.mjs`
  (uses a persistent cache profile, so repeat runs download nothing).
