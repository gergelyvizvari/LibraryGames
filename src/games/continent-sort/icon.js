import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A globe with two continents and a little sorting arrow.
export const icon = [
    ['base', '#54a0ff', _jsx("circle", { cx: "24", cy: "24", r: "20" })],
    ['detail', '#1dd1a1', _jsx("path", { d: "M10 14 C15 10 22 11 23 16 C24 21 18 21 18 26 C18 31 13 33 10 29 C7 25 6 18 10 14 Z" })],
    ['detail', '#feca57', _jsx("path", { d: "M29 22 C33 20 39 22 40 27 C41 33 36 40 31 39 C28 38 30 33 28 30 C26 27 26 24 29 22 Z" })],
    ['detail', ink, _jsx("circle", { cx: "32", cy: "12", r: "3" })],
    ['shine', '#fff', _jsx("path", { d: "M13 9 A20 20 0 0 1 22 5 L22 8 A17 17 0 0 0 15 11 Z" })],
];
