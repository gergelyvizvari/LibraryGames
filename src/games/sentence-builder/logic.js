export function tilesFor(rng, text) {
    const tiles = text.split(' ').map((word, id) => ({ id, word }));
    let out = rng.shuffle(tiles);
    for (let i = 0; i < 10 && out.map((t) => t.word).join(' ') === text; i++)
        out = rng.shuffle(tiles);
    return out;
}
/** The next tile is right if its word matches the next word (duplicates like "the" are interchangeable). */
export function isNext(text, builtCount, word) {
    return text.split(' ')[builtCount] === word;
}
