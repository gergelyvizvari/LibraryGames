import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { makePuzzle, targets } from './logic';
/** Patterns to mirror in one stage. */
const STAGE = 4;
export default function MirrorMatch({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level, 0));
    const [filled, setFilled] = useState([]);
    const [wrongCell, setWrongCell] = useState(null);
    const [solved, setSolved] = useState(0);
    const stage = useStage(STAGE, onFinish);
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const goal = targets(puzzle);
    const tap = (cell) => {
        if (stage.over || filled.includes(cell) || filled.length === goal.length)
            return;
        if (!goal.includes(cell)) {
            setWrongCell(cell);
            later(() => setWrongCell(null), 300);
            stage.slip();
            shake();
            return;
        }
        const next = [...filled, cell];
        setFilled(next);
        sound.tone(500 + next.length * 60, 0.08, 'triangle', 0.16);
        if (next.length < goal.length)
            return;
        setSolved((n) => n + 1);
        if (stage.good(goal.length * 10))
            return;
        later(() => {
            setPuzzle(makePuzzle(rng, level, solved + 1));
            setFilled([]);
        }, 800);
    };
    const side = (isLeft) => (_jsx("div", { className: "mm-side", style: { gridTemplateColumns: `repeat(${puzzle.half}, 1fr)` }, children: Array.from({ length: puzzle.rows * puzzle.half }, (_, i) => {
            const on = isLeft ? puzzle.left.includes(i) : filled.includes(i);
            return isLeft ? (_jsx("span", { className: `mm-cell${on ? ' mm-on' : ''}` }, i)) : (_jsx("button", { className: `mm-cell mm-tap${on ? ' mm-on' : ''}${wrongCell === i ? ' mm-wrong' : ''}`, onPointerDown: () => tap(i) }, i));
        }) }));
    return (_jsx(SceneShell, { place: "woods", say: t('say'), stage: stage, bare: true, className: "mirror-match", children: _jsxs("div", { className: "mm-board", ref: ref, children: [side(true), _jsx("div", { className: "mm-mirror" }), side(false)] }, solved) }));
}
