/**
 * ATELIER ARCHIVE — application bootstrap.
 * Wires the store, the hash router, delegated interactions and the overlay surfaces.
 */
import { armImageFallbacks, qs, qsa, delegate } from './core/dom.js';
import { subscribe, getState, commit, actions, computeTotals, wishlistProducts } from './core/state.js';
import { byId } from './data/catalog.js';
import { STORE_SALES } from './data/content.js';
import { matchRoute, onRouteChange, startRouter, currentRoute } from './core/router.js';
import { renderHeader, renderMobileNav } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, renderWishlistDrawer } from './components/drawer.js';
import { renderAuthModal } from './components/auth-modal.js';
import { renderQuickView } from './components/quick-view.js';
import { renderChatWidget, renderToast, chatLogHTML } from './components/chat-widget.js';
import { renderSearchOverlay, initSearchOverlay } from './components/search-overlay.js';
import { renderHome } from './views/home.js';
import { renderCatalog } from './views/catalog.js';
import { renderProduct } from './views/product.js';
import { renderWishlist } from './views/wishlist.js';
import { renderCheckout, summaryPanel } from './views/checkout.js';
import { renderAccount } from './views/account.js';
import { renderSales } from './views/sales.js';
import { renderSupport } from './views/support.js';
import { play, toggleMuted } from './core/sound.js';
import { renderSell, renderSellPreview, DEMO_LISTINGS } from './views/sell.js';
import { CHAT_SCRIPT, CHAT_FALLBACK } from './data/content.js';

/* ------------------------------------------------------------------ *
 * Routes
 * ------------------------------------------------------------------ */
const ROUTES = [
  { path: '/home', view: renderHome, title: 'Atelier Archive — the considered second life of clothing' },
  { path: '/catalog', view: renderCatalog, title: 'The floor — Atelier Archive' },
  { path: '/sell', view: renderSell, title: 'List a piece — Atelier Archive' },
  { path: '/product/:id', view: renderProduct, title: 'Piece — Atelier Archive' },
  { path: '/wishlist', view: renderWishlist, title: 'Your vault — Atelier Archive' },
  { path: '/checkout', view: renderCheckout, title: 'Checkout — Atelier Archive' },
  { path: '/account', view: renderAccount, title: 'Your account — Atelier Archive' },
  { path: '/sales', view: renderSales, title: 'Store sales — Atelier Archive' },
  { path: '/events', view: renderSales, title: 'Store sales — Atelier Archive' },
  { path: '/support', view: renderSupport, title: 'Support — Atelier Archive' },
];

const roots = {};
let currentMatch = { route: ROUTES[0], params: {} };

/* ------------------------------------------------------------------ *
 * Renderers
 * ------------------------------------------------------------------ */
function renderView() {
  const state = getState();
  const { route, params } = currentMatch;
  roots.main.innerHTML = route.view(state, params);
  armImageFallbacks(roots.main);
  document.title = route.title;
}

function renderHeaderRegion() {
  const state = getState();
  roots.header.innerHTML = renderHeader(state) + renderMobileNav(state);
}

let lastDrawer = null;

function renderDrawers() {
  const state = getState();
  const drawer = state.ui.drawer;
  const animate = drawer !== lastDrawer;
  lastDrawer = drawer;
  if (drawer === 'cart') roots.drawer.innerHTML = renderCartDrawer(state, { animate });
  else if (drawer === 'wishlist') roots.drawer.innerHTML = renderWishlistDrawer(state, { animate });
  else roots.drawer.innerHTML = '';
  armImageFallbacks(roots.drawer);
}

function renderModals() {
  const state = getState();
  const wasAuthOpen = !!roots.modal.querySelector('[data-overlay="auth"]');
  roots.modal.innerHTML = renderAuthModal(state, { animate: !wasAuthOpen }) + renderQuickView(state);
  armImageFallbacks(roots.modal);
}

function renderToastRegion() {
  roots.toast.innerHTML = renderToast(getState());
}

function renderCatalogResults() {
  const state = getState();
  const results = qs('[data-catalog-results]');
  if (!results) {
    renderView();
    return;
  }
  // Re-render the whole catalog to keep counts + active chips truthful,
  // but restore focus on the control the user is holding.
  const active = document.activeElement;
  const marker = active && active.id ? active.id : null;
  const rail = qs('[data-filter-rail]');
  const railHtml = rail ? rail.innerHTML : null;

  renderView();

  if (marker) {
    const restored = qs(`#${marker}`);
    if (restored) restored.focus({ preventScroll: true });
  }
  if (railHtml && qs('[data-filter-rail]')) {
    // Kept for reference — full view render already refreshed the rail.
  }
}

function renderCheckoutSummary() {
  const state = getState();
  const host = qs('#checkout-summary');
  if (!host) {
    renderView();
    return;
  }
  const totals = computeTotals({
    gov: state.ui.checkout.shipping.gov,
    couponCode: state.ui.checkout.coupon,
    express: !!state.ui.checkout.express,
  });
  const wrap = document.createElement('div');
  wrap.innerHTML = summaryPanel(state, totals);
  const next = wrap.firstElementChild;
  if (next) host.replaceWith(next);
  armImageFallbacks(roots.main);
}

function renderSellPreviewRegion() {
  const host = qs('#sell-preview');
  if (!host) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = renderSellPreview(getState());
  const next = wrap.firstElementChild;
  if (next) host.replaceWith(next);
  armImageFallbacks(roots.main);
}

/* ------------------------------------------------------------------ *
 * Chat
 * ------------------------------------------------------------------ */
function syncChatChrome() {
  const state = getState();
  const panel = qs('#chat-panel');
  if (!panel) return;
  const open = state.ui.chat.open;
  panel.classList.toggle('pointer-events-auto', open);
  panel.classList.toggle('translate-y-0', open);
  panel.classList.toggle('scale-100', open);
  panel.classList.toggle('opacity-100', open);
  panel.classList.toggle('pointer-events-none', !open);
  panel.classList.toggle('translate-y-4', !open);
  panel.classList.toggle('scale-95', !open);
  panel.classList.toggle('opacity-0', !open);
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function renderChatMessages() {
  const state = getState();
  const host = qs('[data-chat-messages]');
  if (!host) return;
  const typing = host.querySelector('[data-chat-typing]');
  host.innerHTML = chatLogHTML(state.ui.chat.messages) + (typing ? typing.outerHTML : '');
  host.scrollTop = host.scrollHeight;
}

function setTyping(on) {
  const typing = qs('[data-chat-typing]');
  if (typing) typing.hidden = !on;
  const host = qs('[data-chat-messages]');
  if (host) host.scrollTop = host.scrollHeight;
}

function replyToChat(text) {
  const matched = CHAT_SCRIPT.find((entry) => entry.match.test(text));
  const reply = matched ? matched.reply : CHAT_FALLBACK;
  setTyping(true);
  setTimeout(() => {
    setTyping(false);
    actions.receiveChat(reply);
  }, 900 + Math.random() * 700);
}

/* ------------------------------------------------------------------ *
 * Scroll lock
 * ------------------------------------------------------------------ */
function syncScrollLock() {
  const { ui } = getState();
  const locked =
    !!ui.drawer ||
    !!ui.auth?.open ||
    !!ui.quickView ||
    !!ui.mobileNav ||
    !!ui.mobileFilters;
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/* ------------------------------------------------------------------ *
 * State → DOM
 * ------------------------------------------------------------------ */
const PARTIALS = {
  none: [],
  toast: ['toast'],
  overlay: ['header', 'drawers', 'modals'],
  view: ['view'],
  commerce: ['header', 'drawers', 'view'],
  all: ['header', 'view', 'drawers', 'modals', 'toast'],
  'catalog-results': ['catalog-results'],
  'checkout-summary': ['checkout-summary'],
  chat: ['chat-messages'],
};

function refresh(partial = 'view') {
  const parts = PARTIALS[partial] ?? PARTIALS.view;
  for (const part of parts) {
    if (part === 'header') renderHeaderRegion();
    else if (part === 'view') renderView();
    else if (part === 'drawers') renderDrawers();
    else if (part === 'modals') renderModals();
    else if (part === 'toast') renderToastRegion();
    else if (part === 'catalog-results') renderCatalogResults();
    else if (part === 'checkout-summary') renderCheckoutSummary();
    else if (part === 'chat-messages') renderChatMessages();
  }
  syncChatChrome();
  syncScrollLock();
}

subscribe((state, meta) => {
  refresh(meta?.partial || 'view');
});

/* ------------------------------------------------------------------ *
 * Route preparation (query → state)
 * ------------------------------------------------------------------ */
function prepareRoute(route) {
  const state = getState();
  const q = route.query || {};

  if (route.path === '/catalog') {
    const patch = {};
    if (q.q !== undefined) patch.q = q.q;
    if (q.category) patch.categories = String(q.category).split(',');
    if (q.era) patch.eras = String(q.era).split(',');
    if (q.condition) patch.conditions = String(q.condition).split(',');
    if (q.sort) patch.sort = q.sort;
    if (q.size) patch.sizes = String(q.size).split(',');
    if (q.soldBy) patch.soldBy = String(q.soldBy).split(',');
    const changed = Object.entries(patch).some(([k, v]) => JSON.stringify(state.ui.filters[k]) !== JSON.stringify(v));
    if (changed) {
      commit(
        (d) => {
          d.ui.filters = { ...d.ui.filters, ...patch };
        },
        { partial: 'none' },
      );
    }
  }

  if (route.path === '/account') {
    const tab = q.tab || 'profile';
    if (state.ui.accountTab !== tab) {
      commit(
        (d) => {
          d.ui.accountTab = tab;
        },
        { partial: 'none' },
      );
    }
  }

  if (route.path === '/checkout' && state.ui.checkout.step >= 5 && !state.ui.checkout.placedOrder) {
    commit(
      (d) => {
        d.ui.checkout.step = 1;
      },
      { partial: 'none' },
    );
  }
}

function resolveRoute(route) {
  const found = matchRoute(ROUTES, route.path);
  if (found) return found;
  return { route: { path: '/home', view: renderHome, title: 'Atelier Archive' }, params: {} };
}

let lastPath = '/home';

function handleRouteChange(route) {
  prepareRoute(route);

  // Arriving on the catalog from elsewhere resets a previously narrowed floor.
  if (route.path === '/catalog' && !Object.keys(route.query || {}).length && lastPath !== '/catalog') {
    const f = getState().ui.filters;
    const narrow =
      f.q ||
      f.categories.length ||
      f.sizes.length ||
      f.conditions.length ||
      f.eras.length ||
      f.min > 0 ||
      f.max < 150;
    if (narrow) {
      commit(
        (d) => {
          d.ui.filters = { q: '', categories: [], sizes: [], conditions: [], eras: [], soldBy: [], min: 0, max: 150, sort: 'curated' };
        },
        { partial: 'none' },
      );
    }
  }
  const routeChanged = route.path !== lastPath;
  lastPath = route.path;

  currentMatch = resolveRoute(route);
  if (routeChanged) {
    roots.main.classList.add('route-enter');
    setTimeout(() => roots.main.classList.remove('route-enter'), 220);
  }
  renderView();
  renderHeaderRegion();
  syncChatChrome();
  syncScrollLock();
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  const { ui } = getState();
  if (ui.mobileNav || (route.path !== '/catalog' && ui.mobileFilters)) {
    commit(
      (d) => {
        d.ui.mobileNav = false;
        if (route.path !== '/catalog') d.ui.mobileFilters = false;
      },
      { partial: 'none' },
    );
    renderHeaderRegion();
  }
}

/* ------------------------------------------------------------------ *
 * Interaction map
 * ------------------------------------------------------------------ */
function requireAuth(pending) {
  if (getState().user) return true;
  actions.openAuth(pending);
  return false;
}

const CLICK = {
  /* sound */
  'toggle-sound': () => {
    const muted = toggleMuted();
    if (!muted) play('pop');
    renderHeaderRegion();
  },
  /* overlays */
  'open-cart': () => actions.openDrawer('cart'),
  'open-wishlist': () => actions.openDrawer('wishlist'),
  'close-drawer': () => actions.closeDrawer(),
  'goto-cart': () => {
    actions.closeQuickView();
    actions.openDrawer('cart');
  },
  'go-catalog': () => {
    actions.closeDrawer();
    window.location.hash = '#/catalog';
  },
  'go-account': () => {
    window.location.hash = '#/account';
  },
  'open-auth': (el) => {
    if (el.dataset.mode) actions.setAuthMode(el.dataset.mode);
    actions.openAuth();
  },
  'close-auth': () => actions.closeAuth(),
  'auth-mode': (el) => {
    const draft = {
      name: qs('#auth-name')?.value || '',
      email: qs('#auth-email')?.value || '',
      password: qs('#auth-password')?.value || '',
    };
    actions.setAuthMode(el.dataset.mode, draft);
  },
  'demo-login': () => {
    const state = getState();
    const user = actions.login({ email: 'amira@atelierarchive.tn', name: 'Amira Ben Salah', password: 'demo' });
    if (state.ui.auth.pending === 'checkout') window.location.hash = '#/checkout';
    return user;
  },
  'open-search': () => searchCtl.open(),
  'close-quickview': () => actions.closeQuickView(),
  'toggle-mobile-nav': () => actions.toggleMobileNav(),
  'toggle-mobile-filters': () => actions.toggleMobileFilters(),
  'toggle-chat': () => actions.toggleChat(),
  'toggle-newsletter': () => actions.toggleNewsletter(),

  /* commerce */
  'add-to-cart': (el) => actions.addToCart(el.dataset.id),
  'cart-inc': (el) => {
    const state = getState();
    const line = state.cart.find((l) => l.productId === el.dataset.id);
    if (line) actions.setQty(el.dataset.id, line.qty + 1);
  },
  'cart-dec': (el) => {
    const state = getState();
    const line = state.cart.find((l) => l.productId === el.dataset.id);
    if (line) actions.setQty(el.dataset.id, line.qty - 1);
  },
  'cart-remove': (el) => actions.removeFromCart(el.dataset.id),
  wishlist: (el) => actions.toggleWishlist(el.dataset.id),
  'wishlist-remove': (el) => actions.toggleWishlist(el.dataset.id),
  'move-to-cart': (el) => actions.moveWishlistToCart(el.dataset.id),
  'move-all-to-cart': () => actions.moveAllWishlistToCart(),
  'clear-wishlist': () => actions.clearWishlist(),

  /* catalog */
  'toggle-filter': (el) => actions.toggleFilterValue(el.dataset.key, el.dataset.value),
  'reset-filters': () => actions.resetFilters(),
  'clear-chip': (el) => {
    const key = el.dataset.key;
    if (key === 'price') return actions.setFilter({ min: 0, max: 150 });
    if (key === 'q') return actions.setFilter({ q: '' });
    return actions.toggleFilterValue(key, el.dataset.value);
  },
  'lookbook-step': (el) => {
    const dir = Number(el.dataset.dir);
    const total = 4;
    const next = getState().ui.lookbook + dir;
    actions.setLookbook(Math.max(0, Math.min(total - 1, next)));
  },
  'product-image': (el) => actions.setProductImage(Number(el.dataset.index)),

  /* store sales */
  'sale-city': (el) => {
    commit((d) => { d.ui.saleCity = el.dataset.city; }, { partial: 'view' });
  },
  'add-to-calendar': (el) => {
    const sale = STORE_SALES.find((s) => s.id === el.dataset.id);
    if (!sale) return;
    const stamp = (iso) => iso.replace(/-/g, '');
    const end = new Date(`${sale.to}T12:00:00`);
    end.setDate(end.getDate() + 1);
    const endIso = end.toISOString().slice(0, 10);
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Atelier Archive//Store sales//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${sale.id}@atelierarchive.tn`,
      `DTSTAMP:${stamp(new Date().toISOString().slice(0, 10))}T120000Z`,
      `DTSTART;VALUE=DATE:${stamp(sale.from)}`,
      `DTEND;VALUE=DATE:${stamp(endIso)}`,
      `SUMMARY:${sale.store} — ${sale.discount}% off`,
      `LOCATION:${sale.address}, ${sale.city}`,
      `DESCRIPTION:${sale.note.replace(/\n/g, ' ')} (${sale.hours})`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sale.store.replace(/[^\w]+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    actions.toast('Sale dates saved — open the file to add them to your calendar.', 'success');
  },

  /* account */
  'account-tab': (el) => {
    commit((d) => { d.ui.accountTab = el.dataset.tab; }, { partial: 'view' });
  },
  logout: () => actions.logout(),
  'copy-code': async (el) => {
    try {
      await navigator.clipboard.writeText(el.dataset.code);
      actions.toast(`${el.dataset.code} copied to clipboard.`, 'success');
    } catch {
      actions.toast(`${el.dataset.code} — select and copy manually.`, 'ink');
    }
  },
  reorder: (el) => actions.reorder(el.dataset.id),
  'help-order': (el) => {
    const order = getState().orders.find((o) => o.id === el.dataset.id);
    actions.toggleChat(true);
    if (order) {
      actions.sendChat(`I'd like to ask about order ${order.id}`);
      replyToChat('order');
    }
  },
  'print-receipt': () => window.print(),
  'use-credit': () => {
    actions.closeAuth();
    actions.toast('Store credit applies automatically at checkout.', 'ink');
  },
  'message-seller': (el) => {
    const product = byId(el.dataset.id);
    if (!product) return;
    const seller = product.seller;
    actions.toggleChat(true);
    actions.sendChat(`Hi ${seller.name.split(' ')[0]} — is the ${product.shortTitle} still available?`);
    setTimeout(() => {
      actions.receiveChat(
        `${seller.name.split(' ')[0]} usually replies ${seller.response.replace('usually ', '')}. I've passed your question on — you'll get an email the moment they answer.`,
      );
    }, 900);
  },
  'browse-seller': (el) => {
    window.location.hash = `#/catalog?soldBy=individual`;
  },

  /* checkout */
  'checkout-step': (el) => {
    const step = Number(el.dataset.step);
    if (step <= getState().ui.checkout.step) actions.setCheckoutStep(step);
  },
  'checkout-back': () => actions.setCheckoutStep(Math.max(1, getState().ui.checkout.step - 1)),
  'checkout-next': () => {
    const state = getState();
    const step = state.ui.checkout.step;
    if (!validateStep(step)) return;
    if (step >= 4) return;
    actions.setCheckoutStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  'fill-address': () => {
    commit(
      (d) => {
        d.ui.checkout.shipping = {
          ...d.ui.checkout.shipping,
          name: 'Amira Ben Salah',
          phone: '+216 98 412 300',
          line1: '14 Rue de Marseille, Appt 3B',
          city: 'Tunis',
          postal: '1000',
          gov: 'tunis',
          email: d.user?.email || 'amira@atelierarchive.tn',
        };
      },
      { partial: 'view' },
    );
    actions.toast('Demo delivery address filled.', 'ink');
  },
  'apply-coupon': () => {
    const input = qs('[data-coupon-input]');
    const state = getState();
    const totals = computeTotals({
      gov: state.ui.checkout.shipping.gov,
      couponCode: '',
      express: !!state.ui.checkout.express,
    });
    actions.applyCoupon(input ? input.value : state.ui.checkout.coupon, totals);
  },
  'remove-coupon': () => actions.removeCoupon(),
  'try-coupon': (el) => {
    const state = getState();
    const totals = computeTotals({ gov: state.ui.checkout.shipping.gov, couponCode: '', express: !!state.ui.checkout.express });
    actions.applyCoupon(el.dataset.code, totals);
  },
  express: (el) => {
    syncCheckoutDomToState();
    commit((d) => { d.ui.checkout.express = el.dataset.value === 'express'; }, { partial: 'view' });
  },
  payment: (el) => {
    syncCheckoutDomToState();
    actions.setPayment(el.dataset.value);
  },
  'fill-card': () => {
    const set = (id, value) => {
      const node = qs(`#${id}`);
      if (node) node.value = value;
    };
    set('f-card', '4242 4242 4242 4242');
    set('f-exp', '04 / 29');
    set('f-cvc', '123');
    actions.toast('Test card filled — nothing will be charged.', 'ink');
  },
  'place-order': () => {
    syncCheckoutDomToState();
    if (!validateStep()) return;
    const state = getState();
    const totals = computeTotals({
      gov: state.ui.checkout.shipping.gov,
      couponCode: state.ui.checkout.coupon,
      express: !!state.ui.checkout.express,
    });
    const order = actions.placeOrder(totals);
    if (order) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      actions.toast(`Demo order ${order.id} confirmed!`, 'success');
    }
  },
  'reset-checkout': () => actions.startNewCheckout(),
  'fill-demo-listing': () => {
    const idx = (window.__demoListingIdx = ((window.__demoListingIdx ?? -1) + 1) % DEMO_LISTINGS.length);
    const sample = DEMO_LISTINGS[idx];
    const user = getState().user;
    commit(
      (d) => {
        d.ui.sellDraft = {
          ...(d.ui.sellDraft || {}),
          ...sample,
          sellerName: d.ui.sellDraft?.sellerName || user?.name || 'Youssef B.',
          sellerLocation: d.ui.sellDraft?.sellerLocation || user?.address?.city || 'La Marsa, Tunis',
        };
      },
      { partial: 'view' },
    );
    actions.toast('Demo thrift item filled — click Publish to post it!', 'ink');
  },
  'sell-pick-photo': (el) => {
    syncSellDomToState();
    commit(
      (d) => {
        d.ui.sellDraft = { ...(d.ui.sellDraft || {}), image: el.dataset.image };
      },
      { partial: 'view' },
    );
  },
  'sell-set-field': (el) => {
    syncSellDomToState();
    commit(
      (d) => {
        d.ui.sellDraft = { ...(d.ui.sellDraft || {}), [el.dataset.key]: el.dataset.value };
      },
      { partial: 'view' },
    );
  },
  'delete-listing': (el) => {
    const id = el.dataset.id;
    actions.deleteListing(id);
    if (window.location.hash === `#/product/${id}`) {
      window.location.hash = '#/catalog';
    }
  },
  'close-all': () => {
    actions.closeDrawer();
    actions.closeAuth();
    actions.closeQuickView();
  },
};

/* ------------------------------------------------------------------ *
 * Step validation
 * ------------------------------------------------------------------ */
function syncCheckoutDomToState() {
  const fields = qsa('[data-field]', roots.main);
  if (!fields.length) return;
  const patch = {};
  fields.forEach((el) => {
    patch[el.dataset.field] = el.type === 'checkbox' ? el.checked : el.value;
  });
  commit(
    (d) => {
      d.ui.checkout.shipping = { ...d.ui.checkout.shipping, ...patch };
    },
    { partial: 'none' },
  );
}

function validateStep() {
  const panel = qs('[data-step-error]');
  const fields = qsa('[data-required]', roots.main).filter((el) => el.offsetParent !== null);

  const missing = fields.find((el) => {
    if (el.id === 'f-terms') return !el.checked;
    return el.value.trim().length === 0;
  });

  if (missing) {
    if (panel) {
      panel.classList.remove('hidden');
      panel.classList.add('flex');
      panel.innerHTML = `<span>Please enter your <strong>${missing.dataset.required || 'delivery details'}</strong> (or click <button type="button" data-action="fill-address" class="underline font-semibold">Fill demo address</button>).</span>`;
    }
    missing.classList.add('!ring-2', '!ring-clay-500/60');
    missing.focus({ preventScroll: false });
    missing.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  if (panel) {
    panel.classList.add('hidden');
    panel.classList.remove('flex');
  }
  return true;
}

function syncSellDomToState() {
  const fields = qsa('[data-sell-field]', roots.main);
  if (!fields.length) return;
  const patch = {};
  fields.forEach((el) => {
    const k = el.dataset.sellField;
    if (k === 'image' && el.value === 'Custom uploaded photo') return;
    patch[k] = el.value;
  });
  commit(
    (d) => {
      d.ui.sellDraft = { ...(d.ui.sellDraft || {}), ...patch };
    },
    { partial: 'none' },
  );
}

function handleSellFieldInput(el) {
  const field = el.dataset.sellField;
  if (!field) return;
  const val = el.value;
  commit(
    (d) => {
      if (field === 'image' && val === 'Custom uploaded photo') return;
      d.ui.sellDraft = { ...(d.ui.sellDraft || {}), [field]: val };
    },
    { partial: 'none' },
  );
  renderSellPreviewRegion();
}

/* ------------------------------------------------------------------ *
 * Field sync
 * ------------------------------------------------------------------ */
function handleFieldInput(el) {
  const field = el.dataset.field;
  if (!field) return;
  const value = el.type === 'checkbox' ? el.checked : el.value;

  commit(
    (d) => {
      d.ui.checkout.shipping = { ...d.ui.checkout.shipping, [field]: value };
    },
    { partial: field === 'gov' ? 'view' : 'none' },
  );

  if (field === 'gift') refresh('view');
}

function handleSortSelect(el) {
  actions.setFilter({ sort: el.value });
}

/* ------------------------------------------------------------------ *
 * Forms
 * ------------------------------------------------------------------ */
function handleSubmit(event) {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  const kind = form.dataset.form;
  const data = new FormData(form);

  if (kind === 'sell') {
    syncSellDomToState();
    const draft = getState().ui.sellDraft || {};
    const title = String(draft.title || data.get('title') || '').trim();
    const err = qs('[data-sell-error]', form);
    if (!title) {
      if (err) {
        err.innerHTML = '<span>Please enter an <strong>item title</strong> (or click <strong>Fill demo item</strong> at the top).</span>';
        err.classList.remove('hidden');
        err.classList.add('flex');
      }
      const titleInput = qs('#sell-title', form);
      if (titleInput) titleInput.focus();
      return;
    }
    actions.publishListing({
      title,
      brand: String(draft.brand || data.get('brand') || '').trim(),
      price: data.get('price') || draft.price || 75,
      category: String(data.get('category') || draft.category || 'Outerwear'),
      size: String(data.get('size') || draft.size || '42'),
      condition: String(data.get('condition') || draft.condition || 'Excellent'),
      era: String(data.get('era') || draft.era || '90s'),
      material: String(draft.material || data.get('material') || '').trim(),
      colorway: String(draft.colorway || data.get('colorway') || '').trim(),
      story: String(draft.story || data.get('story') || '').trim(),
      sellerName: String(draft.sellerName || data.get('sellerName') || '').trim(),
      sellerLocation: String(draft.sellerLocation || data.get('sellerLocation') || '').trim(),
      image: draft.image,
    });
    window.location.hash = '#/catalog';
    return;
  }

  if (kind === 'auth') {
    const mode = form.dataset.mode;
    const email = String(data.get('email') || '').trim();
    const name = String(data.get('name') || '').trim();
    const password = String(data.get('password') || '');
    const error = qs('[data-auth-error]', form);
    if (!email && !name) {
      if (error) {
        error.textContent = 'Please enter an email or username.';
        error.classList.remove('hidden');
      }
      return;
    }
    const pending = getState().ui.auth.pending;
    actions.login({ email: email || name, name, password: password || 'demo', mode });
    if (pending === 'checkout') window.location.hash = '#/checkout';
    return;
  }

  if (kind === 'newsletter') {
    commit((d) => { d.newsletter = true; }, { partial: 'view' });
    actions.toast('You are on the list. One quiet email per drop.', 'success');
    form.reset();
    return;
  }

  if (kind === 'profile') {
    actions.updateProfile({
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      address: {
        line1: String(data.get('line1') || ''),
        city: String(data.get('city') || ''),
        postal: String(data.get('postal') || ''),
        gov: String(data.get('gov') || 'tunis'),
        region: String(data.get('region') || ''),
      },
    });
    return;
  }

  if (kind === 'contact') {
    actions.toast('Message sent to the studio — we reply within a day.', 'success');
    form.reset();
    return;
  }

  if (kind === 'chat') {
    const text = String(data.get('message') || '');
    if (!text.trim()) return;
    actions.sendChat(text);
    replyToChat(text);
    form.reset();
    return;
  }
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */
let searchCtl = { open() {}, close() {} };

function boot() {
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

  roots.header = qs('#header-root');
  roots.main = qs('#main');
  roots.footer = qs('#footer-root');
  roots.drawer = qs('#drawer-root');
  roots.modal = qs('#modal-root');
  roots.toast = qs('#toast-root');

  // static shells
  roots.footer.innerHTML = renderFooter(getState());
  qs('#search-root').innerHTML = renderSearchOverlay();
  qs('#chat-root-host').innerHTML = renderChatWidget(getState());

  // initial route
  startRouter();
  currentMatch = resolveRoute(currentRoute());
  prepareRoute(currentRoute());
  renderHeaderRegion();
  renderView();
  syncChatChrome();
  syncScrollLock();
  armImageFallbacks(document);

  searchCtl = initSearchOverlay();

  /* delegation */
  delegate(document, 'click', '[data-action]', (event, el) => {
    const action = el.dataset.action;
    const handler = CLICK[action];
    if (!handler) return;
    const sound = {
      'add-to-cart': 'pop',
      wishlist: 'pop',
      'move-to-cart': 'pop',
      'place-order': 'chime',
      'open-cart': 'whoosh',
      'open-wishlist': 'whoosh',
      'open-auth': 'whoosh',
      'open-search': 'whoosh',
      'toggle-sound': '',
    }[action] ?? 'tick';
    if (sound) play(sound);
    const href = el.tagName === 'A' ? el.getAttribute('href') : null;
    if (href && href.startsWith('#/')) {
      event.preventDefault();
      handler(el, event);
      window.location.hash = href;
      return;
    }
    event.preventDefault();
    handler(el, event);
  });

  delegate(document, 'input', '[data-field]', (event, el) => {
    handleFieldInput(el);
  });

  delegate(document, 'input', '[data-sell-field]', (event, el) => {
    handleSellFieldInput(el);
  });

  delegate(document, 'change', 'select[data-sell-field]', (event, el) => {
    handleSellFieldInput(el);
  });

  delegate(document, 'change', '#sell-photo-file', (event, el) => {
    const file = el.files?.[0];
    if (!file) return;
    syncSellDomToState();
    const reader = new FileReader();
    reader.onload = () => {
      const imgEl = new Image();
      imgEl.onload = () => {
        const maxDim = 680;
        let { width, height } = imgEl;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        commit(
          (d) => {
            d.ui.sellDraft = { ...(d.ui.sellDraft || {}), image: dataUrl };
          },
          { partial: 'view' },
        );
        actions.toast('Photo uploaded and ready to publish.', 'success');
      };
      imgEl.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  delegate(document, 'change', '#price-max', (event, el) => {
    actions.setFilter({ max: Number(el.value) });
  });

  delegate(document, 'input', '#price-max', (event, el) => {
    const label = qs('#price-range-label');
    if (label) label.textContent = `Up to ${el.value} DT`;
  });

  delegate(document, 'change', '[data-action="sort"]', (event, el) => handleSortSelect(el));

  delegate(document, 'change', 'input[type="checkbox"][data-field], [data-field="gov"]', (event, el) => {
    handleFieldInput(el);
  });

  delegate(document, 'change', '#f-terms', () => {});

  document.addEventListener('submit', handleSubmit);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const state = getState();
    if (state.ui.auth?.open) return actions.closeAuth();
    if (state.ui.quickView) return actions.closeQuickView();
    if (state.ui.drawer) return actions.closeDrawer();
    if (state.ui.mobileNav) return actions.toggleMobileNav(false);
    if (state.ui.mobileFilters) return actions.toggleMobileFilters(false);
    if (state.ui.chat.open) return actions.toggleChat(false);
  });

  onRouteChange(handleRouteChange);

  // keep the chat input focused after replies
  subscribe((state, meta) => {
    if (meta?.partial === 'chat' && state.ui.chat.open) {
      const input = qs('#chat-input');
      if (input) input.focus({ preventScroll: true });
    }
  });

  // enter sends a chat message
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && event.target.id === 'chat-input') {
      event.preventDefault();
      const text = event.target.value;
      if (!text.trim()) return;
      actions.sendChat(text);
      replyToChat(text);
      event.target.value = '';
    }
  });

  // quick reply chips
  delegate(document, 'click', '[data-chat-quick]', (event, el) => {
    const text = el.dataset.chatQuick;
    actions.sendChat(text);
    replyToChat(text);
  });

  document.documentElement.classList.add('app-ready');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
