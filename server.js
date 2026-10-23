#!/usr/bin/env node
/**
 * ATELIER ARCHIVE — zero-dependency static server.
 *
 *   node server.js [--port 4173] [--host 127.0.0.1]
 *
 * Deliberate choices, all aimed at "it just loads" on a single local machine:
 *   • `Connection: close` on every response. Node closes idle keep-alive
 *     sockets after 5s while browsers keep them pooled far longer; the next
 *     request on one of those sockets can hang until it times out. For a local
 *     demo the per-request handshake costs ~0.05ms and removes that failure
 *     class entirely.
 *   • ETag + If-None-Match so repeat loads answer 304 instead of re-sending
 *     the 450 KB Tailwind bundle.
 *   • Errors on aborted sockets are swallowed so one cancelled request can
 *     never take the process down.
 */
'use strict';

const http = require('node:http');
const crypto = require('node:crypto');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { URL } = require('node:url');

const ROOT = __dirname;

const argv = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const PORT = Number(readFlag('port', process.env.PORT || 4173));
const HOST = readFlag('host', process.env.HOST || '127.0.0.1');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/** Resolve a URL pathname to { file, stat } inside ROOT, or null. */
async function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;

  const target = path.normalize(path.join(ROOT, decoded));
  if (!target.startsWith(ROOT)) return null;

  try {
    const stat = await fsp.stat(target);
    if (stat.isDirectory()) {
      const index = path.join(target, 'index.html');
      const indexStat = await fsp.stat(index).catch(() => null);
      return indexStat && indexStat.isFile() ? { file: index, stat: indexStat } : null;
    }
    return stat.isFile() ? { file: target, stat } : null;
  } catch {
    return null;
  }
}

function etagFor(stat) {
  return `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
}

const baseHeaders = {
  connection: 'close',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

const server = http.createServer(async (req, res) => {
  const started = process.hrtime.bigint();

  req.on('error', () => {});
  res.on('error', () => {});

  const send = (status, headers, body) => {
    if (res.writableEnded) return;
    res.writeHead(status, { ...baseHeaders, ...headers });
    if (req.method === 'HEAD' || body === undefined) res.end();
    else res.end(body);
    log(status, req.url || '/', started);
  };

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || HOST}`);
  } catch {
    send(400, { 'content-type': 'text/plain; charset=utf-8' }, 'Bad Request');
    return;
  }

  const { pathname } = url;

  if (pathname === '/health') {
    send(200, { 'content-type': 'application/json; charset=utf-8' }, JSON.stringify({ ok: true, uptime: process.uptime() }));
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(405, { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' }, 'Method Not Allowed');
    return;
  }

  let resolved = await resolveFile(pathname === '/' ? '/index.html' : pathname);

  // SPA fallback: unknown extension-less paths render the app shell.
  if (!resolved && !path.extname(pathname)) {
    resolved = await resolveFile('/index.html');
  }

  if (!resolved) {
    send(404, { 'content-type': 'text/plain; charset=utf-8' }, '404 — Not Found');
    return;
  }

  const { file, stat } = resolved;
  const ext = path.extname(file).toLowerCase();
  const isHtml = ext === '.html';
  const etag = etagFor(stat);

  const cacheHeaders = {
    'content-type': MIME[ext] || 'application/octet-stream',
    'cache-control': isHtml ? 'no-store' : 'no-cache',
    etag,
    'last-modified': stat.mtime.toUTCString(),
  };

  // Revalidation: answer 304 when the browser already has this exact file.
  if (!isHtml && req.headers['if-none-match'] === etag) {
    send(304, cacheHeaders);
    return;
  }

  try {
    const body = await fsp.readFile(file);
    send(200, { ...cacheHeaders, 'content-length': body.length }, body);
  } catch {
    send(500, { 'content-type': 'text/plain; charset=utf-8' }, '500 — Internal Server Error');
  }
});

function log(status, target, started) {
  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  const tone = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
  process.stdout.write(`${tone}${status}\x1b[0m ${target} \x1b[2m${ms.toFixed(1)}ms\x1b[0m\n`);
}

server.on('clientError', (err, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  else socket.destroy();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use.\n  Close the other window, or run: node server.js --port ${PORT + 1}\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(
    [
      '',
      '  \x1b[1mATELIER ARCHIVE\x1b[0m \x1b[2m— thrift & archive boutique\x1b[0m',
      `  \x1b[2mserving\x1b[0m ${ROOT}`,
      `  \x1b[1m\x1b[32m→ http://${HOST}:${PORT}\x1b[0m`,
      '',
    ].join('\n'),
  );
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log('\n  server stopped.\n');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 800).unref();
  });
}
