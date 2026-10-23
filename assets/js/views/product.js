/** Product detail: gallery, provenance, measurements, related rail. */
import { html } from '../core/dom.js';
import { icon, BTN, conditionPill, stars, priceRow, productCard, discountPct } from '../components/ui.js';
import { money, relative, compact } from '../core/format.js';
import { byId, PRODUCTS, CONDITIONS, img } from '../data/catalog.js';
import { isWishlisted, cartQty } from '../core/state.js';

export function renderProduct(state, params) {
  const product = byId(params.id) || PRODUCTS[0];
  const saved = isWishlisted(product.id);
  const inBag = cartQty(product.id) > 0;
  const off = discountPct(product);
  const activeImage = product.images[state.ui.product.imageIndex % product.images.length] || product.images[0];
  const grade = CONDITIONS.find((c) => c.id === product.condition) || CONDITIONS[1];
  const seller = product.seller;
  const resale = seller?.type === 'individual';
  const related = PRODUCTS.filter((p) => p.id !== product.id && (p.category === product.category || p.era === product.era)).slice(0, 4);

  return html`
    <div class="fade-in">
      <div class="mx-auto max-w-[1440px] px-5 pt-8 lg:px-10 lg:pt-10">
        <nav class="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
          <a href="#/home" class="transition-colors duration-300 hover:text-zinc-900">Home</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <a href="#/catalog" class="transition-colors duration-300 hover:text-zinc-900">The floor</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <a href="#/catalog?category=${encodeURIComponent(product.category)}" class="transition-colors duration-300 hover:text-zinc-900">${product.category}</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <span class="text-zinc-700">${product.shortTitle}</span>
        </nav>
      </div>

      <section class="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
        <div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <!-- gallery -->
          <div class="lg:sticky lg:top-28 lg:self-start">
            <div class="group relative overflow-hidden rounded-[30px] bg-stone-100 shadow-xl shadow-stone-200/50 ${resale ? 'photo-flash' : ''}">
              <img
                src="${img(activeImage)}"
                alt="${product.title}"
                data-fallback=""
                class="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03] ${resale ? 'photo-phone' : ''}"
              />
              <div class="absolute left-4 top-4 flex flex-col items-start gap-2">
                ${conditionPill(product.condition)}
                ${product.badge && product.badge !== product.condition
                  ? html`<span class="rounded-full bg-zinc-900/85 px-2.5 py-1 text-[8.5px] uppercase tracking-[0.18em] text-stone-50 backdrop-blur">${product.badge}</span>`
                  : ''}
                ${resale
                  ? html`<span class="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[8.5px] uppercase tracking-[0.16em] text-stone-700 backdrop-blur">${icon('camera', 'h-3 w-3')} Seller photo</span>`
                  : ''}
              </div>
              <button
                type="button"
                data-action="wishlist"
                data-id="${product.id}"
                class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/85 text-zinc-800 shadow-sm backdrop-blur-md transition-all duration-300 ease-out hover:scale-110 hover:bg-white ${saved ? '!text-clay-600' : ''}"
                aria-label="${saved ? 'Remove from vault' : 'Save to vault'}"
              >
                ${icon('heart', `h-[18px] w-[18px] ${saved ? 'fill-current' : ''}`)}
              </button>
              <div class="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-stone-600 backdrop-blur">
                ${icon('eye', 'h-3 w-3')} ${compact(product.saves)} saved · ${product.stock} in stock
              </div>
            </div>

            ${product.images.length > 1
              ? html`<div class="mt-3 grid grid-cols-4 gap-3">
                  ${product.images.map(
                    (imageId, i) => html`<button
                      type="button"
                      data-action="product-image"
                      data-index="${i}"
                      class="group overflow-hidden rounded-2xl bg-stone-100 shadow-sm shadow-stone-200/50 ring-2 transition-all duration-300 ease-out ${state.ui.product.imageIndex % product.images.length === i ? 'ring-zinc-900' : 'ring-transparent hover:ring-stone-300'}"
                      aria-label="View image ${i + 1}"
                    >
                      <img src="${img(imageId)}" alt="" data-fallback="" class="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105 ${resale ? 'photo-phone' : ''}" />
                    </button>`,
                  )}
                  ${Array.from({ length: Math.max(0, 4 - product.images.length) }, () => html`<div class="rounded-2xl bg-white/60 shadow-sm shadow-stone-200/40"></div>`)}
                </div>`
              : ''}

            <div class="mt-4 grid grid-cols-3 gap-3">
              ${(resale
                ? [
                    { k: 'Verified seller', v: `${seller.sales} sales · ${seller.rating}★`, i: 'handshake' },
                    { k: 'Buyer protection', v: 'Covered by Atelier', i: 'shield' },
                    { k: 'Delivery', v: 'Ships direct · 3–6 days', i: 'truck' },
                  ]
                : [
                    { k: 'Authenticated', v: '40-point check', i: 'shield' },
                    { k: 'Returns', v: 'Free, 30 days', i: 'refresh' },
                    { k: 'Delivery', v: '2–4 days, US', i: 'truck' },
                  ]
              ).map(
                (t) => html`<div class="rounded-2xl bg-white px-3.5 py-3 shadow-sm shadow-stone-200/50">
                  <span class="text-stone-400">${icon(t.i, 'h-4 w-4')}</span>
                  <p class="mt-1.5 text-[10px] font-medium text-zinc-900">${t.k}</p>
                  <p class="text-[9.5px] text-stone-400">${t.v}</p>
                </div>`,
              )}
            </div>
          </div>

          <!-- info -->
          <div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">
              <a href="#/catalog?category=${encodeURIComponent(product.category)}" class="transition-colors duration-300 hover:text-zinc-900">${product.category}</a>
              <span class="h-1 w-1 rounded-full bg-stone-300"></span><span>${product.era}</span>
              <span class="h-1 w-1 rounded-full bg-stone-300"></span><span>${product.sku}</span>
            </div>

            <h1 class="mt-4 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-light leading-[1.06] tracking-[-0.025em] text-zinc-900">${product.title}</h1>

            <div class="mt-3 flex flex-wrap items-center gap-4">
              ${stars(product.rating, product.reviews)}
              <span class="text-[10px] uppercase tracking-[0.16em] text-stone-400">Listed ${relative(new Date(Date.now() - product.listedDaysAgo * 864e5).toISOString())}</span>
            </div>

            <div class="mt-6 flex flex-wrap items-end gap-4">
              ${priceRow(product, 'lg')}
            </div>

            <p class="mt-6 text-[13.5px] leading-[1.8] text-stone-600">${product.story}</p>

            <!-- grade card -->
            <div class="mt-7 rounded-[24px] bg-white p-5 shadow-xl shadow-stone-200/40">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-[9px] font-medium uppercase tracking-[0.24em] text-stone-400">Condition grade</p>
                  <p class="mt-1.5 font-display text-[19px] text-zinc-900">${grade.label} <span class="text-stone-400">· ${product.grade}</span></p>
                </div>
                ${conditionPill(product.condition)}
              </div>
              <p class="mt-3 text-[11.5px] leading-relaxed text-stone-500">${grade.blurb}</p>
              <div class="mt-4 rounded-2xl bg-stone-50 px-4 py-3">
                <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400">${resale ? 'Seller notes' : 'Studio notes'}</p>
                <p class="mt-1.5 text-[11.5px] leading-relaxed text-stone-600">${product.conditionNotes}</p>
              </div>
            </div>

            <!-- size / measurements -->
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-[20px] bg-white p-5 shadow-xl shadow-stone-200/40">
                <p class="text-[9px] font-medium uppercase tracking-[0.24em] text-stone-400">Size & fit</p>
                <p class="mt-2 font-display text-[17px] text-zinc-900">${product.size}</p>
                <p class="mt-1 text-[11px] text-stone-500">${product.fit}</p>
                <p class="mt-3 border-t border-stone-100 pt-2.5 text-[10.5px] text-stone-500">${product.material}</p>
              </div>
              <div class="rounded-[20px] bg-white p-5 shadow-xl shadow-stone-200/40">
                <p class="text-[9px] font-medium uppercase tracking-[0.24em] text-stone-400">Measured flat</p>
                <dl class="mt-2.5 space-y-1.5">
                  ${Object.entries(product.measurements).map(
                    ([k, v]) => html`<div class="flex items-baseline justify-between gap-3 text-[11.5px]">
                      <dt class="capitalize text-stone-400">${k}</dt>
                      <dd class="tabular-nums text-zinc-900">${v}</dd>
                    </div>`,
                  )}
                </dl>
              </div>
            </div>

            <!-- actions -->
            <div class="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button type="button" data-action="${inBag ? 'goto-cart' : 'add-to-cart'}" data-id="${product.id}" class="${BTN.primary} flex-1 !py-4">
                ${icon('bag', 'h-4 w-4')} ${inBag ? 'In your bag — review' : `Add to bag · ${money(product.price)}`}
              </button>
              <button type="button" data-action="wishlist" data-id="${product.id}" class="${BTN.ghost} !py-4 sm:w-auto">
                ${icon('heart', `h-4 w-4 ${saved ? 'fill-current text-clay-600' : ''}`)} ${saved ? 'In vault' : 'Save'}
              </button>
            </div>

            ${product.isUserListing
              ? html`<div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3">
                  <span class="flex items-center gap-2 text-[11px] font-medium text-emerald-900">
                    ${icon('sparkle', 'h-3.5 w-3.5 text-emerald-700')} Published by you on the community floor
                  </span>
                  <button type="button" data-action="delete-listing" data-id="${product.id}" class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[9.5px] font-medium uppercase tracking-[0.14em] text-clay-700 shadow-sm transition hover:bg-clay-600 hover:text-white">
                    ${icon('trash', 'h-3 w-3')} Remove listing
                  </button>
                </div>`
              : ''}

            <p class="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-stone-400">
              ${icon('lock', 'h-3 w-3')} One of one — reserved for 30 minutes once checkout begins
            </p>

            <!-- seller -->
            <div class="mt-6 rounded-[24px] bg-white p-5 shadow-xl shadow-stone-200/40">
              <div class="flex items-center gap-3.5">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full ${resale ? 'bg-stone-200 text-stone-700' : 'bg-zinc-900 text-stone-50'} text-[11px] font-medium tracking-wide">
                  ${seller.name.slice(0, 2).toUpperCase()}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="flex flex-wrap items-baseline gap-x-2">
                    <span class="text-[12.5px] font-medium text-zinc-900">${seller.name}</span>
                    <span class="text-[10.5px] text-stone-400">${seller.handle}</span>
                  </p>
                  <p class="mt-0.5 text-[10.5px] text-stone-500">
                    ${seller.rating}★ · ${seller.sales} ${resale ? 'sales' : 'pieces rehomed'} · ${seller.location} · replies ${seller.response.replace('usually ', '')}
                  </p>
                </div>
                <button
                  type="button"
                  data-action="message-seller"
                  data-id="${product.id}"
                  class="shrink-0 rounded-full bg-stone-100 px-3.5 py-2 text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-800 transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-stone-50"
                >
                  Message
                </button>
              </div>
              <p class="mt-3 text-[11px] leading-relaxed text-stone-500">${seller.blurb}</p>
              ${resale
                ? html`<p class="mt-3 flex items-start gap-2 rounded-xl bg-stone-50 px-3.5 py-2.5 text-[10px] leading-relaxed text-stone-500">
                    ${icon('camera', 'h-3.5 w-3.5 mt-px shrink-0 text-stone-400')}
                    Photos shot by the seller on a phone — unedited, no studio lighting. Measurements taken by hand, so expect ±0.5".
                  </p>`
                : html`<p class="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50/60 px-3.5 py-2.5 text-[10px] leading-relaxed text-emerald-900">
                    ${icon('shield', 'h-3.5 w-3.5 mt-px shrink-0 text-emerald-600')}
                    Sourced, cleaned and photographed in the Brooklyn studio. Two-person grade check before listing.
                  </p>`}
            </div>

            <!-- provenance -->
            <div class="mt-4 space-y-2">
              ${[
                { q: 'Provenance & sourcing', a: product.story + ' Sourced by our studio team directly from a private collection, then cleaned and conditioned before listing.' },
                { q: 'Materials & care', a: `${product.material}. Made in ${product.madeIn}. ${product.category === 'Knitwear' ? 'Hand-wash cold, dry flat away from direct sunlight.' : 'Professional clean, or cold gentle wash and air dry.'} Full care card ships with the piece.` },
                { q: 'Shipping & returns', a: 'Free US shipping in 2–4 business days; international rates calculated live at checkout. 30-day free returns and worldwide exchanges.' },
              ].map(
                (row, i) => html`
                  <details class="group rounded-[20px] bg-white px-5 py-4 shadow-sm shadow-stone-200/50 transition-all duration-300 ease-out open:shadow-lg open:shadow-stone-300/40" ${i === 0 ? 'open' : ''}>
                    <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-[12.5px] font-medium text-zinc-900">
                      ${row.q}
                      <span class="text-stone-400 transition-transform duration-300 group-open:rotate-180">${icon('chevronDown', 'h-4 w-4')}</span>
                    </summary>
                    <p class="mt-3 text-[11.5px] leading-relaxed text-stone-500">${row.a}</p>
                  </details>`,
              )}
            </div>
          </div>
        </div>
      </section>

      <!-- related -->
      <section class="mx-auto max-w-[1440px] px-5 py-14 lg:px-10 lg:py-20">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="mb-3 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>Sits well with</p>
            <h2 class="font-display text-[clamp(1.7rem,2.8vw,2.4rem)] font-light leading-tight tracking-tight text-zinc-900">More from the same rail</h2>
          </div>
          <a href="#/catalog" class="${BTN.link} hidden sm:inline-flex">All pieces ${icon('arrowUpRight', 'h-3 w-3')}</a>
        </div>
        <div class="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
          ${related.map((p, i) => productCard(p, { index: i }))}
        </div>
      </section>
    </div>`;
}
