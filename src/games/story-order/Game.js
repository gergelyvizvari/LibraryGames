import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useLatest, useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { stories } from './content';
import { askKey, makeDealer, shuffleCards, showPictures, STAGE } from './logic';
export default function StoryOrder({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const rng = useRef(makeRng(seed)).current;
    const deal = useRef(makeDealer(rng, stories[locale] ?? stories.en, level)).current;
    const nextId = useRef(0);
    const newRound = () => ({ id: nextId.current++, cards: shuffleCards(rng, deal()), placed: 0 });
    const [round, setRound] = useState(newRound);
    const [wrong, setWrong] = useState(null);
    const stage = useStage(STAGE, onFinish);
    const later = useTimeouts();
    const pictures = showPictures(level);
    const total = round.cards.length;
    const done = round.placed === total;
    const tap = (card) => {
        if (stage.over || done || card.step < round.placed)
            return;
        if (card.step !== round.placed) {
            stage.slip();
            setWrong(card.step);
            return;
        }
        const placed = round.placed + 1;
        setRound({ ...round, placed });
        setWrong(null);
        if (placed < total) {
            sound.tone(480 + placed * 60, 0.08, 'triangle', 0.18);
            return;
        }
        if (stage.good(total * 10))
            return;
        later(() => setRound(newRound()), 1700);
    };
    // Number keys 1 to 4 tap a page, for anyone on a computer.
    const tapRef = useLatest(tap);
    const roundRef = useLatest(round);
    useEffect(() => {
        const onKey = (e) => {
            const c = roundRef.current.cards[Number(e.key) - 1];
            if (c)
                tapRef.current(c);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [tapRef, roundRef]);
    // Once the story is complete, the pages hop into story order (same keys, so they move instead of popping in again).
    const shown = done ? [...round.cards].sort((a, b) => a.step - b.step) : round.cards;
    const say = done ? t('theEnd') : wrong !== null ? t('notYet') : t(askKey(round.placed, total));
    return (_jsx(SceneShell, { place: "sea", say: say, stage: stage, bare: true, fill: true, className: "story-order", children: _jsx("div", { className: `so-desk so-desk-${total}${done ? ' so-done' : ''}`, children: shown.map((c, i) => {
                const isPlaced = c.step < round.placed;
                const shake = wrong === c.step;
                return (_jsxs("button", { className: `so-page${isPlaced ? ' so-placed' : ''}${shake ? ' so-wrong' : ''}`, style: { animationDelay: `${i * (done ? 110 : 60)}ms` }, onPointerDown: () => tap(c), onAnimationEnd: () => shake && setWrong(null), disabled: stage.over, children: [_jsx("span", { className: "so-number", children: isPlaced ? c.step + 1 : '' }), pictures && _jsx("span", { className: "so-emoji", children: c.emoji }), _jsx("span", { className: "so-text", children: c.text })] }, c.step));
            }) }, round.id) }));
}
