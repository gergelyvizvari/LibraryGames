import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useCountdown, usePops, useTimeouts } from '../../kit/hooks';
import { clamp, makeRng } from '../../kit/random';
import { sound } from '../../kit/sound';
import { Hud, Pops, TimerBar } from '../../kit/ui';
import { boardSizes, columnsFor, deal, startBoard } from './logic';
const DURATION = 75;
export default function PairRush({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const first = startBoard(level);
    const [board, setBoard] = useState(first);
    const [cards, setCards] = useState(() => deal(rng, boardSizes[first]));
    const [open, setOpen] = useState([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [cleared, setCleared] = useState(0);
    const [over, setOver] = useState(false);
    const [pops, addPop] = usePops();
    const later = useTimeouts();
    const left = useCountdown(DURATION, () => {
        setOver(true);
        onFinish({ score, accuracy: clamp(cleared / 3, 0, 1) });
    }, !over);
    const flip = (i) => {
        if (over || open.length === 2 || open.includes(i) || cards[i].matched)
            return;
        sound.pop();
        const now = [...open, i];
        setOpen(now);
        if (now.length < 2)
            return;
        const [a, b] = now;
        if (cards[a].face === cards[b].face) {
            const nc = combo + 1;
            const gained = 10 * nc;
            const next = cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c));
            setCards(next);
            setOpen([]);
            setCombo(nc);
            setScore((s) => s + gained);
            sound.good(nc);
            addPop(`+${gained}`, 50, 45);
            if (next.every((c) => c.matched)) {
                const bonus = next.length * 5;
                setScore((s) => s + bonus);
                setCleared((n) => n + 1);
                sound.win();
                addPop(`${t('cleared')} +${bonus}`, 50, 35, 'info');
                later(() => {
                    const nb = Math.min(board + 1, boardSizes.length - 1);
                    setBoard(nb);
                    setCards(deal(rng, boardSizes[nb]));
                }, 800);
            }
        }
        else {
            setCombo(0);
            later(() => setOpen([]), 750);
        }
    };
    const cols = columnsFor(cards.length);
    return (_jsxs("div", { className: "game pair-rush", children: [_jsx(TimerBar, { left: left, total: DURATION }), _jsx(Hud, { items: [
                    { label: t('score'), value: score },
                    { label: t('combo'), value: `×${combo}`, highlight: combo >= 3 },
                    { label: t('time'), value: Math.ceil(left) },
                ] }), _jsx("div", { className: "pr-grid", style: { gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: cols * 110 }, children: cards.map((c, i) => {
                    const up = c.matched || open.includes(i);
                    return (_jsx("button", { className: `pr-card${up ? ' pr-up' : ''}${c.matched ? ' pr-matched' : ''}`, onClick: () => flip(i), children: _jsxs("span", { className: "pr-inner", children: [_jsx("span", { className: "pr-front", children: c.face }), _jsx("span", { className: "pr-back", children: "?" })] }) }, `${board}-${c.id}`));
                }) }), _jsx(Pops, { pops: pops })] }));
}
