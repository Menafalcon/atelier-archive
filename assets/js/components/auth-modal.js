/** Blurred glass auth modal — sign in / create account, mock user. */
import { html } from '../core/dom.js';
import { icon, BTN, FIELD, LABEL } from './ui.js';
import { img, SOURCES } from '../data/content.js';
import { BENEFITS } from './auth-benefits.js';

export function renderAuthModal(state, { animate = true } = {}) {
  const auth = state.ui.auth;
  if (!auth?.open) return '';
  const isSignup = auth.mode === 'signup';
  const draft = auth.draft || {};

  return html`
    <div class="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6" data-overlay="auth">
      <div class="absolute inset-0 ${animate ? 'animate-[fadeIn_.22s_ease-out]' : ''} bg-stone-900/35 backdrop-blur-md" data-action="close-auth"></div>

      <div class="relative max-h-[92vh] w-full max-w-[900px] ${animate ? 'animate-[modalIn_.28s_cubic-bezier(.22,.61,.36,1)]' : ''} overflow-y-auto rounded-[28px] bg-stone-50 shadow-2xl shadow-stone-900/30" role="dialog" aria-modal="true" aria-label="Account access">
        <button type="button" data-action="close-auth" class="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-500 shadow-sm backdrop-blur transition-all duration-300 ease-out hover:rotate-90 hover:text-zinc-900" aria-label="Close">
          ${icon('close', 'h-[18px] w-[18px]')}
        </button>

        <div class="grid md:grid-cols-[0.9fr_1.1fr]">
          <!-- visual -->
          <div class="relative hidden overflow-hidden md:block">
            <img src="${img(SOURCES.creamRack, 900, 0.72)}" alt="The archive rail" data-fallback="" class="absolute inset-0 h-full w-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-stone-900/10"></div>
            <div class="relative flex h-full flex-col justify-between p-8">
              <span class="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.22em] text-stone-100 backdrop-blur">
                ${icon('sparkle', 'h-3 w-3')} Members only
              </span>
              <div>
                <p class="font-display text-[24px] font-light leading-[1.15] tracking-tight text-stone-50">
                  A quieter way<br />to buy clothing.
                </p>
                <ul class="mt-5 space-y-2">
                  ${BENEFITS.map(
                    (b) => html`<li class="flex items-center gap-2.5 text-[11.5px] text-stone-300">
                      <span class="text-stone-400">${icon('check', 'h-3 w-3')}</span>${b}
                    </li>`,
                  )}
                </ul>
              </div>
            </div>
          </div>

          <!-- form -->
          <div class="p-6 sm:p-8">
            <div class="flex items-baseline gap-2">
              <span class="font-display text-[13px] uppercase tracking-[0.3em] text-zinc-900">Atelier</span>
              <span class="h-2.5 w-px bg-stone-300"></span>
              <span class="font-display text-[13px] uppercase tracking-[0.3em] text-stone-400">Archive</span>
            </div>

            <h2 class="mt-4 font-display text-[26px] font-light leading-tight tracking-tight text-zinc-900">
              ${isSignup ? 'Join the archive' : 'Welcome back'}
            </h2>
            <p class="mt-1.5 text-[12px] leading-relaxed text-stone-500">
              ${isSignup
                ? 'Create a demo account to hold pieces, track orders and save your vault.'
                : 'Sign in with any email or username to reach your vault and orders.'}
            </p>

            <!-- tabs -->
            <div class="mt-4 inline-flex rounded-full bg-stone-200/60 p-1">
              ${['login', 'signup'].map(
                (mode) => html`
                  <button
                    type="button"
                    data-action="auth-mode"
                    data-mode="${mode}"
                    class="rounded-full px-5 py-2 text-[10px] font-medium uppercase tracking-[0.16em] transition-all duration-200 ease-out ${auth.mode === mode ? 'bg-white text-zinc-900 shadow-sm shadow-stone-300/60' : 'text-stone-500 hover:text-zinc-800'}"
                  >
                    ${mode === 'login' ? 'Sign in' : 'Create account'}
                  </button>`,
              )}
            </div>

            <form class="mt-4 space-y-3" data-form="auth" data-mode="${auth.mode}" novalidate>
              ${isSignup
                ? html`<div>
                    <label class="${LABEL} mb-1.5" for="auth-name">Full name</label>
                    <input id="auth-name" name="name" type="text" autocomplete="name" placeholder="Amira Ben Salah" value="${draft.name || ''}" class="${FIELD} !py-3" />
                  </div>`
                : ''}
              <div>
                <label class="${LABEL} mb-1.5" for="auth-email">Email or username</label>
                <input id="auth-email" name="email" type="text" autocomplete="email" required placeholder="you@studio.tn" value="${draft.email || state.user?.email || ''}" class="${FIELD} !py-3" />
              </div>
              <div>
                <label class="${LABEL} mb-1.5" for="auth-password">Password</label>
                <input id="auth-password" name="password" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" placeholder="••••••••" value="${draft.password || ''}" class="${FIELD} !py-3" />
              </div>

              ${!isSignup
                ? html`<div class="flex items-center justify-between pt-0.5">
                    <label class="flex cursor-pointer items-center gap-2 text-[11px] text-stone-500">
                      <input type="checkbox" checked class="h-3.5 w-3.5 rounded border-stone-300 text-zinc-900 focus:ring-zinc-900/20" /> Keep me signed in
                    </label>
                    <button type="button" data-action="demo-login" class="text-[11px] text-stone-500 underline-offset-4 transition-colors duration-300 hover:text-zinc-900 hover:underline">Use demo account</button>
                  </div>`
                : html`<label class="flex cursor-pointer items-start gap-2.5 pt-0.5 text-[11px] leading-relaxed text-stone-500">
                    <input type="checkbox" checked class="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-zinc-900 focus:ring-zinc-900/20" />
                    Send me one quiet email per drop. No daily noise.
                  </label>`}

              <p data-auth-error class="hidden rounded-xl bg-clay-50 px-3.5 py-2 text-[11.5px] text-clay-800"></p>

              <button type="submit" class="${BTN.primary} mt-2 w-full !py-3.5">
                ${isSignup ? 'Create my account' : 'Sign in'} ${icon('arrowRight', 'h-3.5 w-3.5')}
              </button>
            </form>

            <div class="my-4 flex items-center gap-3">
              <span class="h-px flex-1 bg-stone-200"></span>
              <span class="text-[9px] uppercase tracking-[0.2em] text-stone-400">or</span>
              <span class="h-px flex-1 bg-stone-200"></span>
            </div>

            <button type="button" data-action="demo-login" class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-800 shadow-sm shadow-stone-200/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
              ${icon('sparkle', 'h-3.5 w-3.5')} Enter with demo account (Amira Ben Salah)
            </button>

            <p class="mt-4 text-center text-[10px] leading-relaxed text-stone-400">
              Demo authentication — any email/username and password works. Stored locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>`;
}
