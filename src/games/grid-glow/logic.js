export function gridFor(count) {
    return count <= 4 ? 3 : count <= 7 ? 4 : 5;
}
export function startCount(level) {
    return Math.min(6, 2 + Math.floor((level - 1) / 2));
}
/** `count` different cells in a `size` x `size` grid. */
export function pattern(rng, size, count) {
    return rng.shuffle(Array.from({ length: size * size }, (_, i) => i)).slice(0, count);
}
