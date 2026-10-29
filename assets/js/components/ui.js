/** Design system primitives: icons, buttons, badges, product card. */
import { html, raw } from '../core/dom.js';
import { money, compact } from '../core/format.js';
import { isWishlisted, cartQty } from '../core/state.js';
import { img } from '../data/catalog.js';

/* ------------------------------------------------------------------ *
 * Icons — 24px stroke set
 * ------------------------------------------------------------------ */
const PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  bag: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  star: '<path d="m12 4 2.5 5.2 5.5.8-4 3.9.9 5.6L12 16.9 7.1 19.5l.9-5.6-4-3.9 5.5-.8L12 4Z"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  arrowRight: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  arrowLeft: '<path d="M20 12H4M10 18 4 12l6-6"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/>',
  truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  leaf: '<path d="M4 20c0-8 6-14 16-15-1 10-7 15-13 15H4Z"/><path d="M4 20c4-5 8-7 12-8"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 10h8"/>',
  send: '<path d="M4 12 20 4l-6 16-3-6-7-2Z"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sparkle: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5l3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  phone: '<path d="M6 3.5h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5l1.5-2 4 1.5v3A2 2 0 0 1 17.5 19C10.6 18.4 5.6 13.4 5 6.5A2 2 0 0 1 6 3.5Z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  tag: '<path d="M4 11.5V4h7.5L20 12.5 12.5 20 4 11.5Z"/><circle cx="8" cy="8" r="1.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
  eye: '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r="0.9" fill="currentColor"/>',
  pinterest: '<circle cx="12" cy="12" r="9"/><path d="M9.5 20c1-3 1.5-5.5 2-8"/><path d="M11.5 12c1.5 2.5 5.5.8 5-2.3-.5-3.2-5.8-3.4-6.7-.3-.5 1.6.2 3.2 1.2 3.7"/>',
  book: '<path d="M4 5.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4V5.5Z"/><path d="M20 5.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h6V5.5Z"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M4 13h16M12 9v11"/><path d="M12 9C10 9 8 8 8 6.5S10.5 4 12 9ZM12 9c2 0 4-1 4-2.5S13.5 4 12 9Z"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  ruler: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 8h.01"/>',
  quote: '<path d="M9 7C6.5 8 5 10 5 13c0 2 1.2 3.5 3 3.5S11 15.2 11 13.4c0-1.7-1.2-2.9-2.8-2.9M19 7c-2.5 1-4 3-4 6 0 2 1.2 3.5 3 3.5s3-1.3 3-3.1c0-1.7-1.2-2.9-2.8-2.9"/>',
  camera: '<rect x="3" y="7.5" width="18" height="12" rx="2.5"/><circle cx="12" cy="13.5" r="3.2"/><path d="M8.6 7.5 9.8 5.4h4.4l1.2 2.1"/>',
  handshake: '<path d="m6 12 3-3 3 2 3-2 3 3-3.5 4.5a2 2 0 0 1-3 .2L6 12Z"/><path d="M3 10.5 6 12M21 10.5 18 12"/>',
  soundOn: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>',
  soundOff: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 5 6M22 9l-5 6"/>',
};

export function icon(name, className = 'h-5 w-5') {
  const path = PATHS[name];
  if (!path) return '';
  return raw(
    `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`,
  );
}

/* ------------------------------------------------------------------ *
 * Class tokens
 * ------------------------------------------------------------------ */
export const BTN = {
  primary: 'btn btn--solid',
  ghost: 'btn btn--line',
  soft: 'btn btn--line btn--sm',
  icon: 'btn btn--icon btn--line',
  link: 'inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink underline-offset-[6px] transition-colors duration-300 hover:text-clay-700 hover:underline',
};

export const FIELD = 'field';
export const LABEL = 'eyebrow block';

/* ------------------------------------------------------------------ *
 * Small parts
 * ------------------------------------------------------------------ */
const CONDITION_TONE = {
  Vault: 'tag--vault',
  Excellent: 'tag--good',
  Good: '',
};

export const conditionPill = (condition, extra = '') => html`
  <span class="tag ${CONDITION_TONE[condition] ?? ''} ${extra}">
    <span class="h-1 w-1 rounded-full bg-current opacity-60"></span>${condition}
  </span>`;

export function stars(rating, reviews, cls = '') {
  const full = Math.round(rating);
  return html`
    <span class="inline-flex items-center gap-1.5 ${cls}">
      <span class="flex items-center gap-0.5 text-brass">
        ${Array.from({ length: 5 }, (_, i) => html`<span class="text-[10px] leading-none ${i < full ? '' : 'opacity-25'}">★</span>`)}
      </span>
      <span class="font-mono text-[10px] tabular-nums text-stone-500">${Number(rating).toFixed(1)}${reviews !== undefined ? ` · ${reviews}` : ''}</span>
    </span>`;
}

export const discountPct = (p) => Math.round((1 - p.price / (p.retail || p.price)) * 100);

export function priceRow(product, size = 'md') {
  const off = discountPct(product);
  return html`
    <div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
      <span class="${size === 'lg' ? 'font-display text-[34px] leading-none' : 'pcard__price'} tracking-tight text-ink">${money(product.price)}</span>
      ${product.retail && product.retail > product.price
        ? html`<span class="pcard__old">${money(product.retail)}</span>`
        : ''}
      ${off > 0 ? html`<span class="font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-700">−${off}%</span>` : ''}
    </div>`;
}

/* ------------------------------------------------------------------ *
 * Product card
 * ------------------------------------------------------------------ */
export function productCard(product, { variant = 'default', index = 0 } = {}) {
  const saved = isWishlisted(product.id);
  const inBag = cartQty(product.id) > 0;
  const tall = variant === 'tall';
  const seller = product.seller;
  const resale = seller?.type === 'individual';

  return html`
    <article class="pcard group" data-index="${index}">
      <div class="pcard__media ${tall ? '!aspect-[3/4.3]' : ''} ${resale ? 'photo-flash' : ''}">
        <a href="#/product/${product.id}" class="block h-full w-full" aria-label="View ${product.title}">
          <img
            src="${product.images[0] ? img(product.images[0]) : ''}"
            alt="${product.title}"
            loading="lazy"
            data-fallback=""
            class="h-full w-full object-cover will-change-transform ${resale ? 'photo-phone' : ''}"
          />
          <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
        </a>

        <div class="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          ${conditionPill(product.condition)}
          ${product.badge
            ? html`<span class="tag tag--solid">${product.badge}</span>`
            : ''}
        </div>

        <button
          type="button"
          data-action="wishlist"
          data-id="${product.id}"
          aria-pressed="${saved}"
          aria-label="${saved ? 'Remove from vault' : 'Save to vault'}"
          class="absolute right-2.5 ${product.badge ? 'top-12' : 'top-2.5'} grid h-9 w-9 place-items-center border border-ink/15 bg-paper/90 text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-bone ${saved ? '!bg-oxblood !text-paper !border-oxblood' : ''}"
        >
          ${icon('heart', `h-4 w-4 ${saved ? 'fill-current' : ''}`)}
        </button>

        <div class="absolute inset-x-2.5 bottom-2.5 translate-y-4 opacity-0 transition-all duration-350 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            data-action="${inBag ? 'goto-cart' : 'add-to-cart'}"
            data-id="${product.id}"
            class="btn btn--solid btn--sm w-full"
          >
            ${inBag ? 'In your bag — review' : 'Add to bag'}
            ${icon('plus', 'h-3 w-3')}
          </button>
        </div>
      </div>

      <div class="flex flex-1 flex-col px-1.5 pb-1 pt-4">
        <p class="pcard__meta">${product.brand} · ${product.era}</p>
        <a href="#/product/${product.id}" class="pcard__title mt-2 block">
          ${product.title}
        </a>
        <p class="mt-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-stone-500">
          ${product.category} · Size ${product.size} · ${compact(product.saves)} saved
        </p>
        ${resale
          ? html`<p class="mt-2 flex items-center gap-1.5 font-mono text-[9.5px] text-stone-400">
              <span class="text-stone-300">${icon('camera', 'h-3 w-3')}</span>
              <span class="truncate">${seller.handle}</span>
              <span class="text-stone-300">·</span>
              <span class="shrink-0">${product.images.length} photos</span>
            </p>`
          : html`<p class="mt-2 flex items-center gap-1.5 font-mono text-[9.5px] text-stone-400">
              <span class="text-emerald-700">${icon('shield', 'h-3 w-3')}</span>
              <span class="truncate">Studio authenticated</span>
            </p>`}
        <div class="mt-auto flex items-end justify-between gap-2 border-t border-ink/10 pt-3.5 mt-4">
          ${priceRow(product)}
          ${product.isUserListing
            ? html`<button
                type="button"
                data-action="delete-listing"
                data-id="${product.id}"
                class="inline-flex items-center gap-1 border border-ink/15 px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-stone-500 transition hover:border-clay-700 hover:bg-clay-700 hover:text-paper"
                title="Remove your listing"
              >
                ${icon('trash', 'h-3 w-3')} Remove
              </button>`
            : ''}
        </div>
      </div>
    </article>`;
}

/* ------------------------------------------------------------------ *
 * Section heading
 * ------------------------------------------------------------------ */
export function sectionHead({ kicker, title, copy, action, align = 'left', tone = 'dark' }) {
  const centered = align === 'center';
  return html`
    <div class="flex flex-col gap-6 ${centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}">
      <div class="${centered ? 'max-w-2xl' : 'max-w-xl'}">
        ${kicker ? html`<p class="eyebrow mb-4 flex items-center gap-3 ${centered ? 'justify-center' : ''}">
          <span class="inline-block h-px w-8 bg-ink/40"></span>${kicker}
        </p>` : ''}
        <h2 class="font-display text-[clamp(2rem,3.6vw,3.15rem)] leading-[1.02] ${tone === 'light' ? 'text-stone-50' : 'text-ink'}">${title}</h2>
        ${copy ? html`<p class="mt-5 max-w-lg text-[13px] leading-relaxed ${tone === 'light' ? 'text-stone-300' : 'text-stone-500'} ${centered ? 'mx-auto' : ''}">${copy}</p>` : ''}
      </div>
      ${action ? html`<div class="shrink-0">${action}</div>` : ''}
    </div>`;
}

export function emptyState({ title, copy, action, iconName = 'sparkle' }) {
  return html`
    <div class="mx-auto flex max-w-md flex-col items-center border border-ink/15 bg-paper px-10 py-20 text-center">
      <span class="mb-7 inline-flex h-14 w-14 items-center justify-center border border-ink/20 text-stone-400">${icon(iconName, 'h-6 w-6')}</span>
      <h3 class="font-display text-2xl text-ink">${title}</h3>
      <p class="mt-3 text-[13px] leading-relaxed text-stone-500">${copy}</p>
      ${action ? html`<div class="mt-8">${action}</div>` : ''}
    </div>`;
}

/** Elegant fade-in wrapper used by views for stagger. */
export const revealCls = 'reveal';
