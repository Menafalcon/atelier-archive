/** Editorial footer: trust strip, newsletter, link index, oversized wordmark. */
import { html } from '../core/dom.js';
import { icon, BTN, FIELD } from './ui.js';
import { BRAND, FOOTER_COLUMNS, SOCIALS, TRUST_MARKS } from '../data/content.js';

const SOCIAL_ICON = { Instagram: 'instagram', Pinterest: 'pinterest', Substack: 'book' };

export function renderFooter(state) {
  return html`
    <footer class="mt-24 border-t border-ink/15 bg-paper">
      <div class="mx-auto max-w-[1440px] px-5 lg:px-10">
        <!-- trust strip -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-ink/10 py-6 sm:grid-cols-4">
          ${TRUST_MARKS.map(
            (mark, i) => html`
              <div class="flex items-start gap-3">
                <span class="mt-0.5 font-mono text-[8.5px] text-ink/35">${String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span class="block text-[11.5px] font-semibold leading-tight text-ink">${mark.label}</span>
                  <span class="mt-1 block font-mono text-[9px] uppercase leading-snug tracking-[0.1em] text-stone-500">${mark.detail}</span>
                </span>
              </div>`,
          )}
        </div>

        <div class="grid gap-12 py-14 lg:grid-cols-[1.35fr_2fr] lg:py-16">
          <!-- brand + newsletter -->
          <div class="max-w-sm">
            <a href="#/home" class="group inline-flex items-baseline gap-2">
              <span class="font-display text-[26px] leading-none text-ink transition-colors group-hover:text-oxblood">Atelier Archive</span>
            </a>
            <p class="mt-5 max-w-xs text-[13px] leading-relaxed text-stone-500">
              A considered floor of second-life clothing — sourced by hand, graded honestly, and documented
              piece by piece. Established ${BRAND.established} in ${BRAND.city}.
            </p>

            <div class="mt-8">
              <p class="eyebrow">The Rail — one email per drop</p>
              <form class="mt-3 flex items-stretch gap-2" data-form="newsletter">
                <label class="sr-only" for="footer-email">Email address</label>
                <input id="footer-email" type="email" required placeholder="you@studio.com" class="${FIELD} field--mono" />
                <button type="submit" class="btn btn--solid btn--icon shrink-0" aria-label="Subscribe">
                  ${icon('arrowRight', 'h-4 w-4')}
                </button>
              </form>
              <p class="mt-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink/40">${state.newsletter ? 'You are on the list — quietly.' : 'No daily noise. Unsubscribe in one click.'}</p>
            </div>

            <div class="mt-8 flex items-center gap-2">
              ${SOCIALS.map(
                (s) => html`<a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}" class="icon-btn border border-ink/15">
                  ${icon(SOCIAL_ICON[s.label] || 'arrowUpRight', 'h-[15px] w-[15px]')}
                </a>`,
              )}
              <span class="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink/40">${SOCIALS[0].handle}</span>
            </div>
          </div>

          <!-- link index -->
          <div class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            ${FOOTER_COLUMNS.map(
              (col) => html`
                <div>
                  <p class="eyebrow border-b border-ink/10 pb-2">${col.title}</p>
                  <ul class="mt-4 space-y-2.5">
                    ${col.links.map(
                      (link) => html`<li>
                        <a href="${link.href}" class="group relative inline-block text-[12.5px] text-stone-600 transition-colors duration-300 hover:text-ink">
                          ${link.label}
                          <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full"></span>
                        </a>
                      </li>`,
                    )}
                  </ul>
                </div>`,
            )}
          </div>
        </div>

        <!-- oversized wordmark -->
        <div class="select-none overflow-hidden border-t border-ink/10 pt-10">
          <p class="whitespace-nowrap text-center font-display text-[clamp(3rem,12vw,10rem)] leading-[0.8] tracking-[-0.03em] text-ink/15">
            Atelier Archive
          </p>
        </div>

        <div class="flex flex-col gap-5 border-t border-ink/10 py-7 font-mono text-[9px] uppercase tracking-[0.14em] text-ink/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© ${new Date().getFullYear()} ${BRAND.name}. Every piece authenticated by hand.</p>
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Accessibility</span>
            <span class="ml-1 flex items-center gap-1.5 border border-ink/15 px-3 py-1.5 text-ink/60">
              ${icon('lock', 'h-3 w-3')} Secure checkout
            </span>
          </div>
        </div>
      </div>
    </footer>`;
}
