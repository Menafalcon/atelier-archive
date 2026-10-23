/** Formatting helpers. Prices are Tunisian dinars (TND), millimes trimmed. */

const tnd = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 285 → "285 DT", 142.8 → "142.8 DT" */
export const money = (n) => `${tnd.format(Number(n) || 0)} DT`;

export const compact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0);

export const pct = (n) => `${Math.round(Number(n) || 0)}%`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function date(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function dateTime(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  const h = d.getHours();
  const hh = ((h + 11) % 12) + 1;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${date(d)} · ${hh}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function longDate(input) {
  const d = new Date(`${input}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
}

export function monthLabel(input) {
  const d = new Date(`${input}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

export function dayLabel(input) {
  const d = new Date(`${input}T12:00:00`);
  return String(d.getDate()).padStart(2, '0');
}

export function relative(input) {
  const then = new Date(input).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months} mo ago` : `${Math.round(months / 12)} y ago`;
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'AA';

export const stars = (rating) => {
  const full = Math.round(rating);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
};

/** Deterministic short id for optimistic UI records. */
export function orderId() {
  return `AA-${Math.floor(10000 + Math.random() * 89999)}`;
}
