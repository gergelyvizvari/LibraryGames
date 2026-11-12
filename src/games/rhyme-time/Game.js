import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useShake, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { rhymes } from './content';
import { makeDealer, makeQuestion, optionCount, showPictures } from './logic';
/** Rhymes to find in one stage. */
const STAGE = 6;
export default function RhymeTime({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const groups = rhymes[locale] ?? rhymes.en;
    const rng = useRef(makeRng(seed)).current;
    const deal = useRef(makeDealer(rng, groups)).current;
    const next = () => makeQuestion(rng, groups, deal(), optionCount(level));
    const [q, setQ] = useState(next);
    const [qIndex, setQIndex] = useState(0);
    const [message, setMessage] = useState(() => t('ask'));
    const [wrong, setWrong] = useState([]);
    const [solved, setSolved] = useState(false);
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const pictures = showPictures(level);
    const pick = (o) => {
        if (over || solved || wrong.includes(o))
            return;
        if (o !== q.answer) {
            setWrong((w) => [...w, o]);
            setMessage(t('no'));
            stage.slip();
            shake();
            return;
        }
        setSolved(true);
        setMessage(t('yes', { a: q.target.word, b: q.answer.word }));
        if (stage.good(wrong.length ? 5 : 15))
            return;
        later(() => {
            setQ(next());
            setQIndex((i) => i + 1);
            setWrong([]);
            setSolved(false);
            setMessage(t('ask'));
        }, 1200);
    };
    return (_jsxs(SceneShell, { place: "village", say: message, stage: stage, bare: true, className: "rhyme-time", children: [_jsxs("div", { className: "rt-target", children: [_jsx("span", { className: "rt-emoji", children: q.target.emoji }), _jsx("span", { className: "rt-word", children: q.target.word })] }, qIndex), _jsx("div", { ref: ref, className: `rt-options rt-options-${q.options.length}`, children: q.options.map((o) => (_jsxs("button", { className: `rt-option${solved && o === q.answer ? ' rt-right' : ''}${wrong.includes(o) ? ' rt-wrong' : ''}`, onPointerDown: () => pick(o), disabled: over, children: [pictures && _jsx("span", { className: "rt-opt-emoji", children: o.emoji }), _jsx("span", { className: "rt-opt-word", children: o.word })] }, `${qIndex}-${o.word}`))) })] }));
}
