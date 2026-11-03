// Tiny Web Audio synth: no sound files, works offline. Safe to call anywhere (no-ops without audio).
const MUTE_KEY = 'lg.muted';
let ctx = null;
let muted = readMuted();
function readMuted() {
    try {
        return localStorage.getItem(MUTE_KEY) === '1';
    }
    catch {
        return false;
    }
}
function audio() {
    if (muted || typeof window === 'undefined' || !('AudioContext' in window))
        return null;
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended')
        void ctx.resume();
    return ctx;
}
/** Plays one note; returns its oscillator so a scheduled (`delay`) note can be stopped early. */
export function tone(freq, duration = 0.15, type = 'sine', volume = 0.2, delay = 0) {
    const ac = audio();
    if (!ac)
        return undefined;
    const start = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
    return osc;
}
export const sound = {
    tone,
    tap: () => tone(660, 0.06, 'triangle', 0.12),
    /** Rises with the combo, so streaks sound better and better. */
    good: (combo = 0) => {
        const base = 520 * 2 ** (Math.min(combo, 12) / 12);
        tone(base, 0.1, 'triangle');
        tone(base * 1.5, 0.12, 'triangle', 0.15, 0.06);
    },
    /** Soft, friendly "oops", never harsh. */
    bad: () => {
        tone(260, 0.12, 'sine', 0.18);
        tone(200, 0.16, 'sine', 0.15, 0.08);
    },
    pop: () => tone(880, 0.05, 'square', 0.06),
    tick: () => tone(1000, 0.04, 'square', 0.05),
    go: () => tone(990, 0.25, 'triangle', 0.2),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.18, i * 0.1)),
    isMuted: () => muted,
    setMuted(value) {
        muted = value;
        try {
            localStorage.setItem(MUTE_KEY, value ? '1' : '0');
        }
        catch {
            // storage unavailable
        }
    },
};
export function vibrate(ms = 20) {
    try {
        navigator.vibrate?.(ms);
    }
    catch {
        // not supported
    }
}
