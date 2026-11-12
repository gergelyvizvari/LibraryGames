import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
/** A pup's face on the 48 × 48 grid: coat, ears and muzzle colours, with open or happily closed eyes. */
const face = (coat, ear, muzzle, happy, extra = []) => [
    ['accent', ear, _jsx("path", { d: "M10 12 C2 14 2 30 8 36 C12 32 14 22 15 14 Z M38 12 C46 14 46 30 40 36 C36 32 34 22 33 14 Z" })],
    ['base', coat, _jsx("circle", { cx: "24", cy: "23", r: "16.5" })],
    ['detail', muzzle, _jsx("ellipse", { cx: "24", cy: "30", rx: "8.5", ry: "6.8" })],
    ['detail', '#f08aa6', _jsx("path", { d: "M11.5 27.5a2.6 2.6 0 1 0 .1 0Z M36.5 27.5a2.6 2.6 0 1 0 .1 0Z" })],
    happy
        ? ['base', ink, _jsx("path", { d: "M13.5 21 q3.5 -4.4 7 0 l-.6 1.2 q-2.9 -3 -5.8 0 Z M27.5 21 q3.5 -4.4 7 0 l-.6 1.2 q-2.9 -3 -5.8 0 Z M21 26 h6 q0 4.2 -3 4.2 q-3 0 -3 -4.2 Z" })]
        : ['base', ink, _jsx("path", { d: "M17 16.8a4 4 0 1 0 .1 0Z M31 16.8a4 4 0 1 0 .1 0Z M21 26 h6 q0 4.2 -3 4.2 q-3 0 -3 -4.2 Z" })],
    ...(happy ? [] : [['shine', '#fff', _jsx("path", { d: "M15.6 18a1.3 1.3 0 1 0 .1 0Z M29.6 18a1.3 1.3 0 1 0 .1 0Z" })]]),
    ...extra,
];
// Won one at a time by finishing stages. Drawn like game icons, on the 48 × 48 grid.
export const stickers = [
    { name: 'sticker.happy', icon: face('#e6a862', '#a8683c', '#fff3dc', true, [['detail', '#f08aa6', _jsx("path", { d: "M21.5 31.5 q2.5 2 5 0 q-.4 4.5 -2.5 4.5 q-2.1 0 -2.5 -4.5 Z" })]]) },
    {
        name: 'sticker.bow',
        icon: face('#bcb7d6', '#7d76a4', '#eeeaf8', false, [
            ['accent', '#d9506a', _jsx("path", { d: "M24 42 l-9 -5 v10 Z M24 42 l9 -5 v10 Z" })],
            ['detail', '#b63c5c', _jsx("circle", { cx: "24", cy: "42", r: "2.8" })],
        ]),
    },
    { name: 'sticker.snow', icon: face('#fff6e6', '#b5825a', '#ffffff', false, [['accent', '#b5825a', _jsx("path", { d: "M26 6.7 C36 7 40.5 14 40.3 21 C35 24 29 20 26 6.7 Z" })]]) },
    {
        name: 'sticker.basket',
        icon: [
            ['accent', '#c98f2a', _jsx("path", { d: "M13 10 C8 11 8 20 11 24 L16 14 Z M35 10 C40 11 40 20 37 24 L32 14 Z" })],
            ['base', '#f2c14e', _jsx("circle", { cx: "24", cy: "18", r: "12" })],
            ['detail', '#fff3c8', _jsx("ellipse", { cx: "24", cy: "23", rx: "6", ry: "4.6" })],
            ['base', ink, _jsx("path", { d: "M19 13.6a2.8 2.8 0 1 0 .1 0Z M29 13.6a2.8 2.8 0 1 0 .1 0Z M22 20.4 h4 q0 3 -2 3 q-2 0 -2 -3 Z" })],
            ['accent', '#b5825a', _jsx("path", { d: "M6 28 H42 Q41 44 34 44 H14 Q7 44 6 28 Z" })],
            ['detail', '#c99a6a', _jsx("rect", { x: "4", y: "24.5", width: "40", height: "7", rx: "3.5" })],
        ],
    },
];
