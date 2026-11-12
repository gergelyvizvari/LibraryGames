import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A happy bee.
export const icon = [
    ['accent', '#c7ecee', _jsx("ellipse", { cx: "18", cy: "14", rx: "8", ry: "9" })],
    ['accent', '#c7ecee', _jsx("ellipse", { cx: "30", cy: "13", rx: "7", ry: "8" })],
    ['base', '#feca57', _jsx("ellipse", { cx: "24", cy: "30", rx: "19", ry: "13" })],
    ['detail', ink, _jsx("path", { d: "M15 19 Q12 30 15 41 L20 42.5 Q17 30 20 17.5 Z M27 17.5 Q24 30 27 42.5 L32 41 Q29 30 32 19 Z" })],
    ['detail', ink, _jsx("circle", { cx: "37", cy: "27", r: "2.5" })],
    ['shine', '#fff', _jsx("path", { d: "M36 21 A8 8 0 0 1 40 25 L38 26 A6 6 0 0 0 35 23 Z" })],
];
