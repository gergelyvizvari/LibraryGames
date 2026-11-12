import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useGameLoop, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { words, wordsForLevel } from './content';
/** Pictures to name in one stage. */
const STAGE = 8;
export default function WordCatch({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const pool = wordsForLevel(words[locale] ?? words.en, level);
    // Deal words from a shuffled deck so none repeats until the whole pool has been seen.
    const deck = useRef([]);
    const makeDrop = (prev) => {
        if (deck.current.length === 0)
            deck.current = rng.shuffle(pool.filter((w) => w !== prev));
        const answer = deck.current.pop();
        const others = rng.shuffle(pool.filter((w) => w !== answer));
        // From level 5, prefer distractors that start with the same letter, so kids must really read.
        const similar = level >= 5 ? others.filter((w) => w.word[0] === answer.word[0]) : [];
        const distractors = [...similar, ...others].slice(0, 2).map((w) => w.word);
        return { answer, options: rng.shuffle([answer.word, ...distractors]), x: rng.int(15, 85), y: -10 };
    };
    const [drop, setDropState] = useState(() => makeDrop());
    const dropRef = useRef(drop);
    const setDrop = (d) => {
        dropRef.current = d;
        setDropState(d);
    };
    const stage = useStage(STAGE, onFinish);
    const over = stage.over;
    const [ref, shake] = useShake();
    const fallSeconds = clamp(7.5 - level * 0.45, 3, 7.5);
    const miss = () => {
        stage.slip();
        shake();
    };
    useGameLoop((dt) => {
        const d = dropRef.current;
        const y = d.y + (dt / fallSeconds) * 100;
        if (y < 92) {
            setDrop({ ...d, y });
            return;
        }
        miss();
        setDrop(makeDrop(d.answer));
    }, !over);
    const choose = (option) => {
        if (over)
            return;
        if (option !== drop.answer.word)
            return miss();
        if (!stage.good())
            setDrop(makeDrop(drop.answer));
    };
    return (_jsx(SceneShell, { place: "village", say: t('say'), stage: stage, bare: true, fill: true, className: "word-catch", tray: _jsx("div", { className: "choices", children: drop.options.map((o) => (_jsx("button", { className: "choice-btn", onPointerDown: () => choose(o), children: o }, o))) }), children: _jsxs("div", { className: "wc-sky", ref: ref, children: [_jsx("div", { className: "wc-drop", style: { left: `${drop.x}%`, top: `${drop.y}%` }, children: drop.answer.emoji }), _jsx("div", { className: "wc-ground" })] }) }));
}
