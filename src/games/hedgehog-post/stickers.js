import { jsx as _jsx } from "react/jsx-runtime";
import { ink } from '../../kit/icon';
import { icon } from './icon';
const box = [
    ['accent', '#8d6e63', _jsx("rect", { x: "21", y: "30", width: "6", height: "15", rx: "2" })],
    ['base', '#54a0ff', _jsx("path", { d: "M10 20 a14 14 0 0 1 28 0 V32 H10Z" })],
    ['detail', ink, _jsx("rect", { x: "17", y: "20", width: "14", height: "4", rx: "2" })],
    ['shine', '#fff', _jsx("path", { d: "M14 18 a10 10 0 0 1 6 -7 v4 a6 6 0 0 0 -3 3Z" })],
];
const cap = [
    ['accent', '#2c5590', _jsx("path", { d: "M6 30 Q24 38 42 30 L40 35 Q24 42 8 35Z" })],
    ['base', '#54a0ff', _jsx("path", { d: "M8 31 Q8 10 24 10 Q40 10 40 31 Q24 26 8 31Z" })],
    ['detail', '#feca57', _jsx("circle", { cx: "24", cy: "21", r: "4.5" })],
];
// Won one at a time by finishing stages.
export const stickers = [
    { name: 'sticker.letter', icon },
    { name: 'sticker.box', icon: box },
    { name: 'sticker.cap', icon: cap },
];
