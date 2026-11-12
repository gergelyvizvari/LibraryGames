import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { usePops, useShake } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { Pops } from '../../kit/ui';
import { makePuzzle, mirror, sameShape } from './logic';
/** Shapes to find in one stage. */
const STAGE = 6;
const blocks = { warm: ['#f2c14e', '#f7d572', '#d9a52e'], cool: ['#3fb0a8', '#62c4bc', '#2c9690'] };
/** A shape built of wooden toy blocks. */
function Shape({ cells, tone, size = 26 }) {
    const w = Math.max(...cells.map((c) => c[0])) + 1;
    const h = Math.max(...cells.map((c) => c[1])) + 1;
    const [face, light, dark] = blocks[tone];
    const s = size;
    return (_jsxs("svg", { viewBox: `0 -2 ${w * s} ${h * s + 8}`, width: w * s, height: h * s + 8, "aria-hidden": true, children: [cells.map(([x, y]) => (_jsx("rect", { x: x * s + 1, y: y * s + 5, width: s - 2, height: s - 2, rx: s * 0.2, fill: "#241a3c", opacity: "0.22" }, `s${x},${y}`))), cells.map(([x, y]) => (_jsxs("g", { children: [_jsx("rect", { x: x * s + 1, y: y * s + 1, width: s - 2, height: s - 2, rx: s * 0.2, fill: dark }), _jsx("rect", { x: x * s + 1, y: y * s + 1, width: s - 2, height: s - 6, rx: s * 0.2, fill: face }), _jsx("rect", { x: x * s + s * 0.2, y: y * s + s * 0.16, width: s * 0.6, height: s * 0.2, rx: s * 0.1, fill: light })] }, `${x},${y}`)))] }));
}
export default function ShapeSpin({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [puzzle, setPuzzle] = useState(() => makePuzzle(rng, level));
    const [spin, setSpin] = useState(0);
    const stage = useStage(STAGE, onFinish);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const choose = (i) => {
        if (stage.over)
            return;
        if (i !== puzzle.answer) {
            stage.slip();
            shake();
            if (sameShape(mirror(puzzle.target), puzzle.options[i]))
                addPop(t('flipped'), 50, 60, 'bad');
            return;
        }
        if (stage.good())
            return;
        setSpin((s) => s + 1);
        setPuzzle(makePuzzle(rng, level));
    };
    return (_jsxs(SceneShell, { place: "woods", say: t('which'), stage: stage, bare: true, className: "shape-spin", children: [_jsx("div", { className: "ss-target", children: _jsx(Shape, { cells: puzzle.target, tone: "warm", size: 36 }) }, spin), _jsx("div", { className: "ss-options", ref: ref, style: { gridTemplateColumns: `repeat(${puzzle.options.length === 4 ? 2 : 3}, 1fr)` }, children: puzzle.options.map((o, i) => (_jsx("button", { className: "ss-option", onPointerDown: () => choose(i), children: _jsx(Shape, { cells: o, tone: "cool", size: 21 }) }, `${spin}-${i}`))) }), _jsx(Pops, { pops: pops })] }));
}
