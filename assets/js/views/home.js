/** Landing feed: hero, bento collections, lookbooks, drops, social proof. */
import { html, raw } from '../core/dom.js';
import { icon, BTN, productCard, sectionHead, stars } from '../components/ui.js';
import { money, longDate } from '../core/format.js';
import { PRODUCTS, CATEGORIES, individualSellers, piecesBy, byId } from '../data/catalog.js';
import { LOOKBOOKS, STORE_SALES, TESTIMONIALS, EDITORIAL, img, BRAND } from '../data/content.js';

const nextSale = () => [...STORE_SALES].sort((a, b) => a.from.localeCompare(b.from))[0];

const byEra = (era) => PRODUCTS.filter((p) => p.era === era);

function hero(state) {
  const lead = byId('aa-2107') || PRODUCTS[0];
  const secondary = byId('aa-1780') || PRODUCTS[1];
  return html`
    <section class="relative overflow-hidden pb-8 pt-10 sm:pt-14 lg:pb-16 lg:pt-20">
      <!-- ambient wash -->
      <div class="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-clay-100/40 blur-[120px]"></div>
      <div class="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-stone-200/50 blur-[110px]"></div>

      <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
        <div class="grid items-center gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
          <!-- copy -->
          <div class="relative z-10 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-600 shadow-sm shadow-stone-200/70">
                <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                Spring floor · ${PRODUCTS.length} pieces live
              </span>
              <span class="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3.5 py-2 text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-100">
                ${icon('sparkle', 'h-3 w-3')} One of one, always
              </span>
            </div>

            <h1 class="mt-7 font-display text-[clamp(2.7rem,5.6vw,4.9rem)] font-light leading-[0.98] tracking-[-0.035em] text-zinc-900">
              Clothing that has<br class="hidden sm:block" />
              <span class="italic text-clay-700">already</span> lived.
            </h1>

            <p class="mt-7 max-w-[30rem] text-[14.5px] leading-[1.75] text-stone-500">
              A marketplace for clothing that has already lived. Half the rail is sourced, graded and
              photographed in our studio; the other half is listed by neighbours clearing out their own
              closets — phone photos, honest measurements, fair prices. Nothing here is mass produced,
              and nothing is listed twice.
            </p>

            <div class="mt-9 flex flex-wrap items-center gap-3">
              <a href="#/catalog" class="${BTN.primary}">
                Browse the floor
                ${icon('arrowRight', 'h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/btn:translate-x-1')}
              </a>
              <a href="#/sell" class="${BTN.ghost}">
                ${icon('plus', 'h-3.5 w-3.5')} List a piece
              </a>
              <a href="#/events" class="${BTN.ghost}">
                ${icon('calendar', 'h-3.5 w-3.5')} Store sales
              </a>
            </div>

            <dl class="mt-11 grid max-w-md grid-cols-3 gap-4 border-t border-stone-200/80 pt-6">
              ${[
                { k: '4,200+', v: 'Pieces rehomed' },
                { k: '47%', v: 'Avg. below retail' },
                { k: '4.9/5', v: 'From 1,840 buyers' },
              ].map(
                (s) => html`<div>
                  <dt class="font-display text-[22px] font-light tracking-tight text-zinc-900">${s.k}</dt>
                  <dd class="mt-1 text-[9.5px] uppercase tracking-[0.16em] text-stone-400">${s.v}</dd>
                </div>`,
              )}
            </dl>
          </div>

          <!-- asymmetric collage -->
          <div class="relative">
            <div class="grid grid-cols-12 gap-3 sm:gap-4">
              <a href="#/product/${lead.id}" class="group relative col-span-7 overflow-hidden rounded-[28px] shadow-2xl shadow-stone-300/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_40px_80px_-30px_rgba(120,113,108,0.55)]">
                <img src="${img(EDITORIAL.leatherJacketMan, 900, 0.78)}" alt="90s Boxy Leather Blazer" data-fallback="" class="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
                <span class="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent"></span>
                <span class="absolute inset-x-4 bottom-4">
                  <span class="block text-[8.5px] uppercase tracking-[0.24em] text-stone-300">The Vault · 90s</span>
                  <span class="mt-1 block font-display text-[17px] leading-tight text-white">Boxy Leather Blazer</span>
                  <span class="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-stone-200">${money(lead.price)} ${icon('arrowUpRight', 'h-3 w-3')}</span>
                </span>
              </a>

              <div class="col-span-5 flex flex-col gap-3 sm:gap-4">
                <a href="#/product/${secondary.id}" class="group relative flex-1 overflow-hidden rounded-[24px] shadow-xl shadow-stone-300/40 transition-all duration-300 ease-out hover:-translate-y-1">
                  <img src="${img(EDITORIAL.fringedPoncho, 600, 0.8)}" alt="80s Mohair Fringe Poncho" data-fallback="" class="h-full min-h-[150px] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                  <span class="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent"></span>
                  <span class="absolute inset-x-3 bottom-3 text-[10px] uppercase tracking-[0.16em] text-white">Mohair poncho</span>
                </a>

                <div class="rounded-[24px] bg-zinc-900 p-5 text-stone-100 shadow-xl shadow-stone-400/30">
                  <p class="text-[8.5px] uppercase tracking-[0.24em] text-stone-400">Next store sale</p>
                  <p class="mt-2 font-display text-[16px] leading-tight">${nextSale().store}<br />${nextSale().city} · −${nextSale().discount}%</p>
                  <a href="#/events" class="mt-3.5 inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-stone-300 transition-colors duration-300 hover:text-white">
                    ${longDate(nextSale().from)} ${icon('arrowRight', 'h-3 w-3')}
                  </a>
                </div>
              </div>
            </div>

            <!-- floating authenticity chip -->
            <div class="absolute -left-4 -top-5 hidden items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-xl shadow-stone-300/50 backdrop-blur sm:flex">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700">${icon('shield', 'h-4 w-4')}</span>
              <div>
                <p class="text-[10.5px] font-medium text-zinc-900">Authenticated by hand</p>
                <p class="mt-0.5 text-[9.5px] text-stone-400">Two-person, 40-point check</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function marquee() {
  const items = ['Sourced by hand', 'Graded honestly', 'One of one', 'Carbon-neutral delivery', 'Free 30-day returns', 'Repaired, not replaced'];
  return html`
    <div class="relative overflow-hidden border-y border-stone-200/60 bg-white/50 py-4">
      <div class="marquee flex w-max items-center gap-10 whitespace-nowrap">
        ${[0, 1].map(() =>
          items.map(
            (item) => html`<span class="flex items-center gap-10 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400">
              ${item}<span class="h-1 w-1 rounded-full bg-stone-300"></span>
            </span>`,
          ),
        )}
      </div>
    </div>`;
}

function bentoCollections() {
  const [a, b, c] = [byId('aa-2107') || PRODUCTS[0], byId('aa-6610') || PRODUCTS[1], byId('aa-2244') || PRODUCTS[2]];
  return html`
    <section class="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
      ${sectionHead({
        kicker: 'The edit',
        title: raw('Three ways into<br class="hidden sm:block" /> the archive'),
        copy: 'Every season we build the floor around a single silhouette, then let the rest of the rail argue with it.',
        action: html`<a href="#/catalog" class="${BTN.link}">All ${PRODUCTS.length} pieces ${icon('arrowUpRight', 'h-3 w-3')}</a>`,
      })}

      <div class="mt-12 grid gap-4 md:grid-cols-6">
        <!-- large -->
        <a href="#/catalog?condition=Vault" class="group relative col-span-1 overflow-hidden rounded-[30px] md:col-span-3 md:row-span-2">
          <img src="${img(EDITORIAL.burgundyCoat, 1100, 0.9)}" alt="The Vault collection" data-fallback="" class="h-full min-h-[340px] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]" />
          <span class="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/25 to-transparent"></span>
          <span class="absolute inset-x-7 bottom-7">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[8.5px] uppercase tracking-[0.22em] text-stone-100 backdrop-blur">
              ${icon('sparkle', 'h-3 w-3')} Archive-grade
            </span>
            <span class="mt-4 block font-display text-[clamp(1.7rem,3vw,2.5rem)] font-light leading-tight tracking-tight text-white">The Vault</span>
            <span class="mt-2 block max-w-sm text-[12.5px] leading-relaxed text-stone-300">Nine pieces held back all season. Unworn, documented, and released once.</span>
            <span class="mt-5 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
              Enter the vault ${icon('arrowRight', 'h-3 w-3 transition-transform duration-300 ease-out group-hover:translate-x-1')}
            </span>
          </span>
        </a>

        <!-- medium -->
        <a href="#/product/${a.id}" class="group relative overflow-hidden rounded-[26px] bg-white p-2.5 shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50 md:col-span-3">
          <div class="flex h-full gap-4">
            <div class="w-[46%] overflow-hidden rounded-[18px] bg-stone-100">
              <img src="${img(a.images[0], 600, 0.82)}" alt="${a.title}" data-fallback="" class="h-full min-h-[210px] w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105" />
            </div>
            <div class="flex w-[54%] flex-col justify-between py-5 pr-3">
              <div>
                <span class="text-[8.5px] uppercase tracking-[0.24em] text-stone-400">${a.brand} · ${a.era}</span>
                <span class="mt-2 block font-display text-[19px] leading-snug tracking-tight text-zinc-900">${a.shortTitle}</span>
                <span class="mt-2 block text-[11px] leading-relaxed text-stone-500">${a.condition} · Size ${a.size}<br />${a.material}</span>
                <span class="mt-3.5 block font-display text-[17px] text-zinc-900">${money(a.price)}</span>
              </div>
              <span class="inline-flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.16em] text-zinc-800">
                View piece ${icon('arrowUpRight', 'h-3 w-3 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5')}
              </span>
            </div>
          </div>
        </a>

        <!-- small pair -->
        <a href="#/product/${b.id}" class="group relative overflow-hidden rounded-[24px] shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 md:col-span-2">
          <img src="${img(b.images[0], 600, 1)}" alt="${b.title}" data-fallback="" class="aspect-[4/3] w-full object-cover transition-transform duration-[1100ms] group-hover:scale-105" />
          <span class="absolute inset-0 bg-gradient-to-t from-stone-950/75 to-transparent"></span>
          <span class="absolute inset-x-4 bottom-4">
            <span class="block text-[8.5px] uppercase tracking-[0.22em] text-stone-300">${b.era} knitwear</span>
            <span class="mt-1 block font-display text-[15px] leading-tight text-white">${b.shortTitle}</span>
          </span>
        </a>

        <a href="#/product/${c.id}" class="group relative overflow-hidden rounded-[24px] shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 md:col-span-1">
          <img src="${img(c.images[0], 500, 1)}" alt="${c.title}" data-fallback="" class="aspect-[4/3] w-full object-cover transition-transform duration-[1100ms] group-hover:scale-105" />
          <span class="absolute inset-0 bg-gradient-to-t from-stone-950/75 to-transparent"></span>
          <span class="absolute inset-x-4 bottom-4">
            <span class="block text-[8.5px] uppercase tracking-[0.22em] text-stone-300">Footwear</span>
            <span class="mt-1 block font-display text-[14px] leading-tight text-white">Air Force 1</span>
          </span>
        </a>
      </div>
    </section>`;
}

function lookbooks(state) {
  const active = state.ui.lookbook || 0;
  return html`
    <section class="overflow-hidden bg-stone-100/50 py-16 lg:py-24">
      <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
        <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div class="max-w-xl">
            <p class="mb-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400">
              <span class="h-px w-8 bg-stone-300"></span>Lookbooks
            </p>
            <h2 class="font-display text-[clamp(1.9rem,3.4vw,3rem)] font-light leading-[1.08] tracking-[-0.02em] text-zinc-900">
              Shot on the floor,<br class="hidden sm:block" /> not in a studio.
            </h2>
          </div>
          <div class="flex items-center gap-2">
            ${[-1, 1].map(
              (dir) => html`<button
                type="button"
                data-action="lookbook-step"
                data-dir="${dir}"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm shadow-stone-200/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-300/50"
                aria-label="${dir < 0 ? 'Previous lookbook' : 'Next lookbook'}"
              >
                ${icon(dir < 0 ? 'chevronLeft' : 'chevronRight', 'h-4 w-4')}
              </button>`,
            )}
          </div>
        </div>

        <div class="relative mt-10">
          <div class="flex gap-4 transition-transform duration-700 ease-out" style="transform:translateX(calc(-${active} * (100% / 3 - 0.5rem)))">
            ${LOOKBOOKS.map(
              (lb, i) => html`
                <article class="w-[86%] shrink-0 sm:w-[52%] lg:w-[calc(33.333%-0.7rem)]">
                  <div class="group relative overflow-hidden rounded-[28px] shadow-xl shadow-stone-300/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/60">
                    <img src="${lb.image}" alt="${lb.title}" data-fallback="" class="aspect-[4/5] w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-[1.04]" />
                    <span class="absolute inset-0 bg-gradient-to-t ${lb.accent} via-stone-900/10 to-transparent"></span>
                    <span class="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[8.5px] uppercase tracking-[0.22em] text-stone-100 backdrop-blur">${lb.kicker}</span>
                    <span class="absolute inset-x-5 bottom-5">
                      <span class="block font-display text-[23px] font-light leading-tight text-white">${lb.title}</span>
                      <span class="mt-1.5 block text-[12px] leading-relaxed text-stone-300">${lb.subtitle}</span>
                      <span class="mt-3 block text-[9px] uppercase tracking-[0.18em] text-stone-400">${lb.note}</span>
                    </span>
                  </div>
                </article>`,
            )}
          </div>
        </div>

        <div class="mt-7 flex items-center justify-center gap-1.5">
          ${LOOKBOOKS.map(
            (lb, i) => html`<button type="button" data-action="lookbook-step" data-dir="${i - active}" class="h-1.5 rounded-full transition-all duration-500 ease-out ${i === active ? 'w-8 bg-zinc-900' : 'w-1.5 bg-stone-300 hover:bg-stone-400'}" aria-label="Go to ${lb.title}"></button>`,
          )}
        </div>
      </div>
    </section>`;
}

function arrivals() {
  const rail = PRODUCTS.slice(0, 5);
  return html`
    <section class="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
      ${sectionHead({
        kicker: 'Just landed',
        title: 'This week on the rail',
        copy: 'Twelve new pieces, photographed the morning they arrived. The good ones rarely last a week.',
        action: html`<a href="#/catalog?sort=new" class="${BTN.link}">Shop all new ${icon('arrowUpRight', 'h-3 w-3')}</a>`,
      })}
      <div class="mt-11 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        ${rail.map(
          (p, i) => html`<div class="w-[74%] shrink-0 snap-start sm:w-[42%] lg:w-[calc(25%-0.75rem)]">
            ${productCard(p, { index: i })}
          </div>`,
        )}
        <a href="#/catalog" class="group flex w-[50%] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-[26px] bg-white px-6 py-10 text-center shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50 sm:w-[30%] lg:w-[calc(25%-0.75rem)]">
          <span class="grid h-14 w-14 place-items-center rounded-full bg-stone-100 text-stone-500 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-stone-50">${icon('grid', 'h-6 w-6')}</span>
          <span class="font-display text-lg text-zinc-900">The whole floor</span>
          <span class="text-[11px] text-stone-500">All ${PRODUCTS.length} pieces, filterable</span>
        </a>
      </div>
    </section>`;
}

function dropBanner() {
  const sale = nextSale();
  return html`
    <section class="mx-auto max-w-[1440px] px-5 lg:px-10">
      <div class="relative overflow-hidden rounded-[36px] bg-zinc-900 shadow-2xl shadow-stone-400/40">
        <img src="${sale.image}" alt="${sale.store}" data-fallback="" class="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div class="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/20"></div>
        <div class="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-16">
          <div class="max-w-xl">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[8.5px] uppercase tracking-[0.24em] text-stone-200 backdrop-blur">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-400"></span> Next local store sale
            </span>
            <h2 class="mt-6 font-display text-[clamp(1.9rem,4vw,3.2rem)] font-light leading-[1.02] tracking-tight text-white">
              ${sale.store}
              <span class="block text-stone-400">${sale.city} · −${sale.discount}%</span>
            </h2>
            <p class="mt-5 max-w-md text-[13px] leading-relaxed text-stone-400">${sale.note}</p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
              <a href="#/events" class="inline-flex items-center gap-2.5 rounded-full bg-stone-50 px-7 py-3.5 text-[10.5px] font-medium uppercase tracking-[0.2em] text-zinc-900 transition-all duration-300 ease-out hover:-translate-y-0.5">
                ${icon('calendar', 'h-3.5 w-3.5')} See all store sales
              </a>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            ${[
              { k: 'From', v: longDate(sale.from) },
              { k: 'Until', v: longDate(sale.to) },
              { k: 'Opening hours', v: sale.hours },
              { k: 'Address', v: sale.address },
            ].map(
              (d) => html`<div class="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                <p class="text-[8.5px] uppercase tracking-[0.22em] text-stone-500">${d.k}</p>
                <p class="mt-1.5 text-[12.5px] leading-snug text-stone-200">${d.v}</p>
              </div>`,
            )}
          </div>
        </div>
      </div>
    </section>`;
}

function categoryBento() {
  const tiles = [
    { label: 'Outerwear', count: PRODUCTS.filter((p) => p.category === 'Outerwear').length, image: EDITORIAL.utilityJacket, span: 'md:col-span-3 md:row-span-2', ratio: 'aspect-[3/4]' },
    { label: 'Denim', count: PRODUCTS.filter((p) => p.category === 'Denim').length, image: EDITORIAL.denimTrucker, span: 'md:col-span-3', ratio: 'aspect-[16/10]' },
    { label: 'Knitwear', count: PRODUCTS.filter((p) => p.category === 'Knitwear').length, image: EDITORIAL.fringedPoncho, span: 'md:col-span-2', ratio: 'aspect-square' },
    { label: 'Footwear', count: PRODUCTS.filter((p) => p.category === 'Footwear').length, image: EDITORIAL.tanAf1, span: 'md:col-span-1', ratio: 'aspect-square' },
  ];
  return html`
    <section class="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
      ${sectionHead({ kicker: 'Categories', title: 'Find your corner of the archive', copy: 'Seven categories, four decades. Everything measured flat and photographed honestly.' })}
      <div class="mt-11 grid gap-4 md:grid-cols-6">
        ${tiles.map(
          (tile) => html`
            <a href="#/catalog?category=${encodeURIComponent(tile.label)}" class="group relative overflow-hidden rounded-[28px] ${tile.span}">
              <img src="${img(tile.image, 800, 1)}" alt="${tile.label}" data-fallback="" class="${tile.ratio} w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]" />
              <span class="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent"></span>
              <span class="absolute inset-x-6 bottom-6 flex items-end justify-between">
                <span>
                  <span class="block font-display text-[22px] font-light leading-tight text-white">${tile.label}</span>
                  <span class="mt-1 block text-[9.5px] uppercase tracking-[0.18em] text-stone-400">${tile.count} pieces</span>
                </span>
                <span class="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-all duration-300 ease-out group-hover:bg-white group-hover:text-zinc-900">
                  ${icon('arrowUpRight', 'h-3.5 w-3.5')}
                </span>
              </span>
            </a>`,
        )}
      </div>
    </section>`;
}

function neighbourhoodRail() {
  const sellers = individualSellers().slice(0, 3);
  const listingCount = PRODUCTS.filter((p) => p.soldBy === 'individual').length;

  return html`
    <section id="neighbourhood-rail" class="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
      ${sectionHead({
        kicker: 'The neighbourhood rail',
        title: raw('Half this floor is<br class="hidden sm:block" /> somebody’s closet.'),
        copy: `${listingCount} pieces are listed by individuals across Tunisia — shot on phones, measured on a kitchen table, boxed up at home. Same buyer protection, none of the shop-floor gloss.`,
        action: html`<a href="#/catalog?soldBy=individual" class="${BTN.link}">Shop individual sellers ${icon('arrowUpRight', 'h-3 w-3')}</a>`,
      })}

      <div class="mt-11 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        ${sellers.map((seller) => {
          const pieces = piecesBy(seller.id);
          return html`
            <article class="group flex flex-col rounded-[28px] bg-white p-5 shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50">
              <div class="flex items-center gap-3">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone-200 text-[11px] font-medium tracking-wide text-stone-700">
                  ${seller.name.slice(0, 2).toUpperCase()}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[12.5px] font-medium text-zinc-900">${seller.name}</p>
                  <p class="truncate text-[10.5px] text-stone-400">${seller.handle} · ${seller.location}</p>
                </div>
                <span class="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-stone-600">${seller.rating}★</span>
              </div>

              <p class="mt-3.5 text-[11.5px] leading-relaxed text-stone-500">${seller.blurb}</p>

              <div class="mt-4 flex gap-2">
                ${[0, 1].map((slot) => {
                  const piece = pieces[slot];
                  if (!piece) {
                    return html`<a href="#/catalog?soldBy=individual" class="flex flex-1 flex-col items-center justify-center gap-2 rounded-[18px] bg-stone-50 px-3 text-center transition-colors duration-300 hover:bg-stone-100">
                      <span class="text-stone-300">${icon('camera', 'h-5 w-5')}</span>
                      <span class="text-[9px] uppercase leading-tight tracking-[0.12em] text-stone-400">More in<br />the closet</span>
                    </a>`;
                  }
                  return html`<a href="#/product/${piece.id}" class="group/img relative flex-1 overflow-hidden rounded-[18px] bg-stone-100 photo-flash">
                    <img src="${img(piece.images[0])}" alt="${piece.title}" data-fallback="" loading="lazy" class="photo-phone aspect-[4/5] w-full object-cover transition-transform duration-[1100ms] ease-out group-hover/img:scale-105" />
                    <span class="absolute inset-x-2 bottom-2 rounded-full bg-white/85 px-2 py-1 text-center text-[8.5px] uppercase tracking-[0.12em] text-zinc-800 backdrop-blur">${money(piece.price)}</span>
                  </a>`;
                })}
              </div>

              <div class="mt-4 flex items-center justify-between border-t border-stone-100 pt-3.5">
                <span class="text-[9.5px] uppercase tracking-[0.14em] text-stone-400">${pieces.length} ${pieces.length === 1 ? 'piece' : 'pieces'} · ${seller.sales} sales</span>
                <a href="#/catalog?soldBy=individual" class="text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-800 underline-offset-4 transition-colors duration-300 hover:text-clay-700 hover:underline">See closet</a>
              </div>
            </article>`;
        })}
      </div>

      <div class="mt-4 flex flex-col gap-5 rounded-[28px] bg-zinc-900 p-7 text-stone-200 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-xl">
          <p class="flex items-center gap-2 text-[9px] uppercase tracking-[0.24em] text-stone-500">${icon('handshake', 'h-3.5 w-3.5')} Sell with us</p>
          <p class="mt-2.5 font-display text-[clamp(1.35rem,2.4vw,1.85rem)] font-light leading-tight text-white">Have a piece to pass on?</p>
          <p class="mt-2 text-[12px] leading-relaxed text-stone-400">
            List it in four steps: three phone photos, your measurements, a price. We handle payment,
            buyer protection and returns — you keep 85%.
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2.5">
          <a href="#/sell" class="inline-flex items-center gap-2 rounded-full bg-stone-50 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-900 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-stone-950/40">
            ${icon('plus', 'h-3.5 w-3.5')} Start a listing
          </a>
          <a href="#/support" class="rounded-full border border-white/25 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/50 hover:text-white">
            How selling works
          </a>
        </div>
      </div>
    </section>`;
}

function gradeGuide() {
  const grades = [
    { id: 'Vault', title: 'Vault', copy: 'Unworn or near-unworn. Deadstock hardware, original tags where they survive.', tone: 'bg-amber-50 text-amber-900', n: '02' },
    { id: 'Excellent', title: 'Excellent', copy: 'Light, even wear. Structurally perfect, no repairs needed for years.', tone: 'bg-emerald-50 text-emerald-900', n: '06' },
    { id: 'Good', title: 'Good', copy: 'Honest, visible wear — fading, softened hems — photographed in detail.', tone: 'bg-stone-100 text-stone-700', n: '04' },
  ];
  return html`
    <section class="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
      <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <p class="mb-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>Condition</p>
          <h2 class="font-display text-[clamp(1.9rem,3.4vw,3rem)] font-light leading-[1.06] tracking-[-0.02em] text-zinc-900">
            We grade the way<br />a museum would.
          </h2>
          <p class="mt-6 max-w-md text-[13.5px] leading-relaxed text-stone-500">
            Two people inspect every piece against the same 40-point rubric: seams, hardware, fibre stress,
            odour, repair history. What you read on the card is what you unwrap — no surprises, no “as-is”.
          </p>
          <a href="#/support" class="${BTN.ghost} mt-8">Read the full rubric ${icon('arrowRight', 'h-3.5 w-3.5')}</a>
        </div>

        <div class="space-y-3">
          ${grades.map(
            (g) => html`
              <div class="group flex items-center gap-5 rounded-[24px] bg-white p-5 shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50">
                <span class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${g.tone} font-display text-lg">${g.n}</span>
                <div class="min-w-0 flex-1">
                  <p class="font-display text-[17px] text-zinc-900">${g.title}</p>
                  <p class="mt-1 text-[11.5px] leading-relaxed text-stone-500">${g.copy}</p>
                </div>
                <span class="hidden shrink-0 text-stone-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-zinc-900 sm:block">${icon('arrowRight', 'h-4 w-4')}</span>
              </div>`,
          )}
        </div>
      </div>
    </section>`;
}

function testimonials() {
  return html`
    <section class="bg-stone-100/50 py-16 lg:py-24">
      <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
        ${sectionHead({ kicker: 'In their words', title: 'Eighteen hundred quiet buyers', align: 'center', copy: 'No paid reviews. These are buyers who came back more than twice.' })}
        <div class="mt-12 grid gap-4 md:grid-cols-3">
          ${TESTIMONIALS.map(
            (t) => html`
              <figure class="flex flex-col rounded-[26px] bg-white p-7 shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50">
                <span class="text-clay-600/40">${icon('quote', 'h-7 w-7')}</span>
                <blockquote class="mt-4 flex-1 font-display text-[17px] font-light leading-[1.5] tracking-tight text-zinc-900">“${t.quote}”</blockquote>
                <figcaption class="mt-7 flex items-center gap-3 border-t border-stone-100 pt-5">
                  <img src="${t.avatar}" alt="${t.name}" data-fallback="" class="h-10 w-10 rounded-full object-cover" />
                  <div class="min-w-0">
                    <p class="text-[12px] font-medium text-zinc-900">${t.name}</p>
                    <p class="text-[10px] uppercase tracking-[0.14em] text-stone-400">${t.role}</p>
                  </div>
                  <span class="ml-auto">${stars(t.rating)}</span>
                </figcaption>
              </figure>`,
          )}
        </div>
      </div>
    </section>`;
}

function closingCta(state) {
  return html`
    <section class="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
      <div class="relative overflow-hidden rounded-[36px] bg-white px-8 py-14 shadow-xl shadow-stone-200/40 sm:px-14 lg:px-20">
        <div class="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full bg-clay-100/50 blur-[100px]"></div>
        <div class="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div class="max-w-xl">
            <p class="text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400">The Rail — one email per drop</p>
            <h2 class="mt-5 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-light leading-[1.05] tracking-[-0.02em] text-zinc-900">
              Get first look at<br />the next twelve pieces.
            </h2>
            <p class="mt-5 max-w-md text-[13px] leading-relaxed text-stone-500">
              A single quiet email before each release — with measurements, provenance and the pieces we are
              unlikely to source again.
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
              ${state.user
                ? html`<a href="#/account" class="${BTN.primary}">You are a member ${icon('arrowRight', 'h-3.5 w-3.5')}</a>`
                : html`<button type="button" data-action="open-auth" data-mode="signup" class="${BTN.primary}">Create an account ${icon('arrowRight', 'h-3.5 w-3.5')}</button>`}
              <button type="button" data-action="toggle-newsletter" class="${BTN.ghost}">
                ${state.newsletter ? 'Subscribed' : 'Just the newsletter'}
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            ${[PRODUCTS[4], PRODUCTS[7], PRODUCTS[2], PRODUCTS[8]].map(
              (p) => html`<a href="#/product/${p.id}" class="group overflow-hidden rounded-2xl bg-stone-100">
                <img src="${img(p.images[0], 400, 1)}" alt="${p.title}" data-fallback="" class="aspect-square w-full object-cover transition-transform duration-[1000ms] group-hover:scale-105" />
              </a>`,
            )}
          </div>
        </div>
      </div>
    </section>`;
}

export function renderHome(state) {
  return html`
    <div class="fade-in">
      ${hero(state)}
      ${marquee()}
      ${bentoCollections()}
      ${lookbooks(state)}
      ${arrivals()}
      <div class="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">${dropBanner(state)}</div>
      ${categoryBento()}
      ${neighbourhoodRail()}
      ${gradeGuide()}
      ${testimonials()}
      ${closingCta(state)}
    </div>`;
}
