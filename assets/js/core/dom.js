/** Tiny DOM / templating helpers. Escapes by default; `html` output is trusted. */

/**
 * Markup produced by `html` is wrapped in this String subclass so nested
 * templates are never escaped twice, while every plain interpolation is.
 */
class SafeHtml extends String {}

export const raw = (value) => new SafeHtml(String(value ?? ''));

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

function render(value) {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (value instanceof SafeHtml) return String(value);
  if (Array.isArray(value)) return value.map(render).join('');
  if (typeof value === 'object') return esc(JSON.stringify(value));
  return esc(value);
}

/** Tagged template returning trusted markup with escaped interpolations. */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i += 1) out += render(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

export const el = (markup) => {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(markup).trim();
  return tpl.content.firstElementChild;
};

export const qs = (sel, scope = document) => scope.querySelector(sel);
export const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

export function setHTML(target, markup) {
  const node = typeof target === 'string' ? qs(target) : target;
  if (node) node.innerHTML = markup;
  return node;
}

/** Attribute-safe boolean helper. */
export const attr = (name, value) => (value ? ` ${name}` : '');

/** Event delegation: one handler for every element matching `selector`. */
export function delegate(root, eventName, selector, handler) {
  root.addEventListener(eventName, (event) => {
    const match = event.target.closest(selector);
    if (match && root.contains(match)) handler(event, match);
  });
}

export function debounce(fn, wait = 180) {
  let timer = 0;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function lockScroll(locked) {
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/** Local SVG fallback so a failed remote photograph never leaves a hole. */
export function fallbackImage(label = 'Atelier Archive') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f5f5f4"/><stop offset="0.55" stop-color="#e7e5e4"/><stop offset="1" stop-color="#d6d3d1"/>
      </linearGradient>
    </defs>
    <rect width="800" height="1000" fill="url(#g)"/>
    <circle cx="400" cy="430" r="150" fill="none" stroke="#a8a29e" stroke-width="2" opacity="0.6"/>
    <path d="M320 470c40-70 120-70 160 0" fill="none" stroke="#a8a29e" stroke-width="2" opacity="0.7"/>
    <text x="400" y="640" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#78716c" letter-spacing="6">${esc(label.slice(0, 22).toUpperCase())}</text>
    <text x="400" y="680" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" fill="#a8a29e" letter-spacing="4">IMAGE UNAVAILABLE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Attach a graceful error fallback to every remote image inside `scope`. */
export function armImageFallbacks(scope = document) {
  qsa('img[data-fallback]', scope).forEach((img) => {
    if (img.dataset.armed) return;
    img.dataset.armed = '1';
    img.addEventListener(
      'error',
      () => {
        img.classList.add('is-fallback');
        img.src = img.dataset.fallback || fallbackImage(img.alt || 'Archive');
      },
      { once: true },
    );
  });
}
