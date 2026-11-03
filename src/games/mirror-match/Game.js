import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useCountdown, usePops, useShake, useTimeouts } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { makePuzzle, targets } from './logic';
const DURATION = 75;
export default function MirrorMatch({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level, 0));
    const [filled, setFilled] = useState([]);
    const [wrongCell, setWrongCell] = useState(null);
    const [solved, setSolved] = useState(0);
    const [slips, setSlips] = useState(0);
    const [score, setScore] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const goal = targets(puzzle);
    const left = useCountdown(DURATION, () => {
        setOver(true);
        onFinish({ score, accuracy: clamp(solved / 6, 0, 1) * (slips > solved * 2 ? 0.7 : 1) });
    }, !over);
    const tap = (cell) => {
        if (over || filled.includes(cell) || filled.length === goal.length)
            return;
        if (!goal.includes(cell)) {
            setSlips((s) => s + 1);
            setWrongCell(cell);
            later(() => setWrongCell(null), 300);
            sound.bad();
            vibrate(40);
            shake();
            return;
        }
        const next = [...filled, cell];
        setFilled(next);
        sound.tone(500 + next.length * 60, 0.08, 'triangle', 0.16);
        if (next.length < goal.length)
            return;
        const gained = goal.length * 10;
        setScore((s) => s + gained);
        setSolved((n) => n + 1);
        sound.good(solved + 1);
        addPop(`${t('perfect')} +${gained}`, 50, 45);
        later(() => {
            setPuzzle(makePuzzle(rng, level, solved + 1));
            setFilled([]);
        }, 800);
    };
    const side = (isLeft) => (_jsx("div", { className: "mm-side", style: { gridTemplateColumns: `repeat(${puzzle.half}, 1fr)` }, children: Array.from({ length: puzzle.rows * puzzle.half }, (_, i) => {
            const on = isLeft ? puzzle.left.includes(i) : filled.includes(i);
            return isLeft ? (_jsx("span", { className: `mm-cell${on ? ' mm-on' : ''}` }, i)) : (_jsx("button", { className: `mm-cell mm-tap${on ? ' mm-on' : ''}${wrongCell === i ? ' mm-wrong' : ''}`, onPointerDown: () => tap(i) }, i));
        }) }));
    return (_jsxs("div", { className: "game mirror-match", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('patterns'), value: solved, highlight: solved > 0 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsxs("div", { className: "mm-board", ref: ref, children: [side(true), _jsx("div", { className: "mm-mirror" }), side(false)] }, solved), _jsxs("p", { className: "muted", style: { textAlign: 'center' }, children: [filled.length, " / ", goal.length] }), _jsx(Pops, { pops: pops })] }));
}
