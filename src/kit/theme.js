// Colour helpers for game-coloured surfaces. The page has one look; the colours live at the top of `styles.css`.
function luminance([r, g, b]) {
    const ch = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}
function rgbToHsl([r, g, b]) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min)
        return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h / 6, s, l];
}
function hslToRgb([h, s, l]) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = (t) => {
        t = (t + 1) % 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
}
const toHex = (rgb) => `#${rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`;
/** Contrast of white text on a colour (WCAG ratio). */
export function whiteContrast(color) {
    return 1.05 / (luminance(hexToRgb(color)) + 0.05);
}
/**
 * A game's colour, deepened just enough that white bold text on it stays readable (3.3:1).
 * Dark colours come back unchanged; light ones (yellow, sky blue, pink) get darker and a little calmer.
 */
export function gameSurface(color) {
    let [h, s, l] = rgbToHsl(hexToRgb(color));
    while (whiteContrast(toHex(hslToRgb([h, s, l]))) < 3.3 && l > 0) {
        l -= 0.01;
        s = Math.min(s, 0.78);
    }
    return toHex(hslToRgb([h, s, l]));
}
/** The CSS variables a game-coloured surface needs: its colour and the deepened version that carries white text. */
export function gameColorVars(color) {
    return { ['--game-color']: color, ['--game-surface']: gameSurface(color) };
}
