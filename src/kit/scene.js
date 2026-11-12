import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** The stars at the top of a scene game: one per task of the stage, gold once it is done. */
export function StagePips({ done, total, label }) {
    return (_jsx("div", { className: "scene-pips", role: "img", "aria-label": label, children: Array.from({ length: total }, (_, i) => (_jsxs("svg", { viewBox: "-12 -12 24 24", className: i < done ? 'pip-done' : i === done ? 'pip-now' : 'pip-todo', "aria-hidden": true, focusable: "false", children: [i === done && _jsx("circle", { r: "10.5" }), _jsx("path", { d: "M0 -9 L2.6 -3.6 L8.6 -2.8 L4.2 1.4 L5.3 7.3 L0 4.4 L-5.3 7.3 L-4.2 1.4 L-8.6 -2.8 L-2.6 -3.6 Z" })] }, i))) }));
}
/** What the scene's character says. Screen readers hear every new line. */
export function SpeechBubble({ children, style }) {
    return (_jsx("p", { className: "scene-bubble", role: "status", "aria-live": "polite", style: style, children: children }));
}
/** The cream band at the bottom of a scene that holds the things to tap. */
export function SceneTray({ children, hidden = false }) {
    return _jsx("div", { className: `scene-tray${hidden ? ' scene-tray-off' : ''}`, children: children });
}
const toolArt = {
    mark: _jsx("path", { d: "M-9 -9 l18 18 M9 -9 l-18 18", fill: "none", stroke: "currentColor", strokeWidth: "5", strokeLinecap: "round" }),
    hint: (_jsxs(_Fragment, { children: [_jsx("circle", { cy: "-4", r: "10", fill: "#ffd24a" }), _jsx("rect", { x: "-5", y: "6", width: "10", height: "7", rx: "2", fill: "currentColor" }), _jsx("path", { d: "M-16 -12 l-5 -3 M16 -12 l5 -3 M0 -20 v-5", fill: "none", stroke: "#f2b01e", strokeWidth: "2.5", strokeLinecap: "round" })] })),
    restart: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M10 -4 A11 11 0 1 0 8 8", fill: "none", stroke: "currentColor", strokeWidth: "4.5", strokeLinecap: "round" }), _jsx("path", { d: "M4 -10 L15 -8 L11 3Z", fill: "currentColor" })] })),
    undo: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-8 -3 H5 a8 8 0 0 1 0 16 H-4", fill: "none", stroke: "currentColor", strokeWidth: "4.5", strokeLinecap: "round" }), _jsx("path", { d: "M-5 -12 L-15 -3 L-5 6Z", fill: "currentColor" })] })),
    up: _jsx("path", { d: "M0 -11 L12 4 H5 V12 H-5 V4 H-12Z", fill: "currentColor", stroke: "currentColor", strokeWidth: "3", strokeLinejoin: "round" }),
    listen: (_jsxs(_Fragment, { children: [_jsx("path", { d: "M-13 -5 H-6 L3 -13 V13 L-6 5 H-13Z", fill: "currentColor", stroke: "currentColor", strokeWidth: "2", strokeLinejoin: "round" }), _jsx("path", { d: "M8 -6 q5 6 0 12 M12 -11 q9 11 0 22", fill: "none", stroke: "currentColor", strokeWidth: "3.4", strokeLinecap: "round" })] })),
};
const turns = { right: 90, down: 180, left: 270 };
/** A round, drawn button of a scene (a tool, an arrow), with an optional word under it. */
export function SceneTool({ kind, label, onPress, on = false, disabled = false, hideLabel = false, }) {
    return (_jsxs("button", { className: `scene-tool${on ? ' scene-tool-on' : ''}`, onPointerDown: onPress, disabled: disabled, "aria-pressed": on || undefined, "aria-label": hideLabel ? label : undefined, children: [_jsx("span", { className: "scene-tool-btn", children: _jsx("svg", { viewBox: "-28 -28 56 56", "aria-hidden": true, focusable: "false", children: kind in turns ? _jsx("g", { transform: `rotate(${turns[kind]})`, children: toolArt.up }) : toolArt[kind] }) }), !hideLabel && _jsx("span", { className: "scene-tool-label", children: label })] }));
}
