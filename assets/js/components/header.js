/** Masthead, mega menu, live badges, sound toggle. */
import { html } from '../core/dom.js';
import { icon, BTN } from './ui.js';
import { cartCount, wishlistCount } from '../core/state.js';
import { PRODUCTS, CATEGORIES } from '../data/catalog.js';
import { img, SOURCES, STORE_SALES } from '../data/content.js';
import { money } from '../core/format.js';
import { isMuted } from '../core/sound.js';

const NAV = [
  { label: 'The Floor', href: '#/catalog' },
  { label: 'Sell a piece', href: '#/sell' },
  { label: 'Store sales', href: '#/events' },
  { label: 'Support', href: '#/support' },
];

const TICKER = [
  'Delivery to all 24 governorates',
  'Free delivery over 250 DT',
  'One of one, always',
  'Cash on delivery',
  'Authenticated in studio',
];

function badge(count) {
  if (!count) return '';
  return html`<span class="absolute -right-1 -top-1 grid h-[15px] min-w-[15px] place-items-center bg-vermilion px-1 font-mono text-[8px] font-medium leading-none text-paper">${count > 9 ? '9+' : count}</span>`;
}

function megaColumn(title, items) {
  return html`
    <div>
      <p class="eyebrow mb-4 border-b border-ink/10 pb-2">${title}</p>
      <ul class="space-y-2">
        ${items.map(
          (item) => html`<li>
            <a href="${item.href}" class="group flex items-baseline justify-between gap-3 py-0.5 font-sans text-[12.5px] text-stone-600 transition-colors duration-300 hover:text-ink">
              <span class="relative">
                <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full"></span>
                ${item.label}
              </span>
              ${item.meta ? html`<span class="font-mono text-[9px] tabular-nums text-stone-400">${item.meta}</span>` : ''}
            </a>
          </li>`,
        )}
      </ul>
    </div>`;
}

function soundButton() {
  const muted = isMuted();
  return html`
    <button
      type="button"
      data-action="toggle-sound"
      class="icon-btn"
      aria-pressed="${!muted}"
      aria-label="${muted ? 'Turn interface sound on' : 'Turn interface sound off'}"
      title="${muted ? 'Sound off' : 'Sound on'}"
    >
      ${icon(muted ? 'soundOff' : 'soundOn', 'h-[17px] w-[17px]')}
    </button>`;
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
    <!-- ticker -->
    <div class="bg-ink text-bone/75">
      <div class="mx-auto flex h-8 max-w-[1440px] items-center gap-6 overflow-hidden px-5 lg:px-10">
        <p class="hidden shrink-0 items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.22em] text-bone/60 lg:flex">
          ${icon('leaf', 'h-3 w-3')} Tunisia · est. 2019
        </p>
        <div class="ticker-mask relative flex-1 overflow-hidden">
          <div class="marquee flex w-max gap-8 whitespace-nowrap font-mono text-[8.5px] uppercase tracking-[0.24em]">
            ${[0, 1].map(
              () => html`${TICKER.map(
                (t) => html`<span class="flex items-center gap-8">${t}<span class="text-brass">✦</span></span>`,
              )}`,
            )}
          </div>
        </div>
        <a href="#/events" class="hidden shrink-0 items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.2em] text-bone/70 transition-colors hover:text-bone lg:flex">
          Next sale · ${nextSale.store} · −${nextSale.discount}% ${icon('arrowUpRight', 'h-3 w-3')}
        </a>
      </div>
    </div>

    <header class="sticky top-0 z-50 border-b border-ink/15 bg-bone/90 backdrop-blur-xl">
      <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
        <div class="grid h-[76px] grid-cols-[auto_1fr_auto] items-center gap-4">
          <!-- mobile menu -->
          <button type="button" data-action="toggle-mobile-nav" class="icon-btn -ml-2 lg:hidden" aria-label="Open menu">
            ${icon('menu', 'h-5 w-5')}
          </button>

          <!-- wordmark -->
          <a href="#/home" class="group flex items-baseline gap-3 justify-self-start">
            <span class="whitespace-nowrap font-display text-[20px] leading-none tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-oxblood sm:text-[26px] xl:text-[28px]">Atelier Archive</span>
            <span class="hidden flex-col font-mono text-[7.5px] uppercase leading-[1.5] tracking-[0.24em] text-ink/45 xl:flex">
              <span>Second life</span>
              <span>La Marsa</span>
            </span>
          </a>

          <!-- nav -->
          <nav class="hidden items-center justify-center gap-7 lg:flex">
            <div class="group/shop relative">
              <button type="button" class="flex items-center gap-1.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-oxblood" aria-haspopup="true">
                Shop ${icon('chevronDown', 'h-3 w-3 transition-transform duration-300 group-hover/shop:rotate-180')}
              </button>
              <div class="invisible absolute left-1/2 top-full w-[720px] -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-hover/shop:visible group-hover/shop:translate-y-0 group-hover/shop:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100">
                <div class="mt-2 grid grid-cols-[1.1fr_1fr_0.9fr] gap-8 border border-ink/15 bg-paper p-7 shadow-ambient">
                  ${megaColumn('Categories', categoryCounts)}
                  <div class="space-y-6">
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
                  <a href="#/catalog?condition=Vault" class="group/vault relative block overflow-hidden border border-ink/15">
                    <img src="${img(SOURCES.rustBomber, 520, 1.15)}" alt="The Vault" data-fallback="" class="h-full min-h-[260px] w-full object-cover transition-transform duration-[900ms] group-hover/vault:scale-105" />
                    <span class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"></span>
                    <span class="absolute inset-x-4 bottom-4">
                      <span class="font-mono text-[8px] uppercase tracking-[0.24em] text-bone/70">Archive-grade</span>
                      <span class="mt-1 block font-display text-2xl text-paper">The Vault</span>
                      <span class="mt-2 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/80">Enter ${icon('arrowRight', 'h-3 w-3')}</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
            ${NAV.map(
              (item) => html`<a href="${item.href}" class="group relative py-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-oxblood">
                ${item.label}
                <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-oxblood transition-all duration-300 group-hover:w-full"></span>
              </a>`,
            )}
          </nav>

          <!-- actions -->
          <div class="flex items-center justify-self-end gap-0.5">
            ${soundButton()}
            <button type="button" data-action="open-search" class="icon-btn" aria-label="Search the floor">
              ${icon('search', 'h-[17px] w-[17px]')}
            </button>

            <button type="button" data-action="${user ? 'go-account' : 'open-auth'}" class="icon-btn hidden sm:inline-flex" aria-label="Account">
              ${icon('user', 'h-[17px] w-[17px]')}
            </button>

            <button type="button" data-action="open-wishlist" class="icon-btn" aria-label="Wishlist vault">
              ${icon('heart', 'h-[17px] w-[17px]')}${badge(saved)}
            </button>

            <button type="button" data-action="open-cart" class="icon-btn" aria-label="Shopping bag">
              ${icon('bag', 'h-[17px] w-[17px]')}${badge(count)}
            </button>

            <a href="#/sell" class="btn btn--solid btn--sm ml-2 hidden xl:inline-flex">
              Sell a piece ${icon('plus', 'h-3 w-3')}
            </a>
            <a href="#/catalog" class="btn btn--line btn--sm ml-2 hidden 2xl:inline-flex">
              Shop the floor ${icon('arrowUpRight', 'h-3 w-3')}
            </a>
          </div>
        </div>
      </div>
    </header>`;
}

export function renderMobileNav(state) {
  const open = state.ui.mobileNav;
  if (!open) return '';
  const links = [
    ...NAV,
    { label: 'The Vault', href: '#/catalog?condition=Vault' },
    { label: 'Wishlist', href: '#/wishlist', meta: wishlistCount() },
    { label: 'Account', href: '#/account' },
  ];
  return html`
    <div class="fixed inset-0 z-[70] lg:hidden">
      <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" data-action="toggle-mobile-nav"></div>
      <div class="absolute inset-y-0 left-0 flex w-[92%] max-w-sm flex-col border-r border-ink/15 bg-bone px-6 pb-8 pt-5">
        <div class="flex items-center justify-between">
          <span class="eyebrow">Menu · Atelier Archive</span>
          <button type="button" data-action="toggle-mobile-nav" class="icon-btn" aria-label="Close menu">${icon('close', 'h-5 w-5')}</button>
        </div>
        <nav class="mt-8 flex-1 overflow-y-auto">
          ${links.map(
            (link, i) => html`<a href="${link.href}" class="group flex items-baseline justify-between border-b border-ink/10 py-3.5">
              <span class="flex items-baseline gap-3">
                <span class="font-mono text-[9px] text-ink/35">${String(i + 1).padStart(2, '0')}</span>
                <span class="font-display text-[26px] leading-none text-ink transition-colors group-hover:text-oxblood">${link.label}</span>
              </span>
              ${link.meta ? html`<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/40">${link.meta}</span>` : ''}
            </a>`,
          )}
          <p class="eyebrow pb-1 pt-8">Browse by era</p>
          <div class="flex flex-wrap gap-2 pt-3">
            ${['70s', '80s', '90s', 'Y2K'].map((era) => html`<a href="#/catalog?era=${era}" class="tag">${era}</a>`)}
          </div>
        </nav>
        <div class="pt-6">
          ${state.user
            ? html`<a href="#/account" class="flex items-center gap-3 border border-ink/15 bg-paper p-3">
                <span class="grid h-10 w-10 place-items-center bg-ink font-mono text-[10px] text-bone">${state.user.name.slice(0, 2).toUpperCase()}</span>
                <span class="min-w-0"><span class="block truncate text-[12px] font-medium text-ink">${state.user.name}</span><span class="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-ink/45">${state.user.tier}</span></span>
              </a>`
            : html`<button type="button" data-action="open-auth" class="${BTN.primary} w-full">Sign in / Join</button>`}
        </div>
      </div>
    </div>`;
}
