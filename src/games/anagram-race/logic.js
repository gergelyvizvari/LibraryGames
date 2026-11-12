/** Shuffled letter tiles, never in the right order already. */
export function scramble(rng, word) {
    const tiles = [...word].map((letter, id) => ({ id, letter }));
    let out = rng.shuffle(tiles);
    for (let i = 0; i < 10 && out.map((t) => t.letter).join('') === word; i++)
        out = rng.shuffle(tiles);
    return out;
}
