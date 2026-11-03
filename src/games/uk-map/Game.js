import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocale } from '../../i18n';
import { MapHunt } from '../../kit/MapHuntGame';
import { nationLabels, places } from './content';
import { BANDS, DOT_GAP_KM, fromMap, toMap } from './logic';
import { HEIGHT, INSET, WIDTH, england, neighbours, northernIreland, scotland, shetland, wales } from './outline';
const [ix, iy, iw, ih] = INSET;
export default function UkMap(props) {
    const locale = useLocale();
    const { t } = props;
    const scene = (dots) => (_jsxs(_Fragment, { children: [_jsx("path", { d: neighbours, className: "ukm-neighbour" }), _jsx("rect", { x: ix, y: iy, width: iw, height: ih, rx: 18, className: "ukm-inset" }), _jsx("path", { d: england, className: "ukm-land ukm-england" }), _jsx("path", { d: wales, className: "ukm-land ukm-wales" }), _jsx("path", { d: scotland, className: "ukm-land ukm-scotland" }), _jsx("path", { d: shetland, className: "ukm-land ukm-scotland" }), _jsx("path", { d: northernIreland, className: "ukm-land ukm-ni" }), dots &&
                nationLabels.map(({ key, at }) => {
                    const [x, y] = toMap([at[0], at[1]]);
                    // Long names go on two lines: "Northern / Ireland", "Észak- / Írország".
                    const lines = t(key).split(/(?<=-)|\s+/);
                    return (_jsx("text", { x: x, y: y - (lines.length - 1) * 19, className: "ukm-nation", children: lines.map((l, i) => (_jsx("tspan", { x: x, dy: i ? 38 : 0, children: l }, i))) }, key));
                })] }));
    return (_jsx(MapHunt, { ...props, places: places[locale] ?? places.en, width: WIDTH, height: HEIGHT, toMap: toMap, fromMap: fromMap, bands: BANDS, dotGapKm: DOT_GAP_KM, className: "uk-map", scene: scene }));
}
