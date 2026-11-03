import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useCountdown, usePops, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { makePuzzle, mirror, sameShape } from './logic';
const DURATION = 60;
function Shape({ cells, color, size = 26 }) {
    const w = Math.max(...cells.map((c) => c[0])) + 1;
    const h = Math.max(...cells.map((c) => c[1])) + 1;
    return (_jsx("svg", { viewBox: `0 0 ${w * size} ${h * size}`, width: w * size, height: h * size, "aria-hidden": true, children: cells.map(([x, y]) => (_jsx("rect", { x: x * size + 1.5, y: y * size + 1.5, width: size - 3, height: size - 3, rx: 6, fill: color }, `${x},${y}`))) }));
}
export default function ShapeSpin({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level));
    const [spin, setSpin] = useState(0);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [right, setRight] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const left = useCountdown(DURATION, () => {
        setOver(true);
        onFinish({ score, accuracy: (right / Math.max(1, right + wrong)) * clamp(right / 12, 0, 1) });
    }, !over);
    const choose = (i) => {
        if (over)
            return;
        if (i === puzzle.answer) {
            const nc = combo + 1;
            const gained = 10 + Math.min(nc, 10) * 2;
            setScore((s) => s + gained);
            setCombo(nc);
            setRight((r) => r + 1);
            sound.good(nc);
            addPop(`+${gained}`, 50, 30);
            setSpin((s) => s + 1);
            setPuzzle(makePuzzle(rng, level));
        }
        else {
            setCombo(0);
            setWrong((w) => w + 1);
            sound.bad();
            vibrate(50);
            shake();
            const isMirror = sameShape(mirror(puzzle.target), puzzle.options[i]);
            addPop(isMirror ? t('flipped') : '✗', 50, 60, 'bad');
        }
    };
    return (_jsxs("div", { className: "game shape-spin", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsx("div", { className: "ss-target", children: _jsx(Shape, { cells: puzzle.target, color: "var(--game-color)", size: 34 }) }, spin), _jsx("p", { className: "prompt", children: t('which') }), _jsx("div", { className: "ss-options", ref: ref, style: { gridTemplateColumns: `repeat(${puzzle.options.length === 4 ? 2 : 3}, 1fr)` }, children: puzzle.options.map((o, i) => (_jsx("button", { className: "ss-option", onPointerDown: () => choose(i), children: _jsx(Shape, { cells: o, color: "#54a0ff", size: 20 }) }, `${spin}-${i}`))) }), _jsx(Pops, { pops: pops })] }));
}
