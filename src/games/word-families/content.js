/** The easiest families leave at level 7, so the top levels bring new words, not just more of them. */
export const GROUPS = [
    { id: 'animals', emoji: '🐾', minLevel: 1, maxLevel: 6 },
    { id: 'food', emoji: '🍽️', minLevel: 1, maxLevel: 6 },
    { id: 'colours', emoji: '🎨', minLevel: 1, maxLevel: 6 },
    { id: 'vehicles', emoji: '🚦', minLevel: 3, maxLevel: 10 },
    { id: 'clothes', emoji: '👚', minLevel: 3, maxLevel: 10 },
    { id: 'body', emoji: '🧍', minLevel: 3, maxLevel: 10 },
    { id: 'weather', emoji: '🌦️', minLevel: 5, maxLevel: 10 },
    { id: 'music', emoji: '🎵', minLevel: 5, maxLevel: 10 },
    { id: 'jobs', emoji: '💼', minLevel: 5, maxLevel: 10 },
    { id: 'home', emoji: '🏠', minLevel: 7, maxLevel: 10 },
    { id: 'school', emoji: '🏫', minLevel: 7, maxLevel: 10 },
    { id: 'sports', emoji: '🏅', minLevel: 7, maxLevel: 10 },
];
const w = (...list) => list.map(([word, emoji]) => ({ word, emoji }));
/** Words per family. No word fits two families (no "orange" in both food and colours). */
export const words = {
    en: {
        animals: w(['cat', '🐱'], ['dog', '🐶'], ['cow', '🐮'], ['pig', '🐷'], ['horse', '🐴'], ['sheep', '🐑'], ['duck', '🦆'], ['lion', '🦁'], ['frog', '🐸'], ['mouse', '🐭'], ['rabbit', '🐰'], ['bear', '🐻']),
        food: w(['apple', '🍎'], ['bread', '🍞'], ['cheese', '🧀'], ['banana', '🍌'], ['egg', '🥚'], ['pizza', '🍕'], ['cake', '🎂'], ['carrot', '🥕'], ['milk', '🥛'], ['grapes', '🍇'], ['soup', '🍲'], ['pancake', '🥞']),
        colours: w(['red', '❤️'], ['blue', '💙'], ['green', '💚'], ['yellow', '💛'], ['purple', '💜'], ['brown', '🤎'], ['black', '🖤'], ['white', '🤍'], ['orange', '🧡'], ['gold', '🥇'], ['silver', '🥈']),
        vehicles: w(['car', '🚗'], ['bus', '🚌'], ['train', '🚂'], ['plane', '✈️'], ['ship', '🚢'], ['bike', '🚲'], ['truck', '🚚'], ['tractor', '🚜'], ['rocket', '🚀'], ['taxi', '🚕'], ['tram', '🚋'], ['helicopter', '🚁']),
        clothes: w(['T-shirt', '👕'], ['dress', '👗'], ['cap', '🧢'], ['socks', '🧦'], ['trainers', '👟'], ['coat', '🧥'], ['scarf', '🧣'], ['gloves', '🧤'], ['jeans', '👖'], ['boots', '👢'], ['shorts', '🩳'], ['swimsuit', '🩱']),
        body: w(['hand', '✋'], ['foot', '🦶'], ['leg', '🦵'], ['eye', '👁️'], ['ear', '👂'], ['nose', '👃'], ['mouth', '👄'], ['arm', '💪'], ['tooth', '🦷'], ['brain', '🧠'], ['tongue', '👅']),
        weather: w(['sun', '☀️'], ['rain', '🌧️'], ['snow', '❄️'], ['wind', '🌬️'], ['cloud', '☁️'], ['storm', '⛈️'], ['rainbow', '🌈'], ['fog', '🌫️'], ['lightning', '⚡'], ['tornado', '🌪️']),
        music: w(['drum', '🥁'], ['guitar', '🎸'], ['piano', '🎹'], ['violin', '🎻'], ['trumpet', '🎺'], ['saxophone', '🎷'], ['bell', '🔔'], ['microphone', '🎤'], ['banjo', '🪕'], ['accordion', '🪗']),
        jobs: w(['doctor', '🧑‍⚕️'], ['cook', '🧑‍🍳'], ['farmer', '🧑‍🌾'], ['teacher', '🧑‍🏫'], ['pilot', '🧑‍✈️'], ['firefighter', '🧑‍🚒'], ['police officer', '👮'], ['astronaut', '🧑‍🚀'], ['painter', '🧑‍🎨'], ['singer', '🧑‍🎤'], ['mechanic', '🧑‍🔧'], ['builder', '👷']),
        home: w(['bed', '🛏️'], ['chair', '🪑'], ['sofa', '🛋️'], ['door', '🚪'], ['window', '🪟'], ['lamp', '💡'], ['bath', '🛁'], ['mirror', '🪞'], ['clock', '🕰️'], ['toilet', '🚽'], ['key', '🔑']),
        school: w(['pencil', '✏️'], ['book', '📕'], ['ruler', '📏'], ['scissors', '✂️'], ['crayon', '🖍️'], ['paper', '📄'], ['abacus', '🧮'], ['notebook', '📓'], ['pen', '🖊️'], ['globe', '🌍'], ['paintbrush', '🖌️'], ['school bag', '🎒']),
        sports: w(['football', '⚽'], ['tennis', '🎾'], ['basketball', '🏀'], ['skiing', '⛷️'], ['swimming', '🏊'], ['boxing', '🥊'], ['golf', '⛳'], ['running', '🏃'], ['karate', '🥋'], ['bowling', '🎳'], ['surfing', '🏄'], ['skating', '⛸️']),
    },
    hu: {
        animals: w(['macska', '🐱'], ['kutya', '🐶'], ['tehén', '🐮'], ['malac', '🐷'], ['ló', '🐴'], ['bárány', '🐑'], ['kacsa', '🦆'], ['oroszlán', '🦁'], ['béka', '🐸'], ['egér', '🐭'], ['nyuszi', '🐰'], ['medve', '🐻']),
        food: w(['alma', '🍎'], ['kenyér', '🍞'], ['sajt', '🧀'], ['banán', '🍌'], ['tojás', '🥚'], ['pizza', '🍕'], ['torta', '🎂'], ['répa', '🥕'], ['tej', '🥛'], ['szőlő', '🍇'], ['leves', '🍲'], ['palacsinta', '🥞']),
        colours: w(['piros', '❤️'], ['kék', '💙'], ['zöld', '💚'], ['sárga', '💛'], ['lila', '💜'], ['barna', '🤎'], ['fekete', '🖤'], ['fehér', '🤍'], ['narancssárga', '🧡'], ['rózsaszín', '🩷'], ['szürke', '🩶']),
        vehicles: w(['autó', '🚗'], ['busz', '🚌'], ['vonat', '🚂'], ['repülő', '✈️'], ['hajó', '🚢'], ['bicikli', '🚲'], ['teherautó', '🚚'], ['traktor', '🚜'], ['rakéta', '🚀'], ['taxi', '🚕'], ['villamos', '🚋'], ['helikopter', '🚁']),
        clothes: w(['póló', '👕'], ['ruha', '👗'], ['sapka', '🧢'], ['zokni', '🧦'], ['cipő', '👟'], ['kabát', '🧥'], ['sál', '🧣'], ['kesztyű', '🧤'], ['farmer', '👖'], ['csizma', '👢'], ['rövidnadrág', '🩳'], ['fürdőruha', '🩱']),
        body: w(['kéz', '✋'], ['talp', '🦶'], ['láb', '🦵'], ['szem', '👁️'], ['fül', '👂'], ['orr', '👃'], ['száj', '👄'], ['kar', '💪'], ['fog', '🦷'], ['agy', '🧠'], ['nyelv', '👅']),
        weather: w(['napsütés', '☀️'], ['eső', '🌧️'], ['hó', '❄️'], ['szél', '🌬️'], ['felhő', '☁️'], ['vihar', '⛈️'], ['szivárvány', '🌈'], ['köd', '🌫️'], ['villám', '⚡'], ['tornádó', '🌪️']),
        music: w(['dob', '🥁'], ['gitár', '🎸'], ['zongora', '🎹'], ['hegedű', '🎻'], ['trombita', '🎺'], ['szaxofon', '🎷'], ['csengő', '🔔'], ['mikrofon', '🎤'], ['bendzsó', '🪕'], ['harmonika', '🪗']),
        jobs: w(['orvos', '🧑‍⚕️'], ['szakács', '🧑‍🍳'], ['gazda', '🧑‍🌾'], ['tanító', '🧑‍🏫'], ['pilóta', '🧑‍✈️'], ['tűzoltó', '🧑‍🚒'], ['rendőr', '👮'], ['űrhajós', '🧑‍🚀'], ['festő', '🧑‍🎨'], ['énekes', '🧑‍🎤'], ['szerelő', '🧑‍🔧'], ['kőműves', '👷']),
        home: w(['ágy', '🛏️'], ['szék', '🪑'], ['kanapé', '🛋️'], ['ajtó', '🚪'], ['ablak', '🪟'], ['lámpa', '💡'], ['kád', '🛁'], ['tükör', '🪞'], ['óra', '🕰️'], ['vécé', '🚽'], ['kulcs', '🔑']),
        school: w(['ceruza', '✏️'], ['könyv', '📕'], ['vonalzó', '📏'], ['olló', '✂️'], ['zsírkréta', '🖍️'], ['papír', '📄'], ['számolókeret', '🧮'], ['füzet', '📓'], ['toll', '🖊️'], ['földgömb', '🌍'], ['ecset', '🖌️'], ['iskolatáska', '🎒']),
        sports: w(['foci', '⚽'], ['tenisz', '🎾'], ['kosárlabda', '🏀'], ['síelés', '⛷️'], ['úszás', '🏊'], ['boksz', '🥊'], ['golf', '⛳'], ['futás', '🏃'], ['karate', '🥋'], ['bowling', '🎳'], ['szörfözés', '🏄'], ['korcsolyázás', '⛸️']),
    },
};
export const groupsFor = (level) => GROUPS.filter((g) => g.minLevel <= level && g.maxLevel >= level);
