import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useCountdown, usePops, useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { Clock } from './Clock';
import { DURATION, flipped, label, makeOptions, pointsFor, randomTime, same, stepFor } from './logic';
export default function ClockCatch({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const makeQuestion = (prev) => {
        let answer = randomTime(rng, stepFor(level));
        while (prev && same(prev, answer))
            answer = randomTime(rng, stepFor(level));
        return { answer, options: makeOptions(rng, answer, level) };
    };
    const [q, setQ] = useState(() => makeQuestion());
    const [index, setIndex] = useState(0);
    const [wrong, setWrong] = useState([]);
    const [solved, setSolved] = useState(false);
    const [score, setScore] = useState(0);
    const [caught, setCaught] = useState(0);
    const [combo, setCombo] = useState(0);
    const [message, setMessage] = useState('');
    const [over, setOver] = useState(false);
    const stats = useRef({ right: 0, misses: 0 });
    const shownAt = useRef(performance.now());
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const flip = flipped(level, index);
    const left = useCountdown(DURATION, () => {
        setOver(true);
        const s = stats.current;
        onFinish({ score, accuracy: (s.right / Math.max(1, s.right + s.misses)) * Math.min(1, s.right / 10) });
    }, !over);
    const pick = (o) => {
        if (over || solved || wrong.some((w) => same(w, o)))
            return;
        if (!same(o, q.answer)) {
            stats.current.misses++;
            setWrong((w) => [...w, o]);
            setCombo(0);
            setMessage(t('no'));
            sound.bad();
            vibrate(40);
            shake();
            return;
        }
        const firstTry = wrong.length === 0;
        const c = firstTry ? combo + 1 : 0;
        const pts = firstTry ? pointsFor((performance.now() - shownAt.current) / 1000, c) : 5;
        if (firstTry)
            stats.current.right++;
        setCombo(c);
        setScore((s) => s + pts);
        setCaught((n) => n + 1);
        setSolved(true);
        setMessage(t('yes', { time: label(q.answer) }));
        sound.good(c);
        // Two soft ticks, like a clock.
        sound.tone(1200, 0.03, 'square', 0.05, 0.18);
        sound.tone(900, 0.03, 'square', 0.05, 0.3);
        addPop(`+${pts}`, 50, 20);
        later(() => {
            setQ(makeQuestion(q.answer));
            setIndex((i) => i + 1);
            setWrong([]);
            setSolved(false);
            setMessage('');
            shownAt.current = performance.now();
        }, 900);
    };
    const optionClass = (o) => `${solved && same(o, q.answer) ? ' cc-right' : ''}${wrong.some((w) => same(w, o)) ? ' cc-wrong' : ''}`;
    return (_jsxs("div", { className: "game clock-catch", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('caught'), value: caught, highlight: combo >= 3 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsx("p", { className: `prompt${solved ? ' cc-yes' : ''}`, children: message || (flip ? t('findClock', { time: label(q.answer) }) : t('whatTime')) }), _jsxs("div", { className: `cc-stage${flip ? ' cc-stage-flip' : ''}`, children: [flip ? _jsx("div", { className: "cc-digital", children: label(q.answer) }) : _jsx(Clock, { time: q.answer, size: 210 }), _jsx(Pops, { pops: pops })] }, index), _jsx("div", { ref: ref, className: flip ? 'cc-clocks' : `cc-options cc-options-${q.options.length}`, children: q.options.map((o) => (_jsx("button", { className: `${flip ? 'cc-clock-btn' : 'cc-time-btn'}${optionClass(o)}`, onPointerDown: () => pick(o), disabled: over, "aria-label": label(o), children: flip ? _jsx(Clock, { time: o, size: 104 }) : label(o) }, `${index}-${label(o)}`))) })] }));
}
