import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { usePops, useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops } from '../../kit/ui';
import { ROUNDS, accuracyFor, animalKey, holdRange, pointsFor } from './logic';
export default function LightsOut({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [state, setState] = useState('ready');
    const [lit, setLit] = useState(0);
    const [times, setTimes] = useState([]);
    const [message, setMessage] = useState('');
    const [score, setScore] = useState(0);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const outAt = useRef(0);
    const run = useRef(0);
    const startLights = () => {
        const id = ++run.current;
        setMessage('');
        setLit(0);
        setState('lighting');
        for (let i = 1; i <= 5; i++) {
            later(() => {
                if (run.current !== id)
                    return;
                setLit(i);
                sound.tone(440, 0.12, 'square', 0.08);
                if (i === 5) {
                    setState('holding');
                    const [min, max] = holdRange(level);
                    later(() => {
                        if (run.current !== id)
                            return;
                        setLit(0);
                        setState('go');
                        outAt.current = performance.now();
                    }, rng.int(min, max));
                }
            }, i * 450);
        }
    };
    const tap = () => {
        if (state === 'ready' || state === 'result') {
            startLights();
            return;
        }
        if (state === 'lighting' || state === 'holding') {
            run.current++;
            sound.bad();
            vibrate(80);
            shake();
            setLit(0);
            setMessage(t('tooSoon'));
            setState('result');
            return;
        }
        if (state !== 'go')
            return;
        const ms = Math.round(performance.now() - outAt.current);
        const next = [...times, ms];
        const pts = pointsFor(ms);
        setTimes(next);
        setScore((s) => s + pts);
        sound.good(next.length * 2);
        addPop(`+${pts}`, 50, 30);
        setMessage(`${t('ms', { ms })} · ${t(animalKey(ms))}`);
        if (next.length >= ROUNDS) {
            setState('done');
            onFinish({ score: score + pts, accuracy: accuracyFor(next, level) });
        }
        else {
            setState('result');
        }
    };
    const label = state === 'go' ? t('tapNow') : state === 'lighting' || state === 'holding' ? t('waitForIt') : state === 'done' ? '' : t('tapToStart');
    return (_jsxs("div", { className: "game lights-out", children: [_jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('round'), value: `${Math.min(times.length + 1, ROUNDS)} / ${ROUNDS}` },
                ] }), _jsxs("button", { ref: ref, className: `lo-area lo-${state}`, onPointerDown: tap, children: [_jsx("div", { className: "lo-lights", children: [1, 2, 3, 4, 5].map((i) => (_jsx("span", { className: `lo-light${i <= lit ? ' lo-on' : ''}` }, i))) }), _jsx("div", { className: "lo-message", children: message }), _jsx("div", { className: "lo-label", children: label })] }), _jsx(Pops, { pops: pops })] }));
}
