import { jsx as _jsx } from "react/jsx-runtime";
/** Dark ink for eyes, text lines and dots. Same colour as the sticker outline. */
export const ink = '#2d3142';
export function Icon({ icon, className = '' }) {
    return (_jsx("svg", { viewBox: "0 0 48 48", className: `game-icon ${className}`, "aria-hidden": true, focusable: "false", children: icon.map(([role, color, shape], i) => (_jsx("g", { className: `gi-${role}`, fill: color, children: shape }, i))) }));
}
