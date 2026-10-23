/** Sell / Publish view: list a thrift item and have it appear immediately on the floor. */
import { html } from '../core/dom.js';
import { icon, BTN, FIELD, LABEL, conditionPill, priceRow } from '../components/ui.js';
import { money } from '../core/format.js';
import { CATEGORIES, ERAS, CONDITIONS, SIZES, SOURCES, img } from '../data/catalog.js';

export const PHOTO_PRESETS = [
  { id: SOURCES.rustBomber, label: 'Bomber jacket' },
  { id: SOURCES.leatherJacketMan, label: 'Leather blazer' },
  { id: SOURCES.utilityJacket, label: 'Utility coat' },
  { id: SOURCES.denimTrucker, label: 'Denim trucker' },
  { id: SOURCES.chambrayShirt, label: 'Vintage shirt' },
  { id: SOURCES.flatlayKnit, label: 'Knit sweater' },
  { id: SOURCES.whiteCrewneck, label: 'Crewneck fleece' },
  { id: SOURCES.roseJoggers, label: 'Vintage trousers' },
  { id: SOURCES.tanAf1, label: 'Sneakers' },
  { id: SOURCES.greenBackpack, label: 'Canvas bag' },
];

export const DEMO_LISTINGS = [
  {
    title: 'Vintage 90s Levi’s 505 Faded Indigo Jeans',
    brand: 'Levi’s',
    category: 'Denim',
    era: '90s',
    size: '40',
    condition: 'Excellent',
    price: '75',
    retail: '140',
    colorway: 'Washed Mid-Indigo',
    material: '100% heavyweight cotton denim',
    story: 'Found at Hafsia fripe and worn only a few times. Honest fade at the knees, zero fraying at the hem.',
    image: SOURCES.denimTrucker,
  },
  {
    title: 'Y2K Olive Canvas Workwear Bomber',
    brand: 'Carhartt WIP',
    category: 'Outerwear',
    era: 'Y2K',
    size: '44',
    condition: 'Vault',
    price: '115',
    retail: '195',
    colorway: 'Washed Rust / Olive',
    material: '12 oz cotton duck canvas, quilted lining',
    story: 'Boxy cropped silhouette with original brass zipper. Warm enough for Tunis winters.',
    image: SOURCES.rustBomber,
  },
  {
    title: '90s Heavyweight Cream Cable-Knit Pullover',
    brand: 'Ralph Lauren',
    category: 'Knitwear',
    era: '90s',
    size: '42',
    condition: 'Excellent',
    price: '65',
    retail: '125',
    colorway: 'Oatmeal / Cream',
    material: '100% combed cotton knit',
    story: 'Soft, breathable cable knit with a relaxed drop shoulder. Freshly hand-washed and dried flat.',
    image: SOURCES.flatlayKnit,
  },
  {
    title: '80s Oversized Distressed Leather Jacket',
    brand: 'Schott NYC',
    category: 'Outerwear',
    era: '80s',
    size: '46',
    condition: 'Good',
    price: '135',
    retail: '240',
    colorway: 'Espresso Brown',
    material: 'Full-grain cowhide leather',
    story: 'Broken-in vintage leather with natural patina on the sleeves. All pockets and snaps intact.',
    image: SOURCES.leatherJacketMan,
  },
];

export function renderSellPreview(state) {
  const d = state.ui.sellDraft || {};
  const title = String(d.title || '').trim() || 'Your piece title appears here';
  const brand = String(d.brand || '').trim() || 'Vintage Fripe';
  const category = d.category || 'Outerwear';
  const era = d.era || '90s';
  const size = d.size || '42';
  const condition = d.condition || 'Excellent';
  const price = Math.max(1, Number(d.price) || 75);
  const retail = Math.max(price + 20, Number(d.retail) || Math.round(price * 1.65));
  const image = d.image || SOURCES.rustBomber;
  const sellerName = String(d.sellerName || state.user?.name || 'Community Seller').trim();
  const handleBase = sellerName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'fripe';
  const payout = Math.round(price * 0.85);

  return html`
    <div id="sell-preview" class="space-y-5">
      <div class="rounded-[28px] bg-white p-5 shadow-xl shadow-stone-200/40">
        <div class="mb-3.5 flex items-center justify-between">
          <span class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">Live floor preview</span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-800">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Instant publish
          </span>
        </div>

        <article class="group relative flex flex-col overflow-hidden rounded-[22px] border border-stone-200/70 bg-stone-50/50 p-2.5">
          <div class="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-stone-100 photo-flash">
            <img src="${img(image)}" alt="${title}" data-fallback="" class="h-full w-full object-cover photo-phone" />
            <div class="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
              ${conditionPill(condition)}
              <span class="rounded-full bg-zinc-900/85 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-stone-50 backdrop-blur">Just listed</span>
            </div>
          </div>

          <div class="flex flex-1 flex-col px-2 pb-1 pt-3.5">
            <p class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">${brand} · ${era}</p>
            <p class="mt-1.5 font-display text-[16px] leading-[1.3] tracking-tight text-zinc-900">${title}</p>
            <p class="mt-1 text-[11px] text-stone-500">${category} · Size ${size}</p>
            <p class="mt-1.5 flex items-center gap-1.5 text-[10px] text-stone-400">
              <span class="text-stone-300">${icon('camera', 'h-3 w-3')}</span>
              <span class="truncate">@${handleBase}.tn</span>
              <span class="text-stone-300">·</span>
              <span>Community listing</span>
            </p>
            <div class="mt-3 pt-2 border-t border-stone-200/60">
              ${priceRow({ price, retail })}
            </div>
          </div>
        </article>

        <div class="mt-4 flex items-center justify-between rounded-2xl bg-stone-100/80 px-4 py-3 text-[11.5px]">
          <span class="text-stone-600">Your seller payout (85%)</span>
          <span class="font-display text-[16px] font-medium text-emerald-800">${money(payout)}</span>
        </div>
      </div>

      ${(state.userListings || []).length
        ? html`
            <div class="rounded-[28px] bg-white p-5 shadow-xl shadow-stone-200/40">
              <div class="flex items-baseline justify-between">
                <h3 class="font-display text-[16px] text-zinc-900">Your live listings</h3>
                <span class="text-[9.5px] uppercase tracking-[0.16em] text-stone-400">${state.userListings.length} on the floor</span>
              </div>
              <ul class="mt-4 space-y-2.5">
                ${state.userListings.map(
                  (item) => html`
                    <li class="flex items-center gap-3 rounded-2xl bg-stone-50 p-2.5">
                      <a href="#/product/${item.id}" class="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                        <img src="${img(item.images[0])}" alt="${item.title}" data-fallback="" class="h-full w-full object-cover" />
                      </a>
                      <div class="min-w-0 flex-1">
                        <a href="#/product/${item.id}" class="block truncate text-[12px] font-medium text-zinc-900 hover:text-clay-700">${item.title}</a>
                        <p class="text-[10.5px] text-stone-500">${money(item.price)} · Size ${item.size} · ${item.condition}</p>
                      </div>
                      <button
                        type="button"
                        data-action="delete-listing"
                        data-id="${item.id}"
                        class="shrink-0 rounded-full p-2 text-stone-400 transition hover:bg-stone-200/70 hover:text-clay-700"
                        title="Remove from floor"
                        aria-label="Remove ${item.title}"
                      >
                        ${icon('trash', 'h-3.5 w-3.5')}
                      </button>
                    </li>`,
                )}
              </ul>
            </div>`
        : ''}
    </div>`;
}

export function renderSell(state) {
  const d = state.ui.sellDraft || {};
  const activeCondition = d.condition || 'Excellent';
  const activeEra = d.era || '90s';
  const activeCategory = d.category || 'Outerwear';
  const activeSize = d.size || '42';
  const activeImage = d.image || SOURCES.rustBomber;
  const sellerName = d.sellerName || state.user?.name || '';
  const sellerLocation = d.sellerLocation || state.user?.address?.city || 'La Marsa, Tunis';

  return html`
    <div class="fade-in">
      <section class="mx-auto max-w-[1440px] px-5 pt-8 lg:px-10 lg:pt-12">
        <nav class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
          <a href="#/home" class="transition-colors duration-300 hover:text-zinc-900">Home</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <a href="#/catalog" class="transition-colors duration-300 hover:text-zinc-900">The floor</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <span class="text-zinc-700">List a piece</span>
        </nav>

        <div class="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-[9.5px] font-medium uppercase tracking-[0.24em] text-clay-700">Community thrift rail</p>
            <h1 class="mt-1 font-display text-[clamp(2rem,3.8vw,3.1rem)] font-light leading-tight tracking-[-0.025em] text-zinc-900">
              Publish a piece to the floor
            </h1>
            <p class="mt-2 max-w-xl text-[13px] leading-relaxed text-stone-500">
              Post clothes from your own closet. Once published, your item immediately appears on <a href="#/catalog" class="underline underline-offset-4 hover:text-zinc-900">The Floor</a> and can be viewed, saved, and bought.
            </p>
          </div>
          <button
            type="button"
            data-action="fill-demo-listing"
            class="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-50 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800"
          >
            ${icon('sparkle', 'h-3.5 w-3.5')} Fill demo item
          </button>
        </div>
      </section>

      <section class="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-10">
        <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <!-- Left: Form -->
          <form data-form="sell" class="space-y-8 rounded-[30px] bg-white p-6 shadow-xl shadow-stone-200/40 sm:p-9" novalidate>
            <!-- Step 1: Photo -->
            <div>
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">Step 1 · Photography</p>
                  <h2 class="mt-1 font-display text-[22px] font-light tracking-tight text-zinc-900">Upload or choose a photo</h2>
                </div>
                <label
                  for="sell-photo-file"
                  class="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-stone-100 px-4 py-2 text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-zinc-900 hover:text-stone-50"
                >
                  ${icon('camera', 'h-3.5 w-3.5')} Upload from device
                  <input id="sell-photo-file" type="file" accept="image/*" class="sr-only" />
                </label>
              </div>

              <p class="mt-1.5 text-[11.5px] text-stone-500">
                Upload a photo from your computer/phone, paste an image link, or pick one of the thrift presets below:
              </p>

              <!-- Preset photo grid -->
              <div class="mt-4 grid grid-cols-5 gap-2.5 sm:grid-cols-10">
                ${PHOTO_PRESETS.map(
                  (preset) => html`
                    <button
                      type="button"
                      data-action="sell-pick-photo"
                      data-image="${preset.id}"
                      title="${preset.label}"
                      class="group relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-100 ring-2 transition-all duration-200 ${activeImage === preset.id ? 'ring-zinc-900 scale-[1.03] shadow-md' : 'ring-transparent opacity-75 hover:opacity-100'}"
                    >
                      <img src="${img(preset.id)}" alt="${preset.label}" class="h-full w-full object-cover" />
                    </button>`,
                )}
              </div>

              <div class="mt-3.5">
                <label class="${LABEL} mb-1.5" for="sell-image">Or paste an image URL</label>
                <input
                  id="sell-image"
                  name="image"
                  data-sell-field="image"
                  type="text"
                  value="${activeImage.startsWith('data:') ? 'Custom uploaded photo' : activeImage}"
                  placeholder="https://example.com/photo.jpg"
                  class="${FIELD} !py-2.5 text-[12px]"
                />
              </div>
            </div>

            <!-- Step 2: Details -->
            <div class="border-t border-stone-100 pt-7">
              <p class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">Step 2 · Piece details</p>
              <h2 class="mt-1 font-display text-[22px] font-light tracking-tight text-zinc-900">Tell buyers what it is</h2>

              <div class="mt-5 grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="${LABEL} mb-1.5" for="sell-title">Item title *</label>
                  <input
                    id="sell-title"
                    name="title"
                    data-sell-field="title"
                    type="text"
                    required
                    placeholder="e.g. Vintage 90s Levi’s 501 Faded Blue Jeans"
                    value="${d.title || ''}"
                    class="${FIELD}"
                  />
                </div>

                <div>
                  <label class="${LABEL} mb-1.5" for="sell-brand">Brand / Label</label>
                  <input
                    id="sell-brand"
                    name="brand"
                    data-sell-field="brand"
                    type="text"
                    placeholder="e.g. Levi’s, Nike, Vintage Fripe"
                    value="${d.brand || ''}"
                    class="${FIELD}"
                  />
                </div>

                <div>
                  <label class="${LABEL} mb-1.5" for="sell-price">Price (DT) * <span class="normal-case tracking-normal text-stone-400">(recommended 40–150 DT)</span></label>
                  <input
                    id="sell-price"
                    name="price"
                    data-sell-field="price"
                    type="number"
                    min="10"
                    max="500"
                    step="1"
                    required
                    placeholder="75"
                    value="${d.price ?? '75'}"
                    class="${FIELD}"
                  />
                </div>

                <div>
                  <label class="${LABEL} mb-1.5" for="sell-category">Category</label>
                  <div class="relative">
                    <select id="sell-category" name="category" data-sell-field="category" class="appearance-none ${FIELD} pr-10">
                      ${CATEGORIES.map((c) => html`<option value="${c}" ${c === activeCategory ? 'selected' : ''}>${c}</option>`)}
                    </select>
                    <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">${icon('chevronDown', 'h-3.5 w-3.5')}</span>
                  </div>
                </div>

                <div>
                  <label class="${LABEL} mb-1.5" for="sell-size">Size (EU)</label>
                  <div class="relative">
                    <select id="sell-size" name="size" data-sell-field="size" class="appearance-none ${FIELD} pr-10">
                      ${SIZES.map((s) => html`<option value="${s}" ${s === activeSize ? 'selected' : ''}>${s}</option>`)}
                    </select>
                    <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">${icon('chevronDown', 'h-3.5 w-3.5')}</span>
                  </div>
                </div>

                <!-- Condition pills -->
                <div>
                  <span class="${LABEL} mb-1.5">Condition grade</span>
                  <input type="hidden" name="condition" value="${activeCondition}" />
                  <div class="grid grid-cols-3 gap-2">
                    ${CONDITIONS.map(
                      (c) => html`
                        <button
                          type="button"
                          data-action="sell-set-field"
                          data-key="condition"
                          data-value="${c.id}"
                          class="rounded-2xl px-3 py-2.5 text-[11px] font-medium transition-all duration-200 ${activeCondition === c.id ? 'bg-zinc-900 text-stone-50 shadow-sm' : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'}"
                        >
                          ${c.label}
                        </button>`,
                    )}
                  </div>
                </div>

                <!-- Era pills -->
                <div>
                  <span class="${LABEL} mb-1.5">Era</span>
                  <input type="hidden" name="era" value="${activeEra}" />
                  <div class="grid grid-cols-4 gap-2">
                    ${ERAS.map(
                      (era) => html`
                        <button
                          type="button"
                          data-action="sell-set-field"
                          data-key="era"
                          data-value="${era}"
                          class="rounded-2xl px-3 py-2.5 text-[11px] font-medium transition-all duration-200 ${activeEra === era ? 'bg-zinc-900 text-stone-50 shadow-sm' : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'}"
                        >
                          ${era}
                        </button>`,
                    )}
                  </div>
                </div>

                <div>
                  <label class="${LABEL} mb-1.5" for="sell-material">Material / Fabric <span class="normal-case tracking-normal text-stone-400">(optional)</span></label>
                  <input
                    id="sell-material"
                    name="material"
                    data-sell-field="material"
                    type="text"
                    placeholder="e.g. 100% cotton denim"
                    value="${d.material || ''}"
                    class="${FIELD}"
                  />
                </div>

                <div>
                  <label class="${LABEL} mb-1.5" for="sell-colorway">Colorway <span class="normal-case tracking-normal text-stone-400">(optional)</span></label>
                  <input
                    id="sell-colorway"
                    name="colorway"
                    data-sell-field="colorway"
                    type="text"
                    placeholder="e.g. Washed Indigo / Olive"
                    value="${d.colorway || ''}"
                    class="${FIELD}"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label class="${LABEL} mb-1.5" for="sell-story">Description & condition notes <span class="normal-case tracking-normal text-stone-400">(optional)</span></label>
                  <textarea
                    id="sell-story"
                    name="story"
                    data-sell-field="story"
                    rows="3"
                    placeholder="How does it fit? Where did you find it? Any honest wear to mention?"
                    class="${FIELD}"
                  >${d.story || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- Step 3: Seller info -->
            <div class="border-t border-stone-100 pt-7">
              <p class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">Step 3 · Seller details</p>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="${LABEL} mb-1.5" for="sell-seller-name">Your name</label>
                  <input
                    id="sell-seller-name"
                    name="sellerName"
                    data-sell-field="sellerName"
                    type="text"
                    placeholder="e.g. Youssef B."
                    value="${sellerName}"
                    class="${FIELD}"
                  />
                </div>
                <div>
                  <label class="${LABEL} mb-1.5" for="sell-seller-location">City / Governorate</label>
                  <input
                    id="sell-seller-location"
                    name="sellerLocation"
                    data-sell-field="sellerLocation"
                    type="text"
                    placeholder="e.g. La Marsa, Tunis"
                    value="${sellerLocation}"
                    class="${FIELD}"
                  />
                </div>
              </div>
            </div>

            <div data-sell-error class="hidden items-center gap-2 rounded-2xl bg-clay-500/10 px-4 py-3 text-[11.5px] text-clay-700"></div>

            <div class="flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-6">
              <a href="#/catalog" class="${BTN.ghost} !px-5 !py-3">Cancel</a>
              <button id="sell-submit" type="submit" class="${BTN.primary} !px-9 !py-4">
                ${icon('plus', 'h-4 w-4')} Publish item to the floor
              </button>
            </div>
          </form>

          <!-- Right: Live Preview & Published list -->
          <aside class="lg:sticky lg:top-28 lg:self-start">
            ${renderSellPreview(state)}
          </aside>
        </div>
      </section>
    </div>`;
}
