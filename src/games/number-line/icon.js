import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A frog hopping over a number line.
export const icon = [
    ['accent', '#fff', _jsx("rect", { x: "3", y: "38", width: "42", height: "5", rx: "2.5" })],
    ['accent', '#fff', _jsx("rect", { x: "8", y: "33", width: "4", height: "12", rx: "2" })],
    ['accent', '#fff', _jsx("rect", { x: "36", y: "33", width: "4", height: "12", rx: "2" })],
    ['base', '#1dd1a1', _jsx("path", { d: "M10 28 C10 17 16 12 24 12 C32 12 38 17 38 28 C38 31 35 33 24 33 C13 33 10 31 10 28 Z" })],
    ['base', '#1dd1a1', _jsx("circle", { cx: "17", cy: "12", r: "5.5" })],
    ['base', '#1dd1a1', _jsx("circle", { cx: "31", cy: "12", r: "5.5" })],
    ['detail', ink, _jsx("circle", { cx: "17", cy: "12", r: "2.4" })],
    ['detail', ink, _jsx("circle", { cx: "31", cy: "12", r: "2.4" })],
    ['detail', ink, _jsx("path", { d: "M18 24 Q24 28 30 24", fill: "none", stroke: ink, strokeWidth: "2.4", strokeLinecap: "round" })],
];
