/** Catalog: advanced filter rail + bento product feed. */
import { html } from '../core/dom.js';
import { icon, BTN, productCard, conditionPill } from '../components/ui.js';
import { money } from '../core/format.js';
import { PRODUCTS, CATEGORIES, ERAS, CONDITIONS, SIZES, img } from '../data/catalog.js';

const SORTS = [
  { id: 'curated', label: 'Curated' },
  { id: 'new', label: 'Newest' },
  { id: 'price-asc', label: 'Price · low to high' },
  { id: 'price-desc', label: 'Price · high to low' },
  { id: 'rating', label: 'Best reviewed' },
];

export function filterProducts(filters) {
  const q = String(filters.q || '').trim().toLowerCase();
  const tokens = q ? q.split(/\s+/) : [];
  const maxPrice = filters.max ?? Infinity;

  const list = PRODUCTS.filter((p) => {
    if (filters.categories?.length && !filters.categories.includes(p.category)) return false;
    if (filters.conditions?.length && !filters.conditions.includes(p.condition)) return false;
    if (filters.eras?.length && !filters.eras.includes(p.era)) return false;
    if (filters.sizes?.length && !filters.sizes.includes(p.size)) return false;
    if (filters.soldBy?.length && !filters.soldBy.includes(p.soldBy || 'shop')) return false;
    if (p.price < (filters.min ?? 0) || (!p.isUserListing && p.price > maxPrice) || (p.isUserListing && maxPrice < 150 && p.price > maxPrice)) return false;
    if (tokens.length) {
      const haystack = `${p.title} ${p.brand} ${p.category} ${p.era} ${p.colorway} ${p.material} ${p.condition} ${p.seller?.name || ''} ${p.seller?.handle || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      if (!tokens.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case 'new':
      return list.sort((a, b) => (b.isUserListing ? 1 : 0) - (a.isUserListing ? 1 : 0) || a.listedDaysAgo - b.listedDaysAgo);
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating);
    default:
      return list.sort((a, b) => (b.isUserListing ? 1 : 0) - (a.isUserListing ? 1 : 0) || b.saves - a.saves);
  }
}

const activeCount = (f) =>
  (f.categories?.length || 0) +
  (f.conditions?.length || 0) +
  (f.eras?.length || 0) +
  (f.sizes?.length || 0) +
  (f.soldBy?.length || 0) +
  (f.q ? 1 : 0) +
  (f.min > 0 || f.max < 150 ? 1 : 0);

function checkRow({ key, label, active, action, value, count }) {
  return html`
    <li>
      <button
        type="button"
        data-action="${action}"
        data-key="${key}"
        data-value="${value}"
        class="group flex w-full items-center gap-3 py-1.5 text-left transition-all duration-300 ease-out"
      >
        <span class="grid h-4 w-4 shrink-0 place-items-center rounded-[2px] border transition-all duration-300 ease-out ${
          active ? 'border-zinc-900 bg-zinc-900 text-stone-50' : 'border-stone-300 bg-white text-transparent group-hover:border-stone-400'
        }">
          ${icon('check', 'h-2.5 w-2.5')}
        </span>
        <span class="flex-1 text-[12.5px] transition-colors duration-300 ease-out ${active ? 'text-zinc-900' : 'text-stone-600 group-hover:text-zinc-900'}">${label}</span>
        ${count !== undefined ? html`<span class="text-[10px] tabular-nums text-stone-400">${String(count).padStart(2, '0')}</span>` : ''}
      </button>
    </li>`;
}

function filterRail(filters, results, { mobile = false } = {}) {
  const chips = (values, key) =>
    values.map(
      (value) => html`
        <button
          type="button"
          data-action="toggle-filter"
          data-key="${key}"
          data-value="${value}"
          class="tag transition-all duration-300 ${
            filters[key].includes(value) ? 'tag--solid' : 'hover:border-ink hover:text-ink'
          }"
        >
          ${value}
        </button>`,
    );

  return html`
    <div class="${mobile ? '' : 'lg:sticky lg:top-28'} space-y-7">
      <div class="flex items-baseline justify-between">
        <p class="text-[10px] font-medium uppercase tracking-[0.26em] text-stone-400">Refine</p>
        ${activeCount(filters) > 0
          ? html`<button type="button" data-action="reset-filters" class="text-[10px] uppercase tracking-[0.14em] text-clay-700 underline-offset-4 transition hover:underline">Clear ${activeCount(filters)}</button>`
          : html`<span class="text-[10px] uppercase tracking-[0.14em] text-stone-400">${results.length} shown</span>`}
      </div>

      <!-- category -->
      <section class="border border-ink/12 bg-paper p-5">
        <h3 class="mb-3 text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">Category</h3>
        <ul class="space-y-0.5">
          ${CATEGORIES.map((c) =>
            checkRow({
              key: 'categories',
              label: c,
              active: filters.categories.includes(c),
              action: 'toggle-filter',
              value: c,
              count: PRODUCTS.filter((p) => p.category === c).length,
            }),
          )}
        </ul>
      </section>

      <!-- size -->
      <section class="border border-ink/12 bg-paper p-5">
        <h3 class="mb-3.5 text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">Size</h3>
        <div class="flex flex-wrap gap-1.5">${chips(SIZES, 'sizes')}</div>
      </section>

      <!-- condition -->
      <section class="border border-ink/12 bg-paper p-5">
        <h3 class="mb-3.5 text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">Condition</h3>
        <ul class="space-y-0.5">
          ${CONDITIONS.map((c) =>
            checkRow({
              key: 'conditions',
              label: c.label,
              active: filters.conditions.includes(c.id),
              action: 'toggle-filter',
              value: c.id,
              count: PRODUCTS.filter((p) => p.condition === c.id).length,
            }),
          )}
        </ul>
        <dl class="mt-3 space-y-1.5 border-t border-stone-100 pt-3">
          ${CONDITIONS.map(
            (c) => html`<div class="flex items-start gap-2">
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-300"></span>
              <div><dt class="text-[10px] font-medium uppercase tracking-[0.1em] text-stone-500">${c.label}</dt>
              <dd class="text-[10px] leading-snug text-stone-400">${c.blurb}</dd></div>
            </div>`,
          )}
        </dl>
      </section>

      <!-- price -->
      <section class="border border-ink/12 bg-paper p-5">
        <div class="mb-3.5 flex items-baseline justify-between">
          <h3 class="text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">Max price</h3>
          <span id="price-range-label" class="text-[11.5px] font-medium tabular-nums text-zinc-900">Up to ${money(filters.max)}</span>
        </div>
        <label class="sr-only" for="price-max">Maximum price</label>
        <input
          id="price-max"
          type="range"
          min="40"
          max="150"
          step="5"
          value="${filters.max}"
          class="range-slider w-full"
        />
        <div class="mt-2 flex justify-between text-[9.5px] uppercase tracking-[0.12em] text-stone-400"><span>40 DT</span><span>150 DT</span></div>
      </section>

      <!-- sold by -->
      <section class="border border-ink/12 bg-paper p-5">
        <h3 class="mb-1 text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">Sold by</h3>
        <p class="mb-3.5 text-[10px] leading-snug text-stone-400">A marketplace — half the rail is listed by neighbours.</p>
        <div class="space-y-1.5">
          ${[
            { id: 'shop', label: 'Atelier studio', meta: PRODUCTS.filter((p) => p.soldBy === 'shop').length, note: 'Graded & shot in studio' },
            { id: 'individual', label: 'Individual sellers', meta: PRODUCTS.filter((p) => p.soldBy === 'individual').length, note: 'Phone photos, direct' },
          ].map(
            (opt) => html`
              <button
                type="button"
                data-action="toggle-filter"
                data-key="soldBy"
                data-value="${opt.id}"
                class="group flex w-full items-center gap-3 border border-transparent px-2.5 py-2 text-left transition-all duration-300 ease-out ${(filters.soldBy || []).includes(opt.id) ? 'bg-zinc-900 text-stone-50' : 'hover:bg-stone-50'}">
                <span class="grid h-4 w-4 shrink-0 place-items-center rounded-[2px] border ${(filters.soldBy || []).includes(opt.id) ? 'border-stone-50 bg-stone-50 text-zinc-900' : 'border-stone-300 text-transparent'}">
                  ${icon('check', 'h-2.5 w-2.5')}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-[12px] ${(filters.soldBy || []).includes(opt.id) ? 'text-stone-50' : 'text-stone-700'}">${opt.label}</span>
                  <span class="block text-[9.5px] ${(filters.soldBy || []).includes(opt.id) ? 'text-stone-400' : 'text-stone-400'}">${opt.note}</span>
                </span>
                <span class="text-[10px] tabular-nums ${(filters.soldBy || []).includes(opt.id) ? 'text-stone-400' : 'text-stone-400'}">${String(opt.meta).padStart(2, '0')}</span>
              </button>`,
          )}
        </div>
      </section>

      <!-- era -->
      <section class="border border-ink/12 bg-paper p-5">
        <h3 class="mb-3.5 text-[9.5px] font-medium uppercase tracking-[0.24em] text-stone-400">Vintage era</h3>
        <div class="flex flex-wrap gap-1.5">${chips(ERAS, 'eras')}</div>
      </section>

      <div class="border border-ink bg-ink p-5 text-stone-200">
        <p class="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-stone-400">${icon('ruler', 'h-3 w-3')} Measuring note</p>
        <p class="mt-2.5 text-[11.5px] leading-relaxed text-stone-300">
          All measurements are taken flat, by hand, in centimetres. Expect ±1 cm. Between sizes? Size up — these
          are vintage cuts, not modern ones.
        </p>
      </div>
    </div>`;
}

function activeChips(filters) {
  const entries = [
    ...(filters.q ? [{ key: 'q', label: `“${filters.q}”`, value: '' }] : []),
    ...filters.categories.map((v) => ({ key: 'categories', label: v, value: v })),
    ...filters.sizes.map((v) => ({ key: 'sizes', label: `Size ${v}`, value: v })),
    ...filters.conditions.map((v) => ({ key: 'conditions', label: v, value: v })),
    ...filters.eras.map((v) => ({ key: 'eras', label: v, value: v })),
    ...(filters.soldBy || []).map((v) => ({ key: 'soldBy', label: v === 'shop' ? 'Atelier studio' : 'Individual sellers', value: v })),
    ...(filters.min > 0 || filters.max < 150 ? [{ key: 'price', label: `Up to ${money(filters.max)}`, value: '' }] : []),
  ];
  if (!entries.length) return '';
  return html`
    <div class="flex flex-wrap items-center gap-2">
      ${entries.map(
        (e) => html`<button type="button" data-action="clear-chip" data-key="${e.key}" data-value="${e.value}" class="group inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[10.5px] text-stone-600 shadow-sm shadow-stone-200/70 transition-all duration-300 ease-out hover:text-zinc-900 hover:shadow-md">
          ${e.label}
          <span class="text-stone-300 transition-colors duration-300 group-hover:text-clay-600">${icon('close', 'h-3 w-3')}</span>
        </button>`,
      )}
      <button type="button" data-action="reset-filters" class="ml-1 text-[10px] uppercase tracking-[0.14em] text-stone-400 underline-offset-4 transition hover:text-zinc-900 hover:underline">Reset</button>
    </div>`;
}

function featureCard(product) {
  return html`
    <article class="group relative col-span-full overflow-hidden border border-ink/15 bg-paper p-2.5 transition-colors duration-300 hover:border-ink lg:col-span-2">
      <div class="grid gap-0 sm:grid-cols-2">
        <div class="relative overflow-hidden bg-stone-100">
          <a href="#/product/${product.id}" class="block h-full">
            <img src="${img(product.images[0])}" alt="${product.title}" data-fallback="" class="h-full min-h-[300px] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
          </a>
          <div class="absolute left-3 top-3">${conditionPill(product.condition)}</div>
        </div>
        <div class="flex flex-col justify-center p-6 sm:p-8">
          <p class="font-mono text-[9px] uppercase tracking-[0.26em] text-oxblood">Editor's pick · ${product.era}</p>
          <a href="#/product/${product.id}" class="mt-3 font-display text-[clamp(1.35rem,2.2vw,1.75rem)] font-light leading-tight tracking-tight text-zinc-900 transition-colors duration-300 hover:text-clay-700">
            ${product.title}
          </a>
          <p class="mt-3 text-[12px] leading-relaxed text-stone-500">${product.story}</p>
          <dl class="mt-5 grid grid-cols-2 gap-2 text-[11px]">
            <div><dt class="text-[8.5px] uppercase tracking-[0.18em] text-stone-400">Size</dt><dd class="mt-0.5 text-zinc-900">${product.size}</dd></div>
            <div><dt class="text-[8.5px] uppercase tracking-[0.18em] text-stone-400">Material</dt><dd class="mt-0.5 truncate text-zinc-900">${product.material}</dd></div>
          </dl>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <a href="#/product/${product.id}" class="${BTN.primary} !px-6 !py-3">View piece ${icon('arrowRight', 'h-3 w-3')}</a>
            <button type="button" data-action="add-to-cart" data-id="${product.id}" class="${BTN.ghost} !px-5 !py-3">
              ${icon('bag', 'h-3.5 w-3.5')} ${money(product.price)}
            </button>
          </div>
        </div>
      </div>
    </article>`;
}

export function renderCatalog(state) {
  const filters = state.ui.filters;
  const results = filterProducts(filters);
  const hasUserListings = results.some((p) => p.isUserListing);
  const featured = !hasUserListings && activeCount(filters) === 0 && filters.sort === 'curated' ? results.find((p) => p.condition === 'Vault') : null;
  const grid = featured ? results.filter((p) => p.id !== featured.id) : results;

  return html`
    <div class="fade-in">
      <!-- masthead -->
      <section class="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-14">
        <nav class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
          <a href="#/home" class="transition-colors duration-300 hover:text-zinc-900">Home</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <span class="text-zinc-700">The floor</span>
        </nav>
        <div class="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <h1 class="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-light leading-[1.02] tracking-[-0.03em] text-zinc-900">
              The floor
            </h1>
            <p class="mt-4 max-w-lg text-[13.5px] leading-relaxed text-stone-500">
              ${results.length} ${results.length === 1 ? 'piece' : 'pieces'} currently available.
              Every item is one of one — once it leaves, it does not return.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" data-action="toggle-mobile-filters" class="btn btn--line btn--sm lg:hidden">
              ${icon('filter', 'h-3.5 w-3.5')} Filters ${activeCount(filters) ? `· ${activeCount(filters)}` : ''}
            </button>
            <div class="relative">
              <label class="sr-only" for="sort">Sort</label>
              <select
                id="sort"
                data-action="sort"
                class="field field--mono w-auto cursor-pointer appearance-none !py-3 pl-3.5 pr-10 uppercase tracking-[0.12em]"
              >
                ${SORTS.map((s) => html`<option value="${s.id}" ${filters.sort === s.id ? 'selected' : ''}>${s.label}</option>`)}
              </select>
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50">${icon('chevronDown', 'h-3 w-3')}</span>
            </div>
            <a href="#/wishlist" class="btn btn--line btn--sm">
              ${icon('heart', 'h-3.5 w-3.5')} Vault
            </a>
            <a href="#/sell" class="btn btn--solid btn--sm">
              ${icon('plus', 'h-3.5 w-3.5')} List a piece
            </a>
          </div>
        </div>

        ${activeCount(filters) ? html`<div class="mt-6">${activeChips(filters)}</div>` : ''}
      </section>

      <section class="mx-auto max-w-[1440px] px-5 py-10 lg:px-10 lg:py-12">
        <div class="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10 xl:grid-cols-[280px_1fr]">
          <aside class="hidden lg:block" data-filter-rail>${filterRail(filters, results)}</aside>

          <div data-catalog-results>
            ${grid.length || featured
              ? html`<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  ${featured ? featureCard(featured) : ''}
                  ${grid.map((p, i) => productCard(p, { index: i, variant: i % 7 === 0 ? 'tall' : 'default' }))}
                </div>`
              : html`<div class="rounded-[30px] bg-white px-8 py-20 text-center shadow-xl shadow-stone-200/40">
                  <span class="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-stone-100 text-stone-400">${icon('search', 'h-6 w-6')}</span>
                  <h2 class="font-display text-2xl font-light tracking-tight text-zinc-900">Nothing matches those filters</h2>
                  <p class="mx-auto mt-3 max-w-sm text-[12.5px] leading-relaxed text-stone-500">
                    The floor is small by design. Widen the price range or clear a filter to see what is available.
                  </p>
                  <button type="button" data-action="reset-filters" class="${BTN.primary} mt-7">Clear all filters</button>
                </div>`}
          </div>
        </div>
      </section>

      <!-- mobile filter sheet -->
      ${state.ui.mobileFilters
        ? html`
            <div class="fixed inset-0 z-[78] lg:hidden">
              <div class="absolute inset-0 animate-[fadeIn_.3s_ease-out] bg-stone-900/30 backdrop-blur-sm" data-action="toggle-mobile-filters"></div>
              <div class="absolute inset-x-0 bottom-0 max-h-[88vh] animate-[slideUp_.4s_cubic-bezier(.22,.61,.36,1)] overflow-y-auto rounded-t-[32px] bg-stone-50 p-6 pb-10 shadow-2xl">
                <div class="mb-5 flex items-center justify-between">
                  <p class="font-display text-xl tracking-tight text-zinc-900">Refine the floor</p>
                  <button type="button" data-action="toggle-mobile-filters" class="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-500 shadow-sm">${icon('close', 'h-4 w-4')}</button>
                </div>
                ${filterRail(filters, results, { mobile: true })}
                <button type="button" data-action="toggle-mobile-filters" class="${BTN.primary} mt-6 w-full">Show ${results.length} pieces</button>
              </div>
            </div>`
        : ''}
    </div>`;
}
