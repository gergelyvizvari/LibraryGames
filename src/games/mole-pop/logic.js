import { clamp } from '../../kit/random';
export const HOLES = 9;
/** How long a critter stays up, in seconds. */
export const upTime = (level, elapsed) => clamp(1.5 - level * 0.08 - elapsed * 0.008, 0.55, 1.5);
/** Seconds between pops. */
export const spawnGap = (level, elapsed) => clamp(0.9 - level * 0.04 - elapsed * 0.006, 0.35, 0.9);
export function pickCritter(rng, level) {
    const r = rng.next();
    if (r < 0.08)
        return 'gold';
    // Bunnies (don't tap!) appear from level 2.
    if (level >= 2 && r < 0.08 + clamp(0.08 + level * 0.02, 0, 0.25))
        return 'bunny';
    return 'mole';
}
export const points = { mole: 10, gold: 30, bunny: -15 };
