/**
 * Smoke test — renders every view and exercises the pricing engine
 * in plain Node with a minimal browser shim. Run: node tools/smoke.mjs
 */
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const base = new URL('../assets/js/', import.meta.url);
const load = (p) => import(new URL(p, base).href);

const { getState, computeTotals, commit, actions } = await load('core/state.js');
const { money } = await load('core/format.js');
const { PRODUCTS } = await load('data/catalog.js');

const views = {
  home: ['views/home.js', 'renderHome'],
  catalog: ['views/catalog.js', 'renderCatalog'],
  sell: ['views/sell.js', 'renderSell'],
  product: ['views/product.js', 'renderProduct'],
  wishlist: ['views/wishlist.js', 'renderWishlist'],
  checkout: ['views/checkout.js', 'renderCheckout'],
  account: ['views/account.js', 'renderAccount'],
  sales: ['views/sales.js', 'renderSales'],
  support: ['views/support.js', 'renderSupport'],
};

const components = {
  header: ['components/header.js', 'renderHeader'],
  footer: ['components/footer.js', 'renderFooter'],
  cartDrawer: ['components/drawer.js', 'renderCartDrawer'],
  wishlistDrawer: ['components/drawer.js', 'renderWishlistDrawer'],
  authModal: ['components/auth-modal.js', 'renderAuthModal'],
  quickView: ['components/quick-view.js', 'renderQuickView'],
  chat: ['components/chat-widget.js', 'renderChatWidget'],
  toast: ['components/chat-widget.js', 'renderToast'],
  search: ['components/search-overlay.js', 'renderSearchOverlay'],
};

let failures = 0;
const check = (label, condition, detail = '') => {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    failures += 1;
    console.log(`  \x1b[31m✗\x1b[0m ${label} ${detail}`);
  }
};

const assertMarkup = (label, markup) => {
  const str = String(markup);
  check(`${label} renders`, str.length > 400, `(length ${str.length})`);
  check(`${label} has no escape artifacts`, !str.includes('&lt;div') && !str.includes('[object Object]'));
  check(`${label} has balanced-ish tags`, (str.match(/<div/g) || []).length >= (str.match(/<\/div>/g) || []).length);
};

console.log('\n\x1b[1mVIEWS\x1b[0m');
for (const [name, [file, fn]] of Object.entries(views)) {
  const mod = await load(file);
  const render = mod[fn];
  check(`${name} exports ${fn}`, typeof render === 'function');
  const markup = render(getState(), { id: PRODUCTS[0].id });
  assertMarkup(name, markup);
}

console.log('\n\x1b[1mCOMPONENTS\x1b[0m');
let quick = getState();
for (const [name, [file, fn]] of Object.entries(components)) {
  const mod = await load(file);
  const render = mod[fn];
  check(`${name} exports ${fn}`, typeof render === 'function');
  let markup = render(getState());
  if (name === 'quickView') {
    commit((d) => { d.ui.quickView = PRODUCTS[0].id; }, { partial: 'none' });
    markup = render(getState());
  }
  if (name === 'authModal') {
    commit((d) => { d.ui.auth = { open: true, mode: 'signup', pending: null }; }, { partial: 'none' });
    markup = render(getState());
  }
  if (name === 'cartDrawer' || name === 'wishlistDrawer') {
    check(`${name} non-empty with seeded data`, String(markup).length > 400);
  }
  if (name === 'toast') {
    commit((d) => { d.ui.toast = { id: 1, message: 'Smoke test toast', tone: 'success' }; }, { partial: 'none' });
    markup = render(getState());
    commit((d) => { d.ui.toast = null; }, { partial: 'none' });
    check('toast renders when active', String(markup).includes('Smoke test toast'));
  }
  const str = String(markup);
  check(`${name} renders`, str.length > 0);
  check(`${name} clean output`, !str.includes('[object Object]'));
}

console.log('\n\x1b[1mCOMMERCE ENGINE\x1b[0m');
commit((d) => { d.ui.checkout.shipping.gov = 'tunis'; d.ui.checkout.coupon = ''; d.ui.checkout.express = false; }, { partial: 'none' });
const tn = computeTotals({ gov: 'tunis' });
check('Grand Tunis shipping is 7 DT under threshold', tn.shipping === 7, `(${tn.shipping})`);
check('Tunisia TVA rate applied', tn.taxRate === 0.19);
check('total = subtotal + shipping + tax', Math.abs(tn.total - (tn.subtotal + tn.shipping + tn.tax)) < 0.01, `(${tn.total})`);

const sousse = computeTotals({ gov: 'sousse', couponCode: 'WELCOME10' });
check('WELCOME10 discount is 10% of subtotal', Math.abs(sousse.discount - sousse.subtotal * 0.1) < 0.01, `(${sousse.discount})`);
check('TVA is 19% of discounted subtotal', Math.abs(sousse.tax - (sousse.subtotal - sousse.discount) * 0.19) < 0.01, `(${sousse.tax})`);
check('coupon resolves', sousse.coupon?.code === 'WELCOME10');

const freeship = computeTotals({ gov: 'tataouine', couponCode: 'FREESHIP' });
check('FREESHIP zeroes shipping', freeship.shipping === 0);

const invalid = computeTotals({ gov: 'tunis', couponCode: 'NOPE123' });
check('invalid coupon reports reason', !!invalid.couponError);

const express = computeTotals({ gov: 'sousse', express: true });
check('express adds a shipping premium', express.shipping > sousse.shipping, `(${express.shipping})`);

console.log('\n\x1b[1mCART ACTIONS\x1b[0m');
actions.addToCart('aa-1042');
check('add to cart', getState().cart.some((l) => l.productId === 'aa-1042'));
actions.setQty('aa-1042', 5);
const capped = getState().cart.find((l) => l.productId === 'aa-1042');
check('quantity capped at stock', capped.qty === 1, `(${capped.qty})`);
actions.toggleWishlist('aa-1042');
check('wishlist toggle on', getState().wishlist.includes('aa-1042'));
actions.toggleWishlist('aa-1042');
check('wishlist toggle off', !getState().wishlist.includes('aa-1042'));
actions.moveWishlistToCart('aa-1780');
check('wishlist → cart', getState().cart.some((l) => l.productId === 'aa-1780'));

actions.login({ email: 'smoke@test.dev', name: 'Smoke Test' });
check('login sets user', getState().user?.name === 'Smoke Test');
check('login clears auth modal', getState().ui.auth.open === false);
actions.updateProfile({ name: 'Smoke T.' });
check('profile update', getState().user.name === 'Smoke T.');

const before = getState().orders.length;
const placed = actions.placeOrder(computeTotals({ gov: 'tunis' }));
check('place order creates record', !!placed && getState().orders.length === before + 1);
check('place order empties bag', getState().cart.length === 0);
check('order id format', /^AA-\d{5}$/.test(placed.id), placed.id);
check('order has tracking steps', placed.steps.length === 4);

const checkoutView = await load('views/checkout.js');
const confirmed = String(checkoutView.renderCheckout(getState()));
check('confirmation renders after purchase', confirmed.includes('It is yours'));
check('confirmation shows the order id', confirmed.includes(placed.id));

actions.startNewCheckout();
const emptyCheckout = String(checkoutView.renderCheckout(getState()));
check('empty bag falls back to the empty state', emptyCheckout.includes('Nothing to check out'));

actions.sendChat('how fast is shipping?');
check('chat message stored', getState().ui.chat.messages.some((m) => m.from === 'me'));

console.log('\n\x1b[1mMARKETPLACE\x1b[0m');
check('every piece is priced between 40 and 150 DT', PRODUCTS.every((p) => p.price >= 40 && p.price <= 150));
check('every piece has a seller', PRODUCTS.every((p) => p.seller && p.seller.type));
check('floor is mixed shop + individual', new Set(PRODUCTS.map((p) => p.soldBy)).size === 2);
check('individual listings use phone photography', PRODUCTS.filter((p) => p.soldBy === 'individual').every((p) => p.seller.photoStyle === 'phone'));
check('studio listings use studio photography', PRODUCTS.filter((p) => p.soldBy === 'shop').every((p) => p.seller.photoStyle === 'studio'));
check('sellers carry ratings and sales', PRODUCTS.every((p) => typeof p.seller.rating === 'number' && typeof p.seller.sales === 'number'));
const catalogMod = await load('views/catalog.js');
const onlyIndividual = catalogMod.filterProducts({ soldBy: ['individual'], categories: [], conditions: [], eras: [], sizes: [], min: 0, max: 150, sort: 'curated' });
check('soldBy filter narrows correctly', onlyIndividual.length > 0 && onlyIndividual.length < PRODUCTS.length, `(${onlyIndividual.length})`);
check('soldBy filter only returns individuals', onlyIndividual.every((p) => p.soldBy === 'individual'));

const countBeforePublish = PRODUCTS.length;
const published = actions.publishListing({
  title: 'Smoke Test Vintage Denim Jacket',
  brand: 'Levi’s',
  price: 85,
  category: 'Denim',
  size: '42',
  condition: 'Excellent',
  era: '90s',
});
check('publishListing adds item to PRODUCTS', PRODUCTS.length === countBeforePublish + 1 && PRODUCTS[0].id === published.id);
check('published item appears first in catalog filterProducts', catalogMod.filterProducts(getState().ui.filters)[0]?.id === published.id);
actions.deleteListing(published.id);
check('deleteListing removes item from PRODUCTS', PRODUCTS.length === countBeforePublish);

console.log('\n\x1b[1mPERSISTENCE\x1b[0m');
const stored = JSON.parse(store.get('atelier.archive.v3') || 'null');
await new Promise((r) => setTimeout(r, 200));
const stored2 = JSON.parse(store.get('atelier.archive.v3') || 'null');
check('state written to localStorage', !!stored2, '(debounced)');
check('cart persisted', Array.isArray(stored2?.cart));
check('user persisted', stored2?.user?.email === 'smoke@test.dev');
check('orders persisted', Array.isArray(stored2?.orders) && stored2.orders.length >= 3);
check('wishlist persisted', Array.isArray(stored2?.wishlist));

console.log(`\n${failures === 0 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'} — ${failures} failing check(s)\n`);
process.exit(failures === 0 ? 0 : 1);
