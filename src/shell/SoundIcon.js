import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** The sound button's picture. On: a purple speaker with waves. Off: a grey speaker under a thick red slash. */
export function SoundIcon({ muted }) {
    const body = muted ? '#b0aac8' : '#7c5ce0';
    return (_jsxs("svg", { className: "sound-icon", viewBox: "0 0 32 32", "aria-hidden": true, focusable: "false", children: [_jsx("path", { d: "M4 12.500a1.500 1.500 0 0 1 1.500-1.500H10l6.600-5.600A1.500 1.500 0 0 1 19 6.600v18.800a1.500 1.500 0 0 1-2.400 1.200L10 21H5.500A1.500 1.500 0 0 1 4 19.500z", fill: body }), muted ? (_jsxs(_Fragment, { children: [_jsx("path", { d: "M5 27L27 5", fill: "none", stroke: "#fffaf0", strokeWidth: "7.500", strokeLinecap: "round" }), _jsx("path", { d: "M5 27L27 5", fill: "none", stroke: "#d9506a", strokeWidth: "4", strokeLinecap: "round" })] })) : (_jsx("path", { d: "M22.500 12a5.600 5.600 0 0 1 0 8M26 8.500a10.500 10.500 0 0 1 0 15", fill: "none", stroke: "#f2a71b", strokeWidth: "2.800", strokeLinecap: "round" }))] }));
}
