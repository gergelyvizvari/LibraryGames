import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon = [
    ['accent', '#c7ecee', _jsx("circle", { cx: "40", cy: "11", r: "5" })],
    ['accent', '#c7ecee', _jsx("circle", { cx: "38", cy: "40", r: "3.5" })],
    ['base', '#c7ecee', _jsx("circle", { cx: "21", cy: "26", r: "16" })],
    ['detail', ink, _jsx("text", { x: "21", y: "33.5", fontSize: "21", fontWeight: "700", textAnchor: "middle", children: "A" })],
    ['shine', '#fff', _jsx("path", { d: "M11 22 A11 11 0 0 1 18 14.5 L19 17.5 A8 8 0 0 0 14 22.5 Z" })],
];
