/** Wishlist vault — persisted collection page. */
import { html } from '../core/dom.js';
import { icon, BTN, conditionPill, emptyState, productCard } from '../components/ui.js';
import { money, compact } from '../core/format.js';
import { wishlistProducts, cartQty } from '../core/state.js';
import { PRODUCTS, img } from '../data/catalog.js';

export function renderWishlist(state) {
  const items = wishlistProducts();
  const total = items.reduce((n, p) => n + p.price, 0);
  const retailTotal = items.reduce((n, p) => n + (p.retail || p.price), 0);
  const recentlyViewed = (state.recentlyViewed || []).map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  const suggestions = PRODUCTS.filter((p) => !state.wishlist.includes(p.id)).slice(0, 4);

  return html`
    <div class="fade-in">
      <section class="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-14">
        <nav class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
          <a href="#/home" class="transition-colors duration-300 hover:text-zinc-900">Home</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <span class="text-zinc-700">Wishlist vault</span>
        </nav>

        <div class="mt-7 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <h1 class="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-light leading-[1.02] tracking-[-0.03em] text-zinc-900">
              Your vault
            </h1>
            <p class="mt-4 max-w-lg text-[13.5px] leading-relaxed text-stone-500">
              ${items.length
                ? `${items.length} ${items.length === 1 ? 'piece is' : 'pieces are'} held here. Move any of them into your bag in one tap — the vault persists across visits.`
                : 'Pieces you are considering live here. Saved to this device, ready when you are.'}
            </p>
          </div>

          ${items.length
            ? html`<div class="rounded-[24px] bg-white p-5 shadow-xl shadow-stone-200/40">
                <div class="flex items-baseline justify-between">
                  <span class="text-[9.5px] uppercase tracking-[0.2em] text-stone-400">Combined value</span>
                  <span class="font-display text-xl text-zinc-900">${money(total)}</span>
                </div>
                <div class="mt-2.5 flex items-baseline justify-between">
                  <span class="text-[9.5px] uppercase tracking-[0.2em] text-stone-400">Retail equivalent</span>
                  <span class="text-[11.5px] text-stone-500 line-through">${money(retailTotal)}</span>
                </div>
                <button type="button" data-action="move-all-to-cart" class="${BTN.primary} mt-4 w-full !py-3.5">
                  Move all ${items.length} to bag ${icon('arrowRight', 'h-3.5 w-3.5')}
                </button>
              </div>`
            : ''}
        </div>
      </section>

      <section class="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-12">
        ${items.length
          ? html`
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                ${items.map(
                  (product, i) => html`
                    <article class="group flex gap-4 rounded-[26px] bg-white p-3 shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50">
                      <a href="#/product/${product.id}" class="relative w-[42%] shrink-0 overflow-hidden rounded-[18px] bg-stone-100">
                        <img src="${img(product.images[0])}" alt="${product.title}" data-fallback="" class="h-full min-h-[180px] w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105" />
                        <span class="absolute left-2 top-2">${conditionPill(product.condition)}</span>
                      </a>
                      <div class="flex min-w-0 flex-1 flex-col py-2 pr-2">
                        <div class="flex items-start justify-between gap-2">
                          <p class="text-[9px] uppercase tracking-[0.22em] text-stone-400">${product.brand} · ${product.era}</p>
                          <button type="button" data-action="wishlist" data-id="${product.id}" class="shrink-0 rounded-full p-1 text-stone-300 transition-all duration-300 hover:bg-stone-100 hover:text-clay-600" aria-label="Remove from vault">
                            ${icon('close', 'h-3.5 w-3.5')}
                          </button>
                        </div>
                        <a href="#/product/${product.id}" class="mt-1.5 font-display text-[16px] leading-snug text-zinc-900 transition-colors duration-300 hover:text-clay-700">${product.shortTitle}</a>
                        <p class="mt-1 text-[10.5px] text-stone-500">Size ${product.size} · ${compact(product.saves)} saved</p>
                        <div class="mt-auto flex items-baseline gap-2 pt-3">
                          <span class="font-display text-[17px] text-zinc-900">${money(product.price)}</span>
                          ${product.retail > product.price ? html`<span class="text-[10.5px] text-stone-400 line-through">${money(product.retail)}</span>` : ''}
                        </div>
                        <button
                          type="button"
                          data-action="move-to-cart"
                          data-id="${product.id}"
                          class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-100/90 px-4 py-2.5 text-[9.5px] font-medium uppercase tracking-[0.16em] text-zinc-800 transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-stone-50"
                        >
                          ${icon('bag', 'h-3 w-3')} ${cartQty(product.id) ? 'Add another' : 'Move to bag'}
                        </button>
                      </div>
                    </article>`,
                )}
              </div>

              <div class="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/70 px-6 py-5 shadow-sm shadow-stone-200/40">
                <p class="text-[11.5px] text-stone-500">Held pieces are not reserved — one-of-one items can sell while saved.</p>
                <button type="button" data-action="clear-wishlist" class="text-[10px] uppercase tracking-[0.16em] text-stone-400 underline-offset-4 transition hover:text-clay-700 hover:underline">Empty vault</button>
              </div>`
          : emptyState({
              title: 'The vault is empty',
              copy: 'Save pieces as you browse. They persist on this device, and you can move any of them into your bag in a single tap.',
              iconName: 'heart',
              action: html`<a href="#/catalog" class="${BTN.primary}">Browse the floor ${icon('arrowRight', 'h-3.5 w-3.5')}</a>`,
            })}
      </section>

      ${recentlyViewed.length
        ? html`<section class="mx-auto max-w-[1440px] px-5 pb-6 lg:px-10">
            <p class="mb-4 text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">Recently viewed</p>
            <div class="flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              ${recentlyViewed.map(
                (p) => html`<a href="#/product/${p.id}" class="group flex w-[220px] shrink-0 items-center gap-3 rounded-2xl bg-white p-2 shadow-sm shadow-stone-200/50 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
                  <span class="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <img src="${img(p.images[0])}" alt="" data-fallback="" class="h-full w-full object-cover" />
                  </span>
                  <span class="min-w-0">
                    <span class="block truncate text-[11.5px] text-zinc-800">${p.shortTitle}</span>
                    <span class="block text-[10.5px] text-stone-500">${money(p.price)}</span>
                  </span>
                </a>`,
              )}
            </div>
          </section>`
        : ''}

      <section class="mx-auto max-w-[1440px] px-5 py-14 lg:px-10 lg:py-20">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="mb-3 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>Consider these</p>
            <h2 class="font-display text-[clamp(1.7rem,2.8vw,2.4rem)] font-light leading-tight tracking-tight text-zinc-900">Newly on the rail</h2>
          </div>
          <a href="#/catalog?sort=new" class="${BTN.link} hidden sm:inline-flex">All new ${icon('arrowUpRight', 'h-3 w-3')}</a>
        </div>
        <div class="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
          ${suggestions.map((p, i) => productCard(p, { index: i }))}
        </div>
      </section>
    </div>`;
}
