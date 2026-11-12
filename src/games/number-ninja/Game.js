import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useGameLoop, usePops, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { Pops } from '../../kit/ui';
import { decoyFor, expressionFor, targetRange } from './logic';
/** Right bubbles to pop in one stage, and how many of them before the number changes. */
const STAGE = 8;
const PER_TARGET = 4;
export default function NumberNinja({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const newTarget = () => rng.int(...targetRange(level));
    const [target, setTarget] = useState(newTarget);
    const [bubbles, setBubbles] = useState([]);
    const state = useRef({ bubbles: [], spawnIn: 0, nextId: 0 });
    const stage = useStage(STAGE, onFinish);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const speed = clamp(12 + level * 2.2, 12, 34); // % of the height per second
    useGameLoop((dt) => {
        const s = state.current;
        s.spawnIn -= dt;
        if (s.spawnIn <= 0) {
            s.spawnIn = clamp(1.2 - level * 0.06, 0.6, 1.2);
            const good = rng.chance(0.45);
            const e = good ? expressionFor(rng, level, target) : decoyFor(rng, level, target);
            s.bubbles.push({ ...e, id: s.nextId++, x: rng.int(10, 82), y: 105, speed: speed * (0.85 + rng.next() * 0.3) });
        }
        s.bubbles = s.bubbles.map((b) => ({ ...b, y: b.y - b.speed * dt })).filter((b) => b.y > -15);
        setBubbles(s.bubbles);
    }, !stage.over);
    const tap = (b) => {
        if (stage.over)
            return;
        const s = state.current;
        s.bubbles = s.bubbles.filter((q) => q.id !== b.id);
        setBubbles(s.bubbles);
        if (b.value !== target) {
            stage.slip();
            shake();
            addPop(`${b.text} = ${b.value}`, b.x + 6, b.y, 'bad');
            return;
        }
        const hits = stage.done + 1;
        if (stage.good() || hits % PER_TARGET !== 0)
            return;
        let n = newTarget();
        while (n === target)
            n = newTarget();
        setTarget(n);
        s.bubbles = [];
        setBubbles([]);
    };
    return (_jsx(SceneShell, { place: "peaks", say: t('say', { n: target }), stage: stage, bare: true, fill: true, className: "number-ninja", children: _jsxs("div", { className: "nn-field", ref: ref, children: [_jsx("span", { className: "nn-target", children: target }, target), bubbles.map((b) => (_jsx("button", { className: "nn-bubble", style: { left: `${b.x}%`, top: `${b.y}%` }, onPointerDown: () => tap(b), children: b.text }, b.id))), _jsx(Pops, { pops: pops })] }) }));
}
