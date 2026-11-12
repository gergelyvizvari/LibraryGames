import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { flag, names } from './content';
import { dealBoard, isPair, nextGroup, peekMs } from './logic';
export default function FlagFriends({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const countryNames = names[locale] ?? names.en;
    const rng = useRef(makeRng(seed)).current;
    const played = useRef([]);
    const newBoard = () => {
        const g = nextGroup(rng, level, played.current);
        played.current.push(g);
        return { group: g, cards: dealBoard(rng, level, g) };
    };
    // One stage is one board: every pair found is a star.
    const [board, setBoard] = useState(newBoard);
    const boardNo = 0;
    const [open, setOpen] = useState([]);
    const [peeking, setPeeking] = useState(peekMs(level) > 0);
    const [missed, setMissed] = useState([]);
    const [message, setMessage] = useState('');
    const stage = useStage(board.cards.length / 2, onFinish);
    const later = useTimeouts();
    const cards = board.cards;
    // Every board starts with a short look at all the cards (fewer seconds at higher levels).
    useEffect(() => {
        const ms = peekMs(level);
        if (!ms)
            return;
        setPeeking(true);
        later(() => setPeeking(false), ms);
    }, [boardNo, level, later]);
    const flip = (i) => {
        if (stage.over || peeking || open.length === 2 || open.includes(i) || cards[i].matched)
            return;
        sound.pop();
        const now = [...open, i];
        setOpen(now);
        if (now.length < 2)
            return;
        const [a, b] = now;
        if (isPair(cards[a], cards[b])) {
            setBoard({ ...board, cards: cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c)) });
            setOpen([]);
            setMessage(t('yes', { name: countryNames[cards[a].iso] }));
            stage.good();
            return;
        }
        setMissed([a, b]);
        // After a look at every card a wrong pair is a slip of memory; without one it is just looking around.
        if (peekMs(level) > 0)
            stage.slip();
        else
            sound.tone(220, 0.1, 'triangle', 0.1);
        later(() => {
            setOpen([]);
            setMissed([]);
        }, 850);
    };
    const cols = cards.length <= 6 ? 3 : 4;
    return (_jsxs(SceneShell, { place: "lake", say: peeking ? t('peek') : message || t('find'), stage: stage, bare: true, className: "flag-friends", children: [_jsx("span", { className: "ff-group", children: t(`group.${board.group}`) }), _jsx("div", { className: "ff-grid", style: { gridTemplateColumns: `repeat(${cols}, 1fr)` }, children: cards.map((c, i) => {
                    const up = peeking || c.matched || open.includes(i);
                    return (_jsx("button", { className: `ff-card${up ? ' ff-up' : ''}${c.matched ? ' ff-matched' : ''}${missed.includes(i) ? ' ff-miss' : ''}`, onPointerDown: () => flip(i), "aria-label": up ? (c.kind === 'flag' ? `flag ${c.iso}` : countryNames[c.iso]) : `card ${i + 1}`, children: _jsxs("span", { className: "ff-inner", children: [_jsx("span", { className: `ff-front ff-${c.kind}`, children: c.kind === 'flag' ? flag(c.iso) : countryNames[c.iso] }), _jsx("span", { className: "ff-back", children: "?" })] }) }, `${boardNo}-${c.id}`));
                }) })] }));
}
