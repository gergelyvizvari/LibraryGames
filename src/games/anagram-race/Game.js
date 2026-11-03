import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useCountdown, usePops, useShake, useTimeouts } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound, vibrate } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { words, wordsForLevel } from './content';
import { scramble } from './logic';
const DURATION = 75;
export default function AnagramRace({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const pool = wordsForLevel(words[locale] ?? words.en, level);
    const order = useRef(rng.shuffle(pool)).current;
    const [index, setIndex] = useState(0);
    const word = order[index % order.length];
    const [tiles, setTiles] = useState(() => scramble(rng, word.word));
    const [used, setUsed] = useState([]);
    const [score, setScore] = useState(0);
    const [solved, setSolved] = useState(0);
    const [slips, setSlips] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const [ref, shake] = useShake();
    const later = useTimeouts();
    const left = useCountdown(DURATION, () => {
        setOver(true);
        onFinish({ score, accuracy: clamp(solved / 8, 0, 1) * (slips > solved * 2 ? 0.7 : 1) });
    }, !over);
    const typed = used.map((id) => tiles.find((x) => x.id === id).letter).join('');
    const tap = (id, letter) => {
        if (over || used.includes(id) || typed === word.word)
            return;
        if (letter !== word.word[typed.length]) {
            setSlips((s) => s + 1);
            sound.bad();
            vibrate(40);
            shake();
            return;
        }
        const next = [...used, id];
        setUsed(next);
        sound.tone(520 + next.length * 70, 0.08, 'triangle', 0.18);
        if (next.length < word.word.length)
            return;
        const gained = word.word.length * 10;
        setScore((s) => s + gained);
        setSolved((n) => n + 1);
        sound.good(solved + 1);
        addPop(`+${gained}`, 50, 30);
        later(() => {
            const nextWord = order[(index + 1) % order.length];
            setIndex(index + 1);
            setTiles(scramble(rng, nextWord.word));
            setUsed([]);
        }, 700);
    };
    return (_jsxs("div", { className: "game anagram-race", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('words'), value: solved, highlight: solved > 0 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsx("div", { className: "ar-picture", children: word.emoji }, index), _jsx("div", { className: "ar-slots", children: [...word.word].map((_, i) => (_jsx("span", { className: `ar-slot${i < typed.length ? ' ar-filled' : ''}${i === typed.length ? ' ar-next' : ''}`, children: typed[i] ?? '' }, i))) }), _jsx("div", { className: "ar-tiles", ref: ref, children: tiles.map((tile) => (_jsx("button", { className: `ar-tile${used.includes(tile.id) ? ' ar-used' : ''}`, onPointerDown: () => tap(tile.id, tile.letter), children: tile.letter }, `${index}-${tile.id}`))) }), _jsx(Pops, { pops: pops })] }));
}
