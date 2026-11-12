import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState } from 'react';
import { CritterGuide } from '../../kit/critters';
import { useTimeouts } from '../../kit/hooks';
import { makeRng } from '../../kit/random';
import { SceneShell, useStage } from '../../kit/SceneShell';
import { sound } from '../../kit/sound';
import { Feast, SEAT_W, Waiting } from './Feast';
import { isSet, makeTable, TABLES, wishState } from './logic';
const WISH_KEY = { window: 'wish.window', cake: 'wish.cake', next: 'wish.next', apart: 'wish.apart' };
export default function ForestFeast({ level, seed, t, onFinish }) {
    const rng = useRef(makeRng(seed)).current;
    const [table, setTable] = useState(() => makeTable(rng, level));
    const [seating, setSeating] = useState(() => Array(table.guests.length).fill(null));
    const [picked, setPicked] = useState(null);
    const [say, setSay] = useState(t('say'));
    const [busy, setBusy] = useState(false);
    const stage = useStage(TABLES, onFinish);
    const later = useTimeouts();
    const n = table.guests.length;
    const states = useMemo(() => table.guests.map((_, g) => wishState(table, seating, g)), [table, seating]);
    const waiting = table.guests.map((_, g) => g).filter((g) => !seating.includes(g));
    const explain = (g) => {
        const wish = table.wishes[g];
        return t(wish ? WISH_KEY[wish.kind] : 'wish.none');
    };
    const pick = (g) => {
        if (busy || stage.over)
            return;
        sound.tap();
        if (picked === g) {
            // A second tap on a seated guest sends it back to the tray.
            setPicked(null);
            if (seating.includes(g))
                setSeating(seating.map((x) => (x === g ? null : x)));
            setSay(t('say'));
            return;
        }
        setPicked(g);
        setSay(explain(g));
    };
    const sit = (s) => {
        if (busy || stage.over)
            return;
        const there = seating[s];
        if (picked === null) {
            if (there !== null)
                pick(there);
            return;
        }
        if (there === picked) {
            pick(picked);
            return;
        }
        const next = [...seating];
        const from = next.indexOf(picked);
        // Whoever sat there swaps places with the guest (or goes back to the tray).
        if (from >= 0)
            next[from] = there;
        next[s] = picked;
        setSeating(next);
        setPicked(null);
        if (isSet(table, next)) {
            setBusy(true);
            setSay(t('done'));
            if (stage.good())
                return;
            later(() => {
                const fresh = makeTable(rng, level);
                setTable(fresh);
                setSeating(Array(fresh.guests.length).fill(null));
                setSay(t('say'));
                setBusy(false);
            }, 1800);
            return;
        }
        if (next.every((g) => g !== null)) {
            stage.slip();
            setSay(t('fix'));
            return;
        }
        sound.tone(440 + next.filter((g) => g !== null).length * 60, 0.1, 'triangle', 0.12);
        setSay(wishState(table, next, picked) === 'broken' ? explain(picked) : t('say'));
    };
    const width = n * SEAT_W + 24;
    return (_jsx(SceneShell, { place: "woods", say: say, stage: stage, bare: true, className: "forest-feast", guide: _jsx(CritterGuide, { kind: "fox", mood: busy ? 'happy' : 'idle' }), tray: _jsx("div", { className: "ff-tray", children: waiting.length === 0 ? (_jsx("span", { className: "ff-all", children: t('allSeated') })) : (waiting.map((g) => (_jsx("button", { className: `ff-wait${picked === g ? ' ff-wait-on' : ''}`, onPointerDown: () => pick(g), "aria-pressed": picked === g, "aria-label": t('guest', { n: g + 1 }), children: _jsx(Waiting, { table: table, g: g }) }, g)))) }), children: _jsxs("div", { className: "ff-table", style: { aspectRatio: `${width} / 300`, ['--ff-ratio']: width / 300 }, children: [_jsx(Feast, { table: table, seating: seating, states: states, picked: picked, done: busy }), _jsx("div", { className: "ff-seats", style: { gridTemplateColumns: `repeat(${n}, 1fr)`, paddingInline: `${(12 / width) * 100}%` }, children: seating.map((g, s) => (_jsx("button", { className: "ff-seat", onPointerDown: () => sit(s), "aria-label": t('seat', { n: s + 1 }), "aria-pressed": g !== null }, s))) })] }, stage.done) }));
}
