import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon = [
    ['accent', '#ff6b6b', _jsx("path", { d: "M38 15 L47 9 L45.5 17 Z M38 18 L46 21.5 L40 24 Z" })],
    ['base', '#3c3f4e', _jsx("circle", { cx: "23", cy: "25", r: "17" })],
    ['detail', '#ffd8b0', _jsx("rect", { x: "8", y: "19", width: "30", height: "11", rx: "5.5" })],
    ['base', ink, _jsx("path", { d: "M14 23.5 L21 25.5 L14 26.5 Z M32 23.5 L25 25.5 L32 26.5 Z" })],
];
