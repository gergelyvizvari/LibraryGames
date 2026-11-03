import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useCountdown, useGameLoop, usePops, useShake } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { words, wordsForLevel } from './content';
const DURATION = 60;
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
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const end = () => {
        setOver(true);
        onFinish({ score, accuracy: hits + misses === 0 ? 0 : (hits / (hits + misses)) * clamp(hits / 12, 0, 1) });
    };
    const left = useCountdown(DURATION, end, !over);
    const fallSeconds = clamp(6.5 - level * 0.4 - combo * 0.08, 2.2, 6.5);
    const miss = () => {
        sound.bad();
        vibrate(50);
        shake();
        setCombo(0);
        setMisses((m) => m + 1);
    };
    useGameLoop((dt) => {
        const d = dropRef.current;
        const y = d.y + (dt / fallSeconds) * 100;
        if (y < 92) {
            setDrop({ ...d, y });
            return;
        }
        miss();
        addPop(t('oops'), d.x, 80, 'bad');
        setDrop(makeDrop(d.answer));
    }, !over);
    const choose = (option) => {
        if (over)
            return;
        if (option === drop.answer.word) {
            const nextCombo = combo + 1;
            const gained = 10 + Math.min(nextCombo, 10) * 2;
            setScore((s) => s + gained);
            setCombo(nextCombo);
            setHits((h) => h + 1);
            sound.good(nextCombo);
            addPop(`+${gained}`, drop.x, drop.y);
            setDrop(makeDrop(drop.answer));
        }
        else {
            miss();
            addPop(t('oops'), drop.x, drop.y, 'bad');
        }
    };
    return (_jsxs("div", { className: "game word-catch", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 5 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsxs("div", { className: "wc-sky", ref: ref, children: [_jsx("div", { className: "wc-drop", style: { left: `${drop.x}%`, top: `${drop.y}%` }, children: drop.answer.emoji }), _jsx("div", { className: "wc-ground" }), _jsx(Pops, { pops: pops })] }), _jsx("div", { className: "choices", children: drop.options.map((o) => (_jsx("button", { className: "choice-btn", onPointerDown: () => choose(o), children: o }, o))) })] }));
}
