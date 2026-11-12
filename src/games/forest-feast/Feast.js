import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Critter } from '../../kit/critters';
// The drawn table of the feast: chairs in a row, the guests on them, the cloth, the cake and the cups.
const CREAM = '#fffaf0';
/** Width of one chair's place on the table, in drawing units. */
export const SEAT_W = 84;
export const TABLE_H = 300;
const TOP = 60;
const cupColors = ['#3fb0a8', '#a48cf0', '#f2c14e', '#7cc552', '#62a6e6', '#f39a5a'];
/** The little picture in a guest's wish bubble, drawn around (0, 0) in about 50 × 26. */
export function WishIcon({ wish, guests }) {
    if (wish.kind === 'window')
        return (_jsxs(_Fragment, { children: [_jsx("rect", { x: "-12", y: "-11", width: "24", height: "22", rx: "5", fill: "#bd7d4a" }), _jsx("rect", { x: "-9", y: "-8", width: "18", height: "16", rx: "3", fill: "#8fd0e8" }), _jsx("path", { d: "M-9 4 Q0 0 9 3 V8 H-9Z", fill: "#7cc552" }), _jsx("path", { d: "M-9 0 H9 M0 -8 V8", stroke: "#bd7d4a", strokeWidth: "2.4" })] }));
    if (wish.kind === 'cake')
        return (_jsxs(_Fragment, { children: [_jsx("rect", { x: "-10", y: "-3", width: "20", height: "11", rx: "3", fill: "#f4b6c8" }), _jsx("path", { d: "M-10 -1 q3.3 3 6.6 0 q3.3 3 6.6 0 q3.3 3 6.6 0 v-3 h-19.8Z", fill: "#fff6dc" }), _jsx("circle", { cx: "0", cy: "-7", r: "3", fill: "#e2607e" })] }));
    return (_jsxs(_Fragment, { children: [_jsx("g", { transform: "translate(-10 3) scale(0.42)", children: _jsx(Critter, { kind: guests[wish.who] }) }), wish.kind === 'next' ? (_jsx("path", { d: "M12 6 C4 0 7 -6 12 -2 C17 -6 20 0 12 6Z", fill: "#e2607e" })) : (_jsxs("g", { transform: "translate(13 0)", children: [_jsx("circle", { r: "7.5", fill: CREAM, stroke: "#d9506a", strokeWidth: "2.6" }), _jsx("path", { d: "M-5 5 L5 -5", stroke: "#d9506a", strokeWidth: "2.6" })] }))] }));
}
/** A speech bubble with a wish, its tail pointing down at (0, 0). Red-edged when the wish does not hold. */
export function WishBubble({ wish, guests, sad = false }) {
    const w = wish.kind === 'next' || wish.kind === 'apart' ? 52 : 36;
    return (_jsxs("g", { className: sad ? 'ff-wish ff-sad' : 'ff-wish', children: [_jsx("rect", { x: -w / 2, y: "-44", width: w, height: "34", rx: "17", fill: CREAM, stroke: sad ? '#e2607e' : 'none', strokeWidth: "3" }), _jsx("path", { d: "M-6 -12 L0 -2 L6 -12Z", fill: CREAM }), _jsx("g", { transform: "translate(0 -27)", children: _jsx(WishIcon, { wish: wish, guests: guests }) })] }));
}
const moodFor = (state, done) => (done || state === 'ok' ? 'happy' : state === 'broken' ? 'sad' : 'idle');
/** The table with its chairs and the guests sitting on them. */
export function Feast({ table, seating, states, picked, done, }) {
    const n = seating.length;
    const w = n * SEAT_W + 24;
    const x = (s) => 12 + SEAT_W * s + SEAT_W / 2;
    return (_jsxs("svg", { viewBox: `0 0 ${w} ${TABLE_H}`, className: "ff-art", "aria-hidden": true, focusable: "false", children: [_jsxs("g", { transform: `translate(${x(0)} ${TOP - 20})`, children: [_jsx("rect", { x: "-30", y: "-40", width: "60", height: "52", rx: "12", fill: "#e8d9b0" }), _jsx("rect", { x: "-24", y: "-34", width: "48", height: "40", rx: "8", fill: "#bfe3ef" }), _jsx("path", { d: "M-24 -6 Q-4 -16 24 -8 V6 H-24Z", fill: "#9dcf6a" }), _jsx("path", { d: "M-14 -4 l7 -20 l7 20Z", fill: "#2f6f6a" }), _jsx("path", { d: "M-24 -14 H24 M0 -34 V6", stroke: "#e8d9b0", strokeWidth: "4" })] }), seating.map((_, s) => (_jsxs("g", { transform: `translate(${x(s)} 0)`, children: [_jsx("rect", { x: "-33", y: TOP, width: "66", height: "120", rx: "15", fill: "#a8683c" }), _jsx("rect", { x: "-25", y: TOP + 9, width: "50", height: "92", rx: "10", fill: "#bd7d4a" }), _jsx("path", { d: `M-25 ${TOP + 38} h50 M-25 ${TOP + 64} h50`, stroke: "#a8683c", strokeWidth: "3" }), seating[s] === null && _jsx("circle", { cy: TOP + 52, r: "16", fill: CREAM, opacity: picked !== null ? 0.6 : 0.3, className: picked !== null ? 'ff-free' : undefined })] }, s))), seating.map((g, s) => g === null ? null : (_jsx("g", { transform: `translate(${x(s)} ${TOP + 70})`, children: _jsx("g", { className: `ff-guest${picked === g ? ' ff-picked' : ''}${done ? ' ff-hop' : ''}`, children: _jsx("g", { transform: "scale(1.3)", children: _jsx(Critter, { kind: table.guests[g], mood: moodFor(states[g], done), body: true }) }) }) }, `g${g}`))), _jsx("rect", { x: "4", y: TOP + 108, width: w - 8, height: "24", rx: "8", fill: "#fff6dc" }), _jsx("path", { d: `M4 ${TOP + 126} h${w - 8} v24 ${Array.from({ length: Math.ceil((w - 8) / 28) }, () => 'q-7 9 -14 0 q-7 9 -14 0').join(' ')} Z`, fill: CREAM }), _jsx("path", { d: `M4 ${TOP + 134} h${w - 8}`, stroke: "#e2607e", strokeWidth: "3", strokeDasharray: "10 8", opacity: "0.6" }), _jsx("rect", { x: "22", y: TOP + 154, width: "14", height: "74", rx: "5", fill: "#8a5c3c" }), _jsx("rect", { x: w - 36, y: TOP + 154, width: "14", height: "74", rx: "5", fill: "#8a5c3c" }), seating.map((_, s) => s === table.cake ? (_jsxs("g", { transform: `translate(${x(s)} ${TOP + 104})`, children: [_jsx("ellipse", { cx: "0", cy: "14", rx: "28", ry: "6", fill: CREAM }), _jsx("rect", { x: "-20", y: "-8", width: "40", height: "22", rx: "5", fill: "#f4b6c8" }), _jsx("path", { d: "M-20 -4 q6.7 6 13.3 0 q6.7 6 13.3 0 q6.7 6 13.4 0 v-6 h-40Z", fill: "#fff6dc" }), _jsx("circle", { cx: "0", cy: "-13", r: "5.5", fill: "#e2607e" }), _jsx("path", { d: "M0 -18 q2 -4 5 -5", stroke: "#62ab3e", strokeWidth: "2", fill: "none" })] }, s)) : (_jsxs("g", { transform: `translate(${x(s)} ${TOP + 112})`, children: [_jsx("ellipse", { cx: "0", cy: "7", rx: "13", ry: "3.5", fill: CREAM }), _jsx("path", { d: "M-8 -5 h16 v6 a8 8 0 0 1 -16 0Z", fill: cupColors[s % cupColors.length] }), _jsx("path", { d: "M8 -2 q6 0 4 5", fill: "none", stroke: cupColors[s % cupColors.length], strokeWidth: "2.4" })] }, s))), seating.map((g, s) => {
                const wish = g === null ? null : table.wishes[g];
                if (g === null || !wish || done || (states[g] === 'ok' && picked !== g))
                    return null;
                return (_jsx("g", { transform: `translate(${x(s)} ${TOP + 30})`, children: _jsx(WishBubble, { wish: wish, guests: table.guests, sad: states[g] === 'broken' }) }, `w${g}`));
            })] }));
}
/** A guest waiting in the tray, with its wish above it. */
export function Waiting({ table, g }) {
    const wish = table.wishes[g];
    return (_jsxs("svg", { viewBox: "-36 -80 72 124", className: "ff-wait-art", "aria-hidden": true, focusable: "false", children: [_jsx("ellipse", { cx: "0", cy: "40", rx: "24", ry: "5", fill: "#241a3c", opacity: "0.15" }), _jsx("g", { transform: "translate(0 6) scale(0.86)", children: _jsx(Critter, { kind: table.guests[g], body: true }) }), wish && (_jsx("g", { transform: "translate(0 -36) scale(0.9)", children: _jsx(WishBubble, { wish: wish, guests: table.guests }) }))] }));
}
