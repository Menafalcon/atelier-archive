/** Floating support chat. Mounted once; the message log updates in place. */
import { html, esc, raw, armImageFallbacks } from '../core/dom.js';
import { icon } from './ui.js';

const QUICK_REPLIES = ['Sizing help', 'Where is my order?', 'Condition grades', 'Coupon codes'];

function bubble(message) {
  const mine = message.from === 'me';
  return html`
    <div class="flex ${mine ? 'justify-end' : 'justify-start'} animate-[fadeIn_.3s_ease-out]">
      <div class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-sm ${
        mine
          ? 'rounded-br-md bg-zinc-900 text-stone-100 shadow-stone-400/25'
          : 'rounded-bl-md bg-white text-zinc-800 shadow-stone-200/60'
      }">
        ${message.text}
      </div>
    </div>`;
}

export function chatLogHTML(messages) {
  if (!messages?.length) {
    return html`<p class="px-2 py-6 text-center text-[11.5px] text-stone-400">Ask Wren anything about the floor.</p>`;
  }
  return raw(messages.map(bubble).join(''));
}

export function renderChatWidget(state) {
  const { open, messages } = state.ui.chat;
  const unread = state.ui.chat.unread;

  return html`
    <div id="chat-root">
      <!-- launcher -->
      <button
        type="button"
        id="chat-launcher"
        data-action="toggle-chat"
        class="group fixed bottom-5 right-5 z-[75] inline-flex h-14 items-center rounded-full bg-zinc-900 text-stone-50 shadow-2xl shadow-stone-900/25 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-stone-900/35 sm:bottom-7 sm:right-7"
        aria-label="Open support chat"
      >
        <span class="relative grid h-14 w-14 shrink-0 place-items-center">
          ${icon('chat', 'h-5 w-5')}
          ${unread ? html`<span class="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-clay-500 ring-2 ring-zinc-900"></span>` : ''}
        </span>
        <span class="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-[10px] font-medium uppercase tracking-[0.18em] opacity-0 transition-all duration-300 ease-out group-hover:max-w-[120px] group-hover:pr-5 group-hover:opacity-100">Studio chat</span>
      </button>

      <!-- panel -->
      <div
        id="chat-panel"
        class="fixed bottom-24 right-4 z-[76] flex w-[calc(100%-2rem)] max-w-[378px] origin-bottom-right flex-col overflow-hidden rounded-[28px] bg-stone-50 shadow-2xl shadow-stone-900/25 transition-all duration-300 ease-out sm:bottom-28 sm:right-7 ${open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0'}"
        role="dialog"
        aria-label="Studio chat"
        aria-hidden="${open ? 'false' : 'true'}"
      >
        <header class="relative flex items-center gap-3 overflow-hidden bg-zinc-900 px-5 py-4 text-stone-100">
          <span class="absolute inset-0 bg-gradient-to-tr from-clay-700/40 to-transparent"></span>
          <span class="relative grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[11px] font-medium tracking-wide">W</span>
          <div class="relative min-w-0 flex-1">
            <p class="text-[12px] font-medium">Wren · Studio assistant</p>
            <p class="mt-0.5 flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.16em] text-stone-400">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online · replies in ~2 min
            </p>
          </div>
          <button type="button" data-action="toggle-chat" class="relative shrink-0 rounded-full p-1.5 text-stone-400 transition-all duration-300 hover:bg-white/10 hover:text-white" aria-label="Close chat">
            ${icon('close', 'h-4 w-4')}
          </button>
        </header>

        <div class="flex max-h-[52vh] min-h-[220px] flex-1 flex-col gap-2.5 overflow-y-auto bg-stone-100/50 px-4 py-4" data-chat-messages>
          ${chatLogHTML(messages)}
          <p class="pt-1 text-center text-[9px] uppercase tracking-[0.18em] text-stone-400" data-chat-typing hidden>Wren is typing…</p>
        </div>

        <div class="border-t border-stone-200/70 bg-white px-3 pb-3 pt-2.5">
          <div class="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
            ${QUICK_REPLIES.map(
              (r) => html`<button type="button" data-chat-quick="${r}" class="shrink-0 rounded-full bg-stone-100 px-3 py-1.5 text-[10px] text-stone-600 transition-all duration-300 hover:bg-stone-200 hover:text-zinc-900">${r}</button>`,
            )}
          </div>
          <form data-form="chat" class="flex items-end gap-2">
            <label class="sr-only" for="chat-input">Message</label>
            <textarea
              id="chat-input"
              name="message"
              rows="1"
              placeholder="Ask about sizing, shipping, a piece…"
              class="max-h-24 min-h-[42px] w-full resize-none rounded-2xl border-0 bg-stone-100/80 px-3.5 py-2.5 text-[12px] text-zinc-900 placeholder:text-stone-400 transition-all duration-300 ease-out focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            ></textarea>
            <button type="submit" class="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-zinc-900 text-stone-50 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg" aria-label="Send message">
              ${icon('send', 'h-4 w-4')}
            </button>
          </form>
        </div>
      </div>
    </div>`;
}

export function renderToast(state) {
  const toast = state.ui.toast;
  if (!toast) return '';
  const tone = {
    success: 'bg-zinc-900 text-stone-50',
    ink: 'bg-zinc-900 text-stone-50',
    error: 'bg-clay-700 text-clay-50',
  }[toast.tone] || 'bg-zinc-900 text-stone-50';

  return html`
    <div class="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4 sm:bottom-8">
      <div class="pointer-events-auto flex animate-[toastIn_.4s_cubic-bezier(.22,.61,.36,1)] items-center gap-3 rounded-full ${tone} py-3 pl-4 pr-5 shadow-2xl shadow-stone-900/30" role="status">
        <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
          ${icon(toast.tone === 'error' ? 'info' : 'check', 'h-3.5 w-3.5')}
        </span>
        <p class="text-[11.5px] tracking-wide">${toast.message}</p>
      </div>
    </div>`;
}
