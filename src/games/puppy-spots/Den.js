import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// The drawn pieces of the puppies' den: the pups, the patchwork rug they sit on, their basket and the tools.
const INK = '#33284a';
const CREAM = '#fff6dc';
/** A pup's coat: body, ears, muzzle. */
const coats = [
    ['#e6a862', '#a8683c', '#fff3dc'],
    ['#fff6e6', '#b5825a', '#ffffff'],
    ['#bcb7d6', '#7d76a4', '#eeeaf8'],
    ['#a8683c', '#6d4130', '#f1d9b4'],
    ['#f2c14e', '#c98f2a', '#fff3c8'],
];
export const COATS = coats.length;
function Eye({ x, y, r }) {
    return (_jsxs(_Fragment, { children: [_jsx("circle", { cx: x, cy: y, r: r, fill: "#fff" }), _jsx("circle", { cx: x + r * 0.1, cy: y + r * 0.08, r: r * 0.78, fill: INK }), _jsx("circle", { cx: x - r * 0.2, cy: y - r * 0.28, r: r * 0.3, fill: "#fff" }), _jsx("circle", { cx: x + r * 0.36, cy: y + r * 0.36, r: r * 0.14, fill: "#fff" })] }));
}
/** A sitting pup, drawn around (0, 0): about 50 wide and 60 tall. Happy pups smile with closed eyes. */
export function Pup({ coat, happy = false, bow = false }) {
    const [body, ear, muzzle] = coats[coat % COATS];
    return (_jsxs(_Fragment, { children: [_jsx("ellipse", { cx: "1", cy: "25", rx: "20", ry: "5.5", fill: "#241a3c", opacity: "0.28" }), _jsx("path", { d: "M14 16 q12 -2 10 -13", fill: "none", stroke: ear, strokeWidth: "6", strokeLinecap: "round" }), _jsx("ellipse", { cx: "0", cy: "12", rx: "15.5", ry: "13", fill: body }), _jsx("ellipse", { cx: "0", cy: "15", rx: "8", ry: "9", fill: muzzle, opacity: "0.8" }), _jsx("ellipse", { cx: "-8", cy: "23", rx: "6", ry: "4.2", fill: muzzle }), _jsx("ellipse", { cx: "8", cy: "23", rx: "6", ry: "4.2", fill: muzzle }), bow && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M0 8 l-10 -6 v12Z M0 8 l10 -6 v12Z", fill: "#d9506a" }), _jsx("circle", { cx: "0", cy: "8", r: "3.2", fill: "#b63c5c" })] })), _jsxs("g", { className: "pk-head", children: [_jsx("ellipse", { cx: "-17", cy: "-8", rx: "7.5", ry: "13", fill: ear, transform: "rotate(18 -17 -8)" }), _jsx("ellipse", { cx: "17", cy: "-8", rx: "7.5", ry: "13", fill: ear, transform: "rotate(-18 17 -8)" }), _jsx("circle", { cx: "0", cy: "-9", r: "18.5", fill: body }), coat % COATS === 1 && _jsx("path", { d: "M2 -27 Q18 -26 18 -10 Q10 -4 3 -12Z", fill: ear, opacity: "0.9" }), _jsx("ellipse", { cx: "0", cy: "-1", rx: "9.5", ry: "7.5", fill: muzzle }), _jsx("path", { d: "M-3.4 -5.5 h6.8 q0 4.6 -3.4 4.6 q-3.4 0 -3.4 -4.6Z", fill: INK }), happy ? (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-11.5 -12 q3.8 -4.5 7.6 0 M3.9 -12 q3.8 -4.5 7.6 0", fill: "none", stroke: INK, strokeWidth: "2.4", strokeLinecap: "round" }), _jsx("path", { d: "M-4 1 q4 4 8 0 q-1 7 -4 7 q-3 0 -4 -7Z", fill: "#f08aa6" })] })) : (_jsxs(_Fragment, { children: [_jsx(Eye, { x: -7.5, y: -12, r: 4.9 }), _jsx(Eye, { x: 7.5, y: -12, r: 4.9 }), _jsx("path", { d: "M-3.5 1.5 q3.5 3 7 0", fill: "none", stroke: INK, strokeWidth: "1.5", strokeLinecap: "round" })] })), _jsx("circle", { cx: "-13", cy: "-3", r: "3", fill: "#f08aa6", opacity: "0.6" }), _jsx("circle", { cx: "13", cy: "-3", r: "3", fill: "#f08aa6", opacity: "0.6" })] })] }));
}
// Patch colours of the rug, a lighter and a deeper shade of each for the chequered weave.
const patches = [
    ['#e2607e', '#c94a6b'],
    ['#f2c14e', '#d9a52e'],
    ['#3fb0a8', '#2c9690'],
    ['#a48cf0', '#8a70dc'],
    ['#7cc552', '#62ab3e'],
    ['#f39a5a', '#dc7f3c'],
    ['#62a6e6', '#4689cc'],
    ['#e39ad8', '#cc7cc0'],
];
const U = 100;
const key = (r, c) => `${r},${c}`;
const cross = (cx, cy, s) => `M${cx - s} ${cy - s} l${2 * s} ${2 * s} M${cx + s} ${cy - s} l${-2 * s} ${2 * s}`;
/** The board: a patchwork rug. Each colour is one patch, sewn to its neighbours along a stitched seam. */
export function Rug({ regions, pups, gifts, marks, blocked, why, bad, stuck, tip, happy }) {
    const n = regions.length;
    const w = n * U;
    const cells = regions.flatMap((row, r) => row.map((rug, c) => ({ r, c, rug, k: key(r, c) })));
    const seams = [];
    for (const { r, c, rug } of cells) {
        if (c < n - 1 && regions[r][c + 1] !== rug)
            seams.push(`M${(c + 1) * U} ${r * U} v${U}`);
        if (r < n - 1 && regions[r + 1][c] !== rug)
            seams.push(`M${c * U} ${(r + 1) * U} h${U}`);
    }
    const seam = seams.join(' ');
    const fringe = Array.from({ length: n * 5 + 1 }, (_, i) => {
        const y = 8 + (i * (w - 16)) / (n * 5);
        return `M-38 ${y + (i % 3) - 1} H-14 M${w + 14} ${y - (i % 2)} H${w + 38}`;
    }).join(' ');
    const pupKeys = new Set(pups.map(([r, c]) => key(r, c)));
    const all = [...pups, ...bad.filter(([r, c]) => !pupKeys.has(key(r, c)))];
    return (_jsxs("svg", { className: "pk-rug-art", viewBox: `0 0 ${w} ${w}`, "aria-hidden": true, focusable: "false", children: [_jsx("rect", { x: "-22", y: "-8", width: w + 44, height: w + 36, rx: "22", fill: "#241a3c", opacity: "0.3" }), _jsx("path", { d: fringe, fill: "none", stroke: CREAM, strokeWidth: "5", strokeLinecap: "round" }), _jsx("rect", { x: "-16", y: "-16", width: w + 32, height: w + 32, rx: "20", fill: CREAM }), cells.map(({ r, c, rug, k }) => (_jsxs("g", { children: [_jsx("rect", { x: c * U, y: r * U, width: U, height: U, fill: patches[rug % patches.length][(r + c) % 2] }), _jsx("rect", { x: c * U + 10, y: r * U + 10, width: U - 20, height: U - 20, rx: "13", fill: "#fff", opacity: "0.1" })] }, k))), _jsx("path", { d: seam, fill: "none", stroke: CREAM, strokeWidth: "10", strokeLinecap: "round" }), _jsx("path", { d: seam, fill: "none", stroke: "#b5825a", strokeWidth: "2.6", strokeDasharray: "8 8", opacity: "0.8" }), cells.map(({ r, c, k }) => {
                const cx = c * U + U / 2;
                const cy = r * U + U / 2;
                return (_jsxs("g", { children: [why?.has(k) && _jsx("rect", { className: "pk-why", x: c * U, y: r * U, width: U, height: U, fill: "#fff6dc" }), !why && stuck.has(k) && _jsx("rect", { className: "pk-stuck", x: c * U, y: r * U, width: U, height: U, fill: "#241a3c" }), pupKeys.has(k) ? null : marks.has(k) ? (_jsx("path", { className: "pk-mark", d: cross(cx, cy, 15), fill: "none", stroke: CREAM, strokeWidth: "9", strokeLinecap: "round" })) : blocked.has(k) ? (_jsx("path", { className: "pk-blocked", d: cross(cx, cy, 10), fill: "none", stroke: CREAM, strokeWidth: "5.5", strokeLinecap: "round" })) : null, tip === k && _jsx("circle", { className: "pk-tip", cx: cx, cy: cy, r: "40", fill: "none", stroke: "#ffd24a", strokeWidth: "8" })] }, k));
            }), all.map(([r, c]) => {
                const k = key(r, c);
                const shaking = bad.some(([br, bc]) => br === r && bc === c);
                return (_jsx("g", { transform: `translate(${c * U + U / 2} ${r * U + U / 2 - 5}) scale(1.62)`, children: _jsx("g", { className: `pk-pup${shaking ? ' pk-no' : ''}${happy ? ' pk-hop' : ''}`, style: { animationDelay: happy ? `${c * 60}ms` : undefined }, children: _jsx(Pup, { coat: regions[r][c], bow: gifts.has(k), happy: happy }) }) }, k));
            })] }));
}
/** The basket where the pups wait for their spot: one head peeks out for each (three at most fit). */
export function Basket({ waiting, coats: list }) {
    const seats = [
        [-30, -12],
        [30, -10],
        [0, -22],
    ];
    return (_jsxs("svg", { className: "pk-basket-art", viewBox: "-96 -62 192 114", "aria-hidden": true, focusable: "false", children: [_jsx("ellipse", { cx: "0", cy: "38", rx: "84", ry: "12", fill: "#241a3c", opacity: "0.25" }), seats.slice(0, Math.min(waiting, seats.length)).map(([x, y], i) => (_jsx("g", { className: "pk-wait", transform: `translate(${x} ${y}) scale(1.25)`, children: _jsx(Pup, { coat: list[i] ?? i }) }, `${i}-${list[i]}`))), _jsx("path", { d: "M-72 0 Q-70 40 -50 40 H50 Q70 40 72 0Z", fill: "#b5825a" }), _jsx("path", { d: "M20 0 H72 Q70 40 50 40 H30 Q40 20 20 0Z", fill: "#94694a", opacity: "0.6" }), _jsx("path", { d: "M-60 4 q4 16 0 32 M-40 4 q4 16 0 32 M-20 4 q4 16 0 32 M0 4 q4 16 0 32 M20 4 q4 16 0 32 M40 4 q4 16 0 32 M60 4 q4 16 0 32", fill: "none", stroke: "#8a5a3c", strokeWidth: "2.5", strokeLinecap: "round", opacity: "0.6" }), _jsx("rect", { x: "-78", y: "-8", width: "156", height: "16", rx: "8", fill: "#c99a6a" }), _jsx("rect", { x: "-78", y: "2", width: "156", height: "6", rx: "3", fill: "#94694a", opacity: "0.6" })] }));
}
/** The den's round window onto the pines of the Maze Woods. */
export function DenWindow() {
    const pine = (x, y, q) => (_jsxs(_Fragment, { children: [_jsx("rect", { x: x - 2, y: y, width: "4", height: q, fill: "#5d4038" }), _jsx("path", { d: `M${x - q} ${y} L${x} ${y - q * 1.6} L${x + q} ${y}Z M${x - q * 0.8} ${y - q * 0.9} L${x} ${y - q * 2.4} L${x + q * 0.8} ${y - q * 0.9}Z M${x - q * 0.6} ${y - q * 1.8} L${x} ${y - q * 3.1} L${x + q * 0.6} ${y - q * 1.8}Z`, fill: "#1f6a5c" })] }));
    return (_jsxs("svg", { className: "pk-window", viewBox: "0 0 100 100", "aria-hidden": true, focusable: "false", children: [_jsx("circle", { cx: "50", cy: "50", r: "50", fill: CREAM }), _jsx("clipPath", { id: "pk-pane", children: _jsx("circle", { cx: "50", cy: "50", r: "42" }) }), _jsxs("g", { clipPath: "url(#pk-pane)", children: [_jsx("rect", { width: "100", height: "100", fill: "#9fdcee" }), _jsx("circle", { cx: "33", cy: "31", r: "8.5", fill: "#fff" }), _jsx("circle", { cx: "44", cy: "33", r: "6.5", fill: "#fff" }), _jsx("path", { d: "M8 92 Q50 54 92 71 V92Z", fill: "#c5d86b" }), pine(29, 81, 8.4), pine(52, 75, 10.5), pine(71, 84, 8.8)] }), _jsx("path", { d: "M50 8 V92 M8 50 H92", stroke: CREAM, strokeWidth: "5" })] }));
}
