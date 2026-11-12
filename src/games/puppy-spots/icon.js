import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md: a puppy's face with floppy ears.
export const icon = [
    ['base', '#feca57', _jsx("ellipse", { cx: "24", cy: "25", rx: "16", ry: "17" })],
    ['accent', '#8d6e63', _jsx("path", { d: "M10 9 C3 11 3 27 8 32 C12 28 13 18 15 11 Z" })],
    ['accent', '#8d6e63', _jsx("path", { d: "M38 9 C45 11 45 27 40 32 C36 28 35 18 33 11 Z" })],
    ['detail', '#fff', _jsx("ellipse", { cx: "24", cy: "33", rx: "8.5", ry: "6.5" })],
    ['detail', ink, _jsx("circle", { cx: "17.5", cy: "22.5", r: "2.4" })],
    ['detail', ink, _jsx("circle", { cx: "30.5", cy: "22.5", r: "2.4" })],
    ['detail', ink, _jsx("ellipse", { cx: "24", cy: "30.5", rx: "3.4", ry: "2.6" })],
    ['shine', '#fff', _jsx("ellipse", { cx: "18", cy: "13.5", rx: "3.5", ry: "1.8" })],
];
