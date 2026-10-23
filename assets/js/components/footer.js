/** Editorial footer with newsletter, trust marks and socials. */
import { html } from '../core/dom.js';
import { icon, BTN, FIELD } from './ui.js';
import { BRAND, FOOTER_COLUMNS, SOCIALS, TRUST_MARKS } from '../data/content.js';

const SOCIAL_ICON = { Instagram: 'instagram', Pinterest: 'pinterest', Substack: 'book' };

export function renderFooter(state) {
  return html`
    <footer class="mt-24 bg-stone-50/50">
      <!-- trust strip -->
      <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
        <div class="grid grid-cols-2 gap-3 rounded-[32px] bg-white p-4 shadow-xl shadow-stone-200/40 sm:grid-cols-4 sm:p-6">
          ${TRUST_MARKS.map(
            (mark, i) => html`
              <div class="flex items-start gap-3 rounded-2xl px-3 py-3 transition-all duration-300 ease-out hover:bg-stone-50">
                <span class="mt-0.5 text-stone-400">${icon(['shield', 'tag', 'refresh', 'sparkle'][i], 'h-[18px] w-[18px]')}</span>
                <span>
                  <span class="block text-[11px] font-medium leading-tight text-zinc-900">${mark.label}</span>
                  <span class="mt-1 block text-[10.5px] leading-snug text-stone-500">${mark.detail}</span>
                </span>
              </div>`,
          )}
        </div>
      </div>

      <div class="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-20">
        <div class="grid gap-12 lg:grid-cols-[1.35fr_2fr]">
          <!-- brand + newsletter -->
          <div class="max-w-sm">
            <a href="#/home" class="group inline-flex items-baseline gap-2">
              <span class="font-display text-lg font-light uppercase tracking-[0.3em] text-zinc-900">Atelier</span>
              <span class="h-3 w-px bg-stone-300"></span>
              <span class="font-display text-lg font-light uppercase tracking-[0.3em] text-stone-500">Archive</span>
            </a>
            <p class="mt-5 text-[13px] leading-relaxed text-stone-500">
              A considered floor of second-life clothing — sourced by hand, graded honestly, and documented piece by piece.
              Established ${BRAND.established} in ${BRAND.city}.
            </p>

            <div class="mt-8">
              <p class="text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">The Rail — one email per drop</p>
              <form class="mt-3 flex items-center gap-2" data-form="newsletter">
                <label class="sr-only" for="footer-email">Email address</label>
                <input id="footer-email" type="email" required placeholder="you@studio.com" class="${FIELD} !rounded-full !bg-white !py-3 !text-[12.5px] shadow-sm shadow-stone-200/60" />
                <button type="submit" class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-stone-50 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg" aria-label="Subscribe">
                  ${icon('arrowRight', 'h-4 w-4')}
                </button>
              </form>
              <p class="mt-2.5 text-[10.5px] text-stone-400">${state.newsletter ? 'You are on the list — quietly.' : 'No daily noise. Unsubscribe in one click.'}</p>
            </div>

            <div class="mt-8 flex items-center gap-2">
              ${SOCIALS.map(
                (s) => html`<a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-500 shadow-sm shadow-stone-200/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-zinc-900 hover:shadow-md hover:shadow-stone-300/50">
                  ${icon(SOCIAL_ICON[s.label] || 'arrowUpRight', 'h-[17px] w-[17px]')}
                </a>`,
              )}
              <span class="ml-2 text-[10px] uppercase tracking-[0.18em] text-stone-400">${SOCIALS[0].handle}</span>
            </div>
          </div>

          <!-- link columns -->
          <div class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            ${FOOTER_COLUMNS.map(
              (col) => html`
                <div>
                  <p class="text-[9.5px] font-medium uppercase tracking-[0.26em] text-stone-400">${col.title}</p>
                  <ul class="mt-5 space-y-3">
                    ${col.links.map(
                      (link) => html`<li>
                        <a href="${link.href}" class="group relative inline-block text-[12.5px] text-stone-600 transition-colors duration-300 ease-out hover:text-zinc-900">
                          ${link.label}
                          <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-zinc-900 transition-all duration-300 ease-out group-hover:w-full"></span>
                        </a>
                      </li>`,
                    )}
                  </ul>
                </div>`,
            )}
          </div>
        </div>

        <!-- oversized wordmark -->
        <div class="mt-20 select-none overflow-hidden">
          <p class="whitespace-nowrap text-center font-display text-[clamp(2.8rem,11vw,9.5rem)] font-light leading-[0.85] tracking-[-0.03em] text-stone-200">
            Atelier Archive
          </p>
        </div>

        <div class="mt-14 flex flex-col gap-5 border-t border-stone-200/70 pt-7 text-[10.5px] text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© ${new Date().getFullYear()} ${BRAND.name}. Every piece authenticated by hand.</p>
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span class="uppercase tracking-[0.18em]">Privacy</span>
            <span class="uppercase tracking-[0.18em]">Terms</span>
            <span class="uppercase tracking-[0.18em]">Accessibility</span>
            <span class="ml-1 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm shadow-stone-200/60">
              ${icon('lock', 'h-3 w-3')} Secure checkout
            </span>
          </div>
        </div>
      </div>
    </footer>`;
}
