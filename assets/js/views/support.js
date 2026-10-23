/** Support portal: channels, FAQ accordion, condition rubric, shipping matrix, contact. */
import { html } from '../core/dom.js';
import { icon, BTN, FIELD, LABEL } from '../components/ui.js';
import { money } from '../core/format.js';
import { FAQS, SUPPORT_CHANNELS, SHIPPING_ZONES, BRAND } from '../data/content.js';
import { CONDITIONS } from '../data/catalog.js';

function channels() {
  return html`
    <div class="grid gap-3 sm:grid-cols-3">
      ${SUPPORT_CHANNELS.map(
        (channel) => html`
          <button
            type="button"
            ${channel.action === 'chat' ? 'data-action="toggle-chat"' : ''}
            class="group flex flex-col rounded-[24px] bg-white p-6 text-left shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-300/50"
          >
            <span class="grid h-11 w-11 place-items-center rounded-full bg-stone-100 text-stone-500 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-stone-50">
              ${icon(channel.action === 'chat' ? 'chat' : channel.action === 'email' ? 'mail' : 'phone', 'h-[18px] w-[18px]')}
            </span>
            <span class="mt-4 text-[13px] font-medium text-zinc-900">${channel.title}</span>
            <span class="mt-1 text-[11.5px] text-stone-500">${channel.detail}</span>
            <span class="mt-3 flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-stone-400">
              ${channel.meta} ${icon('arrowUpRight', 'h-3 w-3')}
            </span>
          </button>`,
      )}
    </div>`;
}

function faqList(state) {
  return html`
    <div class="divide-y divide-stone-200/70">
      ${FAQS.map(
        (faq, i) => html`
          <details class="group py-1" ${i === (state.ui.openFaq ?? 0) ? 'open' : ''}>
            <summary class="flex cursor-pointer list-none items-start justify-between gap-5 py-5">
              <span class="flex items-start gap-4">
                <span class="mt-0.5 rounded-full bg-stone-100 px-2.5 py-1 text-[8.5px] font-medium uppercase tracking-[0.14em] text-stone-500">${faq.tag}</span>
                <span class="text-[14px] font-medium leading-snug text-zinc-900 transition-colors duration-300 group-hover:text-clay-700">${faq.q}</span>
              </span>
              <span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-500 transition-all duration-300 group-open:rotate-45 group-open:bg-zinc-900 group-open:text-stone-50">
                ${icon('plus', 'h-3.5 w-3.5')}
              </span>
            </summary>
            <div class="pb-6 pl-0 sm:pl-[4.5rem]">
              <p class="max-w-2xl text-[12.5px] leading-[1.85] text-stone-500">${faq.a}</p>
            </div>
          </details>`,
      )}
    </div>`;
}

function conditionTable() {
  return html`
    <div class="overflow-hidden rounded-[26px] bg-white shadow-xl shadow-stone-200/40">
      <div class="grid grid-cols-[auto_1fr_1fr] gap-4 border-b border-stone-100 px-5 py-3.5 text-[8.5px] uppercase tracking-[0.18em] text-stone-400 sm:px-7">
        <span>Grade</span><span>Meaning</span><span class="hidden sm:block">What you will see</span>
      </div>
      ${CONDITIONS.map(
        (c, i) => html`
          <div class="grid grid-cols-[auto_1fr] gap-4 px-5 py-4 sm:grid-cols-[auto_1fr_1fr] sm:px-7 ${i < CONDITIONS.length - 1 ? 'border-b border-stone-100' : ''}">
            <span class="inline-flex h-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.14em] ${c.tone}">${c.label}</span>
            <p class="text-[11.5px] leading-relaxed text-stone-600">${c.blurb}</p>
            <p class="col-span-2 text-[11px] leading-relaxed text-stone-400 sm:col-span-1">
              ${c.id === 'Vault' ? 'Original tags where they survive, deadstock hardware, no fibre stress.' : c.id === 'Excellent' ? 'Faint fading at cuffs and collars, no thinning, no repairs.' : 'Documented abrasion, softened hems, honest patina — photographed.'}
            </p>
          </div>`,
      )}
    </div>`;
}

function shippingTable() {
  return html`
    <div class="overflow-hidden rounded-[26px] bg-white shadow-xl shadow-stone-200/40">
      <div class="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 border-b border-stone-100 px-6 py-3.5 text-[8.5px] uppercase tracking-[0.18em] text-stone-400 sm:grid">
        <span>Destination</span><span>Courier</span><span>Estimate</span><span class="text-right">Cost</span>
      </div>
      ${SHIPPING_ZONES.map(
        (zone, i) => html`
          <div class="grid grid-cols-2 gap-2 px-5 py-3.5 sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr] sm:items-center sm:gap-4 sm:px-6 ${i < SHIPPING_ZONES.length - 1 ? 'border-b border-stone-100' : ''}">
            <p class="text-[11.5px] font-medium text-zinc-900">${zone.country}</p>
            <p class="text-[11px] text-stone-500">${zone.courier}</p>
            <p class="text-[11px] tabular-nums text-stone-500">${zone.min}–${zone.max} days</p>
            <p class="text-[11px] tabular-nums sm:text-right ${zone.rate === 0 ? 'text-emerald-700' : 'text-zinc-900'}">
              ${zone.rate === 0 ? 'Complimentary' : money(zone.rate)}
            </p>
          </div>`,
      )}
    </div>`;
}

export function renderSupport(state) {
  return html`
    <div class="fade-in">
      <section class="relative overflow-hidden">
        <div class="pointer-events-none absolute -right-24 top-4 h-[360px] w-[360px] rounded-full bg-stone-200/50 blur-[120px]"></div>
        <div class="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-14">
          <nav class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
            <a href="#/home" class="transition-colors duration-300 hover:text-zinc-900">Home</a>
            <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
            <span class="text-zinc-700">Support</span>
          </nav>

          <div class="mt-7 max-w-2xl">
            <p class="mb-4 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>The studio desk</p>
            <h1 class="font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-light leading-[1.0] tracking-[-0.03em] text-zinc-900">
              Real people,<br class="hidden sm:block" /> quick answers.
            </h1>
            <p class="mt-5 max-w-lg text-[13.5px] leading-relaxed text-stone-500">
              Two of us run the desk. Ask about a measurement, a delivery, a repair — or a piece you saw
              last month and still think about.
            </p>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-[1440px] px-5 pt-9 lg:px-10">
        ${channels()}
      </section>

      <!-- FAQ -->
      <section class="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16">
        <div class="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div class="lg:sticky lg:top-28 lg:self-start">
            <p class="mb-3 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>FAQ</p>
            <h2 class="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-light leading-[1.06] tracking-[-0.02em] text-zinc-900">Everything we get asked.</h2>
            <p class="mt-4 max-w-sm text-[12.5px] leading-relaxed text-stone-500">
              Eight questions cover almost every message that reaches the desk. If yours is not here, the
              chat widget answers instantly and hands off to a human when needed.
            </p>
            <button type="button" data-action="toggle-chat" class="${BTN.primary} mt-6">
              ${icon('chat', 'h-3.5 w-3.5')} Talk to Wren
            </button>
            <div class="mt-8 space-y-2.5 rounded-[24px] bg-white p-5 shadow-xl shadow-stone-200/40">
              <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400">Studio hours</p>
              <p class="text-[11.5px] text-zinc-900">Mon–Fri · 10:00–18:00 ET</p>
              <p class="text-[11.5px] text-zinc-900">Sat · 11:00–16:00 ET</p>
              <p class="border-t border-stone-100 pt-2.5 text-[10.5px] text-stone-400">${BRAND.email}</p>
            </div>
          </div>
          <div class="rounded-[28px] bg-white px-6 shadow-xl shadow-stone-200/40 sm:px-8">
            ${faqList(state)}
          </div>
        </div>
      </section>

      <!-- condition rubric -->
      <section class="bg-stone-100/50 py-12 lg:py-16">
        <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="mb-3 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>Grading</p>
              <h2 class="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-light leading-tight tracking-tight text-zinc-900">The condition rubric</h2>
            </div>
            <p class="max-w-sm text-[11.5px] leading-relaxed text-stone-500">40 points, two inspectors, one verdict. Anything below Good never reaches the floor.</p>
          </div>
          <div class="mt-8">${conditionTable()}</div>
        </div>
      </section>

      <!-- shipping matrix -->
      <section class="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mb-3 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-400"><span class="h-px w-8 bg-stone-300"></span>Delivery</p>
            <h2 class="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-light leading-tight tracking-tight text-zinc-900">Where we ship, and how fast</h2>
          </div>
          <a href="#/catalog" class="${BTN.link}">Start an order ${icon('arrowUpRight', 'h-3 w-3')}</a>
        </div>
        <div class="mt-8">${shippingTable()}</div>
        <p class="mt-4 flex items-center gap-2 text-[10.5px] text-stone-400">${icon('leaf', 'h-3.5 w-3.5')} All parcels are carbon-neutral. Duties and taxes are shown before you pay — never on arrival.</p>
      </section>

      <!-- contact form -->
      <section class="mx-auto max-w-[1440px] px-5 pb-16 lg:px-10">
        <div class="grid gap-8 overflow-hidden rounded-[32px] bg-white p-8 shadow-xl shadow-stone-200/40 sm:p-10 lg:grid-cols-[1fr_1fr] lg:p-12">
          <div>
            <p class="text-[9.5px] uppercase tracking-[0.26em] text-stone-400">Write to the studio</p>
            <h2 class="mt-4 font-display text-[clamp(1.6rem,2.8vw,2.2rem)] font-light leading-tight tracking-tight text-zinc-900">Tell us what you need.</h2>
            <p class="mt-4 max-w-sm text-[12.5px] leading-relaxed text-stone-500">
              Include an order number if you have one. We reply within one business day — usually the same
              morning, with a person's name at the bottom.
            </p>
            <ul class="mt-6 space-y-2.5 text-[11.5px] text-stone-600">
              <li class="flex items-center gap-2.5">${icon('mail', 'h-3.5 w-3.5 text-stone-400')} ${BRAND.email}</li>
              <li class="flex items-center gap-2.5">${icon('phone', 'h-3.5 w-3.5 text-stone-400')} ${BRAND.phone}</li>
              <li class="flex items-center gap-2.5">${icon('pin', 'h-3.5 w-3.5 text-stone-400')} ${BRAND.city}</li>
            </ul>
          </div>

          <form data-form="contact" class="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label class="${LABEL} mb-2" for="c-name">Name</label>
              <input id="c-name" name="name" required placeholder="Amelia Hart" class="${FIELD}" />
            </div>
            <div>
              <label class="${LABEL} mb-2" for="c-email">Email</label>
              <input id="c-email" name="email" type="email" required placeholder="you@studio.com" class="${FIELD}" />
            </div>
            <div class="sm:col-span-2">
              <label class="${LABEL} mb-2" for="c-topic">Topic</label>
              <div class="relative">
                <select id="c-topic" name="topic" class="appearance-none ${FIELD} pr-10">
                  <option>Order or delivery</option>
                  <option>Sizing & measurements</option>
                  <option>Condition or authentication</option>
                  <option>Returns & exchanges</option>
                  <option>Events & partnerships</option>
                </select>
                <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">${icon('chevronDown', 'h-3.5 w-3.5')}</span>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="${LABEL} mb-2" for="c-message">Message</label>
              <textarea id="c-message" name="message" rows="4" required placeholder="Tell us the piece, the size, and what you are wondering…" class="${FIELD} resize-none"></textarea>
            </div>
            <div class="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <p class="text-[10px] text-stone-400">Mock form — nothing is sent.</p>
              <button type="submit" class="${BTN.primary}">Send message ${icon('send', 'h-3.5 w-3.5')}</button>
            </div>
          </form>
        </div>
      </section>
    </div>`;
}
