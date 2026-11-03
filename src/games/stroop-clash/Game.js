import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useCountdown, usePops, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { answerFor, colourCount, colours, makeCard } from './logic';
const DURATION = 45;
export default function StroopClash({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [card, setCard] = useState(() => makeCard(rng, level));
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [right, setRight] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const left = useCountdown(DURATION, () => {
        setOver(true);
        const total = right + wrong;
        onFinish({ score, accuracy: total === 0 ? 0 : (right / total) * clamp(right / 25, 0, 1) });
    }, !over);
    const next = () => {
        const c = makeCard(rng, level);
        setCard(c);
        if (c.rule === 'word')
            addPop(t('flip'), 50, 15, 'info');
    };
    const choose = (i) => {
        if (over)
            return;
        if (i === answerFor(card)) {
            const nc = combo + 1;
            const gained = 10 + Math.min(nc, 10);
            setScore((s) => s + gained);
            setCombo(nc);
            setRight((r) => r + 1);
            sound.good(nc);
            addPop(`+${gained}`, 50, 40);
        }
        else {
            setCombo(0);
            setWrong((w) => w + 1);
            sound.bad();
            vibrate(50);
            shake();
        }
        next();
    };
    return (_jsxs("div", { className: "game stroop", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsx("p", { className: `prompt${card.rule === 'word' ? ' prompt-flip' : ''}`, children: card.rule === 'ink' ? t('tapInk') : t('tapWord') }), _jsx("div", { className: "sc-word", ref: ref, style: { color: colours[card.ink].css }, children: t(colours[card.word].key) }), _jsx("div", { className: "sc-buttons", children: colours.slice(0, colourCount(level)).map((c, i) => (_jsx("button", { className: "sc-btn", style: { background: c.css }, "aria-label": t(c.key), onPointerDown: () => choose(i) }, c.key))) }), _jsx(Pops, { pops: pops })] }));
}
