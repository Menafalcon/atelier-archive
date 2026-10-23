/**
 * ATELIER ARCHIVE — reactive state container.
 * Single source of truth, persisted to localStorage, with derived commerce selectors.
 */
import { PRODUCTS, byId, syncUserListings } from '../data/catalog.js';
import {
  SEED_ORDERS,
  COUPONS,
  GOVERNORATES,
  SHIPPING_TIERS,
  VAT_RATE,
  FREE_SHIPPING_THRESHOLD,
  EXPRESS_SURCHARGE,
} from '../data/content.js';
import { round2, orderId } from './format.js';

const STORAGE_KEY = 'atelier.archive.v3';

const defaultShipping = {
  name: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postal: '',
  gov: 'tunis',
  notes: '',
  gift: false,
};

const defaultSellDraft = {
  title: '',
  brand: '',
  category: 'Outerwear',
  era: '90s',
  size: '42',
  condition: 'Excellent',
  price: '75',
  retail: '',
  colorway: '',
  material: '',
  story: '',
  sellerName: '',
  sellerLocation: 'La Marsa, Tunis',
  image: '1591047139829-d91aecb6caea',
};

const DEFAULT_STATE = {
  version: 3,
  user: null,
  userListings: [],
  cart: [{ productId: 'aa-9931', qty: 1 }],
  wishlist: ['aa-1780', 'aa-5520'],
  orders: SEED_ORDERS,
  recentlyViewed: [],
  newsletter: false,
  ui: {
    drawer: null,
    auth: { open: false, mode: 'login', pending: null },
    quickView: null,
    chat: { open: false, messages: [], unread: 1 },
    toast: null,
    mobileNav: false,
    sellDraft: { ...defaultSellDraft },
    filters: {
      q: '',
      categories: [],
      sizes: [],
      conditions: [],
      eras: [],
      soldBy: [],
      min: 0,
      max: 150,
      sort: 'curated',
    },
    checkout: {
      step: 1,
      coupon: '',
      couponError: '',
      couponApplied: null,
      express: false,
      shipping: { ...defaultShipping },
      payment: 'card',
      placedOrder: null,
      busy: false,
    },
    product: { tab: 'details', imageIndex: 0 },
    lookbook: 0,
    mobileFilters: false,
    openFaq: 0,
  },
};

/* ------------------------------------------------------------------ *
 * Hydration
 * ------------------------------------------------------------------ */
function hydrate() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!stored || stored.version !== DEFAULT_STATE.version) return structuredClone(DEFAULT_STATE);
    const merged = {
      ...structuredClone(DEFAULT_STATE),
      ...stored,
      ui: {
        ...structuredClone(DEFAULT_STATE.ui),
        ...(stored.ui || {}),
        filters: {
          ...DEFAULT_STATE.ui.filters,
          ...(stored.ui?.filters || {}),
          max: Math.min(150, Number(stored.ui?.filters?.max) || 150),
        },
        checkout: {
          ...DEFAULT_STATE.ui.checkout,
          ...(stored.ui?.checkout || {}),
          shipping: { ...defaultShipping, ...(stored.ui?.checkout?.shipping || {}) },
          placedOrder: null,
          busy: false,
        },
        auth: { open: false, mode: 'login', pending: null },
        drawer: null,
        quickView: null,
        toast: null,
        mobileNav: false,
        sellDraft: { ...defaultSellDraft, ...(stored.ui?.sellDraft || {}) },
        chat: { ...DEFAULT_STATE.ui.chat, open: false, messages: stored.ui?.chat?.messages || [] },
      },
    };
    if (!Array.isArray(merged.cart)) merged.cart = [];
    if (!Array.isArray(merged.wishlist)) merged.wishlist = [];
    if (!Array.isArray(merged.orders)) merged.orders = SEED_ORDERS;
    if (!Array.isArray(merged.userListings)) merged.userListings = [];
    syncUserListings(merged.userListings);
    return merged;
  } catch {
    syncUserListings([]);
    return structuredClone(DEFAULT_STATE);
  }
}

let state = hydrate();
const listeners = new Set();
let saveTimer = 0;

function persist() {
  clearTimeout(saveTimer);
  const write = () => {
    try {
      const { ui, ...rest } = state;
      const slimUi = {
        filters: ui.filters,
        newsletter: undefined,
        checkout: { coupon: ui.checkout.coupon, shipping: ui.checkout.shipping, payment: ui.checkout.payment },
        lookbook: ui.lookbook,
        openFaq: ui.openFaq,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, ui: slimUi }));
    } catch {
      /* storage full or blocked — the app keeps working in memory */
    }
  };
  write();
  saveTimer = setTimeout(write, 120);
}

function notify(meta) {
  persist();
  listeners.forEach((fn) => {
    try {
      fn(state, meta);
    } catch (err) {
      console.error('[state] subscriber failed', err);
    }
  });
}

export const getState = () => state;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Mutate a shallow clone of state, then broadcast. */
export function commit(mutator, meta = {}) {
  const draft = { ...state, ui: { ...state.ui } };
  mutator(draft);
  state = draft;
  notify(meta);
  return state;
}

/* ------------------------------------------------------------------ *
 * Derived selectors
 * ------------------------------------------------------------------ */
export const productOf = (line) => byId(line.productId) || PRODUCTS[0];

export const cartLines = () =>
  (state.cart || [])
    .map((line) => {
      const product = byId(line.productId);
      return product ? { ...line, product } : null;
    })
    .filter(Boolean);

export const cartCount = () => (state.cart || []).reduce((n, l) => n + l.qty, 0);
export const wishlistCount = () => (state.wishlist || []).length;

export const wishlistProducts = () =>
  (state.wishlist || []).map((id) => byId(id)).filter(Boolean);

/**
 * Resolve a governorate to its delivery zone.
 * Returns { gov, name, tier, label, rate, min, max, courier, note, tax }.
 */
export function deliveryFor(code) {
  const gov = GOVERNORATES.find((g) => g.code === code) || GOVERNORATES[0];
  const tier = SHIPPING_TIERS[gov.tier] || SHIPPING_TIERS['grand-tunis'];
  return { gov, govCode: gov.code, name: gov.name, tier: gov.tier, ...tier, tax: VAT_RATE };
}

/** Backwards-compatible alias used by older call sites. */
export const zoneFor = deliveryFor;

export function validateCoupon(code, subtotal) {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) return { ok: false, reason: 'Enter a code to apply.' };
  const coupon = COUPONS.find((c) => c.code === clean);
  if (!coupon) return { ok: false, reason: 'That code is not in our ledger.' };
  if (subtotal < coupon.min) {
    return { ok: false, reason: `Spend ${coupon.min} DT to unlock ${coupon.code}.` };
  }
  return { ok: true, coupon };
}

/**
 * The pricing engine. Discount → shipping → TVA, in that order.
 * Domestic Tunisia only: one zone per governorate, free above 250 DT.
 */
export function computeTotals({ gov = 'tunis', couponCode = '', express = false } = {}) {
  const lines = cartLines();
  const zone = deliveryFor(gov);
  const subtotal = round2(lines.reduce((n, l) => n + l.product.price * l.qty, 0));
  const retail = round2(lines.reduce((n, l) => n + (l.product.retail || l.product.price) * l.qty, 0));
  const units = lines.reduce((n, l) => n + l.qty, 0);

  let shipping = units === 0 ? 0 : round2(zone.rate);
  if (units > 1) shipping = round2(shipping + (units - 1) * 2);
  if (subtotal >= FREE_SHIPPING_THRESHOLD) shipping = 0;

  const expressRate = EXPRESS_SURCHARGE;
  if (express && units > 0) shipping = round2(shipping + expressRate);

  let discount = 0;
  let coupon = null;
  let couponError = '';

  const attempt = validateCoupon(couponCode, subtotal);
  if (couponCode) {
    if (attempt.ok) {
      coupon = attempt.coupon;
      if (coupon.type === 'percent') discount = round2(subtotal * (coupon.value / 100));
      if (coupon.type === 'fixed') discount = Math.min(round2(coupon.value), subtotal);
      if (coupon.type === 'shipping') {
        discount = 0;
        shipping = 0;
      }
    } else {
      couponError = attempt.reason;
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = round2(taxable * VAT_RATE);
  const total = round2(taxable + shipping + tax);

  return {
    lines,
    units,
    subtotal,
    retail,
    savings: round2(retail - subtotal),
    shipping,
    discount,
    tax,
    taxRate: VAT_RATE,
    total,
    zone,
    coupon,
    couponError,
    express,
    expressRate,
    freeShipping: shipping === 0,
  };
}

export const orderById = (id) => (state.orders || []).find((o) => o.id === id) || null;

export const isWishlisted = (id) => (state.wishlist || []).includes(id);

export const cartQty = (id) => {
  const line = (state.cart || []).find((l) => l.productId === id);
  return line ? line.qty : 0;
};

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */
const openAuth = (pending = null) => {
  commit(
    (d) => {
      d.ui.auth = { open: true, mode: 'login', pending };
      d.ui.drawer = null;
    },
    { partial: 'overlay' },
  );
};

export const actions = {
  /* ---------- overlays ---------- */
  openDrawer(name) {
    commit((d) => { d.ui.drawer = name; }, { partial: 'overlay' });
  },
  closeDrawer() {
    commit((d) => { d.ui.drawer = null; }, { partial: 'overlay' });
  },
  openAuth,
  closeAuth() {
    commit((d) => { d.ui.auth = { open: false, mode: 'login', pending: null, draft: {} }; }, { partial: 'overlay' });
  },
  setAuthMode(mode, draft = {}) {
    commit((d) => { d.ui.auth = { ...d.ui.auth, mode, draft: { ...(d.ui.auth.draft || {}), ...draft } }; }, { partial: 'overlay' });
  },
  openQuickView(id) {
    commit((d) => {
      d.ui.quickView = id;
      d.recentlyViewed = [id, ...(d.recentlyViewed || []).filter((x) => x !== id)].slice(0, 6);
    }, { partial: 'overlay' });
  },
  closeQuickView() {
    commit((d) => { d.ui.quickView = null; }, { partial: 'overlay' });
  },
  toggleMobileNav(force) {
    commit((d) => { d.ui.mobileNav = force ?? !d.ui.mobileNav; }, { partial: 'overlay' });
  },
  toggleMobileFilters(force) {
    commit((d) => { d.ui.mobileFilters = force ?? !d.ui.mobileFilters; }, { partial: 'view' });
  },
  toast(message, tone = 'ink') {
    const id = Date.now();
    commit((d) => { d.ui.toast = { id, message, tone }; }, { partial: 'toast' });
    setTimeout(() => {
      if (getState().ui.toast?.id === id) {
        commit((d) => { d.ui.toast = null; }, { partial: 'toast' });
      }
    }, 3600);
  },

  /* ---------- auth ---------- */
  login({ email, name, password, mode }) {
    const rawEmail = String(email || '').trim().toLowerCase();
    const cleanEmail = rawEmail
      ? rawEmail.includes('@')
        ? rawEmail
        : `${rawEmail.replace(/\s+/g, '.')}@atelierarchive.tn`
      : 'member@atelierarchive.tn';
    const display =
      String(name || '').trim() ||
      cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()) ||
      'Archive Member';
    const isSignup = mode === 'signup';
    const user = {
      id: `usr-${Math.abs(hash(cleanEmail))}`,
      name: display,
      email: cleanEmail,
      phone: '',
      memberSince: isSignup ? new Date().toISOString() : '2024-05-14T10:00:00Z',
      tier: 'Archive Circle',
      points: isSignup ? 250 : 1240,
      address: defaultShipping,
      ...(getState().user?.email === cleanEmail ? getState().user : {}),
      name: String(name || '').trim() || (getState().user?.email === cleanEmail ? getState().user.name : display),
    };
    commit(
      (d) => {
        d.user = user;
        d.ui.auth = { open: false, mode: 'login', pending: null, draft: {} };
        d.ui.checkout.shipping = {
          ...d.ui.checkout.shipping,
          name: d.ui.checkout.shipping.name || user.name,
          email: d.ui.checkout.shipping.email || user.email,
        };
      },
      { partial: 'all' },
    );
    actions.toast(
      isSignup
        ? `Account created — welcome, ${user.name.split(' ')[0]}!`
        : `Welcome${password ? ' back' : ''}, ${user.name.split(' ')[0]}.`,
      'success',
    );
    return user;
  },
  logout() {
    commit(
      (d) => {
        d.user = null;
        d.ui.auth = { open: false, mode: 'login', pending: null };
      },
      { partial: 'all' },
    );
    actions.toast('Signed out. Your vault is saved.', 'ink');
  },
  updateProfile(patch) {
    commit(
      (d) => {
        d.user = { ...d.user, ...patch };
      },
      { partial: 'view' },
    );
    actions.toast('Profile updated.', 'success');
  },

  /* ---------- basket ---------- */
  addToCart(id, qty = 1) {
    const product = byId(id);
    if (!product) return;
    const cap = product.stock || 1;
    const existing = getState().cart.find((l) => l.productId === id);
    commit(
      (d) => {
        if (existing) {
          existing.qty = Math.min(cap, existing.qty + qty);
          d.cart = [...d.cart];
        } else {
          d.cart = [...d.cart, { productId: id, qty: Math.min(cap, qty) }];
        }
        d.wishlist = d.wishlist.filter((x) => x !== id);
      },
      { partial: 'commerce' },
    );
    actions.toast(`${product.shortTitle} added to your bag.`, 'success');
  },
  setQty(id, qty) {
    const product = byId(id);
    const cap = product?.stock || 1;
    commit(
      (d) => {
        const line = d.cart.find((l) => l.productId === id);
        if (!line) return;
        if (qty <= 0) d.cart = d.cart.filter((l) => l.productId !== id);
        else {
          line.qty = Math.min(cap, qty);
          d.cart = [...d.cart];
        }
      },
      { partial: 'commerce' },
    );
  },
  removeFromCart(id) {
    const product = byId(id);
    commit((d) => { d.cart = d.cart.filter((l) => l.productId !== id); }, { partial: 'commerce' });
    actions.toast(`${product?.shortTitle || 'Piece'} removed.`, 'ink');
  },
  clearCart() {
    commit((d) => { d.cart = []; }, { partial: 'commerce' });
  },

  /* ---------- wishlist ---------- */
  toggleWishlist(id) {
    const product = byId(id);
    const had = isWishlisted(id);
    commit(
      (d) => {
        d.wishlist = had ? d.wishlist.filter((x) => x !== id) : [id, ...d.wishlist];
      },
      { partial: 'commerce' },
    );
    actions.toast(
      had ? `${product?.shortTitle} removed from your vault.` : `${product?.shortTitle} saved to your vault.`,
      had ? 'ink' : 'success',
    );
  },
  moveWishlistToCart(id) {
    const product = byId(id);
    commit(
      (d) => {
        d.wishlist = d.wishlist.filter((x) => x !== id);
        const existing = d.cart.find((l) => l.productId === id);
        if (existing) existing.qty = Math.min(product?.stock || 1, existing.qty + 1);
        else d.cart = [...d.cart, { productId: id, qty: 1 }];
        d.cart = [...d.cart];
      },
      { partial: 'commerce' },
    );
    actions.toast(`${product?.shortTitle} moved to your bag.`, 'success');
  },
  clearWishlist() {
    commit((d) => { d.wishlist = []; }, { partial: 'commerce' });
    actions.toast('Vault emptied.', 'ink');
  },
  moveAllWishlistToCart() {
    const state = getState();
    const ids = [...state.wishlist];
    if (!ids.length) return 0;
    commit(
      (d) => {
        ids.forEach((id) => {
          const product = byId(id);
          const cap = product?.stock || 1;
          const existing = d.cart.find((l) => l.productId === id);
          if (existing) existing.qty = Math.min(cap, existing.qty + 1);
          else d.cart = [...d.cart, { productId: id, qty: 1 }];
        });
        d.cart = [...d.cart];
        d.wishlist = [];
      },
      { partial: 'commerce' },
    );
    actions.toast(`${ids.length} ${ids.length === 1 ? 'piece' : 'pieces'} moved to your bag.`, 'success');
    return ids.length;
  },
  reorder(orderIdValue) {
    const order = (getState().orders || []).find((o) => o.id === orderIdValue);
    if (!order) return;
    const available = order.items.filter((line) => byId(line.productId));
    if (!available.length) {
      actions.toast('Those pieces have since found homes.', 'ink');
      return;
    }
    commit(
      (d) => {
        available.forEach((line) => {
          const product = byId(line.productId);
          const cap = product?.stock || 1;
          const existing = d.cart.find((l) => l.productId === line.productId);
          if (existing) existing.qty = Math.min(cap, existing.qty + line.qty);
          else d.cart = [...d.cart, { productId: line.productId, qty: Math.min(cap, line.qty) }];
        });
        d.cart = [...d.cart];
      },
      { partial: 'commerce' },
    );
    actions.openDrawer('cart');
    actions.toast(
      available.length === order.items.length
        ? 'Everything from that order is back in your bag.'
        : 'Available pieces from that order are in your bag.',
      'success',
    );
  },

  /* ---------- catalog ---------- */
  setFilter(patch, { deferred = false } = {}) {
    commit(
      (d) => {
        d.ui.filters = { ...d.ui.filters, ...patch };
      },
      { partial: deferred ? 'catalog-results' : 'view' },
    );
  },
  toggleFilterValue(key, value) {
    const current = getState().ui.filters[key] || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    actions.setFilter({ [key]: next });
  },
  resetFilters() {
    commit(
      (d) => {
        d.ui.filters = {
          q: '',
          categories: [],
          sizes: [],
          conditions: [],
          eras: [],
          soldBy: [],
          min: 0,
          max: 150,
          sort: 'curated',
        };
      },
      { partial: 'view' },
    );
  },

  /* ---------- product page ---------- */
  setProductTab(tab) {
    commit((d) => { d.ui.product = { ...d.ui.product, tab }; }, { partial: 'view' });
  },
  setProductImage(i) {
    commit((d) => { d.ui.product = { ...d.ui.product, imageIndex: i }; }, { partial: 'view' });
  },

  /* ---------- checkout ---------- */
  setCheckoutStep(step) {
    commit((d) => { d.ui.checkout.step = step; }, { partial: 'view' });
  },
  setShippingField(field, value) {
    commit(
      (d) => {
        d.ui.checkout.shipping = { ...d.ui.checkout.shipping, [field]: value };
      },
      { partial: 'checkout-summary' },
    );
  },
  setPayment(method) {
    commit((d) => { d.ui.checkout.payment = method; }, { partial: 'view' });
  },
  applyCoupon(code, totals) {
    const attempt = validateCoupon(code, totals.subtotal);
    if (!attempt.ok) {
      commit(
        (d) => {
          d.ui.checkout.couponError = attempt.reason;
          d.ui.checkout.couponApplied = null;
          d.ui.checkout.coupon = String(code).toUpperCase();
        },
        { partial: 'checkout-summary' },
      );
      return false;
    }
    commit(
      (d) => {
        d.ui.checkout.coupon = attempt.coupon.code;
        d.ui.checkout.couponError = '';
        d.ui.checkout.couponApplied = attempt.coupon.code;
      },
      { partial: 'checkout-summary' },
    );
    actions.toast(`${attempt.coupon.code} applied — ${attempt.coupon.blurb}.`, 'success');
    return true;
  },
  removeCoupon() {
    commit(
      (d) => {
        d.ui.checkout.coupon = '';
        d.ui.checkout.couponApplied = null;
        d.ui.checkout.couponError = '';
      },
      { partial: 'checkout-summary' },
    );
  },
  placeOrder(totals) {
    if (!totals.lines.length) return null;
    const id = orderId();
    const ship = getState().ui.checkout.shipping;
    const steps = [
      { label: 'Order placed', at: new Date().toISOString(), done: true },
      { label: 'Authenticated in studio', at: null, done: false },
      { label: 'In transit', at: null, done: false },
      { label: 'Out for delivery', at: null, done: false },
    ];
    const order = {
      id,
      placedAt: new Date().toISOString(),
      status: 'Processing',
      stage: 1,
      payment: getState().ui.checkout.payment || 'cod',
      items: totals.lines.map((l) => ({ productId: l.product.id, qty: l.qty, price: l.product.price })),
      shipping: {
        name: ship.name || getState().user?.name || 'Archive Member',
        phone: ship.phone || '',
        line1: ship.line1 || '12 Avenue Habib Bourguiba',
        line2: ship.line2,
        city: ship.city || 'Tunis',
        region: ship.region,
        postal: ship.postal || '1000',
        gov: ship.gov || 'tunis',
      },
      courier: totals.zone.courier,
      tracking: 'Pending assignment',
      totals: {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
      },
      steps,
      eta: `${totals.zone.min}–${totals.zone.max} business days`,
      coupon: totals.coupon?.code || null,
    };
    commit(
      (d) => {
        d.orders = [order, ...d.orders];
        d.cart = [];
        d.ui.checkout = {
          ...d.ui.checkout,
          step: 5,
          placedOrder: order,
          coupon: '',
          couponApplied: null,
          shipping: { ...defaultShipping, name: ship.name, email: ship.email },
        };
        if (d.user) d.user = { ...d.user, points: (d.user.points || 0) + Math.round(totals.total) };
      },
      { partial: 'view' },
    );
    return order;
  },
  startNewCheckout() {
    commit(
      (d) => {
        d.ui.checkout = {
          ...d.ui.checkout,
          step: 1,
          placedOrder: null,
          coupon: '',
          couponApplied: null,
          couponError: '',
        };
      },
      { partial: 'view' },
    );
  },

  /* ---------- store sales ---------- */
  /** Kept as a no-op so old links cannot break; there is nothing to RSVP to. */
  toggleRsvp() {
    actions.toast('Store sales need no ticket — just walk in during the dates.', 'ink');
  },

  /* ---------- support ---------- */
  toggleFaq(index) {
    commit((d) => { d.ui.openFaq = d.ui.openFaq === index ? null : index; }, { partial: 'view' });
  },
  toggleChat(force) {
    const open = force ?? !getState().ui.chat.open;
    commit(
      (d) => {
        d.ui.chat = { ...d.ui.chat, open, unread: open ? 0 : d.ui.chat.unread };
        if (open && d.ui.chat.messages.length === 0) {
          d.ui.chat.messages = [
            {
              id: 'm-0',
              from: 'wren',
              text: 'Hi — I am Wren, the studio assistant. Ask me about sizing, condition grades, shipping or a drop you are waiting on.',
              at: Date.now(),
            },
          ];
        }
      },
      { partial: 'overlay' },
    );
  },
  sendChat(text) {
    const message = String(text || '').trim();
    if (!message) return;
    commit(
      (d) => {
        d.ui.chat = {
          ...d.ui.chat,
          messages: [...d.ui.chat.messages, { id: `m-${Date.now()}`, from: 'me', text: message, at: Date.now() }],
        };
      },
      { partial: 'chat' },
    );
  },
  receiveChat(text) {
    commit(
      (d) => {
        d.ui.chat = {
          ...d.ui.chat,
          messages: [...d.ui.chat.messages, { id: `m-${Date.now()}`, from: 'wren', text, at: Date.now() }],
        };
      },
      { partial: 'chat' },
    );
  },
  toggleNewsletter() {
    const next = !getState().newsletter;
    commit((d) => { d.newsletter = next; }, { partial: 'view' });
    actions.toast(next ? 'You are on the list. One quiet email per drop.' : 'Unsubscribed.', next ? 'success' : 'ink');
  },
  setLookbook(i) {
    commit((d) => { d.ui.lookbook = i; }, { partial: 'view' });
  },

  /* ---------- community thrift listings ---------- */
  publishListing(input = {}) {
    const cur = getState();
    const draft = { ...(cur.ui.sellDraft || defaultSellDraft), ...input };
    const price = Math.max(1, Math.round(Number(draft.price) || 65));
    const retail = Math.max(price + 20, Math.round(Number(draft.retail) || price * 1.65));
    const id = `aa-u${Date.now().toString().slice(-5)}`;
    const title = String(draft.title || 'Vintage Thrift Piece').trim();
    const shortTitle = title.length > 28 ? `${title.slice(0, 26).trim()}…` : title;
    const brand = String(draft.brand || 'Vintage Fripe').trim();
    const category = draft.category || 'Outerwear';
    const era = draft.era || '90s';
    const size = draft.size || '42';
    const condition = draft.condition || 'Excellent';
    const gradeMap = { Vault: 'A+', Excellent: 'A', Good: 'B+' };
    const image = String(draft.image || '1591047139829-d91aecb6caea').trim();
    const sellerName = String(draft.sellerName || cur.user?.name || 'Community Seller').trim();
    const handleBase = sellerName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'fripe';
    const sellerLocation = String(draft.sellerLocation || cur.user?.address?.city || 'La Marsa, Tunis').trim();
    const story = String(
      draft.story || 'Listed directly from a personal closet in Tunisia. Clean, steamed, and ready to wear.',
    ).trim();
    const material = String(draft.material || '100% vintage fabric').trim();
    const colorway = String(draft.colorway || 'Classic vintage tone').trim();

    const product = {
      id,
      sku: `AA-${id.slice(-4).toUpperCase()}-TN`,
      title,
      shortTitle,
      brand,
      category,
      era,
      size,
      sizeSystem: 'EU',
      condition,
      grade: gradeMap[condition] || 'A',
      price,
      retail,
      colorway,
      material,
      madeIn: 'Tunisia / Imported',
      fit: size === 'Taille unique' ? 'One size' : `True to EU ${size}`,
      images: [image],
      measurements:
        size === 'Taille unique'
          ? { Size: 'One size', Fit: 'Universal' }
          : { Size: `EU ${size}`, Chest: '56 cm', Length: '68 cm', Shoulder: '47 cm' },
      conditionNotes: story,
      story,
      tags: [brand.toLowerCase(), category.toLowerCase(), era.toLowerCase(), 'thrift', 'community'],
      rating: 5.0,
      reviews: 1,
      saves: 1,
      listedDaysAgo: 0,
      stock: 1,
      badge: 'Just listed',
      isUserListing: true,
      soldBy: 'individual',
      seller: {
        id: `user-${handleBase}`,
        type: 'individual',
        name: sellerName,
        handle: `@${handleBase}.tn`,
        location: sellerLocation,
        rating: 5.0,
        reviews: 1,
        sales: 1,
        joined: '2026',
        response: 'usually within 1 hour',
        photoStyle: 'phone',
        fulfilment: 'seller',
        blurb: 'Community member listing items directly on the Atelier Archive thrift floor.',
      },
    };

    commit(
      (d) => {
        d.userListings = [product, ...(d.userListings || [])];
        syncUserListings(d.userListings);
        d.ui.filters = {
          q: '',
          categories: [],
          sizes: [],
          conditions: [],
          eras: [],
          soldBy: [],
          min: 0,
          max: 150,
          sort: 'curated',
        };
        d.ui.sellDraft = {
          ...defaultSellDraft,
          sellerName: d.user?.name || sellerName,
          sellerLocation,
        };
      },
      { partial: 'all' },
    );
    actions.toast(`Published "${shortTitle}" — now live on the floor!`, 'success');
    return product;
  },

  deleteListing(id) {
    commit(
      (d) => {
        d.userListings = (d.userListings || []).filter((p) => p.id !== id);
        d.cart = (d.cart || []).filter((l) => l.productId !== id);
        d.wishlist = (d.wishlist || []).filter((w) => w !== id);
        syncUserListings(d.userListings);
      },
      { partial: 'all' },
    );
    actions.toast('Listing removed from the floor.', 'info');
  },
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/** Test hook / reset. */
export function resetState() {
  state = structuredClone(DEFAULT_STATE);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
  notify({ partial: 'all' });
}
