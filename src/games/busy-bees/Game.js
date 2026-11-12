import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useGameLoop, useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { Thing } from '../../kit/things';
import { Bee } from './Bee';
import { makeTurn, pointsFor, positionAt, SHOW_MS } from './logic';
/** Flights to follow in one stage. */
const STAGE = 5;
// Flowers that decorate the meadow, as [emoji, x %, y %].
const FLOWERS = [
    ['flower', 8, 10], ['flower', 88, 6], ['mushroom', 50, 92], ['flower', 92, 60], ['leaf', 4, 70], ['flower', 34, 4], ['flower', 70, 34], ['leaf', 26, 48],
];
export default function BusyBees({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [turn, setTurn] = useState(() => makeTurn(rng, level));
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState('show');
    const [ms, setMs] = useState(0);
    const [found, setFound] = useState([]);
    const [wrong, setWrong] = useState(null);
    const [result, setResult] = useState(null);
    const stage = useStage(STAGE, onFinish);
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const flight = (turn.paths[0].length - 1) * turn.legMs;
    // Show the bee(s) to follow, then let everyone fly.
    useEffect(() => {
        if (phase !== 'show')
            return;
        later(() => setPhase('fly'), SHOW_MS);
    }, [phase, index, later]);
    useGameLoop((dt) => {
        const next = ms + dt * 1000;
        if (next >= flight) {
            setMs(flight);
            setPhase('pick');
            sound.tick();
        }
        else
            setMs(next);
    }, phase === 'fly');
    const nextTurn = (delay) => {
        later(() => {
            setTurn(makeTurn(rng, level));
            setIndex((i) => i + 1);
            setMs(0);
            setFound([]);
            setWrong(null);
            setResult(null);
            setPhase('show');
        }, delay);
    };
    const tap = (bee) => {
        if (phase !== 'pick' || result || found.includes(bee))
            return;
        if (turn.targets.includes(bee)) {
            const now = [...found, bee];
            setFound(now);
            if (now.length < turn.targets.length) {
                sound.pop();
                return;
            }
            setResult('yes');
            // A happy little buzz.
            sound.tone(220, 0.12, 'sawtooth', 0.04, 0.12);
            if (!stage.good(pointsFor(level, 1)))
                nextTurn(1100);
            return;
        }
        setWrong(bee);
        setResult('no');
        shake();
        if (!stage.miss())
            nextTurn(1800);
    };
    const prompt = () => {
        if (result === 'no' && turn.targets.length > 1)
            return t('noTwo');
        if (result)
            return t(result);
        if (phase === 'show')
            return t(turn.targets.length > 1 ? 'watchTwo' : 'watchOne');
        if (phase === 'fly')
            return t('follow');
        if (found.length > 0)
            return t('oneMore');
        return t(turn.targets.length > 1 ? 'findTwo' : 'findOne');
    };
    const reveal = phase === 'show' || result === 'no';
    return (_jsx(SceneShell, { place: "lake", say: prompt(), stage: stage, bare: true, fill: true, className: "busy-bees", children: _jsxs("div", { ref: ref, className: `bb-meadow${phase === 'pick' && !result ? ' bb-picking' : ''}`, children: [FLOWERS.map(([f, x, y], i) => (_jsx("span", { className: "bb-flower", style: { left: `${x}%`, top: `${y}%` }, children: _jsx(Thing, { id: f }) }, i))), turn.paths.map((path, b) => {
                    const p = positionAt(path, ms, turn.legMs);
                    // A little buzzing wobble while flying.
                    const wob = phase === 'fly' ? Math.sin(ms / 70 + b * 2) * 0.012 : 0;
                    const x = (p.x + wob) * 100;
                    const y = (p.y + Math.cos(ms / 90 + b) * wob) * 100;
                    const cls = [
                        'bb-bee',
                        reveal && turn.targets.includes(b) ? 'bb-target' : '',
                        found.includes(b) ? 'bb-found' : '',
                        wrong === b ? 'bb-wrong' : '',
                        phase === 'fly' ? 'bb-flying' : '',
                    ].join(' ');
                    return (_jsx("button", { className: cls, style: { left: `${x}%`, top: `${y}%` }, onPointerDown: () => tap(b), "aria-label": `bee ${b + 1}`, disabled: phase === 'done', children: _jsx("span", { className: "bb-face", style: { transform: `scaleX(${p.dir})` }, children: _jsx(Bee, {}) }) }, `${index}-${b}`));
                })] }) }));
}
