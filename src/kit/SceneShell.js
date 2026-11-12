import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from 'react';
import { useT } from '../i18n';
import { useLatest, useTimeouts } from './hooks';
import { Bunting, Guide, PlaceWindow, RoomBooks, RoomPlant } from './places';
import { SceneTray, StagePips } from './scene';
import { sound, vibrate } from './sound';
/**
 * The bookkeeping of a stage: `total` tasks, no clock and no way to lose. Reports the result through `onFinish`
 * exactly once, with an accuracy that only wrong tries lower.
 */
export function useStage(total, onFinish) {
    const [done, setDone] = useState(0);
    const [over, setOver] = useState(false);
    const [mood, setMood] = useState('idle');
    const s = useRef({ done: 0, slips: 0, missed: 0, score: 0, over: false });
    const finish = useLatest(onFinish);
    const later = useTimeouts();
    const flash = useCallback((m) => {
        setMood(m);
        later(() => setMood((now) => (now === m ? 'idle' : now)), 700);
    }, [later]);
    const close = useCallback(() => {
        const st = s.current;
        if (st.done < total)
            return false;
        st.over = true;
        setOver(true);
        finish.current({ score: st.score, accuracy: (total - st.missed) / (total + st.slips) });
        return true;
    }, [finish, total]);
    const good = useCallback((points = 10) => {
        const st = s.current;
        if (st.over)
            return true;
        st.done++;
        st.score += points;
        setDone(st.done);
        sound.good(st.done);
        flash('happy');
        return close();
    }, [close, flash]);
    const miss = useCallback(() => {
        const st = s.current;
        if (st.over)
            return true;
        st.done++;
        st.missed++;
        setDone(st.done);
        flash('oops');
        return close();
    }, [close, flash]);
    const slip = useCallback(() => {
        const st = s.current;
        if (st.over)
            return;
        st.slips++;
        sound.bad();
        vibrate(40);
        flash('oops');
    }, [flash]);
    return { done, total, over, mood, good, slip, miss };
}
/**
 * The shared scene of a game: the room of its place on the map, the place's character saying what to do,
 * the stage's stars, and the game's own board on a sheet of paper in the middle.
 */
export function SceneShell({ place, say, stage, tray, bare = false, fill = false, className = '', guide, children, }) {
    const t = useT();
    return (_jsxs("div", { className: `scene sg sg-${place} ${className}`, children: [_jsxs("div", { className: "sg-room", "aria-hidden": true, children: [_jsx(RoomPlant, {}), _jsx(RoomBooks, {})] }), _jsxs("div", { className: "sg-wall", children: [_jsx(Bunting, {}), _jsx(PlaceWindow, { place: place }), _jsx("p", { className: "scene-bubble sg-bubble", role: "status", "aria-live": "polite", children: say }), _jsx("span", { className: `sg-guide sg-${stage.mood}`, children: guide ?? _jsx(Guide, { place: place }) })] }), _jsx(StagePips, { done: stage.done, total: stage.total, label: t('scene.progress', { n: stage.done, total: stage.total }) }), _jsx("div", { className: `sg-board${bare ? '' : ' sg-sheet'}${fill ? ' sg-fill' : ''}`, children: children }), tray && _jsx(SceneTray, { hidden: stage.over, children: tray })] }));
}
const medalColors = ['#d98a4e', '#b9c2d0', '#f2c14e'];
/** Three stickers for a game without drawn ones of its own: its icon as a bronze, a silver and a gold medal. */
export function medals(icon) {
    return medalColors.map((color, medal) => ({
        medal: medal,
        icon: [
            ['accent', color, _jsx("circle", { cx: "24", cy: "24", r: "21.5" })],
            ['base', '#fffaf0', _jsx("circle", { cx: "24", cy: "24", r: "16.5" })],
            ...icon.map(([role, c, shape]) => [role, c, _jsx("g", { transform: "translate(24 24) scale(0.58) translate(-24 -24)", children: shape })]),
        ],
    }));
}
/** A sticker's name: its own from the game's strings, or "Gold <game>" for a medal. */
export function stickerName(s, gt, t) {
    return s.medal !== undefined ? t(`stickers.medal${s.medal}`, { title: gt('title') }) : gt(s.name ?? 'title');
}
