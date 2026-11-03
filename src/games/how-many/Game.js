import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { usePops, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { sound } from '../../kit/sound';
import { Hud, Pops } from '../../kit/ui';
import { ROUNDS, countRange, flashMs, makeDots, options, pointsFor } from './logic';
// Something different to count every round.
const things = ['🍎', '🐟', '⭐', '🐞', '🎈', '🍓', '🐥', '🌸', '⚽', '🍪', '🐸', '🦋', '🍩', '🐝', '💎', '🧁', '🐠', '🍄', '🌟', '🍒'];
export default function HowMany({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const makeRound = () => {
        const n = rng.int(...countRange(level));
        return { n, dots: makeDots(rng, n), options: options(rng, n), thing: rng.pick(things) };
    };
    const [round, setRound] = useState(makeRound);
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState('show');
    const [message, setMessage] = useState('');
    const [score, setScore] = useState(0);
    const [exact, setExact] = useState(0);
    const [pops, addPop] = usePops();
    const later = useTimeouts();
    useEffect(() => {
        if (phase !== 'show')
            return;
        sound.pop();
        later(() => setPhase('guess'), flashMs(level));
    }, [phase, index, level, later]);
    const guess = (g) => {
        if (phase !== 'guess')
            return;
        const pts = pointsFor(g, round.n);
        const s = score + pts;
        const e = exact + (pts === 20 ? 1 : 0);
        setScore(s);
        setExact(e);
        if (pts === 20) {
            sound.good(e);
            setMessage(t('exact'));
            addPop(`+${pts}`, 50, 40);
        }
        else if (pts > 0) {
            sound.tone(500, 0.12, 'triangle');
            setMessage(t('close', { n: round.n }));
            addPop(`+${pts}`, 50, 40, 'info');
        }
        else {
            sound.bad();
            setMessage(t('itWas', { n: round.n }));
        }
        setPhase('result');
        later(() => {
            if (index + 1 >= ROUNDS) {
                onFinish({ score: s, accuracy: e / ROUNDS });
                return;
            }
            setRound(makeRound());
            setIndex(index + 1);
            setPhase('show');
        }, 1300);
    };
    return (_jsxs("div", { className: "game how-many", children: [_jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('round'), value: `${index + 1} / ${ROUNDS}` },
                ] }), _jsx("p", { className: "prompt", children: phase === 'show' ? t('look') : phase === 'guess' ? t('howMany') : message }), _jsxs("div", { className: "hm-board", children: [(phase === 'show' || phase === 'result') &&
                        round.dots.map((d, i) => (_jsx("span", { className: "hm-dot", style: { left: `${d.x}%`, top: `${d.y}%` }, children: round.thing }, `${index}-${i}`))), phase === 'guess' && _jsx("span", { className: "hm-question", children: "?" }), _jsx(Pops, { pops: pops })] }), _jsx("div", { className: "hm-options", children: round.options.map((o) => (_jsx("button", { className: "choice-btn", disabled: phase !== 'guess', onClick: () => guess(o), children: o }, `${index}-${o}`))) })] }));
}
