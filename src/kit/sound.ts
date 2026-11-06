// Tiny Web Audio synth, plus short recorded clips for games that need real sounds.
// Safe to call anywhere (no-ops without audio).

const MUTE_KEY = 'lg.muted'
let ctx: AudioContext | null = null
let muted = readMuted()

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function audio() {
  if (muted || typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Plays one note; returns its oscillator so a scheduled (`delay`) note can be stopped early. */
export function tone(freq: number, duration = 0.15, type: OscillatorType = 'sine', volume = 0.2, delay = 0) {
  const ac = audio()
  if (!ac) return undefined
  const start = ac.currentTime + delay
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
  return osc
}

// Recorded clips: fetched and decoded once, then played through the same context.
const loading = new Map<string, Promise<void>>()
const clips = new Map<string, AudioBuffer>()
let playing: { src: AudioBufferSourceNode; gain: GainNode } | null = null

/** Starts fetching and decoding a clip so it's ready to play. */
export function preloadClip(url: string) {
  const ac = audio()
  if (!ac || loading.has(url)) return
  loading.set(
    url,
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((data) => ac.decodeAudioData(data))
      .then((buffer) => void clips.set(url, buffer))
      .catch(() => void loading.delete(url)),
  )
}

/**
 * Plays a recorded clip, cutting off the previous one so fast sequences stay clear.
 * Returns false when the clip isn't decoded yet, so the caller can play a fallback.
 * When muted it returns true: there's nothing to fall back to.
 */
export function playClip(url: string, volume = 0.9) {
  const ac = audio()
  if (!ac) return true
  const buffer = clips.get(url)
  if (!buffer) {
    preloadClip(url)
    return false
  }
  if (playing) {
    const { src, gain } = playing
    gain.gain.setTargetAtTime(0, ac.currentTime, 0.015)
    src.stop(ac.currentTime + 0.08)
  }
  const src = ac.createBufferSource()
  const gain = ac.createGain()
  src.buffer = buffer
  gain.gain.value = volume
  src.connect(gain).connect(ac.destination)
  src.start()
  playing = { src, gain }
  src.onended = () => {
    if (playing?.src === src) playing = null
  }
  return true
}

export const sound = {
  tone,
  tap: () => tone(660, 0.06, 'triangle', 0.12),
  /** Rises with the combo, so streaks sound better and better. */
  good: (combo = 0) => {
    const base = 520 * 2 ** (Math.min(combo, 12) / 12)
    tone(base, 0.1, 'triangle')
    tone(base * 1.5, 0.12, 'triangle', 0.15, 0.06)
  },
  /** Soft, friendly "oops", never harsh. */
  bad: () => {
    tone(260, 0.12, 'sine', 0.18)
    tone(200, 0.16, 'sine', 0.15, 0.08)
  },
  pop: () => tone(880, 0.05, 'square', 0.06),
  tick: () => tone(1000, 0.04, 'square', 0.05),
  go: () => tone(990, 0.25, 'triangle', 0.2),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.18, i * 0.1)),
  isMuted: () => muted,
  setMuted(value: boolean) {
    muted = value
    try {
      localStorage.setItem(MUTE_KEY, value ? '1' : '0')
    } catch {
      // storage unavailable
    }
  },
}

export function vibrate(ms = 20) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // not supported
  }
}
