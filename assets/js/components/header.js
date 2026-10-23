/** Sticky glass header, mega menu, live badges. */
import { html } from '../core/dom.js';
import { icon, BTN } from './ui.js';
import { cartCount, wishlistCount } from '../core/state.js';
import { PRODUCTS, CATEGORIES } from '../data/catalog.js';
import { img, SOURCES, STORE_SALES } from '../data/content.js';
import { money } from '../core/format.js';

const NAV = [
  { label: 'The Floor', href: '#/catalog' },
  { label: 'Sell an item', href: '#/sell' },
  { label: 'Events', href: '#/events' },
  { label: 'Support', href: '#/support' },
];

function badge(count) {
  if (!count) return '';
  return html`<span class="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-clay-600 px-1 text-[9px] font-semibold leading-none text-white shadow-sm shadow-clay-900/30">${count > 9 ? '9+' : count}</span>`;
}

function megaColumn(title, items) {
  return html`
    <div>
      <p class="mb-4 text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">${title}</p>
      <ul class="space-y-2.5">
        ${items.map(
          (item) => html`<li>
            <a href="${item.href}" class="group flex items-baseline justify-between gap-3 text-[13px] text-stone-600 transition-all duration-300 ease-out hover:text-zinc-900">
              <span class="relative">
                <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-zinc-900 transition-all duration-300 ease-out group-hover:w-full"></span>
                ${item.label}
              </span>
              ${item.meta ? html`<span class="text-[10px] tabular-nums text-stone-400">${item.meta}</span>` : ''}
            </a>
          </li>`,
        )}
      </ul>
    </div>`;
}

export function renderHeader(state) {
  const nextSale = [...STORE_SALES].sort((a, b) => a.from.localeCompare(b.from))[0];
  const count = cartCount();
  const saved = wishlistCount();
  const user = state.user;
  const categoryCounts = CATEGORIES.map((c) => ({
    label: c,
    href: `#/catalog?category=${encodeURIComponent(c)}`,
    meta: String(PRODUCTS.filter((p) => p.category === c).length).padStart(2, '0'),
  }));

  return html`
    <!-- announcement -->
    <div class="bg-zinc-900 text-stone-200">
      <div class="mx-auto flex max-w-[1440px] items-center justify-center gap-6 px-6 py-2.5 text-[9.5px] font-medium uppercase tracking-[0.24em] lg:justify-between">
        <p class="hidden items-center gap-2.5 whitespace-nowrap lg:flex">${icon('leaf', 'h-3.5 w-3.5 shrink-0 text-stone-400')} Delivery to all 24 governorates</p>
        <p class="flex items-center gap-2.5 whitespace-nowrap text-center">
          <span class="hidden h-1 w-1 shrink-0 rounded-full bg-stone-600 sm:block"></span>
          Free delivery in Tunisia over ${money(250)}
          <span class="hidden h-1 w-1 shrink-0 rounded-full bg-stone-600 sm:block"></span>
        </p>
        <a href="#/events" class="hidden items-center gap-2 whitespace-nowrap text-stone-300 transition-colors duration-300 hover:text-white lg:flex">
          Next sale · ${nextSale.store}, ${nextSale.city} · −${nextSale.discount}% ${icon('arrowRight', 'h-3 w-3')}
        </a>
      </div>
    </div>

    <header class="sticky top-0 z-50 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
          <div class="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-4">
            <!-- left -->
            <nav class="hidden items-center gap-8 lg:flex">
              <div class="group/shop relative">
                <button type="button" class="flex items-center gap-1.5 py-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-zinc-800 transition-colors duration-300 ease-out hover:text-clay-700" aria-haspopup="true">
                  Shop ${icon('chevronDown', 'h-3 w-3 transition-transform duration-300 ease-out group-hover/shop:rotate-180')}
                </button>
                <div class="invisible absolute -left-6 top-full w-[720px] translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover/shop:visible group-hover/shop:translate-y-0 group-hover/shop:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100">
                  <div class="mt-1 overflow-hidden rounded-[28px] bg-white/95 p-7 shadow-2xl shadow-stone-300/50 backdrop-blur-xl">
                    <div class="grid grid-cols-[1.15fr_1fr_1fr] gap-8">
                      ${megaColumn('Categories', categoryCounts)}
                      <div class="space-y-7">
                        ${megaColumn('Era', [
                          { label: '1970s', href: '#/catalog?era=70s' },
                          { label: '1980s', href: '#/catalog?era=80s' },
                          { label: '1990s', href: '#/catalog?era=90s' },
                          { label: 'Y2K', href: '#/catalog?era=Y2K' },
                        ])}
                        ${megaColumn('Condition', [
                          { label: 'Vault', href: '#/catalog?condition=Vault' },
                          { label: 'Excellent', href: '#/catalog?condition=Excellent' },
                          { label: 'Good', href: '#/catalog?condition=Good' },
                        ])}
                      </div>
                      <a href="#/catalog?condition=Vault" class="group/vault relative block overflow-hidden rounded-[20px]">
                        <img src="${img(SOURCES.rustBomber, 520, 1.15)}" alt="The Vault" data-fallback="" class="h-full min-h-[220px] w-full object-cover transition-transform duration-[900ms] ease-out group-hover/vault:scale-105" />
                        <span class="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/10 to-transparent"></span>
                        <span class="absolute inset-x-4 bottom-4">
                          <span class="block text-[9px] uppercase tracking-[0.24em] text-stone-300">Archive-grade</span>
                          <span class="mt-1 block font-display text-xl text-white">The Vault</span>
                          <span class="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-stone-200">Enter ${icon('arrowRight', 'h-3 w-3')}</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              ${NAV.map(
                (item) => html`<a href="${item.href}" class="relative py-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-zinc-800 transition-colors duration-300 ease-out hover:text-clay-700">
                  ${item.label}
                  <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-clay-600 transition-all duration-300 ease-out hover:w-full"></span>
                </a>`,
              )}
            </nav>

            <!-- mobile menu -->
            <button type="button" data-action="toggle-mobile-nav" class="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition-all duration-300 ease-out hover:bg-stone-100 lg:hidden" aria-label="Open menu">
              ${icon('menu', 'h-5 w-5')}
            </button>

            <!-- wordmark -->
            <a href="#/home" class="group flex items-baseline justify-center gap-2 px-2">
              <span class="font-display text-[17px] font-light uppercase leading-none tracking-[0.32em] text-zinc-900 transition-colors duration-300 group-hover:text-clay-700 sm:text-[19px]">Atelier</span>
              <span class="hidden h-3 w-px bg-stone-300 sm:block"></span>
              <span class="hidden font-display text-[17px] font-light uppercase leading-none tracking-[0.32em] text-stone-500 sm:block sm:text-[19px]">Archive</span>
            </a>

            <!-- right -->
            <div class="flex items-center justify-end gap-0.5 sm:gap-1">
              <button type="button" data-action="open-search" class="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition-all duration-300 ease-out hover:bg-stone-100 hover:text-zinc-900" aria-label="Search the floor">
                ${icon('search', 'h-[18px] w-[18px]')}
              </button>

              <div class="group/acc relative hidden sm:block">
                <button type="button" data-action="${user ? 'go-account' : 'open-auth'}" class="inline-flex h-10 items-center gap-2 rounded-full px-3 text-zinc-800 transition-all duration-300 ease-out hover:bg-stone-100 hover:text-zinc-900" aria-label="Account">
                  ${icon('user', 'h-[18px] w-[18px]')}
                  <span class="max-w-[96px] truncate text-[10px] font-medium uppercase tracking-[0.16em]">${user ? user.name.split(' ')[0] : 'Sign in'}</span>
                </button>
              </div>

              <button type="button" data-action="open-wishlist" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition-all duration-300 ease-out hover:bg-stone-100 hover:text-zinc-900" aria-label="Wishlist vault">
                ${icon('heart', 'h-[18px] w-[18px]')}${badge(saved)}
              </button>

              <button type="button" data-action="open-cart" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition-all duration-300 ease-out hover:bg-stone-100 hover:text-zinc-900" aria-label="Shopping bag">
                ${icon('bag', 'h-[18px] w-[18px]')}${badge(count)}
              </button>

              <a href="#/sell" class="ml-1.5 hidden items-center gap-1.5 rounded-full border border-stone-300/80 bg-white px-4 py-2 text-[9.5px] font-medium uppercase tracking-[0.18em] text-zinc-900 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-900 hover:bg-zinc-900 hover:text-stone-50 sm:inline-flex">
                ${icon('plus', 'h-3 w-3')} List a piece
              </a>

              <a href="#/catalog" class="ml-1.5 hidden items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-[9.5px] font-medium uppercase tracking-[0.2em] text-stone-50 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg hover:shadow-stone-400/40 xl:inline-flex">
                Shop the floor ${icon('arrowUpRight', 'h-3 w-3')}
              </a>
            </div>
          </div>
        </div>
      <div class="h-px w-full bg-gradient-to-r from-transparent via-stone-200/80 to-transparent"></div>
    </header>`;
}

export function renderMobileNav(state) {
  const open = state.ui.mobileNav;
  if (!open) return '';
  return html`
    <div class="fixed inset-0 z-[70] lg:hidden">
      <div class="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" data-action="toggle-mobile-nav"></div>
      <div class="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-stone-50 px-7 pb-8 pt-6 shadow-2xl">
        <div class="flex items-center justify-between">
          <span class="font-display text-sm uppercase tracking-[0.3em] text-zinc-900">Menu</span>
          <button type="button" data-action="toggle-mobile-nav" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm">${icon('close', 'h-5 w-5')}</button>
        </div>
        <nav class="mt-10 flex-1 space-y-1 overflow-y-auto">
          ${[
            ...NAV.map((n) => ({ label: n.label, href: n.href })),
            { label: 'The Vault', href: '#/catalog?condition=Vault' },
            { label: 'Wishlist', href: '#/wishlist', meta: wishlistCount() },
            { label: 'Account', href: '#/account' },
          ].map(
            (link) => html`<a href="${link.href}" class="flex items-baseline justify-between border-b border-stone-200/70 py-4 font-display text-2xl font-light tracking-tight text-zinc-900">
              ${link.label}${link.meta ? html`<span class="text-[10px] uppercase tracking-[0.2em] text-stone-400">${link.meta}</span>` : ''}
            </a>`,
          )}
          <p class="pb-1 pt-8 text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">Browse by era</p>
          <div class="flex flex-wrap gap-2 pt-3">
            ${['70s', '80s', '90s', 'Y2K'].map((era) => html`<a href="#/catalog?era=${era}" class="rounded-full bg-white px-4 py-2 text-[11px] tracking-wide text-stone-700 shadow-sm shadow-stone-200/60">${era}</a>`)}
          </div>
        </nav>
        <div class="pt-6">
          ${state.user
            ? html`<a href="#/account" class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <span class="grid h-10 w-10 place-items-center rounded-full bg-stone-900 text-[11px] font-medium text-stone-50">${state.user.name.slice(0, 2).toUpperCase()}</span>
                <span class="min-w-0"><span class="block truncate text-[12px] font-medium text-zinc-900">${state.user.name}</span><span class="block text-[10px] uppercase tracking-[0.14em] text-stone-400">${state.user.tier}</span></span>
              </a>`
            : html`<button type="button" data-action="open-auth" class="${BTN.primary} w-full">Sign in / Join</button>`}
        </div>
      </div>
    </div>`;
}
