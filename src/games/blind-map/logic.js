import { countries } from './content';
export const QUESTIONS = 10;
export function poolForLevel(level) {
    return countries.filter((c) => c.minLevel <= level);
}
/** Ten different countries, the newest-unlocked ones a bit more likely so each level feels fresh. */
export function pickQuestions(rng, level) {
    const pool = poolForLevel(level);
    const weighted = rng.shuffle(pool).sort((a, b) => b.minLevel - a.minLevel + (rng.next() - 0.5) * 6);
    return weighted.slice(0, Math.min(QUESTIONS, pool.length));
}
/** Points for a find: more for the first try and for being quick. */
export function pointsFor(tries, seconds) {
    if (tries > 2)
        return 0;
    const base = tries === 0 ? 20 : 8;
    return base + Math.max(0, Math.round((5 - seconds) * 2));
}
