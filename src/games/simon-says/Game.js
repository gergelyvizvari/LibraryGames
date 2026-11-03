import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { usePops, useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops } from '../../kit/ui';
import { judge, makeOrders, pickAnimals, windowMs } from './logic';
const messages = {
    wrongAnimal: 'wrong',
    noSimon: 'gotcha',
    tooSlow: 'tooSlow',
    waited: 'wellWaited',
};
export default function SimonSays({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const animals = useRef(pickAnimals(rng, level)).current;
    const orders = useRef(makeOrders(rng, level, animals.length)).current;
    const [index, setIndex] = useState(0);
    const [active, setActive] = useState(false);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [right, setRight] = useState(0);
    const [progress, setProgress] = useState(1);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const started = useRef(0);
    const result = useRef({ score: 0, right: 0, combo: 0 });
    const ms = windowMs(level);
    const resolve = (tapped) => {
        if (!active)
            return;
        setActive(false);
        const order = orders[index];
        const outcome = judge(order, tapped);
        const r = result.current;
        if (outcome === 'right' || outcome === 'waited') {
            r.combo++;
            r.right++;
            const gained = 10 + Math.min(r.combo, 10) * 2;
            r.score += gained;
            sound.good(r.combo);
            addPop(outcome === 'waited' ? `${t('wellWaited')} +${gained}` : `+${gained}`, 50, 25);
        }
        else {
            r.combo = 0;
            sound.bad();
            vibrate(60);
            shake();
            addPop(t(messages[outcome]), 50, 25, 'bad');
        }
        setScore(r.score);
        setCombo(r.combo);
        setRight(r.right);
        later(() => {
            if (index + 1 >= orders.length) {
                onFinish({ score: r.score, accuracy: r.right / orders.length });
                return;
            }
            setIndex(index + 1);
        }, 800);
    };
    const resolveRef = useRef(resolve);
    resolveRef.current = resolve;
    // Each order opens a window; if it closes without a tap, that counts as waiting.
    useEffect(() => {
        started.current = performance.now();
        setActive(true);
        setProgress(1);
        const tick = setInterval(() => setProgress(Math.max(0, 1 - (performance.now() - started.current) / ms)), 50);
        const timeout = setTimeout(() => resolveRef.current(null), ms);
        return () => {
            clearInterval(tick);
            clearTimeout(timeout);
        };
    }, [index, ms]);
    const order = orders[index];
    const key = animals[order.animal].key;
    // Some languages change the word after "tap" (Hungarian: kutya → kutyára), so `<animal>.tap` wins when a language has it.
    const animal = t(`${key}.tap`) === `${key}.tap` ? t(key) : t(`${key}.tap`);
    return (_jsxs("div", { className: "game simon-says", children: [_jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('order'), value: `${index + 1} / ${orders.length}` },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
                ] }), _jsxs("div", { className: "sim-order", children: [_jsx("span", { className: "sim-face", children: "\uD83E\uDD34" }), _jsx("span", { children: order.simon ? t('simonSays', { animal }) : t('plain', { animal }) }), _jsx("div", { className: "sim-timer", children: _jsx("div", { style: { width: `${(active ? progress : 0) * 100}%` } }) })] }, index), _jsx("div", { className: `sim-animals${animals.length > 4 ? ' sim-six' : ''}`, ref: ref, children: animals.map((a, i) => (_jsx("button", { className: "sim-animal", onPointerDown: () => resolve(i), "aria-label": t(a.key), children: a.emoji }, a.key))) }), _jsxs("p", { className: "muted", style: { textAlign: 'center' }, children: [right, " \u2713"] }), _jsx(Pops, { pops: pops })] }));
}
