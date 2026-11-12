import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon = [
    ['accent', '#feca57', _jsx("path", { d: "M8 22 L8 5 L21 13 Z M40 22 L40 5 L27 13 Z" })],
    ['base', '#feca57', _jsx("ellipse", { cx: "24", cy: "27", rx: "18", ry: "16" })],
    ['detail', ink, _jsx("circle", { cx: "17", cy: "24", r: "3" })],
    ['detail', ink, _jsx("circle", { cx: "31", cy: "24", r: "3" })],
    ['detail', '#ff6b6b', _jsx("path", { d: "M21 30 H27 L24 34 Z" })],
    ['shine', '#fff', _jsx("ellipse", { cx: "14", cy: "17", rx: "3", ry: "2", transform: "rotate(-30 14 17)" })],
];
