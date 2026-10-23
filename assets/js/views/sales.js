/** Store sales — partner shops running deep discounts on fixed dates. */
import { html } from '../core/dom.js';
import { icon, BTN, sectionHead } from '../components/ui.js';
import { longDate } from '../core/format.js';
import { STORE_SALES, BRAND } from '../data/content.js';

const CITIES = ['All', ...Array.from(new Set(STORE_SALES.map((s) => s.city)))];

function rangeLabel(sale) {
  return sale.from === sale.to ? longDate(sale.from) : `${longDate(sale.from)} — ${longDate(sale.to)}`;
}

function daysUntil(iso) {
  const start = new Date(`${iso}T12:00:00`);
  const now = new Date();
  return Math.ceil((start - now) / 864e5);
}

function discountBadge(sale, size = 'md') {
  const big = size === 'lg';
  return html`
    <span class="inline-flex flex-col items-center rounded-2xl bg-clay-600 ${big ? 'px-5 py-3' : 'px-3.5 py-2'} text-center text-white shadow-lg shadow-clay-900/25">
      <span class="font-display ${big ? 'text-[26px]' : 'text-[19px]'} font-light leading-none tracking-tight">−${sale.discount}%</span>
      <span class="mt-1 text-[8px] uppercase tracking-[0.18em] text-clay-100">off everything</span>
    </span>`;
}

function saleCard(sale) {
  const left = daysUntil(sale.from);
  const soon = left >= 0 && left <= 7;

  return html`
    <article class="group flex flex-col overflow-hidden rounded-[28px] bg-white shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50">
      <div class="relative overflow-hidden">
        <img src="${sale.image}" alt="${sale.store}" data-fallback="" loading="lazy" class="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
        <span class="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent"></span>
        <span class="absolute left-4 top-4">${discountBadge(sale)}</span>
        ${soon
          ? html`<span class="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[8.5px] uppercase tracking-[0.16em] text-clay-800 backdrop-blur">${left === 0 ? 'Starts today' : `In ${left} days`}</span>`
          : html`<span class="absolute right-4 top-4 rounded-full bg-zinc-900/80 px-3 py-1 text-[8.5px] uppercase tracking-[0.16em] text-stone-100 backdrop-blur">${sale.governorate}</span>`}
        <span class="absolute inset-x-4 bottom-4">
          <span class="block font-display text-[21px] font-light leading-tight text-white">${sale.store}</span>
          <span class="mt-1 block text-[10px] uppercase tracking-[0.16em] text-stone-300">${sale.city} · ${sale.governorate}</span>
        </span>
      </div>

      <div class="flex flex-1 flex-col p-6">
        <dl class="space-y-1.5 text-[11px]">
          <div class="flex items-start gap-2 text-zinc-800">
            <span class="mt-0.5 text-stone-400">${icon('calendar', 'h-3.5 w-3.5')}</span>
            <span>${rangeLabel(sale)}</span>
          </div>
          <div class="flex items-start gap-2 text-stone-500">
            <span class="mt-0.5 text-stone-400">${icon('clock', 'h-3.5 w-3.5')}</span>
            <span>${sale.hours}</span>
          </div>
          <div class="flex items-start gap-2 text-stone-500">
            <span class="mt-0.5 text-stone-400">${icon('pin', 'h-3.5 w-3.5')}</span>
            <span class="leading-relaxed">${sale.address}</span>
          </div>
        </dl>

        <p class="mt-4 text-[11.5px] leading-relaxed text-stone-500">${sale.note}</p>

        <div class="mt-4 flex flex-wrap gap-1.5">
          ${sale.categories.map(
            (c) => html`<span class="rounded-full bg-stone-100 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-stone-600">${c}</span>`,
          )}
        </div>

        <div class="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <a href="tel:${sale.phone.replace(/\s/g, '')}" class="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-stone-500 transition-colors duration-300 hover:text-zinc-900">
            ${icon('phone', 'h-3 w-3')} Call shop
          </a>
          <button type="button" data-action="add-to-calendar" data-id="${sale.id}" class="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-2 text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-800 transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-stone-50">
            ${icon('calendar', 'h-3 w-3')} Save dates
          </button>
        </div>
      </div>
    </article>`;
}

export function renderSales(state) {
  const city = state.ui.saleCity || 'All';
  const sales = city === 'All' ? STORE_SALES : STORE_SALES.filter((s) => s.city === city);
  const biggest = [...STORE_SALES].sort((a, b) => b.discount - a.discount)[0];
  const featured = STORE_SALES.find((s) => s.tier === 'flagship') || biggest;
  const governorates = new Set(STORE_SALES.map((s) => s.governorate)).size;
  const avg = Math.round(STORE_SALES.reduce((n, s) => n + s.discount, 0) / STORE_SALES.length);

  return html`
    <div class="fade-in">
      <section class="relative overflow-hidden">
        <div class="pointer-events-none absolute -left-32 top-0 h-[380px] w-[380px] rounded-full bg-clay-100/40 blur-[120px]"></div>
        <div class="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-14">
          <nav class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
            <a href="#/home" class="transition-colors duration-300 hover:text-zinc-900">Home</a>
            <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
            <span class="text-zinc-700">Store sales</span>
          </nav>

          <div class="mt-7 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div class="max-w-2xl">
              <p class="mb-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>Soldes locales</p>
              <h1 class="font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-light leading-[1.0] tracking-[-0.03em] text-zinc-900">
                Six shops.<br class="hidden sm:block" /> Real discounts.
              </h1>
              <p class="mt-5 max-w-lg text-[13.5px] leading-relaxed text-stone-500">
                Our partner shops across Tunisia run deep discounts for a fixed set of dates — ${avg}% off on
                average, up to ${biggest.discount}%. No ticket, no reservation: check the dates, walk in,
                pay the counter price.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-[22px] bg-white px-5 py-4 shadow-xl shadow-stone-200/40">
                <p class="text-[8.5px] uppercase tracking-[0.2em] text-stone-400">Sales on</p>
                <p class="mt-2 font-display text-[26px] font-light leading-none text-zinc-900">${STORE_SALES.length}</p>
                <p class="mt-1 text-[10px] text-stone-400">across ${governorates} governorates</p>
              </div>
              <div class="rounded-[22px] bg-zinc-900 px-5 py-4 text-stone-100 shadow-xl shadow-stone-400/30">
                <p class="text-[8.5px] uppercase tracking-[0.2em] text-stone-400">Biggest</p>
                <p class="mt-2 font-display text-[26px] font-light leading-none">−${biggest.discount}%</p>
                <p class="mt-1 text-[10px] text-stone-400">${biggest.store}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- featured -->
      <section class="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-12">
        <div class="relative overflow-hidden rounded-[34px] bg-zinc-900 shadow-2xl shadow-stone-400/40">
          <img src="${featured.image}" alt="${featured.store}" data-fallback="" class="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div class="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/25"></div>
          <div class="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:p-14">
            <div>
              <span class="inline-flex items-center gap-2 rounded-full bg-clay-600 px-3.5 py-1.5 text-[8.5px] uppercase tracking-[0.22em] text-white">
                ${icon('sparkle', 'h-3 w-3')} Biggest discount this month
              </span>
              <h2 class="mt-5 font-display text-[clamp(1.8rem,3.6vw,2.9rem)] font-light leading-[1.03] tracking-tight text-white">
                ${featured.store} — ${featured.discount}% off
              </h2>
              <p class="mt-4 max-w-lg text-[12.5px] leading-relaxed text-stone-400">${featured.note}</p>
              <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10.5px] uppercase tracking-[0.14em] text-stone-400">
                <span class="flex items-center gap-2">${icon('calendar', 'h-3.5 w-3.5')} ${rangeLabel(featured)}</span>
                <span class="flex items-center gap-2">${icon('pin', 'h-3.5 w-3.5')} ${featured.city}</span>
              </div>
              <div class="mt-7 flex flex-wrap gap-2.5">
                <button type="button" data-action="add-to-calendar" data-id="${featured.id}" class="inline-flex items-center gap-2.5 rounded-full bg-stone-50 px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-900 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-stone-950/40">
                  ${icon('calendar', 'h-3.5 w-3.5')} Save the dates
                </button>
                <a href="tel:${featured.phone.replace(/\s/g, '')}" class="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-200 transition-all duration-300 ease-out hover:border-white/50 hover:text-white">
                  ${icon('phone', 'h-3.5 w-3.5')} Call the shop
                </a>
              </div>
            </div>

            <div class="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm">
              <dl class="space-y-3.5">
                ${[
                  ['Dates', rangeLabel(featured)],
                  ['Hours', featured.hours],
                  ['Address', featured.address],
                  ['Included', featured.categories.join(' · ')],
                ].map(
                  ([k, v]) => html`<div class="flex items-start justify-between gap-3 border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
                    <dt class="text-[8.5px] uppercase tracking-[0.2em] text-stone-500">${k}</dt>
                    <dd class="max-w-[62%] text-right text-[11px] leading-snug text-stone-200">${v}</dd>
                  </div>`,
                )}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <!-- filter + grid -->
      <section class="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="inline-flex flex-wrap gap-1 rounded-full bg-stone-200/50 p-1">
            ${CITIES.map(
              (c) => html`<button
                type="button"
                data-action="sale-city"
                data-city="${c}"
                class="rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] transition-all duration-300 ease-out ${city === c ? 'bg-white text-zinc-900 shadow-sm shadow-stone-300/60' : 'text-stone-500 hover:text-zinc-800'}"
              >
                ${c}
              </button>`,
            )}
          </div>
          <p class="text-[10px] uppercase tracking-[0.16em] text-stone-400">${sales.length} ${sales.length === 1 ? 'sale' : 'sales'} listed</p>
        </div>

        <div class="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          ${sales.map((sale) => saleCard(sale))}
        </div>
      </section>

      <!-- how it works -->
      <section class="mx-auto max-w-[1440px] px-5 pb-8 lg:px-10">
        <div class="grid gap-4 rounded-[32px] bg-white p-8 shadow-xl shadow-stone-200/40 sm:p-10 lg:grid-cols-3">
          ${[
            { n: '01', t: 'Check the dates', d: 'Each sale runs for three days only. The discount applies to everything listed, not a selection.' },
            { n: '02', t: 'Walk in', d: 'No ticket, no booking. Show up during opening hours at the address on the card.' },
            { n: '03', t: 'Pay at the counter', d: 'Cash, card or cheque — each shop decides. Prices are already reduced, nothing to scan.' },
          ].map(
            (s) => html`<div class="flex gap-4">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100 font-display text-[15px] text-stone-500">${s.n}</span>
              <div>
                <p class="text-[12.5px] font-medium text-zinc-900">${s.t}</p>
                <p class="mt-1 text-[11px] leading-relaxed text-stone-500">${s.d}</p>
              </div>
            </div>`,
          )}
        </div>
      </section>

      <!-- partner cta -->
      <section class="mx-auto max-w-[1440px] px-5 pb-16 lg:px-10">
        <div class="flex flex-col gap-5 rounded-[28px] bg-zinc-900 p-7 text-stone-200 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-xl">
            <p class="flex items-center gap-2 text-[9px] uppercase tracking-[0.24em] text-stone-500">${icon('tag', 'h-3.5 w-3.5')} For shop owners</p>
            <p class="mt-2.5 font-display text-[clamp(1.35rem,2.4vw,1.85rem)] font-light leading-tight text-white">Run a sale with us</p>
            <p class="mt-2 text-[12px] leading-relaxed text-stone-400">
              We list partner sales for free: the dates, the address, the discount and what is included.
              Six slots a season, anywhere in Tunisia.
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2.5">
            <button type="button" data-action="toggle-chat" class="rounded-full bg-stone-50 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-900 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-stone-950/40">
              Talk to the studio
            </button>
            <a href="mailto:${BRAND.email}" class="rounded-full border border-white/25 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/50 hover:text-white">
              Email us
            </a>
          </div>
        </div>
      </section>
    </div>`;
}
