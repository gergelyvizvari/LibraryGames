/** Small seeded random number generator (mulberry32). */
export function makeRng(seed) {
    let a = seed >>> 0;
    const next = () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        /** Integer in [min, max], inclusive. */
        int: (min, max) => min + Math.floor(next() * (max - min + 1)),
        pick: (items) => items[Math.floor(next() * items.length)],
        shuffle: (items) => {
            const out = [...items];
            for (let i = out.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                [out[i], out[j]] = [out[j], out[i]];
            }
            return out;
        },
        chance: (p) => next() < p,
    };
}
/** A number that is the same for everyone on a given day, e.g. 20261026. */
export function daySeed(date = new Date()) {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
export function randomSeed() {
    return Math.floor(Math.random() * 2 ** 31);
}
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
