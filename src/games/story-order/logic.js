import { clamp } from '../../kit/random';
import { storiesFor } from './content';
/** Stories to put in order in one stage. */
export const STAGE = 3;
const lv = (level) => clamp(Math.round(level), 1, 10);
/** Pictures help early readers; from level 7 the sentences stand alone. */
export const showPictures = (level) => lv(level) <= 6;
/** Shuffles the steps of a story, never leaving them already in the right order. */
export function shuffleCards(rng, story) {
    const cards = story.steps.map((x, step) => ({ step, ...x }));
    let out = rng.shuffle(cards);
    for (let i = 0; i < 20 && out.every((c, k) => c.step === k); i++)
        out = rng.shuffle(cards);
    // A tiny story could keep coming out in order: swap the first two.
    if (out.every((c, k) => c.step === k))
        [out[0], out[1]] = [out[1], out[0]];
    return out;
}
/** Deals stories for the level in a shuffled order; none comes back until the whole pool has been used. */
export function makeDealer(rng, list, level) {
    const pool = storiesFor(list, level);
    let deck = [];
    let last = null;
    return () => {
        if (deck.length === 0) {
            deck = rng.shuffle(pool);
            // The last story of one round never opens the next.
            if (deck.length > 1 && deck[deck.length - 1] === last)
                [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
        }
        last = deck.pop();
        return last;
    };
}
/** Which question to ask while the player looks for card number `placed`. */
export const askKey = (placed, total) => (placed === 0 ? 'first' : placed === total - 1 ? 'last' : 'next');
