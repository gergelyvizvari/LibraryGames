import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { boardSizes, columnsFor, deal, startBoard } from './logic';
export default function PairRush({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    // One stage is one board: every pair found is a star.
    const [cards, setCards] = useState(() => deal(rng, boardSizes[startBoard(level)]));
    const [open, setOpen] = useState([]);
    const seen = useRef(new Set());
    const stage = useStage(cards.length / 2, onFinish);
    const later = useTimeouts();
    const flip = (i) => {
        if (stage.over || open.length === 2 || open.includes(i) || cards[i].matched)
            return;
        sound.pop();
        const now = [...open, i];
        setOpen(now);
        if (now.length < 2)
            return;
        const [a, b] = now;
        if (cards[a].face === cards[b].face) {
            setCards(cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c)));
            setOpen([]);
            stage.good();
            return;
        }
        // Turning over a card whose pair was already seen is a slip of memory; a first look never is.
        const known = (k, other) => cards.some((c, j) => j !== k && j !== other && c.face === cards[k].face && seen.current.has(j));
        if (known(a, b) || (seen.current.has(b) && seen.current.has(a)))
            stage.slip();
        seen.current.add(a).add(b);
        later(() => setOpen([]), 900);
    };
    const cols = columnsFor(cards.length);
    return (_jsx(SceneShell, { place: "lake", say: t('say'), stage: stage, bare: true, className: "pair-rush", children: _jsx("div", { className: "pr-grid", style: { gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: cols * 110 }, children: cards.map((c, i) => {
                const up = c.matched || open.includes(i);
                return (_jsx("button", { className: `pr-card${up ? ' pr-up' : ''}${c.matched ? ' pr-matched' : ''}`, onClick: () => flip(i), children: _jsxs("span", { className: "pr-inner", children: [_jsx("span", { className: "pr-front", children: c.face }), _jsx("span", { className: "pr-back", children: "?" })] }) }, c.id));
            }) }) }));
}
