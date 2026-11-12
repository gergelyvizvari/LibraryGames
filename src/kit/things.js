import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Small things drawn in the storybook's manner, for games that need something to count, sort or line up.
// Each is drawn around (0, 0), about 46 wide.
const star = 'M0 -21 L6 -7 L21 -6 L9.5 4 L13 19 L0 11 L-13 19 L-9.5 4 L-21 -6 L-6 -7Z';
const dot = (x, y, r, fill, o = 1) => _jsx("circle", { cx: x, cy: y, r: r, fill: fill, opacity: o });
const art = {
    acorn: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-13 -4 Q-14 18 0 22 Q14 18 13 -4Z", fill: "#c98a4b" }), _jsx("path", { d: "M4 -4 H13 Q14 18 0 22 Q10 12 4 -4Z", fill: "#a8683c", opacity: "0.7" }), _jsx("path", { d: "M-16 -4 Q-16 -16 0 -16 Q16 -16 16 -4Z", fill: "#8a5a3c" }), _jsx("rect", { x: "-2", y: "-22", width: "4", height: "8", rx: "2", fill: "#6d4130" })] })),
    mushroom: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-7 0 H7 L9 20 Q0 24 -9 20Z", fill: "#fff3dc" }), _jsx("path", { d: "M-20 2 Q-20 -20 0 -20 Q20 -20 20 2Z", fill: "#e2607e" }), dot(-9, -8, 3.6, '#fff6dc'), dot(5, -12, 3, '#fff6dc'), dot(11, -3, 2.6, '#fff6dc')] })),
    leaf: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M0 -22 Q20 -8 12 12 Q6 22 0 22 Q-6 22 -12 12 Q-20 -8 0 -22Z", fill: "#7cc552" }), _jsx("path", { d: "M0 -22 Q20 -8 12 12 Q6 22 0 22Z", fill: "#62ab3e" }), _jsx("path", { d: "M0 -14 V22 M0 0 l8 -7 M0 8 l-8 -7", fill: "none", stroke: "#fff6dc", strokeWidth: "2.2", strokeLinecap: "round", opacity: "0.8" })] })),
    berries: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M0 -20 Q-2 -8 -8 -2 M0 -20 Q4 -8 9 0", fill: "none", stroke: "#62ab3e", strokeWidth: "3", strokeLinecap: "round" }), dot(-9, 8, 11, '#7d76d8'), dot(10, 10, 11, '#6a62c4'), dot(-12, 4, 3, '#fff', 0.6), dot(7, 6, 3, '#fff', 0.6)] })),
    pine: (_jsxs(_Fragment, { children: [_jsx("rect", { x: "-3", y: "12", width: "6", height: "10", fill: "#5d4038" }), _jsx("path", { d: "M-16 14 L0 -6 L16 14Z M-13 2 L0 -15 L13 2Z M-9 -9 L0 -23 L9 -9Z", fill: "#1f6a5c" })] })),
    apple: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M0 -8 C-10 -16 -22 -8 -20 6 C-18 18 -8 24 0 20 C8 24 18 18 20 6 C22 -8 10 -16 0 -8Z", fill: "#e2607e" }), _jsx("path", { d: "M6 -10 C16 -12 22 -4 20 6 C18 18 8 24 0 20 C10 14 14 0 6 -10Z", fill: "#c94a6b", opacity: "0.8" }), _jsx("path", { d: "M0 -8 q1 -8 5 -13", fill: "none", stroke: "#6d4130", strokeWidth: "3", strokeLinecap: "round" }), _jsx("path", { d: "M4 -16 q8 -6 14 0 q-8 6 -14 0Z", fill: "#7cc552" }), dot(-11, -1, 3.4, '#fff', 0.6)] })),
    star: _jsx("path", { d: star, fill: "#f2c14e", stroke: "#f2c14e", strokeWidth: "5", strokeLinejoin: "round" }),
    heart: _jsx("path", { d: "M0 20 C-30 0 -16 -24 0 -9 C16 -24 30 0 0 20Z", fill: "#e2607e" }),
    moon: _jsx("path", { d: "M6 -21 A21 21 0 1 0 20 12 A17 17 0 1 1 6 -21Z", fill: "#a48cf0" }),
    flower: (_jsxs(_Fragment, { children: [[0, 72, 144, 216, 288].map((a) => (_jsx("ellipse", { cx: "0", cy: "-12", rx: "8", ry: "10", fill: "#e39ad8", transform: `rotate(${a})` }, a))), dot(0, 0, 6.5, '#f2c14e')] })),
    fish: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M10 0 L24 -12 V12Z", fill: "#f39a5a" }), _jsx("ellipse", { cx: "-3", cy: "0", rx: "19", ry: "13", fill: "#f7b267" }), _jsx("path", { d: "M-3 -13 A19 13 0 0 1 16 0 A19 13 0 0 1 -3 13 Q6 0 -3 -13Z", fill: "#f39a5a" }), dot(-12, -3, 4.2, '#fff'), dot(-11.5, -2.6, 2.8, '#33284a')] })),
    balloon: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M0 14 q-4 6 2 10", fill: "none", stroke: "#8a70dc", strokeWidth: "2", strokeLinecap: "round" }), _jsx("path", { d: "M0 -22 C16 -22 18 -2 0 14 C-18 -2 -16 -22 0 -22Z", fill: "#62a6e6" }), _jsx("path", { d: "M4 -21 C16 -18 16 -2 0 14 C10 -2 10 -14 4 -21Z", fill: "#4689cc", opacity: "0.8" }), dot(-7, -12, 3.4, '#fff', 0.65)] })),
    cookie: (_jsxs(_Fragment, { children: [dot(0, 0, 20, '#ecbd6f'), _jsx("path", { d: "M6 -19 A20 20 0 0 1 6 19 A26 26 0 0 0 6 -19Z", fill: "#d9a558" }), dot(-8, -7, 3.2, '#6b4031'), dot(5, -10, 2.8, '#6b4031'), dot(9, 4, 3.2, '#6b4031'), dot(-4, 9, 2.8, '#6b4031'), dot(-12, 4, 2.2, '#6b4031')] })),
    ladybird: (_jsxs(_Fragment, { children: [dot(0, -13, 9, '#33284a'), _jsx("ellipse", { cx: "0", cy: "3", rx: "18", ry: "17", fill: "#e2506a" }), _jsx("path", { d: "M0 -14 V20", stroke: "#33284a", strokeWidth: "2.6" }), dot(-8, -2, 3.6, '#33284a'), dot(8, -2, 3.6, '#33284a'), dot(-9, 10, 3, '#33284a'), dot(9, 10, 3, '#33284a'), dot(-3.5, -15, 2.2, '#fff'), dot(3.5, -15, 2.2, '#fff')] })),
    snowball: (_jsxs(_Fragment, { children: [dot(0, 2, 19, '#eef4fb'), _jsx("path", { d: "M6 -16 A19 19 0 0 1 6 20 A25 25 0 0 0 6 -16Z", fill: "#cfdcec" }), dot(-7, -6, 4, '#fff')] })),
    drop: _jsx("path", { d: "M0 -22 C12 -6 18 2 18 8 A18 14 0 0 1 -18 8 C-18 2 -12 -6 0 -22Z", fill: "#3fb0a8" }),
};
export const thingIds = Object.keys(art);
/** One drawn thing. It fills the box it is given. */
export function Thing({ id, className = '' }) {
    return (_jsx("svg", { className: `thing ${className}`, viewBox: "-26 -26 52 52", "aria-hidden": true, focusable: "false", children: art[id] }));
}
