import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState } from 'react';
import { useT } from '../../i18n';
import { useTimeouts } from '../../kit/hooks';
import { Bunting, Guide } from '../../kit/places';
import { makeRng } from '../../kit/random';
import { SceneTool, SceneTray, StagePips } from '../../kit/scene';
import { sound, vibrate } from '../../kit/sound';
import { Basket, COATS, DenWindow, Rug } from './Den';
import { accuracyFor, clashes, giftsFor, hintFor, isSolved, makePuzzle, pointsFor, puzzlesFor, ruleBroken, ruleCells, showsBlocked, sizeFor, starved, } from './logic';
const key = (r, c) => `${r},${c}`;
const keys = (cells) => new Set(cells.map(([r, c]) => key(r, c)));
const without = (cells, r, c) => cells.filter(([cr, cc]) => cr !== r || cc !== c);
const CLASH_KEY = { row: 'clashRow', col: 'clashCol', rug: 'clashRug', touch: 'clashTouch' };
const STUCK_KEY = { row: 'stuckRow', col: 'stuckCol', rug: 'stuckRug' };
export default function PuppySpots({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const n = sizeFor(level);
    const total = puzzlesFor(level);
    // A room, with the pups planted for the player (beginners only) taken from its answer.
    const newRoom = () => {
        const puzzle = makePuzzle(rng, n);
        const rows = rng.shuffle([...Array(n).keys()]).slice(0, giftsFor(level));
        return { puzzle, gifts: rows.map((r) => [r, puzzle.solution[r]]) };
    };
    const [room, setRoom] = useState(newRoom);
    const [pups, setPups] = useState(room.gifts);
    const [marks, setMarks] = useState(() => new Set());
    const [tool, setTool] = useState('pup');
    const [clash, setClash] = useState(null);
    const [mistakes, setMistakes] = useState(0);
    const [hints, setHints] = useState(0);
    const [done, setDone] = useState([]);
    const [streak, setStreak] = useState(0);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState(t('place'));
    const [busy, setBusy] = useState(false);
    const [over, setOver] = useState(false);
    const [tip, setTip] = useState(null);
    const app = useT();
    const later = useTimeouts();
    const clashRun = useRef(0);
    const { puzzle, gifts } = room;
    const { regions } = puzzle;
    const pupAt = useMemo(() => keys(pups), [pups]);
    const giftAt = useMemo(() => keys(gifts), [gifts]);
    const blocked = useMemo(() => {
        const out = new Set();
        if (busy || !showsBlocked(level))
            return out;
        for (let r = 0; r < n; r++)
            for (let c = 0; c < n; c++)
                if (!pupAt.has(key(r, c)) && clashes(regions, pups, r, c))
                    out.add(key(r, c));
        return out;
    }, [busy, level, n, regions, pups, pupAt]);
    // A row, column or rug with no room left for its pup blinks, so a dead end is never a mystery.
    const stuck = useMemo(() => (busy ? null : starved(regions, pups)), [busy, regions, pups]);
    const stuckAt = useMemo(() => keys(stuck?.cells ?? []), [stuck]);
    /** The square a hint points at glows for a moment. */
    const popAt = (r, c) => {
        const k = key(r, c);
        setTip(k);
        later(() => setTip((now) => (now === k ? null : now)), 1200);
    };
    /** After a change that broke no rule: warn about a dead end, or go back to the plain prompt. */
    const settle = (next, fallback) => {
        const dead = starved(regions, next);
        if (dead)
            sound.tone(220, 0.18, 'triangle', 0.1);
        setMessage(dead ? t(STUCK_KEY[dead.kind]) : fallback);
    };
    const finishRoom = (next, m, h) => {
        const solved = { n, mistakes: m, hints: h };
        const clean = m === 0 && h === 0;
        const run = clean ? streak + 1 : 0;
        const gained = pointsFor(solved, run);
        const all = [...done, solved];
        const sum = score + gained;
        setPups(next);
        setClash(null);
        setStreak(run);
        setDone(all);
        setScore(sum);
        setBusy(true);
        setMessage(t(clean ? 'perfect' : 'solved'));
        // A quiet ending: the pups give one happy hop.
        sound.win();
        if (all.length >= total) {
            setOver(true);
            later(() => onFinish({ score: sum, accuracy: accuracyFor(all) }), 1400);
            return;
        }
        later(() => {
            const g = newRoom();
            setRoom(g);
            setPups(g.gifts);
            setMarks(new Set());
            setMistakes(0);
            setHints(0);
            setTool('pup');
            setMessage(t('place'));
            setBusy(false);
        }, 1600);
    };
    const tap = (r, c) => {
        if (over || busy)
            return;
        const k = key(r, c);
        if (giftAt.has(k)) {
            sound.tap();
            setMessage(t('gift'));
            return;
        }
        if (pupAt.has(k)) {
            // Tapping a pup always takes it away, whichever tool is picked.
            const next = without(pups, r, c);
            sound.tap();
            setPups(next);
            settle(next, t('place'));
            return;
        }
        if (tool === 'mark') {
            sound.tap();
            const next = new Set(marks);
            if (next.has(k))
                next.delete(k);
            else
                next.add(k);
            setMarks(next);
            return;
        }
        const broken = ruleBroken(regions, pups, r, c);
        if (broken) {
            // The pups shake their heads, the row, column, rug or pair that shows why lights up, then the pup hops back.
            const run = ++clashRun.current;
            sound.bad();
            vibrate(60);
            setMistakes((x) => x + 1);
            setStreak(0);
            setMessage(t(CLASH_KEY[broken.rule]));
            setClash({ cell: [r, c], other: broken.other, why: keys(ruleCells(regions, broken.rule, [r, c], broken.other)) });
            later(() => {
                if (clashRun.current === run)
                    setClash(null);
            }, 1100);
            return;
        }
        const next = [...pups, [r, c]];
        setClash(null);
        if (marks.has(k)) {
            const m = new Set(marks);
            m.delete(k);
            setMarks(m);
        }
        if (isSolved(regions, next)) {
            finishRoom(next, mistakes, hints);
            return;
        }
        sound.tone(440 + next.length * 70, 0.1, 'triangle', 0.12);
        setPups(next);
        settle(next, t('place'));
    };
    const hint = () => {
        if (over || busy)
            return;
        const h = hintFor(puzzle, pups);
        if (!h)
            return;
        setHints(hints + 1);
        setStreak(0);
        setClash(null);
        if ('remove' in h) {
            const [r, c] = h.remove;
            sound.pop();
            popAt(r, c);
            setPups(without(pups, r, c));
            setMessage(t('hintTook'));
            return;
        }
        const [r, c] = h.add;
        const next = [...pups, [r, c]];
        const m = new Set(marks);
        m.delete(key(r, c));
        setMarks(m);
        popAt(r, c);
        if (isSolved(regions, next)) {
            finishRoom(next, mistakes, hints + 1);
            return;
        }
        sound.pop();
        setPups(next);
        setMessage(t('hintPut'));
    };
    const canClear = pups.length > gifts.length || marks.size > 0;
    const clear = () => {
        if (over || busy || !canClear)
            return;
        sound.tap();
        setPups(gifts);
        setMarks(new Set());
        setClash(null);
        setMessage(t('place'));
    };
    const pickTool = (next) => {
        if (over || busy)
            return;
        sound.tap();
        setTool(next);
        setMessage(t(next === 'pup' ? 'place' : 'mark'));
    };
    const mood = clash ? 'oops' : busy ? 'happy' : 'idle';
    const marking = tool === 'mark';
    // The pups still in the basket: one of each coat that has no spot on the rug yet.
    const seated = new Set(pups.map(([r, c]) => regions[r][c]));
    const waiting = [...Array(n).keys()].filter((rug) => !seated.has(rug));
    const grid = `repeat(${n}, minmax(0, 1fr))`;
    return (_jsxs("div", { className: "scene pk", children: [_jsxs("div", { className: "pk-wall", children: [_jsx(Bunting, {}), _jsx(DenWindow, {}), _jsx("p", { className: "scene-bubble sg-bubble", role: "status", "aria-live": "polite", children: message }), _jsx("span", { className: `sg-guide sg-${mood}`, children: _jsx(Guide, { place: "woods" }) })] }), _jsx(StagePips, { done: done.length, total: total, label: app('scene.progress', { n: done.length, total }) }), _jsx("div", { className: "pk-floor", children: _jsxs("div", { className: "pk-rug", children: [_jsx(Rug, { regions: regions, pups: pups, gifts: giftAt, marks: marks, blocked: blocked, why: clash?.why, bad: clash ? [clash.cell, clash.other] : [], stuck: stuckAt, tip: tip, happy: busy }), _jsx("div", { className: "pk-cells", style: { gridTemplateColumns: grid, gridTemplateRows: grid }, children: regions.map((row, r) => row.map((_, c) => (_jsx("button", { className: "pk-cell", onPointerDown: () => tap(r, c), "aria-label": t('cell', { row: r + 1, col: c + 1 }), "aria-pressed": pupAt.has(key(r, c)) }, key(r, c))))) })] }, done.length) }), _jsxs(SceneTray, { hidden: over, children: [_jsxs("div", { className: "pk-basket", children: [_jsx(Basket, { waiting: waiting.length, coats: waiting.map((rug) => rug % COATS) }), _jsx("span", { className: "pk-basket-label", children: t(waiting.length ? 'waiting' : 'allOut') })] }), _jsxs("div", { className: "pk-tools", children: [_jsx(SceneTool, { kind: "mark", label: t('toolMark'), on: marking, onPress: () => pickTool(marking ? 'pup' : 'mark') }), _jsx(SceneTool, { kind: "hint", label: t('hint'), onPress: hint }), _jsx(SceneTool, { kind: "restart", label: t('clear'), onPress: clear, disabled: !canClear })] })] })] }));
}
