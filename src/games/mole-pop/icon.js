import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon = [
    ['accent', '#6d4c41', _jsx("ellipse", { cx: "24", cy: "40", rx: "20", ry: "6" })],
    ['base', '#a1887f', _jsx("path", { d: "M10 40 V24 C10 15 16 8 24 8 C32 8 38 15 38 24 V40 Z" })],
    ['detail', ink, _jsx("circle", { cx: "18.5", cy: "21", r: "2.3" })],
    ['detail', ink, _jsx("circle", { cx: "29.5", cy: "21", r: "2.3" })],
    ['detail', '#ff9ff3', _jsx("ellipse", { cx: "24", cy: "27", rx: "3.8", ry: "2.8" })],
    ['detail', '#fff', _jsx("rect", { x: "21.8", y: "30.5", width: "4.4", height: "4.5", rx: "1" })],
];
