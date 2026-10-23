/** Account dashboard: profile, order ledger with receipts, wallet. */
import { html } from '../core/dom.js';
import { icon, BTN, FIELD, LABEL, emptyState } from '../components/ui.js';
import { money, date, initials } from '../core/format.js';
import { VOUCHERS, REWARD_TIERS, SEED_ORDERS } from '../data/content.js';
import { byId, img } from '../data/catalog.js';
import { zoneFor } from '../core/state.js';

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'orders', label: 'Orders', icon: 'bag' },
  { id: 'wallet', label: 'Wallet', icon: 'tag' },
];

const VOUCHER_TONE = {
  amber: 'from-amber-50 to-amber-100/60 text-amber-900',
  emerald: 'from-emerald-50 to-emerald-100/60 text-emerald-900',
  stone: 'from-stone-50 to-stone-100 text-stone-800',
  sky: 'from-sky-50 to-sky-100/60 text-sky-900',
};

function authGate() {
  return html`
    <div class="fade-in mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-24">
      <div class="mx-auto grid max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-xl shadow-stone-200/40 md:grid-cols-2">
        <div class="p-9 sm:p-12">
          <p class="text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">Account</p>
          <h1 class="mt-4 font-display text-[32px] font-light leading-tight tracking-tight text-zinc-900">Your archive, kept.</h1>
          <p class="mt-4 text-[13px] leading-relaxed text-stone-500">
            Sign in to see your vault, follow a delivery and spend the credits sitting in your wallet.
          </p>
          <button type="button" data-action="open-auth" class="${BTN.primary} mt-8">Sign in / Create account ${icon('arrowRight', 'h-3.5 w-3.5')}</button>
          <button type="button" data-action="demo-login" class="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-stone-400 underline-offset-4 transition hover:text-zinc-900 hover:underline">
            ${icon('sparkle', 'h-3 w-3')} Enter with the demo account
          </button>
        </div>
        <div class="relative hidden md:block">
          <img src="assets/img/1490481651871-ab68de25d43d.jpg" alt="" data-fallback="" class="absolute inset-0 h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent"></div>
          <p class="absolute inset-x-7 bottom-7 font-display text-[19px] font-light leading-snug text-stone-50">
            “It feels less like shopping and more like being let into someone’s archive.”
          </p>
        </div>
      </div>
    </div>`;
}

function profileTab(state) {
  const user = state.user;
  return html`
    <div class="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
      <div class="rounded-[28px] bg-white p-6 shadow-xl shadow-stone-200/40 sm:p-8">
        <div class="flex items-baseline justify-between">
          <h2 class="font-display text-[19px] tracking-tight text-zinc-900">Personal settings</h2>
          <span class="text-[9.5px] uppercase tracking-[0.16em] text-stone-400">Saved locally</span>
        </div>
        <form data-form="profile" class="mt-6 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label class="${LABEL} mb-2" for="p-name">Full name</label>
            <input id="p-name" name="name" value="${user.name}" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-2" for="p-email">Email</label>
            <input id="p-email" name="email" type="email" value="${user.email}" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-2" for="p-phone">Phone</label>
            <input id="p-phone" name="phone" value="${user.phone || ''}" placeholder="+1 718 555 0142" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-2" for="p-city">City</label>
            <input id="p-city" name="city" value="${user.address?.city || ''}" placeholder="Brooklyn" class="${FIELD}" />
          </div>
          <div class="sm:col-span-2">
            <label class="${LABEL} mb-2" for="p-line1">Default address</label>
            <input id="p-line1" name="line1" value="${user.address?.line1 || ''}" placeholder="218 Wythe Avenue" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-2" for="p-postal">Postal code</label>
            <input id="p-postal" name="postal" value="${user.address?.postal || ''}" placeholder="11249" class="${FIELD}" />
          </div>
          <div>
            <label class="${LABEL} mb-2" for="p-country">Country</label>
            <input id="p-country" name="country" value="${user.address?.country || 'US'}" class="${FIELD}" />
          </div>
          <div class="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
            <p class="text-[10px] text-stone-400">Changes apply to this device only.</p>
            <button type="submit" class="${BTN.primary} !px-6 !py-3">Save changes</button>
          </div>
        </form>
      </div>

      <div class="space-y-4">
        <div class="rounded-[28px] bg-white p-6 shadow-xl shadow-stone-200/40">
          <p class="text-[9.5px] uppercase tracking-[0.22em] text-stone-400">Membership</p>
          <div class="mt-4 flex items-center gap-3">
            <span class="grid h-12 w-12 place-items-center rounded-full bg-zinc-900 font-display text-[15px] text-stone-50">${initials(user.name)}</span>
            <div>
              <p class="text-[13px] font-medium text-zinc-900">${user.tier}</p>
              <p class="text-[10.5px] text-stone-400">Member since ${date(user.memberSince)}</p>
            </div>
          </div>
          <div class="mt-5 rounded-2xl bg-stone-50 px-4 py-3.5">
            <div class="flex items-baseline justify-between">
              <span class="text-[10px] uppercase tracking-[0.16em] text-stone-400">Reward points</span>
              <span class="font-display text-[17px] text-zinc-900">${user.points || 0}</span>
            </div>
            <div class="mt-2 h-1 overflow-hidden rounded-full bg-stone-200">
              <div class="h-full rounded-full bg-gradient-to-r from-zinc-900 to-stone-600" style="width:${Math.min(100, ((user.points || 0) / 1500) * 100)}%"></div>
            </div>
            <p class="mt-2 text-[10px] text-stone-400">${Math.max(0, 1500 - (user.points || 0))} points to Vault Keeper</p>
          </div>
        </div>

        <div class="rounded-[28px] bg-white p-6 shadow-xl shadow-stone-200/40">
          <p class="text-[9.5px] uppercase tracking-[0.22em] text-stone-400">Preferences</p>
          <label class="mt-4 flex cursor-pointer items-start gap-3">
            <input type="checkbox" ${state.newsletter ? 'checked' : ''} data-action="toggle-newsletter" class="mt-0.5 h-4 w-4 rounded border-stone-300 text-zinc-900 focus:ring-zinc-900/20" />
            <span>
              <span class="block text-[11.5px] text-zinc-900">The Rail newsletter</span>
              <span class="block text-[10px] text-stone-400">One email per drop</span>
            </span>
          </label>
          <label class="mt-3.5 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked class="mt-0.5 h-4 w-4 rounded border-stone-300 text-zinc-900 focus:ring-zinc-900/20" />
            <span>
              <span class="block text-[11.5px] text-zinc-900">Order updates</span>
              <span class="block text-[10px] text-stone-400">Dispatch and delivery notices</span>
            </span>
          </label>
          <button type="button" data-action="logout" class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-100 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-600 transition-all duration-300 ease-out hover:bg-stone-200 hover:text-zinc-900">
            Sign out
          </button>
        </div>
      </div>
    </div>`;
}

function orderReceipt(order) {
  const zone = zoneFor(order.shipping.gov || order.shipping.country);
  return html`
    <div class="mt-4 space-y-4 border-t border-stone-100 pt-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-[8.5px] uppercase tracking-[0.2em] text-stone-400">Shipped to</p>
          <p class="mt-1.5 text-[11.5px] leading-relaxed text-stone-600">
            ${order.shipping.name}<br />
            ${order.shipping.line1}${order.shipping.line2 ? `, ${order.shipping.line2}` : ''}<br />
            ${order.shipping.city}, ${order.shipping.region} ${order.shipping.postal}<br />
            ${zone.name}, Tunisia
          </p>
        </div>
        <div>
          <p class="text-[8.5px] uppercase tracking-[0.2em] text-stone-400">Tracking</p>
          <p class="mt-1.5 text-[11.5px] text-stone-600">${order.courier}</p>
          <p class="mt-0.5 font-mono text-[10.5px] tracking-wide text-stone-400">${order.tracking}</p>
          ${order.eta ? html`<p class="mt-1 text-[10.5px] text-stone-500">Est. ${order.eta}</p>` : ''}
        </div>
      </div>

      <ul class="space-y-2.5 rounded-2xl bg-stone-50 p-4">
        ${order.items.map((line) => {
          const product = byId(line.productId);
          return html`<li class="flex items-center gap-3">
            <span class="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-200/60">
              ${product ? html`<img src="${img(product.images[0])}" alt="" data-fallback="" class="h-full w-full object-cover" />` : ''}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[11.5px] text-zinc-900">${product?.shortTitle || 'Archive piece'}</span>
              <span class="block text-[10px] text-stone-400">Qty ${line.qty}${product ? ` · Size ${product.size}` : ''}</span>
            </span>
            <span class="text-[11px] tabular-nums text-stone-600">${money(line.price * line.qty)}</span>
          </li>`;
        })}
      </ul>

      <dl class="space-y-1.5 text-[11.5px]">
        <div class="flex justify-between"><dt class="text-stone-400">Subtotal</dt><dd class="tabular-nums text-stone-700">${money(order.totals.subtotal)}</dd></div>
        ${order.totals.discount ? html`<div class="flex justify-between"><dt class="text-emerald-700">Discount</dt><dd class="tabular-nums text-emerald-700">−${money(order.totals.discount)}</dd></div>` : ''}
        <div class="flex justify-between"><dt class="text-stone-400">Shipping</dt><dd class="tabular-nums text-stone-700">${order.totals.shipping ? money(order.totals.shipping) : 'Complimentary'}</dd></div>
        <div class="flex justify-between"><dt class="text-stone-400">Tax</dt><dd class="tabular-nums text-stone-700">${money(order.totals.tax)}</dd></div>
        <div class="flex justify-between border-t border-stone-200/80 pt-2 text-[12px] font-medium text-zinc-900"><dt>Total</dt><dd class="tabular-nums">${money(order.totals.total)}</dd></div>
      </dl>

      <div class="flex flex-wrap gap-2">
        <button type="button" data-action="reorder" data-id="${order.id}" class="${BTN.soft} !py-2.5">${icon('refresh', 'h-3 w-3')} Buy again</button>
        <button type="button" data-action="help-order" data-id="${order.id}" class="${BTN.soft} !py-2.5">${icon('chat', 'h-3 w-3')} Ask about this order</button>
        <button type="button" data-action="print-receipt" class="${BTN.soft} !py-2.5">${icon('book', 'h-3 w-3')} Receipt</button>
      </div>
    </div>`;
}

function ordersTab(state) {
  const orders = state.orders || [];
  return html`
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-display text-[19px] tracking-tight text-zinc-900">Order history</h2>
          <p class="mt-1 text-[11px] text-stone-500">${orders.length} ${orders.length === 1 ? 'order' : 'orders'} · every receipt is kept here.</p>
        </div>
        <span class="rounded-full bg-white px-3.5 py-2 text-[9.5px] uppercase tracking-[0.16em] text-stone-500 shadow-sm shadow-stone-200/60">Ledger</span>
      </div>

      ${orders.length
        ? orders.map(
            (order) => html`
              <article class="overflow-hidden rounded-[26px] bg-white shadow-xl shadow-stone-200/40 transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-stone-300/40">
                <details class="group">
                  <summary class="flex cursor-pointer list-none flex-wrap items-center gap-4 p-5 sm:p-6">
                    <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-stone-100 text-stone-500">${icon('bag', 'h-5 w-5')}</span>
                    <span class="min-w-0 flex-1">
                      <span class="flex flex-wrap items-baseline gap-x-2.5">
                        <span class="font-display text-[15px] tracking-tight text-zinc-900">${order.id}</span>
                        <span class="rounded-full px-2 py-0.5 text-[8.5px] uppercase tracking-[0.14em] ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800'
                            : order.status === 'In transit'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                        }">${order.status}</span>
                      </span>
                      <span class="mt-1 block text-[10.5px] text-stone-400">${date(order.placedAt)} · ${order.items.length} ${order.items.length === 1 ? 'piece' : 'pieces'} · ${money(order.totals.total)}</span>
                    </span>
                    <span class="flex items-center gap-3">
                      <span class="hidden items-center gap-1 sm:flex">
                        ${order.items.slice(0, 3).map((line) => {
                          const product = byId(line.productId);
                          return product
                            ? html`<span class="h-11 w-9 overflow-hidden rounded-lg bg-stone-100"><img src="${img(product.images[0])}" alt="" data-fallback="" class="h-full w-full object-cover" /></span>`
                            : '';
                        })}
                      </span>
                      <span class="grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-stone-500 transition-all duration-300 group-open:rotate-180 group-open:bg-zinc-900 group-open:text-stone-50">${icon('chevronDown', 'h-4 w-4')}</span>
                    </span>
                  </summary>

                  <div class="px-5 pb-6 sm:px-6">
                    <!-- tracking -->
                    <div class="mb-5 rounded-2xl bg-stone-50 p-4">
                      <div class="flex items-center justify-between">
                        <p class="text-[9px] uppercase tracking-[0.2em] text-stone-400">Tracking</p>
                        <p class="text-[10px] uppercase tracking-[0.14em] ${order.status === 'Delivered' ? 'text-emerald-700' : 'text-stone-500'}">${order.steps.filter((s) => s.done).length} of ${order.steps.length}</p>
                      </div>
                      <div class="mt-3 flex items-center gap-1.5">
                        ${order.steps.map(
                          (step, i) => html`<span class="flex-1">
                            <span class="block h-1 rounded-full transition-all duration-500 ${step.done ? 'bg-zinc-900' : 'bg-stone-200'}"></span>
                            <span class="mt-1.5 block text-[8.5px] uppercase tracking-[0.1em] ${step.done ? 'text-zinc-700' : 'text-stone-400'}">${step.label.split(' ')[0]}</span>
                          </span>`,
                        )}
                      </div>
                    </div>
                    ${orderReceipt(order)}
                  </div>
                </details>
              </article>`,
          )
        : emptyState({
            title: 'No orders yet',
            copy: 'When you buy your first piece it will be filed here with its receipt and tracking.',
            iconName: 'bag',
            action: html`<a href="#/catalog" class="${BTN.primary}">Browse the floor</a>`,
          })}
    </div>`;
}

function walletTab(state) {
  const user = state.user;
  const tierIndex = Math.max(0, REWARD_TIERS.findIndex((t) => (user.points || 0) < t.spend) - 1);
  const current = REWARD_TIERS[Math.max(0, tierIndex)] || REWARD_TIERS[0];
  const next = REWARD_TIERS[Math.min(REWARD_TIERS.length - 1, REWARD_TIERS.indexOf(current) + 1)];

  return html`
    <div class="space-y-5">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-[26px] bg-zinc-900 p-6 text-stone-100 shadow-xl shadow-stone-400/30">
          <p class="text-[9px] uppercase tracking-[0.22em] text-stone-400">Reward points</p>
          <p class="mt-3 font-display text-[34px] font-light leading-none tracking-tight">${user.points || 0}</p>
          <p class="mt-2 text-[10.5px] text-stone-400">≈ ${money((user.points || 0) / 20)} in credit</p>
          <div class="mt-4 h-1 overflow-hidden rounded-full bg-white/15">
            <div class="h-full rounded-full bg-stone-100" style="width:${Math.min(100, ((user.points || 0) / (next.spend || 1500)) * 100)}%"></div>
          </div>
          <p class="mt-2 text-[9.5px] uppercase tracking-[0.14em] text-stone-500">${Math.max(0, next.spend - (user.points || 0))} pts to ${next.name}</p>
        </div>

        <div class="rounded-[26px] bg-white p-6 shadow-xl shadow-stone-200/40">
          <p class="text-[9px] uppercase tracking-[0.22em] text-stone-400">Current tier</p>
          <p class="mt-3 font-display text-[22px] font-light tracking-tight text-zinc-900">${current.name}</p>
          <ul class="mt-3 space-y-1.5">
            ${current.perks.map(
              (perk) => html`<li class="flex items-start gap-2 text-[10.5px] text-stone-500">${icon('check', 'h-3 w-3 mt-0.5 text-emerald-600')} ${perk}</li>`,
            )}
          </ul>
        </div>

        <div class="rounded-[26px] bg-white p-6 shadow-xl shadow-stone-200/40">
          <p class="text-[9px] uppercase tracking-[0.22em] text-stone-400">Store credit</p>
          <p class="mt-3 font-display text-[34px] font-light leading-none tracking-tight text-zinc-900">${money(45)}</p>
          <p class="mt-2 text-[10.5px] text-stone-500">From two returned pieces. Never expires.</p>
          <button type="button" data-action="use-credit" class="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-[9.5px] uppercase tracking-[0.14em] text-zinc-800 transition-all duration-300 hover:bg-zinc-900 hover:text-stone-50">
            Apply at checkout ${icon('arrowRight', 'h-3 w-3')}
          </button>
        </div>
      </div>

      <div>
        <div class="flex items-baseline justify-between">
          <h2 class="font-display text-[19px] tracking-tight text-zinc-900">Your vouchers</h2>
          <span class="text-[9.5px] uppercase tracking-[0.16em] text-stone-400">${VOUCHERS.length} available</span>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          ${VOUCHERS.map(
            (v) => html`
              <div class="group relative overflow-hidden rounded-[22px] bg-gradient-to-br ${VOUCHER_TONE[v.tone] || VOUCHER_TONE.stone} p-5 shadow-lg shadow-stone-200/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/50">
                <span class="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/30"></span>
                <div class="relative">
                  <p class="font-display text-[24px] font-light leading-none">${v.value}</p>
                  <p class="mt-2 text-[11.5px] font-medium">${v.title}</p>
                  <p class="mt-1 text-[10px] leading-snug opacity-70">${v.detail}</p>
                  <div class="mt-4 flex items-center justify-between gap-2 border-t border-current/10 pt-3">
                    <span class="font-mono text-[9.5px] tracking-[0.1em] opacity-70">${v.code}</span>
                    <button type="button" data-action="copy-code" data-code="${v.code}" class="rounded-full bg-white/60 px-2.5 py-1 text-[8.5px] uppercase tracking-[0.12em] transition-all duration-300 hover:bg-white">Copy</button>
                  </div>
                  <p class="mt-2 text-[8.5px] uppercase tracking-[0.12em] opacity-50">Expires ${v.expires}</p>
                </div>
              </div>`,
          )}
        </div>
      </div>

      <div class="rounded-[26px] bg-white p-6 shadow-xl shadow-stone-200/40">
        <h2 class="font-display text-[17px] tracking-tight text-zinc-900">How rewards work</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          ${REWARD_TIERS.map(
            (tier, i) => html`<div class="rounded-2xl bg-stone-50 p-4 ${i === tierIndex ? 'ring-1 ring-zinc-900/20' : ''}">
              <p class="text-[9px] uppercase tracking-[0.18em] text-stone-400">${tier.spend ? `From ${money(tier.spend)}` : 'Everyone'}</p>
              <p class="mt-1.5 text-[12.5px] font-medium text-zinc-900">${tier.name}</p>
              <ul class="mt-2 space-y-1">
                ${tier.perks.map((p) => html`<li class="text-[10px] leading-snug text-stone-500">${p}</li>`)}
              </ul>
            </div>`,
          )}
        </div>
      </div>
    </div>`;
}

export function renderAccount(state) {
  if (!state.user) return authGate();
  const active = state.ui.accountTab || 'profile';
  const user = state.user;

  return html`
    <div class="fade-in">
      <section class="mx-auto max-w-[1440px] px-5 pt-10 lg:px-10 lg:pt-14">
        <nav class="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-400" aria-label="Breadcrumb">
          <a href="#/home" class="transition-colors duration-300 hover:text-zinc-900">Home</a>
          <span class="text-stone-300">${icon('chevronRight', 'h-2.5 w-2.5')}</span>
          <span class="text-zinc-700">Account</span>
        </nav>

        <div class="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex items-center gap-4">
            <span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-zinc-900 font-display text-xl text-stone-50 shadow-lg shadow-stone-400/30">${initials(user.name)}</span>
            <div>
              <p class="text-[9.5px] uppercase tracking-[0.24em] text-stone-400">${user.tier}</p>
              <h1 class="mt-1 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-light leading-none tracking-[-0.02em] text-zinc-900">${user.name}</h1>
              <p class="mt-1.5 text-[11.5px] text-stone-500">${user.email}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a href="#/wishlist" class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-zinc-800 shadow-sm shadow-stone-200/70 transition-all duration-300 hover:shadow-md">
              ${icon('heart', 'h-3.5 w-3.5')} ${state.wishlist.length} in vault
            </a>
            <button type="button" data-action="logout" class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-stone-500 shadow-sm shadow-stone-200/70 transition-all duration-300 hover:text-zinc-900 hover:shadow-md">
              ${icon('arrowRight', 'h-3.5 w-3.5')} Sign out
            </button>
          </div>
        </div>

        <div class="mt-8 inline-flex flex-wrap gap-1 rounded-full bg-stone-200/50 p-1">
          ${TABS.map(
            (tab) => html`<button
              type="button"
              data-action="account-tab"
              data-tab="${tab.id}"
              class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.16em] transition-all duration-300 ease-out ${
                active === tab.id ? 'bg-white text-zinc-900 shadow-sm shadow-stone-300/60' : 'text-stone-500 hover:text-zinc-800'
              }"
            >
              ${icon(tab.icon, 'h-3.5 w-3.5')} ${tab.label}
              ${tab.id === 'orders' ? html`<span class="rounded-full bg-stone-100 px-1.5 text-[9px] text-stone-500">${state.orders.length}</span>` : ''}
            </button>`,
          )}
        </div>
      </section>

      <section class="mx-auto max-w-[1440px] px-5 py-9 lg:px-10 lg:py-10">
        ${active === 'profile' ? profileTab(state) : ''}
        ${active === 'orders' ? ordersTab(state) : ''}
        ${active === 'wallet' ? walletTab(state) : ''}
      </section>
    </div>`;
}
