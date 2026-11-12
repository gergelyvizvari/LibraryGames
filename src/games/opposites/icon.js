import { jsx as _jsx } from "react/jsx-runtime";
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A sticker split in two: a sunny day half and a night half with the moon.
export const icon = [
    ['base', '#feca57', _jsx("path", { d: "M24 5 A19 19 0 0 0 24 43 Z" })],
    ['base', '#54a0ff', _jsx("path", { d: "M24 5 A19 19 0 0 1 24 43 Z" })],
    ['detail', '#ff9f43', _jsx("circle", { cx: "15", cy: "24", r: "6" })],
    ['detail', '#fff', _jsx("path", { d: "M34 15 A9 9 0 1 0 38 31 A7 7 0 1 1 34 15 Z" })],
    ['shine', '#fff', _jsx("path", { d: "M11 14 A15 15 0 0 1 17 9 L18 12 A12 12 0 0 0 14 16 Z" })],
];
