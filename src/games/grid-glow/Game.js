import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { usePops, useShake, useTimeouts } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hearts, Hud, Pops } from '../../kit/ui';
import { gridFor, pattern, startCount } from './logic';
const LIVES = 3;
const ROUNDS = 12;
export default function GridGlow({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [count, setCount] = useState(startCount(level));
    const size = gridFor(count);
    const [cells, setCells] = useState(() => pattern(rng, size, count));
    const [mode, setMode] = useState('show');
    const [picked, setPicked] = useState([]);
    const [wrongCell, setWrongCell] = useState(null);
    const [lives, setLives] = useState(LIVES);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [rounds, setRounds] = useState(0);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const later = useTimeouts();
    useEffect(() => {
        if (mode !== 'show')
            return;
        sound.tone(700, 0.15, 'triangle', 0.15);
        later(() => setMode('input'), clamp(1600 - level * 80 + count * 120, 900, 2200));
    }, [mode, cells, level, count, later]);
    const newRound = (n) => {
        setCount(n);
        setCells(pattern(rng, gridFor(n), n));
        setPicked([]);
        setWrongCell(null);
        setMode('show');
    };
    const end = (finalScore, finalBest) => onFinish({ score: finalScore, accuracy: clamp(finalBest / (3 + level), 0, 1) });
    const tap = (i) => {
        if (mode !== 'input' || picked.includes(i))
            return;
        if (!cells.includes(i)) {
            sound.bad();
            vibrate(50);
            shake();
            setWrongCell(i);
            setMode('wait');
            const left = lives - 1;
            setLives(left);
            const r = rounds + 1;
            setRounds(r);
            if (left <= 0 || r >= ROUNDS) {
                later(() => end(score, best), 900);
                return;
            }
            later(() => newRound(Math.max(2, count - 1)), 1100);
            return;
        }
        const next = [...picked, i];
        setPicked(next);
        sound.tone(500 + next.length * 60, 0.08, 'triangle', 0.15);
        if (next.length < cells.length)
            return;
        const gained = count * 10;
        const s = score + gained;
        const b = Math.max(best, count);
        setScore(s);
        setBest(b);
        sound.good(count);
        addPop(`+${gained}`, 50, 50);
        setMode('wait');
        const r = rounds + 1;
        setRounds(r);
        if (r >= ROUNDS) {
            later(() => end(s, b), 700);
            return;
        }
        later(() => newRound(count + 1), 700);
    };
    return (_jsxs("div", { className: "game grid-glow", children: [_jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('squares'), value: count, highlight: true },
                    { label: t('lives'), value: _jsx(Hearts, { left: lives, total: LIVES }) },
                ] }), _jsx("p", { className: "prompt", children: mode === 'show' ? t('watch') : t('yourTurn') }), _jsx("div", { className: "gg-grid", ref: ref, style: { gridTemplateColumns: `repeat(${size}, 1fr)` }, children: Array.from({ length: size * size }, (_, i) => {
                    const lit = mode === 'show' || (mode === 'wait' && wrongCell !== null) ? cells.includes(i) : picked.includes(i);
                    return (_jsx("button", { className: `gg-cell${lit ? ' gg-lit' : ''}${wrongCell === i ? ' gg-wrong' : ''}`, onPointerDown: () => tap(i), "aria-label": `square ${i + 1}` }, `${rounds}-${i}`));
                }) }), _jsx(Pops, { pops: pops })] }));
}
