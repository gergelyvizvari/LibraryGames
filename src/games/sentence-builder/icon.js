import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon = [
    ['base', '#feca57', _jsx("rect", { x: "12", y: "9", width: "24", height: "13", rx: "3" })],
    ['base', '#ff6b6b', _jsx("rect", { x: "3", y: "28", width: "20", height: "13", rx: "3" })],
    ['accent', '#54a0ff', _jsx("rect", { x: "25", y: "28", width: "20", height: "13", rx: "3" })],
    ['detail', ink, _jsx("path", { d: "M17 15 h14 v1.2 h-14 Z M8 34 h10 v1.2 h-10 Z M30 34 h10 v1.2 h-10 Z" })],
];
