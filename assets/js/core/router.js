/** Hash router — small, dependency free, with param matching. */

const listeners = new Set();

export function parseHash(hash = window.location.hash) {
  const raw = String(hash || '').replace(/^#/, '');
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = pathPart ? (pathPart.startsWith('/') ? pathPart : `/${pathPart}`) : '/';
  const query = Object.fromEntries(new URLSearchParams(queryPart).entries());
  return { path: path === '/' ? '/home' : path.replace(/\/+$/, '') || '/home', query, raw };
}

export function matchRoute(routes, path) {
  const segments = path.split('/').filter(Boolean);
  for (const route of routes) {
    const pattern = route.path.split('/').filter(Boolean);
    if (pattern.length !== segments.length) continue;
    const params = {};
    const ok = pattern.every((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(segments[i]);
        return true;
      }
      return part === segments[i];
    });
    if (ok) return { route, params };
  }
  return null;
}

export function navigate(to, { replace = false } = {}) {
  const target = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`;
  if (replace) {
    window.history.replaceState(null, '', target);
    emit();
  } else if (window.location.hash === target) {
    emit();
  } else {
    window.location.hash = target;
  }
}

export function currentRoute() {
  return parseHash(window.location.hash);
}

function emit() {
  const route = currentRoute();
  listeners.forEach((fn) => fn(route));
}

export function onRouteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Build a hash URL with a query object. */
export function buildUrl(path, query = {}) {
  const qs = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ).toString();
  return `#${path}${qs ? `?${qs}` : ''}`;
}

export function startRouter() {
  window.addEventListener('hashchange', () => {
    emit();
  });
  if (!window.location.hash) {
    window.history.replaceState(null, '', '#/home');
  }
}
