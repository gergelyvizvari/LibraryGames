import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { ROUNDS, animalKey, holdRange, pointsFor } from './logic';
export default function LightsOut({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [state, setState] = useState('ready');
    const [lit, setLit] = useState(0);
    const [message, setMessage] = useState('');
    const stage = useStage(ROUNDS, onFinish);
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
            stage.slip();
            shake();
            setLit(0);
            setMessage(t('tooSoon'));
            setState('result');
            return;
        }
        if (state !== 'go')
            return;
        const ms = Math.round(performance.now() - outAt.current);
        setMessage(`${t('ms', { ms })} · ${t(animalKey(ms))}`);
        setState(stage.good(pointsFor(ms)) ? 'done' : 'result');
    };
    const label = state === 'go' ? t('tapNow') : state === 'lighting' || state === 'holding' ? t('waitForIt') : state === 'done' ? '' : t('tapToStart');
    return (_jsx(SceneShell, { place: "meadow", say: message || label || t('tapToStart'), stage: stage, bare: true, fill: true, className: "lights-out", children: _jsxs("button", { ref: ref, className: `lo-area lo-${state}`, onPointerDown: tap, children: [_jsx("div", { className: "lo-lights", children: [1, 2, 3, 4, 5].map((i) => (_jsx("span", { className: `lo-light${i <= lit ? ' lo-on' : ''}` }, i))) }), _jsx("div", { className: "lo-label", children: label })] }) }));
}
