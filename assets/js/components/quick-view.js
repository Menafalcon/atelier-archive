/** Quick-view product modal. */
import { html } from '../core/dom.js';
import { icon, BTN, conditionPill, stars, priceRow, discountPct } from './ui.js';
import { money } from '../core/format.js';
import { byId, img } from '../data/catalog.js';
import { isWishlisted } from '../core/state.js';

export function renderQuickView(state) {
  const id = state.ui.quickView;
  if (!id) return '';
  const product = byId(id);
  if (!product) return '';
  const saved = isWishlisted(id);
  const off = discountPct(product);

  return html`
    <div class="fixed inset-0 z-[85] flex items-center justify-center p-4 sm:p-6" data-overlay="quickview">
      <div class="absolute inset-0 animate-[fadeIn_.3s_ease-out] bg-stone-900/30 backdrop-blur-md" data-action="close-quickview"></div>
      <div class="relative flex max-h-[90vh] w-full max-w-[980px] animate-[modalIn_.4s_cubic-bezier(.22,.61,.36,1)] flex-col overflow-hidden rounded-[32px] bg-stone-50 shadow-2xl shadow-stone-900/25 md:flex-row" role="dialog" aria-modal="true" aria-label="${product.title}">
        <button type="button" data-action="close-quickview" class="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-stone-500 shadow-sm backdrop-blur transition-all duration-300 ease-out hover:rotate-90 hover:text-zinc-900" aria-label="Close">
          ${icon('close', 'h-[18px] w-[18px]')}
        </button>

        <div class="relative w-full shrink-0 overflow-hidden bg-stone-100 md:w-[46%]">
          <img src="${img(product.images[0])}" alt="${product.title}" data-fallback="" class="h-[240px] w-full object-cover md:h-full" />
          <div class="absolute left-4 top-4">${conditionPill(product.condition)}</div>
          ${off > 0 ? html`<div class="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[9.5px] font-medium uppercase tracking-[0.16em] text-emerald-800 backdrop-blur">${off}% below retail</div>` : ''}
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-7 sm:p-9">
          <p class="text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">${product.brand} · ${product.era} · ${product.category}</p>
          <h2 class="mt-3 font-display text-[26px] font-light leading-tight tracking-tight text-zinc-900">${product.title}</h2>
          <div class="mt-2.5">${stars(product.rating, product.reviews)}</div>
          <div class="mt-5">${priceRow(product, 'lg')}</div>

          <p class="mt-5 text-[12.5px] leading-relaxed text-stone-600">${product.story}</p>

          <div class="mt-5 grid grid-cols-2 gap-2">
            ${Object.entries(product.measurements)
              .slice(0, 4)
              .map(
                ([k, v]) => html`<div class="rounded-xl bg-white px-3.5 py-2.5 shadow-sm shadow-stone-200/50">
                  <p class="text-[8.5px] uppercase tracking-[0.2em] text-stone-400">${k}</p>
                  <p class="mt-0.5 text-[12px] tabular-nums text-zinc-900">${v}</p>
                </div>`,
              )}
          </div>

          <dl class="mt-5 space-y-2 text-[11.5px]">
            <div class="flex justify-between gap-4"><dt class="text-stone-400">Size</dt><dd class="text-zinc-900">${product.size} · ${product.fit}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-stone-400">Material</dt><dd class="text-right text-zinc-900">${product.material}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-stone-400">Made in</dt><dd class="text-zinc-900">${product.madeIn}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-stone-400">Stock</dt><dd class="text-zinc-900">${product.stock} available</dd></div>
          </dl>

          <div class="mt-6 flex gap-2.5">
            <button type="button" data-action="add-to-cart" data-id="${product.id}" class="${BTN.primary} flex-1">
              ${icon('bag', 'h-3.5 w-3.5')} Add to bag
            </button>
            <button type="button" data-action="wishlist" data-id="${product.id}" class="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm shadow-stone-200/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${saved ? '!text-clay-600' : ''}" aria-label="Save to vault">
              ${icon('heart', `h-[18px] w-[18px] ${saved ? 'fill-current' : ''}`)}
            </button>
          </div>

          <a href="#/product/${product.id}" data-action="close-quickview" class="mt-4 inline-flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500 transition-colors duration-300 hover:text-zinc-900">
            Full details, provenance & condition ${icon('arrowRight', 'h-3 w-3')}
          </a>
        </div>
      </div>
    </div>`;
}
