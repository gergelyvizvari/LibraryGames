import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { Thing } from '../../kit/things';
import { countRange, flashMs, makeDots, options, pointsFor } from './logic';
/** Looks in one stage. */
const STAGE = 6;
// Something different to count every round.
const things = ['apple', 'fish', 'star', 'ladybird', 'balloon', 'mushroom', 'flower', 'cookie', 'acorn', 'berries', 'heart', 'leaf', 'snowball', 'pine'];
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
    const stage = useStage(STAGE, onFinish);
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
        setMessage(pts === 20 ? t('exact') : pts > 0 ? t('close', { n: round.n }) : t('itWas', { n: round.n }));
        setPhase('result');
        if (pts < 20)
            sound.tone(pts > 0 ? 500 : 220, 0.12, 'triangle');
        if (pts === 20 ? stage.good(pts) : stage.miss())
            return;
        later(() => {
            setRound(makeRound());
            setIndex(index + 1);
            setPhase('show');
        }, 1300);
    };
    return (_jsxs(SceneShell, { place: "peaks", say: phase === 'show' ? t('look') : phase === 'guess' ? t('howMany') : message, stage: stage, bare: true, className: "how-many", children: [_jsxs("div", { className: "hm-board", children: [_jsx("span", { className: "hm-chalk", "aria-hidden": true }), (phase === 'show' || phase === 'result') &&
                        round.dots.map((d, i) => (_jsx("span", { className: "hm-dot", style: { left: `${d.x}%`, top: `${d.y}%` }, children: _jsx(Thing, { id: round.thing }) }, `${index}-${i}`))), phase === 'guess' && _jsx("span", { className: "hm-question", children: "?" })] }), _jsx("div", { className: "hm-options", children: round.options.map((o) => (_jsx("button", { className: "choice-btn", disabled: phase !== 'guess', onClick: () => guess(o), children: o }, `${index}-${o}`))) })] }));
}
