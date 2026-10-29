/** Checkout: single-page demo checkout with delivery address and Card / Cash on Delivery payment. */
import { html } from '../core/dom.js';
import { icon, BTN, FIELD, LABEL } from '../components/ui.js';
import { money, date } from '../core/format.js';
import { GOVERNORATES, img } from '../data/content.js';
import { computeTotals, zoneFor } from '../core/state.js';

function addBusinessDays(days) {
  const d = new Date();
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added += 1;
  }
  return d;
}

const short = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function etaRange(zone) {
  return `${short(addBusinessDays(zone.min))} — ${short(addBusinessDays(zone.max))}`;
}

const paymentLabel = (method) =>
  method === 'cod' ? 'Cash on delivery (pay courier)' : 'Bank card · Demo (4242)';

/* ------------------------------------------------------------------ *
 * Sidebar
 * ------------------------------------------------------------------ */
export function summaryPanel(state, totals) {
  const { checkout } = state.ui;
  const applied = totals.coupon;

  return html`
    <div id="checkout-summary" class="space-y-4">
      <div class="border border-ink/15 bg-paper">
        <div class="flex items-baseline justify-between border-b border-ink/10 px-5 py-4">
          <h2 class="font-display text-[21px] leading-none text-ink">Order summary</h2>
          <span class="font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink/45">${totals.units} ${totals.units === 1 ? 'piece' : 'pieces'}</span>
        </div>

        <ul class="divide-y divide-ink/10 px-5">
          ${totals.lines.map(
            (line) => html`<li class="flex items-center gap-3 py-4">
              <span class="relative h-[68px] w-[54px] shrink-0 overflow-hidden border border-ink/10 bg-stone-100">
                <img src="${img(line.product.images[0])}" alt="${line.product.title}" data-fallback="" class="h-full w-full object-cover" />
                <span class="absolute right-0 top-0 grid h-4 min-w-4 place-items-center bg-ink px-1 font-mono text-[8px] text-bone">${line.qty}</span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-display text-[15px] leading-tight text-ink">${line.product.shortTitle}</span>
                <span class="mt-1 block font-mono text-[8.5px] uppercase tracking-[0.12em] text-ink/45">Size ${line.product.size} · ${line.product.condition}</span>
              </span>
              <span class="shrink-0 font-mono text-[11px] tabular-nums text-ink">${money(line.product.price * line.qty)}</span>
            </li>`,
          )}
        </ul>

        <!-- coupon -->
        <div class="border-t border-ink/10 px-5 py-4">
          <label class="${LABEL} mb-2" for="coupon">Promotion code</label>
          ${applied
            ? html`<div class="flex items-center justify-between gap-2 border border-emerald-700/25 bg-emerald-50 px-3 py-2.5">
                <div class="min-w-0">
                  <p class="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-emerald-900">${icon('tag', 'h-3.5 w-3.5')} ${applied.code}</p>
                  <p class="mt-1 truncate text-[10px] text-emerald-800/80">${applied.blurb}</p>
                </div>
                <button type="button" data-action="remove-coupon" class="shrink-0 p-1 text-emerald-800/60 transition-colors hover:text-emerald-900" aria-label="Remove coupon">${icon('close', 'h-3.5 w-3.5')}</button>
              </div>`
            : html`<div class="flex gap-2">
                <input id="coupon" type="text" placeholder="WELCOME10" value="${checkout.couponError ? checkout.coupon : ''}" data-coupon-input class="field field--mono !py-2.5 uppercase" />
                <button type="button" data-action="apply-coupon" class="btn btn--solid btn--sm shrink-0">Apply</button>
              </div>`}
          ${checkout.couponError ? html`<p class="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-clay-700">${icon('info', 'h-3 w-3')} ${checkout.couponError}</p>` : ''}
          ${!applied ? html`<p class="mt-2 font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink/35">Try <button type="button" data-action="try-coupon" data-code="WELCOME10" class="underline decoration-dotted underline-offset-2 transition hover:text-ink">WELCOME10</button> · <button type="button" data-action="try-coupon" data-code="VAULT25" class="underline decoration-dotted underline-offset-2 transition hover:text-ink">VAULT25</button> · <button type="button" data-action="try-coupon" data-code="FREESHIP" class="underline decoration-dotted underline-offset-2 transition hover:text-ink">FREESHIP</button></p>` : ''}
        </div>

        <dl class="space-y-2 border-t border-ink/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.06em]">
          <div class="flex justify-between"><dt class="text-ink/45">Subtotal</dt><dd class="tabular-nums text-ink">${money(totals.subtotal)}</dd></div>
          ${totals.discount > 0
            ? html`<div class="flex justify-between"><dt class="text-emerald-800">Discount · ${applied?.code}</dt><dd class="tabular-nums text-emerald-800">−${money(totals.discount)}</dd></div>`
            : ''}
          <div class="flex justify-between"><dt class="text-ink/45">Shipping · ${totals.zone.courier}</dt><dd class="tabular-nums ${totals.freeShipping ? 'text-emerald-800' : 'text-ink'}">${totals.freeShipping ? 'Free' : money(totals.shipping)}</dd></div>
          <div class="flex justify-between"><dt class="text-ink/45">TVA · ${(totals.taxRate * 100).toFixed(totals.taxRate * 100 % 1 === 0 ? 0 : 2)}%</dt><dd class="tabular-nums text-ink">${money(totals.tax)}</dd></div>
          <div class="flex justify-between"><dt class="text-ink/45">Payment</dt><dd class="text-right text-[9px] text-ink">${checkout.payment === 'cod' ? 'Cash on delivery' : 'Bank card (Demo)'}</dd></div>
          <div class="mt-3 flex items-baseline justify-between border-t border-ink/15 pt-3.5">
            <dt class="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink">Total</dt>
            <dd class="font-display text-[30px] leading-none tracking-tight text-ink">${money(totals.total)}</dd>
          </div>
        </dl>

        ${totals.savings > 0
          ? html`<p class="mx-5 mb-5 flex items-center gap-1.5 border border-brass/40 bg-amber-50 px-3 py-2 font-mono text-[8.5px] uppercase tracking-[0.1em] text-amber-900">${icon('sparkle', 'h-3 w-3 text-brass')} You are saving ${money(totals.savings + totals.discount)} against retail.</p>`
          : ''}
      </div>

      <div class="border border-dashed border-ink/20 p-5">
        <p class="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink/45">${icon('shield', 'h-3.5 w-3.5')} Demo checkout</p>
        <ul class="mt-3 space-y-2 text-[10.5px] text-stone-500">
          <li class="flex items-start gap-2">${icon('check', 'h-3 w-3 mt-0.5 text-emerald-700')} Enter any delivery address in Tunisia</li>
          <li class="flex items-start gap-2">${icon('check', 'h-3 w-3 mt-0.5 text-emerald-700')} Choose Cash on Delivery or Demo Card</li>
          <li class="flex items-start gap-2">${icon('check', 'h-3 w-3 mt-0.5 text-emerald-700')} Simulated order — nothing is actually charged</li>
        </ul>
      </div>
    </div>`;
}


function checkoutForm(state, totals) {
  const s = state.ui.checkout.shipping;
  const zone = zoneFor(s.gov);
  const base = computeTotals({ gov: s.gov, couponCode: state.ui.checkout.coupon, express: false });
  const expressRate = totals.expressRate;
  const method = state.ui.checkout.payment === 'cod' ? 'cod' : 'card';

  return html`
    <div class="space-y-9">
      <!-- 1. Delivery address -->
      <div>
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">Step 1 · Delivery address</p>
            <h2 class="mt-1 font-display text-[24px] font-light tracking-tight text-zinc-900">Where should it go?</h2>
          </div>
          <button
            type="button"
            data-action="fill-address"
            class="btn btn--line btn--sm"
          >
            ${icon('sparkle', 'h-3 w-3')} Fill demo address
          </button>
        </div>
        <p class="mt-1.5 text-[12px] text-stone-500">Enter your delivery details below — shipping updates automatically by governorate.</p>

        <div class="mt-5 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label class="${LABEL} mb-1.5" for="f-name">Full name</label>
            <input id="f-name" data-field="name" data-required="Full name" type="text" autocomplete="name" placeholder="Amira Ben Salah" value="${s.name || state.user?.name || ''}" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-1.5" for="f-phone">Phone number</label>
            <input id="f-phone" data-field="phone" type="tel" autocomplete="tel" placeholder="+216 98 123 456" value="${s.phone || ''}" class="${FIELD}" />
          </div>
          <div class="sm:col-span-2">
            <label class="${LABEL} mb-1.5" for="f-line1">Street address</label>
            <input id="f-line1" data-field="line1" data-required="Address" type="text" autocomplete="address-line1" placeholder="14 Avenue Habib Bourguiba, Appt 3B" value="${s.line1 || ''}" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-1.5" for="f-city">City</label>
            <input id="f-city" data-field="city" data-required="City" type="text" autocomplete="address-level2" placeholder="La Marsa" value="${s.city || ''}" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-1.5" for="f-gov">Governorate</label>
            <div class="relative">
              <select id="f-gov" data-field="gov" data-action="country" class="appearance-none ${FIELD} pr-10">
                ${GOVERNORATES.map((g) => html`<option value="${g.code}" ${g.code === s.gov ? 'selected' : ''}>${g.name}</option>`)}
              </select>
              <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">${icon('chevronDown', 'h-3.5 w-3.5')}</span>
            </div>
          </div>
          <div>
            <label class="${LABEL} mb-1.5" for="f-postal">Postal code <span class="normal-case tracking-normal text-stone-400">(optional)</span></label>
            <input id="f-postal" data-field="postal" type="text" autocomplete="postal-code" placeholder="2078" value="${s.postal || ''}" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-1.5" for="f-email">Email <span class="normal-case tracking-normal text-stone-400">(optional)</span></label>
            <input id="f-email" data-field="email" type="text" autocomplete="email" placeholder="you@example.tn" value="${s.email || state.user?.email || ''}" class="${FIELD}" />
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-stone-100/70 px-5 py-3.5">
          <div>
            <p class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-500">${icon('truck', 'h-3.5 w-3.5')} ${zone.courier} · ${zone.name}</p>
            <p class="mt-0.5 text-[11.5px] text-zinc-900">Estimated arrival: ${etaRange(zone)} <span class="text-stone-400">(${zone.min}–${zone.max} working days)</span></p>
          </div>
          <span class="rounded-full bg-white px-3.5 py-1.5 text-[10px] uppercase tracking-[0.14em] ${totals.freeShipping ? 'text-emerald-700' : 'text-zinc-800'} shadow-sm">
            ${totals.freeShipping ? 'Free delivery' : money(totals.shipping)}
          </span>
        </div>
      </div>

      <!-- 2. Delivery speed -->
      <div class="border-t border-stone-100 pt-7">
        <p class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">Step 2 · Delivery speed</p>
        <h2 class="mt-1 font-display text-[21px] font-light tracking-tight text-zinc-900">Choose your delivery</h2>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          ${[
            {
              id: 'standard',
              title: zone.courier,
              detail: `${zone.min}–${zone.max} working days`,
              eta: etaRange(zone),
              price: base.freeShipping ? 'Free' : money(base.shipping),
              active: !state.ui.checkout.express,
              value: 'standard',
            },
            {
              id: 'express',
              title: `${zone.courier} · Express`,
              detail: 'Dispatched within 12 hours',
              eta: `${short(addBusinessDays(1))} — ${short(addBusinessDays(2))}`,
              price: `+${money(expressRate)}`,
              active: !!state.ui.checkout.express,
              value: 'express',
            },
          ].map(
            (option) => html`
              <button
                type="button"
                data-action="express"
                data-value="${option.value}"
                class="group flex w-full items-center gap-3.5 rounded-[20px] px-4 py-3.5 text-left transition-all duration-200 ease-out ${option.active ? 'bg-white ring-2 ring-zinc-900 shadow-md shadow-stone-300/40' : 'bg-stone-50/80 hover:bg-white hover:shadow-sm'}"
              >
                <span class="grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${option.active ? 'border-zinc-900' : 'border-stone-300'}">
                  <span class="h-2 w-2 rounded-full ${option.active ? 'bg-zinc-900' : 'bg-transparent'}"></span>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-[12px] font-medium text-zinc-900">${option.title}</span>
                  <span class="mt-0.5 block text-[10.5px] text-stone-500">${option.detail} · ${option.eta}</span>
                </span>
                <span class="shrink-0 text-[11.5px] font-medium ${option.price === 'Free' ? 'text-emerald-700' : 'text-zinc-900'}">${option.price}</span>
              </button>`,
          )}
        </div>
      </div>

      <!-- 3. Payment method (Card or Cash on delivery — Demo) -->
      <div class="border-t border-stone-100 pt-7">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-[9.5px] font-medium uppercase tracking-[0.22em] text-stone-400">Step 3 · Payment method</p>
            <h2 class="mt-1 font-display text-[24px] font-light tracking-tight text-zinc-900">Payment</h2>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[9.5px] font-medium uppercase tracking-[0.14em] text-amber-900">
            ${icon('sparkle', 'h-3 w-3')} Demo mode — no real charge
          </span>
        </div>
        <p class="mt-1.5 text-[12px] text-stone-500">Select <strong>Cash on delivery</strong> or <strong>Bank card</strong> below. This is a simulation — no actual payment is processed.</p>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          ${[
            {
              id: 'cod',
              label: 'Cash on delivery',
              icon: 'truck',
              note: 'Pay the courier in cash (DT) upon delivery',
            },
            {
              id: 'card',
              label: 'Bank card (Demo)',
              icon: 'lock',
              note: 'Carte bancaire / e-DINAR · simulated',
            },
          ].map(
            (m) => html`
              <button
                type="button"
                data-action="payment"
                data-value="${m.id}"
                class="flex items-start gap-3.5 rounded-[22px] p-4 text-left transition-all duration-200 ease-out ${method === m.id ? 'bg-white ring-2 ring-zinc-900 shadow-lg shadow-stone-300/40' : 'bg-stone-50/80 hover:bg-white hover:shadow-sm'}"
              >
                <span class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${method === m.id ? 'bg-zinc-900 text-stone-50' : 'bg-stone-200/70 text-stone-600'}">
                  ${icon(m.icon, 'h-4 w-4')}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-2">
                    <span class="text-[13px] font-medium text-zinc-900">${m.label}</span>
                    <span class="grid h-4 w-4 place-items-center rounded-full border-2 ${method === m.id ? 'border-zinc-900' : 'border-stone-300'}">
                      <span class="h-2 w-2 rounded-full ${method === m.id ? 'bg-zinc-900' : 'bg-transparent'}"></span>
                    </span>
                  </span>
                  <span class="mt-1 block text-[11px] leading-snug text-stone-500">${m.note}</span>
                </span>
              </button>`,
          )}
        </div>

        ${method === 'card'
          ? html`
              <div class="mt-4 rounded-[22px] border border-stone-200/80 bg-stone-50/70 p-5">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span class="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Demo card details (pre-filled for testing)</span>
                  <button type="button" data-action="fill-card" class="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-clay-700 underline-offset-4 transition hover:text-zinc-900 hover:underline">
                    ${icon('sparkle', 'h-3 w-3')} Reset demo card
                  </button>
                </div>
                <div class="grid gap-3.5 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label class="${LABEL} mb-1.5" for="f-card">Card number</label>
                    <input id="f-card" inputmode="numeric" value="4242 4242 4242 4242" placeholder="4242 4242 4242 4242" class="${FIELD} !bg-white tracking-[0.08em]" />
                  </div>
                  <div>
                    <label class="${LABEL} mb-1.5" for="f-exp">Expiry</label>
                    <input id="f-exp" value="04 / 29" placeholder="MM / YY" class="${FIELD} !bg-white" />
                  </div>
                  <div>
                    <label class="${LABEL} mb-1.5" for="f-cvc">CVC</label>
                    <input id="f-cvc" inputmode="numeric" value="123" placeholder="123" class="${FIELD} !bg-white" />
                  </div>
                </div>
              </div>`
          : html`
              <div class="mt-4 flex items-center gap-4 rounded-[22px] border border-emerald-200/70 bg-emerald-50/50 p-4">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800">${icon('check', 'h-5 w-5')}</span>
                <div>
                  <p class="text-[12.5px] font-medium text-zinc-900">Cash on delivery selected — ${money(totals.total)} due on arrival</p>
                  <p class="mt-0.5 text-[11px] text-stone-600">No advance payment needed. You pay the ${zone.courier} courier in dinars when your package arrives.</p>
                </div>
              </div>`}
      </div>

      <!-- Place order CTA -->
      <div class="border-t border-stone-100 pt-6">
        <button type="button" data-action="place-order" class="${BTN.primary} w-full !py-4 !text-[12px]">
          ${icon('checkCircle', 'h-4 w-4')} Place demo order · ${money(totals.total)} (${method === 'cod' ? 'Cash on delivery' : 'Demo card'})
        </button>
        <p class="mt-3 text-center text-[10.5px] text-stone-400">
          Onelast look: delivering to <span class="text-zinc-700">${s.city || zone.name}</span> via <span class="text-zinc-700">${zone.courier}</span>. Demo checkout — no real money is charged.
        </p>
      </div>
    </div>`;
}

function stepConfirmed(state, totals) {
  const order = state.ui.checkout.placedOrder;
  if (!order) return '';
  const zone = zoneFor(order.shipping.gov);
  const payText = paymentLabel(order.payment);
  return html`
    <div class="text-center">
      <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
        ${icon('check', 'h-7 w-7')}
      </span>
      <p class="mt-4 text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-700">Demo order confirmed</p>
      <h2 class="mt-2 font-display text-[30px] font-light tracking-tight text-zinc-900">It is yours.</h2>
      <p class="mx-auto mt-3 max-w-md text-[12.5px] leading-relaxed text-stone-500">
        Order <span class="font-medium text-zinc-900">${order.id}</span> has been recorded for
        <span class="font-medium text-zinc-900">${order.shipping.name}</span> (${order.shipping.line1}, ${order.shipping.city}).
      </p>

      <div class="mt-7 grid gap-2.5 text-left sm:grid-cols-3">
        ${[
          { k: 'Order ID', v: order.id },
          { k: 'Payment method', v: payText },
          { k: 'Delivery', v: `${zone.courier} (${etaRange(zone)})` },
        ].map(
          (d) => html`<div class="rounded-2xl bg-stone-50 px-4 py-3.5">
            <p class="text-[8.5px] uppercase tracking-[0.2em] text-stone-400">${d.k}</p>
            <p class="mt-1 text-[11.5px] font-medium text-zinc-900">${d.v}</p>
          </div>`,
        )}
      </div>

      <div class="mt-4 rounded-[22px] bg-stone-50 p-5 text-left">
        <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400">Delivery address</p>
        <p class="mt-1.5 text-[12px] text-zinc-900">
          ${order.shipping.name}${order.shipping.phone ? ` · ${order.shipping.phone}` : ''}<br />
          ${order.shipping.line1}<br />
          ${order.shipping.city}${order.shipping.postal ? ` ${order.shipping.postal}` : ''} · ${zone.name}, Tunisia
        </p>
      </div>

      <div class="mt-4 rounded-[22px] bg-stone-50 p-5 text-left">
        <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400">Tracking</p>
        <ol class="mt-4 space-y-4">
          ${order.steps.map(
            (step, i) => html`<li class="relative flex gap-3.5">
              <span class="relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] ${step.done ? 'bg-emerald-600 text-white' : 'bg-white text-stone-400'}">
                ${step.done ? icon('check', 'h-3 w-3') : i + 1}
              </span>
              ${i < order.steps.length - 1 ? html`<span class="absolute left-3 top-6 h-full w-px ${step.done ? 'bg-emerald-200' : 'bg-stone-200'}"></span>` : ''}
              <span class="pb-1">
                <span class="block text-[11.5px] ${step.done ? 'text-zinc-900' : 'text-stone-400'}">${step.label}</span>
                <span class="block text-[10px] text-stone-400">${step.at ? date(step.at) : 'Pending'}</span>
              </span>
            </li>`,
          )}
        </ol>
      </div>

      <div class="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <a href="#/account?tab=orders" data-action="reset-checkout" class="${BTN.primary} flex-1">View in order history ${icon('arrowRight', 'h-3.5 w-3.5')}</a>
        <a href="#/catalog" data-action="reset-checkout" class="${BTN.ghost} flex-1">Keep browsing</a>
      </div>
    </div>`;
}

export function renderCheckout(state) {
  const { checkout } = state.ui;
  const totals = computeTotals({
    gov: checkout.shipping.gov,
    couponCode: checkout.coupon,
    express: !!checkout.express,
  });
  const step = checkout.step;

  if (!totals.lines.length && !checkout.placedOrder) {
    return html`
      <div class="fade-in mx-auto max-w-[1440px] px-5 py-20 lg:px-10 lg:py-28">
        <div class="mx-auto max-w-lg rounded-[32px] bg-white px-10 py-16 text-center shadow-xl shadow-stone-200/40">
          <span class="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-stone-100 text-stone-400">${icon('bag', 'h-7 w-7')}</span>
          <h1 class="font-display text-3xl font-light tracking-tight text-zinc-900">Nothing to check out</h1>
          <p class="mt-3 text-[13px] leading-relaxed text-stone-500">Your bag is empty. The floor turns over weekly — start with what just landed.</p>
          <a href="#/catalog" class="${BTN.primary} mt-8">Browse the floor ${icon('arrowRight', 'h-3.5 w-3.5')}</a>
        </div>
      </div>`;
  }

  return html`
    <div class="fade-in">
      <section class="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-12">
        <nav class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
          <a href="#/catalog" class="transition-colors duration-300 hover:text-zinc-900">The floor</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <span class="text-zinc-700">Checkout</span>
        </nav>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="font-display text-[clamp(2rem,3.8vw,3rem)] font-light leading-[1.04] tracking-[-0.03em] text-zinc-900">Checkout</h1>
            <p class="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400">
              ${icon('lock', 'h-3 w-3')} Demo environment · enter your address & choose Card or Cash on Delivery
            </p>
          </div>
          <a href="#/catalog" class="${BTN.ghost} !py-2.5 !px-5 w-fit">${icon('arrowLeft', 'h-3.5 w-3.5')} Keep shopping</a>
        </div>
      </section>

      <section class="mx-auto max-w-[1440px] px-5 py-9 lg:px-10 lg:py-12">
        <div class="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
          <div class="border border-ink/15 bg-paper p-6 sm:p-8 lg:p-10">
            <div data-step-error class="mb-6 hidden items-center justify-between gap-3 rounded-2xl bg-clay-50 px-4 py-3 text-[11.5px] text-clay-800"></div>
            ${step >= 5 && checkout.placedOrder ? stepConfirmed(state, totals) : checkoutForm(state, totals)}
          </div>

          <aside class="lg:sticky lg:top-28 lg:self-start">${summaryPanel(state, totals)}</aside>
        </div>
      </section>
    </div>`;
}
