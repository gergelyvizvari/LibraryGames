/**
 * True on a phone or a tablet: the screen is touched and there is no mouse, so there is most likely no keyboard either.
 * False where it cannot be told (tests, old browsers).
 */
export function touchOnly() {
    return typeof matchMedia === 'function' && matchMedia('(hover: none) and (pointer: coarse)').matches;
}
