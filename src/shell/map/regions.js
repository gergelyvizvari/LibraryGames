/**
 * The picture (map.webp, drawn by tools/map-art) is this big; every position below is in these units.
 * The bottom 100 units are plain ground with no stars: today's adventure and the picked game's card sit over it.
 */
export const MAP_W = 1720;
export const MAP_H = 900;
export const regions = [
    {
        id: 'peaks',
        name: 'region.peaks',
        skills: ['maths'],
        label: [300, 372],
        slots: [[112, 330], [214, 340], [330, 322], [420, 322], [512, 340], [150, 400], [52, 340], [592, 236]],
    },
    {
        id: 'woods',
        name: 'region.woods',
        skills: ['logic', 'spatial'],
        label: [790, 372],
        slots: [[668, 120], [790, 214], [916, 130], [700, 268], [892, 244], [790, 92], [650, 200], [934, 200]],
    },
    {
        id: 'lake',
        name: 'region.lake',
        skills: ['memory', 'focus'],
        label: [1366, 362],
        slots: [[1226, 206], [1290, 124], [1370, 108], [1450, 124], [1516, 178], [1546, 250], [1236, 318], [1560, 336], [1200, 140], [1474, 356], [1140, 230], [1600, 180]],
    },
    {
        id: 'sea',
        name: 'region.sea',
        skills: ['typing', 'reading'],
        label: [104, 536],
        slots: [[150, 626], [266, 668], [146, 748], [36, 756], [26, 668], [254, 574]],
    },
    {
        id: 'village',
        name: 'region.village',
        skills: ['language'],
        label: [392, 570],
        slots: [[424, 700], [566, 640], [694, 706], [436, 776], [664, 778], [398, 636], [722, 640], [548, 548]],
    },
    {
        id: 'meadow',
        name: 'region.meadow',
        skills: ['reflexes'],
        label: [880, 556],
        slots: [[1004, 640], [900, 690], [1124, 668], [990, 728], [1110, 728], [1180, 620]],
    },
    {
        id: 'coast',
        name: 'region.coast',
        skills: ['geography'],
        label: [1296, 556],
        slots: [[1392, 660], [1532, 668], [1560, 754], [1668, 716], [1650, 598], [1470, 776], [1340, 716], [1690, 772]],
    },
];
export function regionOf(skill) {
    return regions.find((r) => r.skills.includes(skill));
}
/** Gives every game a star spot in its skill's region, in registry order. A game without a free spot is left out. */
export function placeGames(list) {
    const used = new Map();
    return list.flatMap((game) => {
        const region = regionOf(game.meta.skill);
        const n = used.get(region.id) ?? 0;
        used.set(region.id, n + 1);
        const slot = region.slots[n];
        return slot ? [{ game, region, x: slot[0], y: slot[1] }] : [];
    });
}
/**
 * How big the map is drawn in a window. A tall window (phone) fits the map's height and scrolls sideways;
 * a wide one (computer) shows the whole map. Never so small that the stars are hard to tap.
 */
export function mapScale(w, h) {
    const fit = w / h >= 1.6 ? Math.min(w / MAP_W, h / MAP_H) : h / MAP_H;
    return Math.max(fit, 0.7);
}
