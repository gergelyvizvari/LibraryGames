import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../i18n';
import { useShake, useTimeouts } from '../../kit/hooks';
import { DOT_HIT_R, DOT_R, dotChoices, dotCount, dotGapFor, nearestDot, pickRound, placesFor as poolFor, pointsForKm, showDots } from '../../kit/mapHunt';
import { makeRng } from '../../kit/random';
import { SceneShell } from '../../kit/SceneShell';
import { sound, vibrate } from '../../kit/sound';
import { MapStage } from '../../kit/ui';
import { features } from './content';
import { BANDS, DOT_GAP_KM, kindLabel, kmToFeature, placesFor } from './logic';
import { HEIGHT, WIDTH, fromMap, linePath, loadLand, toMap } from './map';
const KIND_ICON = { river: '〰️', mountain: '⛰️', sea: '🌊', lake: '💧' };
/** One river, ridge, peak or lake as it is always drawn on the blind map. */
function Mark({ f, className = '' }) {
    if (f.kind === 'sea')
        return null;
    if (f.line)
        return _jsx("path", { d: linePath(f.line), className: `rm-${f.kind} ${className}` });
    const [x, y] = toMap(f.at);
    if (f.kind === 'lake')
        return _jsx("circle", { cx: x, cy: y, r: 9, className: `rm-lake-dot ${className}` });
    return _jsx("path", { d: `M${x - 13},${y + 10} L${x},${y - 13} L${x + 13},${y + 10} Z`, className: `rm-peak ${className}` });
}
/** Rivers and mountains to find in one stage. */
const ROUNDS = 6;
export default function RiverMountain({ level, seed, t, onFinish }) {
    const locale = useLocale();
    const places = useRef(placesFor(locale)).current;
    const rng = useRef(makeRng(seed)).current;
    const [round] = useState(() => pickRound(rng, places, level));
    const dots = showDots(level);
    const makeDots = (target) => (dots ? dotChoices(rng, poolFor(places, level), target, dotCount(level), dotGapFor(level, DOT_GAP_KM)) : []);
    const [land, setLand] = useState(null);
    const [index, setIndex] = useState(0);
    const [choices, setChoices] = useState(() => makeDots(round[0]));
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const total = useRef(0);
    const svgRef = useRef(null);
    const [wrapRef, shake] = useShake();
    const later = useTimeouts();
    const target = round[index];
    const [tx, ty] = toMap(target.at);
    useEffect(() => {
        let live = true;
        void loadLand().then((l) => live && setLand(l));
        return () => {
            live = false;
        };
    }, []);
    const finishTurn = (tap, pts, label) => {
        const c = pts >= 20 ? combo + 1 : 0;
        const gained = pts + (pts > 0 ? Math.min(c, 5) * 2 : 0);
        total.current += pts / 30;
        setCombo(c);
        setScore((s) => s + gained);
        setResult({ tap, pts: gained, label });
        if (pts >= 20)
            sound.good(c);
        else if (pts > 0)
            sound.tone(500, 0.12, 'triangle');
        else {
            sound.bad();
            vibrate(40);
            shake();
        }
        later(() => {
            const next = index + 1;
            if (next >= ROUNDS) {
                onFinish({ score: score + gained, accuracy: total.current / ROUNDS });
                return;
            }
            setIndex(next);
            setChoices(makeDots(round[next]));
            setResult(null);
        }, 1800);
    };
    const pickDot = (p) => {
        if (p === target)
            finishTurn(null, 30, t('spotOn'));
        else
            finishTurn(toMap(p.at), 0, t('miss'));
    };
    const tapMap = (e) => {
        if (result || !land)
            return;
        const m = svgRef.current?.getScreenCTM();
        if (!m)
            return;
        const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        if (dots) {
            // The nearest dot wins, so dots close together never steal each other's taps.
            const i = nearestDot(choices.map((p) => toMap(p.at)), [pt.x, pt.y], (DOT_HIT_R * WIDTH) / 1000);
            if (i >= 0)
                pickDot(choices[i]);
            return;
        }
        const lonLat = fromMap([pt.x, pt.y]);
        if (!lonLat)
            return;
        const km = Math.round(kmToFeature(target.feature, lonLat));
        const pts = pointsForKm(km, BANDS);
        const word = pts >= 30 ? t('spotOn') : pts >= 20 ? t('close') : pts > 0 ? t('near') : t('miss');
        finishTurn([pt.x, pt.y], pts, pts >= 30 ? word : `${word} ${t('off', { km })}`);
    };
    // The name sits above the feature, kept inside the map.
    const label = target.name.replace(/^the /, '');
    const lx = Math.min(Math.max(tx, 150), WIDTH - 150);
    const ly = ty < 90 ? ty + 64 : ty - 36;
    return (_jsx(SceneShell, { place: "coast", say: _jsx(_Fragment, { children: result ? (result.label) : (_jsxs(_Fragment, { children: [_jsxs("span", { className: "rm-kind", children: [KIND_ICON[target.feature.kind], " ", t(`kind.${kindLabel(target.feature)}`)] }), ' ', t('where', { place: target.name })] })) }), stage: { done: index + (result ? 1 : 0), total: ROUNDS, over: false, mood: !result ? 'idle' : result.pts >= 20 ? 'happy' : 'oops' }, bare: true, fill: true, className: "river-mountain", children: _jsx(MapStage, { children: _jsx("div", { className: "rm-wrap map-box", ref: wrapRef, style: { '--map-ratio': WIDTH / HEIGHT }, children: land ? (_jsxs("svg", { ref: svgRef, viewBox: `0 0 ${WIDTH} ${HEIGHT}`, className: "rm-map", onPointerDown: tapMap, children: [land.map((d, i) => (_jsx("path", { d: d, className: "rm-land" }, i))), features.map((f) => (_jsx(Mark, { f: f }, f.id))), choices.map((p) => {
                            const [x, y] = toMap(p.at);
                            return (_jsx("circle", { cx: x, cy: y, r: DOT_R, className: `mh-dot${result && p === target ? ' mh-dot-right' : ''}` }, `${index}-${p.name}`));
                        }), result && (_jsxs("g", { className: "mh-answer", children: [target.feature.kind === 'sea' && target.feature.line ? (_jsx("path", { d: linePath(target.feature.line), className: "rm-found rm-found-sea" })) : (_jsx(Mark, { f: target.feature, className: "rm-found" })), result.tap && _jsx("circle", { cx: result.tap[0], cy: result.tap[1], r: 12, className: "mh-tap" }), _jsx("circle", { cx: tx, cy: ty, r: 18, className: "mh-target" }), _jsx("text", { x: lx, y: ly, className: "mh-name rm-name", children: label })] }))] })) : (_jsx("div", { className: "rm-loading", children: t('loading') })) }) }) }));
}
