import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocale } from '../../i18n';
import { MapHunt } from '../../kit/MapHuntGame';
import { balaton, danube, places, tisza } from './content';
import { BANDS, DOT_GAP_KM, fromMap, toMap } from './logic';
import { HEIGHT, WIDTH, outline } from './outline';
const line = (pts) => 'M' + pts.map((p) => toMap(p).map((v) => v.toFixed(1)).join(',')).join('L');
const rivers = [line(danube), line(tisza)];
const lake = line(balaton);
const scene = () => (_jsxs(_Fragment, { children: [_jsx("path", { d: outline, className: "cm2-land" }), rivers.map((d, i) => (_jsx("path", { d: d, className: "cm2-river" }, i))), _jsx("path", { d: lake, className: "cm2-lake" })] }));
export default function CountryMap(props) {
    const locale = useLocale();
    return (_jsx(MapHunt, { ...props, places: places[locale] ?? places.en, width: WIDTH, height: HEIGHT, toMap: toMap, fromMap: fromMap, bands: BANDS, dotGapKm: DOT_GAP_KM, className: "country-map", scene: scene }));
}
