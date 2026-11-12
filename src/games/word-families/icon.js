import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
// A basket with word cards dropping into it.
export const icon = [
    ['accent', '#feca57', _jsx("rect", { x: "9", y: "4", width: "15", height: "11", rx: "3", transform: "rotate(-10 16 10)" })],
    ['accent', '#1dd1a1', _jsx("rect", { x: "25", y: "7", width: "15", height: "11", rx: "3", transform: "rotate(12 32 12)" })],
    ['base', '#ff9f43', _jsx("path", { d: "M5 21 H43 L39 42 A3 3 0 0 1 36 44 H12 A3 3 0 0 1 9 42 Z" })],
    ['detail', ink, _jsx("rect", { x: "14", y: "26", width: "3", height: "13", rx: "1.5" })],
    ['detail', ink, _jsx("rect", { x: "22.5", y: "26", width: "3", height: "13", rx: "1.5" })],
    ['detail', ink, _jsx("rect", { x: "31", y: "26", width: "3", height: "13", rx: "1.5" })],
];
