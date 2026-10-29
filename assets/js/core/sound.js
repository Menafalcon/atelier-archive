/**
 * Small, synthesised interface sounds — no audio files.
 * The context is created on the first gesture; every sound is a few
 * oscillators through a short envelope, so the whole kit weighs nothing.
 */
let ctx = null;
let muted = false;
const listeners = new Set();

try {
  muted = localStorage.getItem('atelier.sound') === 'off';
} catch {
  /* storage blocked — sound stays on */
}

function context() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 880, to = null, type = 'sine', dur = 0.08, gain = 0.03, delay = 0 }) {
  const ac = context();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.22, gain = 0.02 }) {
  const ac = context();
  if (!ac) return;
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2400, ac.currentTime);
  filter.frequency.exponentialRampToValueAtTime(600, ac.currentTime + dur);
  const amp = ac.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start();
}

const KIT = {
  tick: () => tone({ freq: 1650, to: 1100, type: 'square', dur: 0.03, gain: 0.012 }),
  pop: () => {
    tone({ freq: 300, to: 520, type: 'sine', dur: 0.11, gain: 0.05 });
    tone({ freq: 900, type: 'triangle', dur: 0.05, gain: 0.02, delay: 0.02 });
  },
  chime: () => {
    tone({ freq: 784, type: 'sine', dur: 0.32, gain: 0.045 });
    tone({ freq: 1175, type: 'sine', dur: 0.4, gain: 0.035, delay: 0.08 });
    tone({ freq: 1568, type: 'sine', dur: 0.5, gain: 0.02, delay: 0.16 });
  },
  whoosh: () => noise({ dur: 0.26, gain: 0.03 }),
  thud: () => {
    tone({ freq: 150, to: 70, type: 'sine', dur: 0.2, gain: 0.09 });
    tone({ freq: 60, type: 'square', dur: 0.09, gain: 0.03, delay: 0.02 });
  },
  error: () => tone({ freq: 220, to: 150, type: 'sawtooth', dur: 0.18, gain: 0.035 }),
};

export function play(name) {
  if (muted) return;
  const fn = KIT[name];
  if (!fn) return;
  try {
    fn();
  } catch {
    /* audio blocked — silence is acceptable */
  }
}

export const isMuted = () => muted;

export function toggleMuted() {
  muted = !muted;
  try {
    localStorage.setItem('atelier.sound', muted ? 'off' : 'on');
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(muted));
  return muted;
}

export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
