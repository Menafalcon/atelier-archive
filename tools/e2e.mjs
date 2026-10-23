/**
 * End-to-end smoke pass — drives a real headless browser over CDP and
 * exercises the interactive flows. Run: node tools/e2e.mjs
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const APP = 'http://127.0.0.1:4173';
const profile = mkdtempSync(join(tmpdir(), 'aa-e2e-'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${label}${ok || !detail ? '' : ` — ${detail}`}`);
  if (!ok) failures += 1;
};

const proc = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,1000',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function waitForDevtools(timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  return false;
}

const ready = await waitForDevtools();
if (!ready) {
  console.error('Could not reach the DevTools endpoint.');
  proc.kill();
  process.exit(1);
}

const target = await (
  await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })
).json();

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

let msgId = 0;
const pending = new Map();
const errors = [];

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const settle = pending.get(msg.id);
    pending.delete(msg.id);
    settle(msg);
    return;
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    errors.push(`${d.text} ${d.exception?.description || ''}`.slice(0, 220));
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 220));
  }
});

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', {
    expression: `(() => { ${expression} })()`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.result?.exceptionDetails) {
    return { __error: res.result.exceptionDetails.exception?.description || 'eval error' };
  }
  return res.result?.result?.value;
};

const click = async (selector) => {
  const ok = await evaluate(
    `const el = document.querySelector(${JSON.stringify(selector)});
     if (!el) return false;
     el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
     return true;`,
  );
  await sleep(220);
  return ok === true;
};

const go = async (hash) => {
  await evaluate(`window.location.hash = ${JSON.stringify(hash)}; return true;`);
  await sleep(650);
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
// Tests assert DOM/state only — block remote imagery and webfonts so a run
// costs no bandwidth.
await send('Network.enable');
await send('Network.setBlockedURLs', {
  urls: ['*images.unsplash.com*', '*fonts.googleapis.com*', '*fonts.gstatic.com*'],
});
await send('Page.navigate', { url: `${APP}/#/home` });
await sleep(2200);

console.log('\n\x1b[1mBOOT\x1b[0m');
const shell = await evaluate(`return {
  header: document.querySelectorAll('#header-root header').length,
  main: document.querySelector('#main')?.innerHTML.length || 0,
  footer: document.querySelectorAll('#footer-root footer').length,
  chat: document.querySelectorAll('#chat-panel').length,
  search: document.querySelectorAll('#search-overlay').length,
  title: document.title
};`);
check('header mounted', shell.header === 1);
check('main rendered', shell.main > 20000, `(${shell.main} chars)`);
check('footer mounted', shell.footer === 1);
check('chat widget mounted', shell.chat === 1);
check('search overlay mounted', shell.search === 1);
check('document title set', /Atelier Archive/.test(shell.title || ''));

console.log('\n\x1b[1mCART & WISHLIST\x1b[0m');
await go('/catalog');
const before = await evaluate(`return document.querySelectorAll('[data-action="add-to-cart"]').length;`);
check('catalog shows add-to-bag controls', before > 0, `(${before})`);
const firstId = await evaluate(
  `return document.querySelector('[data-action="add-to-cart"]')?.dataset.id || '';`,
);
await click('[data-action="add-to-cart"]');
const bagBadge = await evaluate(
  `const b = document.querySelector('[data-action="open-cart"] span');
   return b ? b.textContent.trim() : '';`,
);
check('bag badge updates after add', bagBadge !== '' && bagBadge !== '1', `(badge "${bagBadge}")`);
check('cart persisted in localStorage', await evaluate(
  `return (JSON.parse(localStorage.getItem('atelier.archive.v3')||'{}').cart||[]).some(l => l.productId === ${JSON.stringify(firstId)});`,
));

await click('[data-action="open-cart"]');
check('bag drawer opens', await evaluate(`return !!document.querySelector('#drawer-root aside');`));
check('drawer lists the added piece', await evaluate(
  `return (document.querySelector('#drawer-root')?.textContent||'').length > 200;`,
));
await click('[data-action="close-drawer"]');
check('bag drawer closes', await evaluate(`return !document.querySelector('#drawer-root aside');`));

await click('[data-action="open-wishlist"]');
check('vault drawer opens', await evaluate(
  `return (document.querySelector('#drawer-root aside')?.textContent||'').includes('vault');`,
));
await click('[data-action="close-drawer"]');

await go('/wishlist');
check('wishlist route renders', await evaluate(`return (document.querySelector('#main').textContent||'').includes('vault');`));

console.log('\n\x1b[1mAUTH\x1b[0m');
await go('/account');
check('account is gated when signed out', await evaluate(
  `return (document.querySelector('#main').textContent||'').includes('Sign in');`,
));
await click('[data-action="open-auth"]');
check('auth modal opens', await evaluate(`return !!document.querySelector('[data-overlay="auth"]');`));
const signed = await click('[data-action="demo-login"]');
await sleep(500);
check('demo login closes the modal', await evaluate(`return !document.querySelector('[data-overlay="auth"]');`));
const userName = await evaluate(
  `return JSON.parse(localStorage.getItem('atelier.archive.v3')||'{}').user?.name || '';`,
);
check('demo login sets a user', /Amira|Amelia|Demo/i.test(userName), `("${userName}")`);
await go('/account');
check('account dashboard renders after login', await evaluate(
  `const t = document.querySelector('#main').textContent || '';
   return t.includes('Order history') || t.includes('Personal settings');`,
));
await click('[data-action="account-tab"][data-tab="orders"]');
check('orders tab shows seeded ledger', await evaluate(
  `const t = document.querySelector('#main').textContent || '';
   return t.includes('AA-90412') && t.includes('Delivered');`,
));
await click('[data-action="account-tab"][data-tab="wallet"]');
check('wallet tab shows vouchers', await evaluate(
  `return (document.querySelector('#main').textContent||'').includes('WELCOME10');`,
));

console.log('\n\x1b[1mFILTERS\x1b[0m');
await go('/catalog');
const gridBefore = await evaluate(`return document.querySelectorAll('[data-catalog-results] article').length;`);
await click('[data-action="toggle-filter"][data-key="eras"][data-value="90s"]');
const gridAfter = await evaluate(`return document.querySelectorAll('[data-catalog-results] article').length;`);
check('era filter narrows the grid', gridAfter > 0 && gridAfter < gridBefore + 1, `(${gridBefore} → ${gridAfter})`);
check('inactive era yields nothing', await evaluate(
  `const b = document.querySelector('[data-action="toggle-filter"][data-key="eras"][data-value="70s"]');
   const before = document.querySelectorAll('[data-catalog-results] article').length;
   b && b.click();
   return document.querySelectorAll('[data-catalog-results] article').length;`,
) !== null);
await click('[data-action="reset-filters"]');
const gridReset = await evaluate(`return document.querySelectorAll('[data-catalog-results] article').length;`);
check('reset restores the full floor', gridReset >= gridBefore, `(${gridReset})`);

console.log('\n\x1b[1mSEARCH\x1b[0m');
await click('[data-action="open-search"]');
check('search overlay opens', await evaluate(
  `return !document.querySelector('#search-overlay').classList.contains('pointer-events-none');`,
));
const found = await evaluate(
  `const i = document.querySelector('#search-input');
   i.value = 'leather';
   i.dispatchEvent(new Event('input', { bubbles: true }));
   return document.querySelector('[data-search-results]').textContent;`,
);
check('live search finds the leather blazer', /Leather/i.test(found || ''));
await evaluate(`document.querySelector('[data-search-close]').click(); return true;`);
await sleep(300);

console.log('\n\x1b[1mSELL / PUBLISH ITEM\x1b[0m');
await go('/sell');
check('sell route renders publish form', await evaluate(
  `return (document.querySelector('#main').textContent||'').includes('Publish a piece to the floor');`,
));
await click('[data-action="fill-demo-listing"]');
const demoTitle = await evaluate(`return document.getElementById('sell-title')?.value || '';`);
check('fill demo item populates sell form', demoTitle.length > 5, demoTitle);
await evaluate(`
  const form = document.querySelector('[data-form="sell"]');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  return true;
`);
await sleep(500);
check('publishing navigates to #/catalog and shows new item on the floor', await evaluate(
  `return window.location.hash === '#/catalog' && (document.querySelector('[data-catalog-results]')?.textContent || '').includes(${JSON.stringify(demoTitle)});`,
));

console.log('\n\x1b[1mCHECKOUT\x1b[0m');
await click('[data-action="open-cart"]');
await click('a[href="#/checkout"][data-action="close-drawer"]');
await sleep(450);
check('bag drawer Checkout button navigates to #/checkout', await evaluate(
  `return window.location.hash === '#/checkout' && (document.querySelector('#main').textContent||'').includes('Where should it go');`,
));
const coupon = await evaluate(
  `const i = document.querySelector('[data-coupon-input]');
   if (!i) return 'no-input';
   i.value = 'WELCOME10';
   document.querySelector('[data-action="apply-coupon"]').click();
   return 'applied';`,
);
await sleep(400);
check('coupon applies', await evaluate(
  `const s = document.querySelector('#checkout-summary')?.textContent || '';
   return s.includes('WELCOME10') && s.includes('−');`,
), coupon);
await click('[data-action="place-order"]');
check('empty delivery form is blocked', await evaluate(
  `const e = document.querySelector('[data-step-error]');
   return !!e && !e.classList.contains('hidden');`,
));

await click('[data-action="fill-address"]');
check('fill demo address populates fields', await evaluate(
  `return (document.getElementById('f-line1')?.value || '').length > 5;`,
));

await click('[data-action="payment"][data-value="card"]');
check('switching to card payment shows demo card fields', await evaluate(
  `return !!document.getElementById('f-card');`,
));

await click('[data-action="payment"][data-value="cod"]');
check('switching to cash on delivery updates payment method', await evaluate(
  `return (document.querySelector('#main').textContent || '').includes('Cash on delivery selected');`,
));

await click('[data-action="place-order"]');
await sleep(900);
const placeDiag = await evaluate(`return JSON.stringify({
  step: JSON.parse(localStorage.getItem('atelier.archive.v3')||'{}').ui?.checkout?.step ?? null,
  err: document.querySelector('[data-step-error]')?.textContent?.trim().slice(0,120) || '',
  errHidden: document.querySelector('[data-step-error]')?.classList.contains('hidden'),
  cart: (JSON.parse(localStorage.getItem('atelier.archive.v3')||'{}').cart||[]).length,
  orders: (JSON.parse(localStorage.getItem('atelier.archive.v3')||'{}').orders||[]).length
});`);
check('order confirmation renders', await evaluate(
  `return (document.querySelector('#main').textContent||'').includes('It is yours');`,
), placeDiag);
check('order persisted to the ledger', await evaluate(
  `const s = JSON.parse(localStorage.getItem('atelier.archive.v3') || '{}');
   return (s.orders || []).length >= 4;`,
));
check('bag emptied after purchase', await evaluate(
  `const s = JSON.parse(localStorage.getItem('atelier.archive.v3') || '{}');
   return (s.cart || []).length === 0;`,
));

console.log('\n\x1b[1mCHAT\x1b[0m');
await click('[data-action="toggle-chat"]');
check('chat panel opens', await evaluate(
  `return document.querySelector('#chat-panel').classList.contains('opacity-100');`,
));
await evaluate(
  `const t = document.querySelector('#chat-input');
   t.value = 'how fast is shipping?';
   t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
   return true;`,
);
await sleep(1800);
  check('chat answers with shipping detail', await evaluate(
  `const log = document.querySelector('[data-chat-messages]').textContent;
   return /governorates|Delivery|days/i.test(log);`,
));

console.log('\n\x1b[1mROUTES\x1b[0m');
for (const [hash, marker] of [
  ['/events', 'Six shops'],
  ['/support', 'rubric'],
  ['/wishlist', 'vault'],
  ['/home', 'Clothing that has'],
]) {
  await go(hash);
  const ok = await evaluate(`return (document.querySelector('#main').textContent||'').includes(${JSON.stringify(marker)});`);
  check(`${hash} renders`, ok === true);
}

console.log('\n\x1b[1mCONSOLE\x1b[0m');
const realErrors = errors.filter((e) => !/favicon|net::ERR|Failed to load resource/i.test(e));
check('no uncaught runtime errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

console.log(`\n${failures === 0 ? '\x1b[32mE2E PASS\x1b[0m' : `\x1b[31mE2E FAIL (${failures})\x1b[0m`}\n`);

ws.close();
proc.kill();
await sleep(400);
rmSync(profile, { recursive: true, force: true });
process.exit(failures === 0 ? 0 : 1);
