import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
// Drawn on a 48 × 48 grid, see "Icons" in ADDING_A_GAME.md.
export const icon = [
    ['base', '#feca57', _jsx("rect", { x: "3", y: "21", width: "14", height: "14", rx: "3", transform: "rotate(-10 10 28)" })],
    ['accent', '#ffeaa7', _jsx("rect", { x: "17", y: "9", width: "14", height: "14", rx: "3", transform: "rotate(8 24 16)" })],
    ['base', '#feca57', _jsx("rect", { x: "31", y: "23", width: "14", height: "14", rx: "3", transform: "rotate(-4 38 30)" })],
    ['detail', ink, _jsx("text", { x: "10", y: "33", fontSize: "12", fontWeight: "700", textAnchor: "middle", transform: "rotate(-10 10 28)", children: "T" })],
    ['detail', ink, _jsx("text", { x: "24", y: "21", fontSize: "12", fontWeight: "700", textAnchor: "middle", transform: "rotate(8 24 16)", children: "A" })],
    ['detail', ink, _jsx("text", { x: "38", y: "35", fontSize: "12", fontWeight: "700", textAnchor: "middle", transform: "rotate(-4 38 30)", children: "C" })],
];
