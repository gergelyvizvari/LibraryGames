import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon = [
    ['base', '#fff', _jsx("rect", { x: "6", y: "6", width: "36", height: "36", rx: "9" })],
    ['detail', ink, _jsx("circle", { cx: "15", cy: "15", r: "3.6" })],
    ['detail', ink, _jsx("circle", { cx: "33", cy: "15", r: "3.6" })],
    ['detail', ink, _jsx("circle", { cx: "24", cy: "24", r: "3.6" })],
    ['detail', ink, _jsx("circle", { cx: "15", cy: "33", r: "3.6" })],
    ['detail', ink, _jsx("circle", { cx: "33", cy: "33", r: "3.6" })],
];
