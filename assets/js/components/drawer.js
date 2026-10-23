/** Slide-out vault (wishlist) and bag (cart) drawers. */
import { html } from '../core/dom.js';
import { icon, BTN, conditionPill, emptyState } from './ui.js';
import { money } from '../core/format.js';
import { cartLines, computeTotals, wishlistProducts } from '../core/state.js';
import { PRODUCTS, img } from '../data/catalog.js';
import { FREE_SHIPPING_THRESHOLD } from '../data/content.js';

const FREE_SHIP_THRESHOLD = FREE_SHIPPING_THRESHOLD;

function shell({ title, meta, body, footer, closeAction = 'close-drawer', animate = true }) {
  return html`
    <div class="fixed inset-0 z-[80]" data-overlay="drawer">
      <div class="absolute inset-0 ${animate ? 'animate-[fadeIn_.25s_ease-out]' : ''} bg-stone-900/25 backdrop-blur-[3px]" data-action="${closeAction}"></div>
      <aside class="absolute inset-y-0 right-0 flex w-full max-w-[440px] ${animate ? 'animate-[slideIn_.32s_cubic-bezier(.22,.61,.36,1)]' : ''} flex-col bg-stone-50 shadow-2xl shadow-stone-900/20" role="dialog" aria-modal="true" aria-label="${title}">
        <header class="flex items-center justify-between px-7 pb-5 pt-7">
          <div>
            <h2 class="font-display text-2xl font-light tracking-tight text-zinc-900">${title}</h2>
            <p class="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">${meta}</p>
          </div>
          <button type="button" data-action="${closeAction}" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm shadow-stone-200/70 transition-all duration-300 ease-out hover:rotate-90 hover:text-zinc-900" aria-label="Close">
            ${icon('close', 'h-[18px] w-[18px]')}
          </button>
        </header>
        <div class="flex-1 overflow-y-auto px-7 pb-6">${body}</div>
        ${footer ? html`<div class="border-t border-stone-200/60 bg-white/60 px-7 py-6 backdrop-blur">${footer}</div>` : ''}
      </aside>
    </div>`;
}

function stepper(id, qty, stock) {
  return html`
    <div class="inline-flex items-center gap-0.5 rounded-full bg-stone-100/80 p-1">
      <button type="button" data-action="cart-dec" data-id="${id}" class="grid h-7 w-7 place-items-center rounded-full text-stone-600 transition-all duration-300 ease-out hover:bg-white hover:text-zinc-900 hover:shadow-sm" aria-label="Decrease quantity">${icon('minus', 'h-3 w-3')}</button>
      <span class="w-6 text-center text-[11.5px] tabular-nums text-zinc-900">${qty}</span>
      <button type="button" data-action="cart-inc" data-id="${id}" ${qty >= stock ? 'disabled' : ''} class="grid h-7 w-7 place-items-center rounded-full text-stone-600 transition-all duration-300 ease-out hover:bg-white hover:text-zinc-900 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent" aria-label="Increase quantity">${icon('plus', 'h-3 w-3')}</button>
    </div>`;
}

function freeShipBar(subtotal) {
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
  return html`
    <div class="mb-6 rounded-2xl bg-white p-4 shadow-sm shadow-stone-200/60">
      <p class="text-[11px] text-stone-600">
        ${remaining > 0
          ? html`<span class="font-medium text-zinc-900">${money(remaining)}</span> from free delivery in Tunisia`
          : html`<span class="inline-flex items-center gap-1.5 font-medium text-emerald-700">${icon('checkCircle', 'h-3.5 w-3.5')} Free delivery unlocked</span>`}
      </p>
      <div class="mt-2.5 h-1 overflow-hidden rounded-full bg-stone-100">
        <div class="h-full rounded-full bg-gradient-to-r from-stone-800 to-stone-500 transition-all duration-700 ease-out" style="width:${pct}%"></div>
      </div>
    </div>`;
}

export function renderCartDrawer(state, { animate = true } = {}) {
  const totals = computeTotals({ gov: state.ui?.checkout?.shipping?.gov || 'tunis' });
  const lines = totals.lines;

  const body = lines.length
    ? html`
        ${freeShipBar(totals.subtotal)}
        <ul class="space-y-3">
          ${lines.map(
            (line) => html`
              <li class="group flex gap-4 rounded-2xl bg-white p-3 shadow-sm shadow-stone-200/50 transition-all duration-300 ease-out hover:shadow-md hover:shadow-stone-300/40">
                <a href="#/product/${line.product.id}" class="relative h-[104px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  <img src="${img(line.product.images[0])}" alt="${line.product.title}" data-fallback="" class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                </a>
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400">${line.product.brand}</p>
                      <a href="#/product/${line.product.id}" class="mt-1 block truncate font-display text-[14px] leading-snug text-zinc-900 transition-colors duration-300 hover:text-clay-700">${line.product.shortTitle}</a>
                      <p class="mt-1 text-[10.5px] text-stone-500">Size ${line.product.size} · ${line.product.condition}</p>
                    </div>
                    <button type="button" data-action="cart-remove" data-id="${line.product.id}" class="shrink-0 rounded-full p-1 text-stone-300 transition-all duration-300 ease-out hover:bg-stone-100 hover:text-clay-600" aria-label="Remove ${line.product.title}">
                      ${icon('trash', 'h-3.5 w-3.5')}
                    </button>
                  </div>
                  <div class="mt-auto flex items-end justify-between pt-3">
                    ${stepper(line.product.id, line.qty, line.product.stock || 1)}
                    <p class="font-display text-[15px] text-zinc-900">${money(line.product.price * line.qty)}</p>
                  </div>
                </div>
              </li>`,
          )}
        </ul>
        <div class="mt-5 flex items-center justify-between rounded-2xl bg-stone-100/60 px-4 py-3">
          <span class="inline-flex items-center gap-2 text-[10.5px] text-stone-500">${icon('clock', 'h-3.5 w-3.5')} Reserved for 30 minutes</span>
          <button type="button" data-action="go-catalog" class="text-[10px] uppercase tracking-[0.16em] text-zinc-700 underline-offset-4 transition-colors duration-300 hover:text-zinc-900 hover:underline">Keep browsing</button>
        </div>`
    : emptyState({
        title: 'Your bag is quiet',
        copy: 'Nothing reserved yet. The floor turns over weekly — start with the newest arrivals.',
        iconName: 'bag',
        action: html`<a href="#/catalog" data-action="close-drawer" class="${BTN.primary}">Browse the floor</a>`,
      });

  const footer = lines.length
    ? html`
        <div class="space-y-2.5 text-[12px]">
          <div class="flex justify-between text-stone-500"><span>Subtotal</span><span class="tabular-nums text-zinc-900">${money(totals.subtotal)}</span></div>
          <div class="flex justify-between text-stone-500"><span>Shipping</span><span class="tabular-nums ${totals.freeShipping ? 'text-emerald-700' : 'text-zinc-900'}">${totals.freeShipping ? 'Complimentary' : money(totals.shipping)}</span></div>
          <div class="flex justify-between border-t border-stone-200/70 pt-2.5 text-[13px] font-medium text-zinc-900"><span>Total</span><span class="tabular-nums">${money(totals.total)}</span></div>
        </div>
        <a href="#/checkout" data-action="close-drawer" class="${BTN.primary} mt-5 w-full">
          Checkout · ${money(totals.total)} ${icon('arrowRight', 'h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/btn:translate-x-1')}
        </a>
        <p class="mt-3 flex items-center justify-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-stone-400">${icon('lock', 'h-3 w-3')} Taxes calculated at checkout</p>`
    : '';

  return shell({
    title: 'Your bag',
    meta: `${totals.units} ${totals.units === 1 ? 'piece' : 'pieces'} reserved`,
    body,
    footer,
    animate,
  });
}

export function renderWishlistDrawer(state, { animate = true } = {}) {
  const items = wishlistProducts();
  const others = PRODUCTS.filter((p) => !state.wishlist.includes(p.id)).slice(0, 2);

  const body = items.length
    ? html`
        <ul class="space-y-3">
          ${items.map(
            (product) => html`
              <li class="group flex gap-4 rounded-2xl bg-white p-3 shadow-sm shadow-stone-200/50 transition-all duration-300 ease-out hover:shadow-md hover:shadow-stone-300/40">
                <a href="#/product/${product.id}" class="relative h-[104px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  <img src="${img(product.images[0])}" alt="${product.title}" data-fallback="" class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                </a>
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400">${product.era} · ${product.condition}</p>
                      <a href="#/product/${product.id}" class="mt-1 block truncate font-display text-[14px] leading-snug text-zinc-900 transition-colors duration-300 hover:text-clay-700">${product.shortTitle}</a>
                      <p class="mt-1 font-display text-[13px] text-stone-600">${money(product.price)}</p>
                    </div>
                    <button type="button" data-action="wishlist-remove" data-id="${product.id}" class="shrink-0 rounded-full p-1 text-stone-300 transition-all duration-300 ease-out hover:bg-stone-100 hover:text-clay-600" aria-label="Remove from vault">
                      ${icon('close', 'h-3.5 w-3.5')}
                    </button>
                  </div>
                  <button type="button" data-action="move-to-cart" data-id="${product.id}" class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-100/80 px-4 py-2 text-[9.5px] font-medium uppercase tracking-[0.16em] text-zinc-800 transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-stone-50">
                    ${icon('bag', 'h-3 w-3')} Move to bag
                  </button>
                </div>
              </li>`,
          )}
        </ul>

        <p class="mb-3 mt-8 text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">You may also want</p>
        <div class="grid grid-cols-2 gap-3">
          ${others.map(
            (p) => html`<a href="#/product/${p.id}" class="group block overflow-hidden rounded-2xl bg-white p-2 shadow-sm shadow-stone-200/50 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
              <div class="aspect-square overflow-hidden rounded-xl bg-stone-100">
                <img src="${img(p.images[0])}" alt="${p.title}" data-fallback="" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p class="mt-2 truncate px-1 text-[11px] text-zinc-800">${p.shortTitle}</p>
              <p class="px-1 pb-1 text-[10.5px] text-stone-500">${money(p.price)}</p>
            </a>`,
          )}
        </div>`
    : emptyState({
        title: 'Your vault is empty',
        copy: 'Save the pieces you are considering. They persist across visits — and you can move any of them into your bag in one tap.',
        iconName: 'heart',
        action: html`<a href="#/catalog" data-action="close-drawer" class="${BTN.primary}">Find something</a>`,
      });

  const footer = items.length
    ? html`
        <div class="flex items-center justify-between text-[11px] text-stone-500">
          <span>${items.length} ${items.length === 1 ? 'piece' : 'pieces'} held</span>
          <span class="tabular-nums text-zinc-900">${money(items.reduce((n, p) => n + p.price, 0))} combined</span>
        </div>
        <button type="button" data-action="move-all-to-cart" class="${BTN.primary} mt-4 w-full">Move all to bag ${icon('arrowRight', 'h-3.5 w-3.5')}</button>
        <a href="#/wishlist" data-action="close-drawer" class="${BTN.ghost} mt-2.5 w-full !py-3">Open vault page</a>`
    : '';

  return shell({
    title: 'Your vault',
    meta: `${items.length} saved ${items.length === 1 ? 'piece' : 'pieces'}`,
    body,
    footer,
    animate,
  });
}
