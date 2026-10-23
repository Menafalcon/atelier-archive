/** Command-palette style search overlay. Mounted once; updated in place. */
import { html, esc, armImageFallbacks } from '../core/dom.js';
import { icon } from './ui.js';
import { money } from '../core/format.js';
import { PRODUCTS, CATEGORIES, ERAS, img } from '../data/catalog.js';

const thumb = (p) => img(p.images[0]);

export function searchResultsHTML(query, { showAll = false } = {}) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) {
    return html`
      <div>
        <p class="mb-4 text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">Popular right now</p>
        <div class="flex flex-wrap gap-2">
          ${['Carhartt', 'Leather blazer', 'Selvedge', 'Y2K', 'Air Force 1', 'Mohair', 'Denim'].map(
            (term) => html`<button type="button" data-search-term="${term}" class="rounded-full bg-white px-4 py-2.5 text-[11.5px] text-stone-600 shadow-sm shadow-stone-200/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-zinc-900 hover:shadow-md">${term}</button>`,
          )}
        </div>
        <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          ${PRODUCTS.slice(0, 4).map(
            (p) => html`<a href="#/product/${p.id}" data-search-close class="group block">
              <div class="aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
                <img src="${thumb(p)}" alt="${p.title}" data-fallback="" class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              </div>
              <p class="mt-2 truncate text-[11.5px] text-zinc-800">${p.shortTitle}</p>
              <p class="text-[10.5px] text-stone-500">${money(p.price)}</p>
            </a>`,
          )}
        </div>
      </div>`;
  }

  const results = PRODUCTS.filter((p) => {
    const haystack = `${p.title} ${p.brand} ${p.category} ${p.era} ${p.colorway} ${p.tags.join(' ')} ${p.size} ${p.condition}`.toLowerCase();
    return q.split(/\s+/).every((token) => haystack.includes(token));
  });
  const list = showAll ? results : results.slice(0, 4);

  if (!results.length) {
    return html`
      <div class="rounded-3xl bg-white px-8 py-12 text-center shadow-xl shadow-stone-200/40">
        <p class="font-display text-xl tracking-tight text-zinc-900">No pieces match “${query}”</p>
        <p class="mt-2 text-[12.5px] text-stone-500">Most of our floor is one of one. Try a broader term, or browse by era.</p>
        <div class="mt-5 flex flex-wrap justify-center gap-2">
          ${ERAS.map((era) => html`<a href="#/catalog?era=${era}" data-search-close class="rounded-full bg-stone-100 px-4 py-2 text-[11px] text-stone-700 transition-all duration-300 hover:bg-stone-200">${era}</a>`)}
        </div>
      </div>`;
  }

  return html`
    <div class="flex items-baseline justify-between">
      <p class="text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">${results.length} ${results.length === 1 ? 'piece' : 'pieces'} found</p>
      <a href="#/catalog?q=${encodeURIComponent(query)}" data-search-close class="text-[10px] uppercase tracking-[0.16em] text-zinc-700 underline-offset-4 transition hover:text-zinc-900 hover:underline">View all in catalog</a>
    </div>
    <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      ${list.map(
        (p) => html`<a href="#/product/${p.id}" data-search-close class="group block rounded-2xl bg-white p-2 shadow-sm shadow-stone-200/50 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-300/40">
          <div class="aspect-[4/5] overflow-hidden rounded-xl bg-stone-100">
            <img src="${thumb(p)}" alt="${p.title}" data-fallback="" class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
          </div>
          <p class="mt-2 truncate px-1 text-[9px] uppercase tracking-[0.18em] text-stone-400">${p.era} · ${p.condition}</p>
          <p class="truncate px-1 text-[11.5px] text-zinc-800">${p.shortTitle}</p>
          <p class="px-1 pb-1 text-[10.5px] text-stone-500">${money(p.price)}</p>
        </a>`,
      )}
    </div>`;
}

export function renderSearchOverlay() {
  return html`
    <div id="search-overlay" class="pointer-events-none fixed inset-0 z-[95] opacity-0 transition-opacity duration-300 ease-out" aria-hidden="true">
      <div class="absolute inset-0 bg-stone-900/30 backdrop-blur-md" data-search-close></div>
      <div class="relative mx-auto mt-[8vh] w-[calc(100%-2rem)] max-w-[1080px] translate-y-[-12px] scale-[0.99] rounded-[32px] bg-stone-50 p-6 shadow-2xl shadow-stone-900/25 transition-all duration-300 ease-out sm:p-9" data-search-panel>
        <div class="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm shadow-stone-200/60">
          ${icon('search', 'h-5 w-5 shrink-0 text-stone-400')}
          <input
            id="search-input"
            type="search"
            autocomplete="off"
            placeholder="Search a brand, an era, a fabric…"
            class="w-full border-0 bg-transparent p-0 text-[15px] text-zinc-900 placeholder:text-stone-400 focus:outline-none focus:ring-0"
            aria-label="Search the floor"
          />
          <kbd class="hidden shrink-0 rounded-md bg-stone-100 px-2 py-1 text-[9.5px] font-medium uppercase tracking-[0.14em] text-stone-400 sm:block">Esc</kbd>
          <button type="button" data-search-close class="shrink-0 rounded-full p-1.5 text-stone-400 transition-all duration-300 hover:bg-stone-100 hover:text-zinc-900 sm:hidden" aria-label="Close search">${icon('close', 'h-5 w-5')}</button>
        </div>

        <div class="mt-7 max-h-[62vh] overflow-y-auto pr-1" data-search-results>
          ${searchResultsHTML('')}
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/70 pt-4">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] uppercase tracking-[0.16em] text-stone-400">
            <span class="inline-flex items-center gap-1.5"><kbd class="rounded bg-white px-1.5 py-0.5 shadow-sm">↵</kbd> open catalog</span>
            <span class="inline-flex items-center gap-1.5"><kbd class="rounded bg-white px-1.5 py-0.5 shadow-sm">⌘K</kbd> search anywhere</span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            ${CATEGORIES.slice(0, 4).map(
              (c) => html`<a href="#/catalog?category=${encodeURIComponent(c)}" data-search-close class="rounded-full bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-stone-500 shadow-sm shadow-stone-200/60 transition-all duration-300 hover:text-zinc-900">${c}</a>`,
            )}
          </div>
        </div>
      </div>
    </div>`;
}

/** Wire the search overlay. Returns open/close controllers. */
export function initSearchOverlay() {
  const overlay = document.getElementById('search-overlay');
  const panel = overlay?.querySelector('[data-search-panel]');
  const input = document.getElementById('search-input');
  const results = overlay?.querySelector('[data-search-results]');
  if (!overlay || !panel || !input || !results) return { open() {}, close() {} };

  let open = false;

  const paint = (query) => {
    results.innerHTML = searchResultsHTML(query);
    armImageFallbacks(results);
  };

  const show = () => {
    open = true;
    overlay.classList.remove('pointer-events-none', 'opacity-0');
    overlay.setAttribute('aria-hidden', 'false');
    panel.classList.remove('translate-y-[-12px]', 'scale-[0.99]');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => input.focus({ preventScroll: true }), 80);
  };

  const hide = () => {
    if (!open) return;
    open = false;
    overlay.classList.add('pointer-events-none', 'opacity-0');
    overlay.setAttribute('aria-hidden', 'true');
    panel.classList.add('translate-y-[-12px]', 'scale-[0.99]');
    document.documentElement.style.overflow = '';
    input.value = '';
    paint('');
  };

  input.addEventListener('input', () => paint(input.value));

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const q = input.value.trim();
      window.location.hash = q ? `#/catalog?q=${encodeURIComponent(q)}` : '#/catalog';
      hide();
    }
  });

  overlay.addEventListener('click', (event) => {
    const term = event.target.closest('[data-search-term]');
    if (term) {
      input.value = term.dataset.searchTerm;
      paint(input.value);
      input.focus();
      return;
    }
    if (event.target.closest('[data-search-close]')) hide();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      show();
    }
  });

  return { open: show, close: hide, toggle: () => (open ? hide() : show()) };
}
