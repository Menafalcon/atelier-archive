/**
 * Local screenshot pass for the restyle review.
 *   node tools/preview.mjs [port]
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9336;
const APP = `http://127.0.0.1:${process.argv[2] || '4180'}`;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'preview-v2');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const profile = join(tmpdir(), 'aa-preview-v2');
mkdirSync(profile, { recursive: true });

const proc = spawn(
  EDGE,
  [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, '--window-size=1440,940', 'about:blank',
  ],
  { stdio: 'ignore' },
);

async function waitForDevtools(timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return true;
    } catch { /* keep waiting */ }
    await sleep(250);
  }
  return false;
}

if (!(await waitForDevtools())) {
  console.error('DevTools endpoint unavailable');
  proc.kill();
  process.exit(1);
}

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target = list.find((t) => t.type === 'page') || list[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let msgId = 0;
const pending = new Map();
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const settle = pending.get(msg.id);
    pending.delete(msg.id);
    settle(msg);
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
  return res.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Storage.clearDataForOrigin', { origin: new URL(APP).origin, storageTypes: 'local_storage' });
await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});

async function shot(name, hash, { width = 1440, height = 940, scroll = 0, setup = '', wait = 1600 } = {}) {
  await send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 600,
  });
  await send('Page.navigate', { url: `${APP}/#${hash}` });
  await sleep(wait);
  if (setup) {
    await evaluate(setup);
    await sleep(900);
  }
  for (let i = 0; i < 25; i += 1) {
    const settled = await evaluate(
      `const imgs = [...document.images]; return imgs.length > 0 && imgs.every((im) => im.complete);`,
    );
    if (settled) break;
    await sleep(250);
  }
  if (scroll) {
    await evaluate(`window.scrollTo({ top: ${scroll}, behavior: 'instant' }); return 1;`);
    await sleep(700);
  }
  await sleep(400);
  const res = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const data = res.result?.data;
  if (!data) {
    console.log(`  ! ${name} — no data`);
    return;
  }
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
  console.log(`  ✓ ${name}.png`);
}

console.log(`\nPreviewing ${APP}`);
await shot('01-home', '/home');
await shot('02-home-collections', '/home', { scroll: 980 });
await shot('03-catalog', '/catalog');
await shot('04-product', '/product/aa-2107');
await shot('05-checkout', '/checkout');
await shot('06-checkout-filled', '/checkout', {
  setup: `document.querySelector('[data-action="fill-address"]')?.click(); return 1;`,
});
await shot('07-mobile-home', '/home', { width: 414, height: 900 });
await shot('11-auth', '/home', {
  setup: `document.querySelector('[data-action="open-auth"]')?.click(); return 1;`,
  wait: 2200,
});
await shot('08-account', '/account', {
  setup: `document.querySelector('[data-action="open-auth"]')?.click();
          setTimeout(() => document.querySelector('[data-action="demo-login"]')?.click(), 300);
          return 1;`,
  height: 1050,
});
await shot('09-sell', '/sell');
await shot('10-cart', '/catalog', {
  setup: `document.querySelector('[data-action="open-cart"]')?.click(); return 1;`,
});

ws.close();
proc.kill();
await sleep(300);
console.log(`\nSaved to ${OUT}\n`);
