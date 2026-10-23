/**
 * Offline audit — serves the app from localhost with the entire public web
 * blocked, then walks every route and proves each referenced asset resolves
 * from 127.0.0.1.
 * Run: node tools/offline-check.mjs
 */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9341;
const APP = 'http://127.0.0.1:4173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'aa-offline-'));

const proc = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,940',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

for (let i = 0; i < 80; i += 1) {
  try {
    if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break;
  } catch {
    /* wait */
  }
  await sleep(250);
}

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target = list.find((t) => t.type === 'page') || list[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let id = 0;
const pending = new Map();
const external = new Map();
const exceptions = [];

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
    return;
  }
  if (msg.method === 'Network.requestWillBeSent') {
    const url = msg.params.request.url;
    if (!url.startsWith(APP) && !url.startsWith('data:') && !url.startsWith('blob:')) {
      let host = url.slice(0, 40);
      try {
        host = new URL(url).host;
      } catch {
        /* keep raw */
      }
      external.set(host, (external.get(host) || 0) + 1);
    }
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    exceptions.push((msg.params.exceptionDetails.exception?.description || '').slice(0, 200));
  }
});

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', {
    expression: `(async () => { ${expression} })()`,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.result?.exceptionDetails) {
    console.error('  eval error:', res.result.exceptionDetails.exception?.description?.slice(0, 160));
  }
  return res.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Page.bringToFront');

// Simulate "no internet": block the whole public web. The app itself is served
// over plain http://127.0.0.1, which stays reachable.
await send('Network.setBlockedURLs', { urls: ['https://*', 'ws://*', 'wss://*'] });

console.log('\n\x1b[1mOFFLINE AUDIT\x1b[0m');
console.log('  public web blocked · app served from 127.0.0.1\n');

const routes = [
  ['/home', 'Clothing that has'],
  ['/catalog', 'The floor'],
  ['/product/aa-3311', 'Rust Flight Bomber'],
  ['/wishlist', 'vault'],
  ['/checkout', 'Checkout'],
  ['/events', 'Six shops'],
  ['/support', 'rubric'],
  ['/account', 'Sign in'],
];

await send('Page.navigate', { url: `${APP}/#/home` });
await sleep(2500);

const assets = new Set();
let rendersOk = true;

for (const [hash, marker] of routes) {
  await evaluate(`window.location.hash = ${JSON.stringify(hash)}; return 1;`);
  await sleep(900);
  const state = await evaluate(`
    const main = document.querySelector('#main');
    for (const img of document.images) if (img.getAttribute('src')) {
      try { window.__assets = window.__assets || []; window.__assets.push(new URL(img.getAttribute('src'), location.href).href); } catch (e) {}
    }
    return JSON.stringify({
      len: main ? main.innerHTML.length : 0,
      marker: main ? main.textContent.includes(${JSON.stringify(marker)}) : false
    });`);
  const s = JSON.parse(state || '{}');
  const ok = s.marker && s.len > 500;
  if (!ok) rendersOk = false;
  console.log(`  ${ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${hash.padEnd(20)} render=${String(s.len).padStart(6)}`);
}

const collected = (await evaluate(`return JSON.stringify(window.__assets || []);`)) || '[]';
JSON.parse(collected).forEach((u) => assets.add(u));

console.log('\n\x1b[1mASSETS\x1b[0m');
const external_images = [...assets].filter((u) => !u.startsWith(APP));
const local = [...assets].filter((u) => u.startsWith(APP));
console.log(`  referenced images: ${assets.size} (${local.length} local, ${external_images.length} remote)`);
if (external_images.length) external_images.slice(0, 5).forEach((u) => console.log(`  · remote: ${u}`));

const status = await evaluate(`
  const urls = ${JSON.stringify(local)};
  const out = await Promise.all(urls.map(async (u) => {
    try { const r = await fetch(u, { cache: 'no-store' }); return [u, r.ok ? r.status : r.status]; }
    catch (e) { return [u, 'ERR']; }
  }));
  return JSON.stringify(out);`);

const results = JSON.parse(status || '[]');
const broken = results.filter(([, code]) => code !== 200);
console.log(`  ${broken.length === 0 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} every local image resolves: ${results.length - broken.length}/${results.length}`);
broken.slice(0, 5).forEach(([u, code]) => console.log(`  · ${code} ${u}`));

console.log('\n\x1b[1mEXTERNAL CALLS\x1b[0m');
const otherHosts = [...external.keys()].filter((h) => !h.includes('fonts.'));
if (external.size === 0) {
  console.log('  \x1b[32m✓\x1b[0m none');
} else {
  for (const [host, count] of external) {
    const optional = host.includes('fonts.');
    console.log(`  ${optional ? '\x1b[33m·\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${host} × ${count}${optional ? ' (optional webfont, safe to fail)' : ''}`);
  }
}

console.log('\n\x1b[1mRUNTIME\x1b[0m');
console.log(`  ${exceptions.length === 0 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} uncaught exceptions: ${exceptions.length}`);

const pass = rendersOk && otherHosts.length === 0 && broken.length === 0 && exceptions.length === 0;
console.log(`\n${pass ? '\x1b[32mOFFLINE-SAFE\x1b[0m' : '\x1b[31mNOT OFFLINE-SAFE\x1b[0m'}\n`);

ws.close();
proc.kill();
await sleep(300);
process.exit(pass ? 0 : 1);
