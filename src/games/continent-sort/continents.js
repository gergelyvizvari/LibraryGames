export const CONTINENTS = ['northAmerica', 'southAmerica', 'europe', 'africa', 'asia', 'oceania', 'antarctica'];
/** The meridian (60° E, the Ural mountains) that splits Russia into its European and Asian parts. */
export const URALS = 60;
/**
 * Which continent a piece of land belongs to, from the centre of that piece (one island or mainland).
 * Simple rules are enough at this map size; Russia is split separately along the Urals.
 */
export function classify(lon, lat, country = '') {
    if (country === 'Antarctica' || lat < -60)
        return 'antarctica';
    if (country === 'Russia')
        return lon > 0 && lon < URALS ? 'europe' : 'asia';
    // The Pacific islands far east of the date line, and Fiji across it.
    if (lon < -150 && lat < 30)
        return 'oceania';
    if (lon < -25)
        return (lat > 7.5 && lon < -77) || lat > 13 ? 'northAmerica' : 'southAmerica';
    if ((lat < -10 && lon > 110) || (lon > 130 && lat < 0) || (lon > 160 && lat < 0))
        return 'oceania';
    // Arabia is Asia, but Eritrea across the Red Sea is Africa.
    const arabia = lon > 34 && lat > 12 && !(lon < 43 && lat < 18);
    if (lat < 34.7 && lon < 52 && !arabia)
        return 'africa';
    // Turkey and the Caucasus are counted as Asia.
    if (lon < 40 && !(lon > 26 && lat < 42))
        return 'europe';
    return 'asia';
}
