import { jsx as _jsx } from "react/jsx-runtime";
const star = 'M24 6.5 L25.7 10.2 L29.7 10.6 L26.7 13.4 L27.5 17.4 L24 15.4 L20.5 17.4 L21.3 13.4 L18.3 10.6 L22.3 10.2 Z';
/** The Library Games mark: toy blocks with an L and a G, and a star block on top. Same sticker style as the game icons. */
export const logoIcon = [
    ['base', '#ff6b6b', _jsx("rect", { x: "3", y: "23", width: "20", height: "20", rx: "4" })],
    ['base', '#54a0ff', _jsx("rect", { x: "25", y: "23", width: "20", height: "20", rx: "4" })],
    ['base', '#feca57', _jsx("rect", { x: "14", y: "2.5", width: "20", height: "20", rx: "4", transform: "rotate(8 24 12.5)" })],
    ['detail', 'none', _jsx("path", { d: "M9.5 28 L9.5 37.5 L17 37.5", stroke: "#fff", strokeWidth: 3.6 })],
    ['detail', 'none', _jsx("path", { d: "M39.5 29.5 Q37.8 27.5 35 27.5 Q30.2 27.5 30.2 33 Q30.2 38.5 35 38.5 Q39.5 38.5 39.5 33.5 L35.5 33.5", stroke: "#fff", strokeWidth: 3.4 })],
    ['detail', '#ffffff', _jsx("path", { d: star, transform: "rotate(8 24 12.5)" })],
];
