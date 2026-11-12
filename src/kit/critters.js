import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Small forest animals for scene games (guests, neighbours, a postman), drawn the storybook way: lineless flat
 * shapes, big glossy eyes, pink cheeks. Each one is drawn around its head's centre at (0, 0): the head is about
 * 44 wide, ears reach up to y = -50 (the bunny's), and with `body` the animal sits down to y = 40.
 */
export const critterKinds = ['owl', 'bunny', 'bear', 'hedgehog', 'squirrel', 'mouse', 'fox'];
const INK = '#33284a';
const coats = {
    owl: { fur: '#a8774f', dark: '#8a5c3c', light: '#f3dfb8' },
    bunny: { fur: '#e4def4', dark: '#c9c0e4', light: '#ffffff' },
    bear: { fur: '#b97a48', dark: '#a8683c', light: '#f1d9b4' },
    hedgehog: { fur: '#e8c9a0', dark: '#7a5238', light: '#f6e3c8' },
    squirrel: { fur: '#c8693a', dark: '#b8612f', light: '#f6dcc0' },
    mouse: { fur: '#b9b5c8', dark: '#9d98b2', light: '#f2eef8' },
    fox: { fur: '#e98a3c', dark: '#5d3b40', light: '#fff3dc' },
};
function Eye({ x, y, r }) {
    return (_jsxs(_Fragment, { children: [_jsx("circle", { cx: x, cy: y, r: r, fill: "#fff" }), _jsx("circle", { cx: x + r * 0.1, cy: y + r * 0.08, r: r * 0.78, fill: INK }), _jsx("circle", { cx: x - r * 0.2, cy: y - r * 0.28, r: r * 0.3, fill: "#fff" }), _jsx("circle", { cx: x + r * 0.36, cy: y + r * 0.36, r: r * 0.14, fill: "#fff" })] }));
}
/** Eyes and mouth for a mood, with the eyes `sp` apart from the middle at height `y`. */
function Face({ mood, y, sp, r, mouth = true }) {
    if (mood === 'happy')
        return (_jsxs(_Fragment, { children: [_jsx("path", { d: `M${-sp - 4} ${y} q4 -5 8 0 M${sp - 4} ${y} q4 -5 8 0`, fill: "none", stroke: INK, strokeWidth: "2.5", strokeLinecap: "round" }), mouth && _jsx("path", { d: `M-4 ${y + 11} q4 4 8 0 q-1 7 -4 7 q-3 0 -4 -7Z`, fill: "#f08aa6" })] }));
    return (_jsxs(_Fragment, { children: [_jsx(Eye, { x: -sp, y: y, r: r }), _jsx(Eye, { x: sp, y: y, r: r }), mood === 'sad' && _jsx("path", { d: `M${-sp - 5} ${y - r - 3} l7 2.5 M${sp + 5} ${y - r - 3} l-7 2.5`, stroke: INK, strokeWidth: "1.8", strokeLinecap: "round" }), mouth &&
                (mood === 'sad' ? (_jsx("path", { d: `M-4 ${y + 14} q4 -3.5 8 0`, fill: "none", stroke: INK, strokeWidth: "1.8", strokeLinecap: "round" })) : (_jsx("path", { d: `M-3.5 ${y + 12} q3.5 3 7 0`, fill: "none", stroke: INK, strokeWidth: "1.6", strokeLinecap: "round" })))] }));
}
const Cheeks = ({ y, x }) => (_jsxs(_Fragment, { children: [_jsx("circle", { cx: -x, cy: y, r: "3.2", fill: "#f08aa6", opacity: "0.6" }), _jsx("circle", { cx: x, cy: y, r: "3.2", fill: "#f08aa6", opacity: "0.6" })] }));
// The spikes of the hedgehog, a fan of points around its head.
const spikes = (() => {
    let d = 'M-24 6 ';
    for (let i = 0; i < 9; i++) {
        const a = ((-160 + i * 17.5) * Math.PI) / 180;
        d += `L${(Math.cos(a) * 32).toFixed(1)} ${(Math.sin(a) * 30 - 2).toFixed(1)} L${(Math.cos(a + 0.16) * 22).toFixed(1)} ${(Math.sin(a + 0.16) * 20 - 2).toFixed(1)} `;
    }
    return d + 'L24 6Z';
})();
function Head({ kind, mood }) {
    const c = coats[kind];
    switch (kind) {
        case 'fox':
            return (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-17 -12 L-22 -36 L-4 -22Z M17 -12 L22 -36 L4 -22Z", fill: "#e5803a" }), _jsx("path", { d: "M-16 -16 L-19 -30 L-9 -22Z M16 -16 L19 -30 L9 -22Z", fill: c.dark }), _jsx("ellipse", { cx: "0", cy: "-6", rx: "21", ry: "19", fill: c.fur }), _jsx("path", { d: "M-21 -2 Q-12 14 0 12 Q12 14 21 -2 Q12 4 0 4 Q-12 4 -21 -2Z", fill: c.light }), _jsx("ellipse", { cx: "0", cy: "2", rx: "4", ry: "3", fill: INK }), _jsx(Face, { mood: mood, y: -9, sp: 8.5, r: 5 }), _jsx(Cheeks, { y: -1, x: 14 })] }));
        case 'owl':
            return (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-18 -18 L-20 -32 L-8 -22Z M18 -18 L20 -32 L8 -22Z", fill: c.dark }), _jsx("ellipse", { cx: "0", cy: "-5", rx: "22", ry: "21", fill: c.fur }), _jsx("circle", { cx: "-9", cy: "-9", r: "9.5", fill: c.light }), _jsx("circle", { cx: "9", cy: "-9", r: "9.5", fill: c.light }), _jsx("path", { d: "M-3 -2 L3 -2 L0 4Z", fill: "#f2a94e" }), _jsx(Face, { mood: mood, y: -9, sp: 9, r: 6, mouth: false }), mood === 'sad' && _jsx("path", { d: "M-4 10 q4 -3 8 0", fill: "none", stroke: INK, strokeWidth: "1.8", strokeLinecap: "round" }), _jsx(Cheeks, { y: 3, x: 15 })] }));
        case 'bunny':
            return (_jsxs(_Fragment, { children: [_jsx("ellipse", { cx: "-9", cy: "-34", rx: "6.5", ry: "18", fill: c.fur, transform: "rotate(-8 -9 -34)" }), _jsx("ellipse", { cx: "9", cy: "-34", rx: "6.5", ry: "18", fill: c.fur, transform: "rotate(8 9 -34)" }), _jsx("ellipse", { cx: "-9", cy: "-33", rx: "3", ry: "12", fill: "#f4b6c8", transform: "rotate(-8 -9 -33)" }), _jsx("ellipse", { cx: "9", cy: "-33", rx: "3", ry: "12", fill: "#f4b6c8", transform: "rotate(8 9 -33)" }), _jsx("circle", { cx: "0", cy: "-5", r: "19", fill: c.fur }), _jsx("ellipse", { cx: "0", cy: "3", rx: "8", ry: "6", fill: c.light }), _jsx("ellipse", { cx: "0", cy: "-1", rx: "3", ry: "2.2", fill: "#e88aa6" }), _jsx(Face, { mood: mood, y: -9, sp: 8, r: 4.8 }), _jsx(Cheeks, { y: 0, x: 13 })] }));
        case 'squirrel':
            return (_jsxs(_Fragment, { children: [_jsx("path", { d: "M14 10 Q40 10 36 -18 Q33 -40 16 -34 Q30 -26 22 -10Z", fill: "#d07a44" }), _jsx("path", { d: "M22 -12 Q32 -24 22 -32", fill: "none", stroke: "#e8a06a", strokeWidth: "4", strokeLinecap: "round" }), _jsx("path", { d: "M-15 -18 L-14 -32 L-5 -22Z M15 -18 L14 -32 L5 -22Z", fill: c.dark }), _jsx("circle", { cx: "0", cy: "-5", r: "18", fill: c.fur }), _jsx("ellipse", { cx: "0", cy: "3", rx: "9", ry: "7", fill: c.light }), _jsx("ellipse", { cx: "0", cy: "-1", rx: "3", ry: "2.2", fill: INK }), _jsx(Face, { mood: mood, y: -9, sp: 7.5, r: 4.6 }), _jsx(Cheeks, { y: 0, x: 12 })] }));
        case 'hedgehog':
            return (_jsxs(_Fragment, { children: [_jsx("path", { d: spikes, fill: c.dark }), _jsx("ellipse", { cx: "0", cy: "-2", rx: "19", ry: "17", fill: c.fur }), _jsx("ellipse", { cx: "0", cy: "6", rx: "7", ry: "5", fill: c.light }), _jsx("ellipse", { cx: "0", cy: "2", rx: "3.4", ry: "2.6", fill: INK }), _jsx(Face, { mood: mood, y: -6, sp: 7.5, r: 4.6 }), _jsx(Cheeks, { y: 3, x: 12 })] }));
        case 'mouse':
            return (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "-17", cy: "-20", r: "11", fill: c.dark }), _jsx("circle", { cx: "17", cy: "-20", r: "11", fill: c.dark }), _jsx("circle", { cx: "-17", cy: "-20", r: "6.5", fill: "#f4b6c8" }), _jsx("circle", { cx: "17", cy: "-20", r: "6.5", fill: "#f4b6c8" }), _jsx("circle", { cx: "0", cy: "-4", r: "18", fill: c.fur }), _jsx("ellipse", { cx: "0", cy: "4", rx: "8", ry: "6", fill: c.light }), _jsx("circle", { cx: "0", cy: "0", r: "3", fill: "#e88aa6" }), _jsx(Face, { mood: mood, y: -8, sp: 7.5, r: 4.6 }), _jsx(Cheeks, { y: 1, x: 12 })] }));
        case 'bear':
            return (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "-15", cy: "-20", r: "7", fill: c.dark }), _jsx("circle", { cx: "15", cy: "-20", r: "7", fill: c.dark }), _jsx("circle", { cx: "0", cy: "-5", r: "19", fill: c.fur }), _jsx("ellipse", { cx: "0", cy: "3", rx: "9", ry: "7", fill: c.light }), _jsx("ellipse", { cx: "0", cy: "-1", rx: "3.4", ry: "2.4", fill: INK }), _jsx(Face, { mood: mood, y: -9, sp: 8, r: 4.8 }), _jsx(Cheeks, { y: 0, x: 13 })] }));
    }
}
/** The sitting body under a head, from y = 10 to y = 40. */
function Body({ kind }) {
    const c = coats[kind];
    const fur = kind === 'hedgehog' ? c.dark : c.fur;
    const belly = kind === 'hedgehog' ? c.fur : c.light;
    return (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-17 40 Q-17 10 0 10 Q17 10 17 40Z", fill: fur }), _jsx("ellipse", { cx: "0", cy: "31", rx: "8.5", ry: "9", fill: belly })] }));
}
/** A forest animal: just its head, or (with `body`) sitting. */
export function Critter({ kind, mood = 'idle', body = false }) {
    return (_jsxs(_Fragment, { children: [body && _jsx(Body, { kind: kind }), _jsx(Head, { kind: kind, mood: mood })] }));
}
/** A forest animal as the character of a scene (for `<SceneShell guide>`), on the guides' 120 × 120 grid. */
export function CritterGuide({ kind, mood = 'idle', children }) {
    return (_jsxs("svg", { viewBox: "0 0 120 120", className: "sg-guide-art", "aria-hidden": true, focusable: "false", children: [_jsx("ellipse", { cx: "60", cy: "112", rx: "40", ry: "7", fill: "#241a3c", opacity: "0.3" }), _jsxs("g", { transform: "translate(60 50) scale(1.55)", children: [_jsx(Critter, { kind: kind, mood: mood, body: true }), children] })] }));
}
