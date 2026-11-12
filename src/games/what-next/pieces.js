import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Thing } from '../../kit/things';
import { symbolSets } from './logic';
// Drawn pieces for the rows: every set of five symbols is shown as one family of five things from the woods.
const hues = ['#e2607e', '#f2c14e', '#3fb0a8', '#a48cf0', '#7cc552'];
const deep = ['#c94a6b', '#d9a52e', '#2c9690', '#8a70dc', '#62ab3e'];
const shine = _jsx("path", { d: "M-11 -9 A15 15 0 0 1 -2 -16 A18 18 0 0 0 -11 -9Z", fill: "#fff", opacity: "0.7" });
const finds = ['acorn', 'mushroom', 'leaf', 'berries', 'pine'];
const star = 'M0 -21 L6 -7 L21 -6 L9.5 4 L13 19 L0 11 L-13 19 L-9.5 4 L-21 -6 L-6 -7Z';
const shapes = [
    (i) => _jsx("path", { d: star, fill: hues[i], stroke: hues[i], strokeWidth: "5", strokeLinejoin: "round" }),
    (i) => _jsx("path", { d: "M0 20 C-30 0 -16 -24 0 -9 C16 -24 30 0 0 20Z", fill: hues[i] }),
    (i) => _jsx("path", { d: "M6 -21 A21 21 0 1 0 20 12 A17 17 0 1 1 6 -21Z", fill: hues[i] }),
    (i) => _jsx("path", { d: "M0 -22 C12 -6 18 2 18 8 A18 14 0 0 1 -18 8 C-18 2 -12 -6 0 -22Z", fill: hues[i] }),
    (i) => (_jsxs(_Fragment, { children: [[0, 72, 144, 216, 288].map((a) => (_jsx("ellipse", { cx: "0", cy: "-12", rx: "8", ry: "10", fill: hues[i], transform: `rotate(${a})` }, a))), _jsx("circle", { r: "6.5", fill: "#fff6dc" })] })),
];
/** A symbol of a puzzle as a drawn piece around (0, 0), about 48 wide. */
export function Piece({ symbol }) {
    const set = symbolSets.findIndex((s) => s.includes(symbol));
    const i = Math.max(0, symbolSets[Math.max(0, set)].indexOf(symbol));
    const family = Math.max(0, set) % 3;
    if (family === 1)
        return _jsx(Thing, { id: finds[i], className: "wn-piece" });
    return (_jsx("svg", { className: "wn-piece", viewBox: "-26 -26 52 52", "aria-hidden": true, focusable: "false", children: family === 0 ? (_jsxs(_Fragment, { children: [_jsx("circle", { r: "19", fill: hues[i] }), _jsx("path", { d: "M6 -18 A19 19 0 0 1 6 18 A24 24 0 0 0 6 -18Z", fill: deep[i] }), shine] })) : (shapes[i]((i + set) % 5)) }));
}
