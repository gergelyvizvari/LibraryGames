import type { Locale } from '../../i18n'

export interface Word {
  word: string
  /** Shown under the word while pictures are on (levels 1 to 5). Hard pairs have none: they only come later. */
  emoji?: string
}

export interface Pair {
  a: Word
  b: Word
  /** Pairs about the same idea (size, direction, mood…) never share a board, so no word has two answers. */
  group: string
  minLevel: number
  maxLevel: number
}

type Tier = 'easy' | 'mid' | 'hard'
const LEVELS: Record<Tier, [number, number]> = { easy: [1, 6], mid: [3, 10], hard: [6, 10] }

const p = (tier: Tier, group: string, a: [string, string?], b: [string, string?]): Pair => ({
  a: { word: a[0], emoji: a[1] },
  b: { word: b[0], emoji: b[1] },
  group,
  minLevel: LEVELS[tier][0],
  maxLevel: LEVELS[tier][1],
})

export const pairs: Record<Locale, Pair[]> = {
  en: [
    p('easy', 'temp', ['hot', '🔥'], ['cold', '🧊']),
    p('easy', 'size', ['big', '🐘'], ['small', '🐭']),
    p('easy', 'time', ['day', '☀️'], ['night', '🌙']),
    p('easy', 'mood', ['happy', '😀'], ['sad', '😢']),
    p('easy', 'dir', ['up', '⬆️'], ['down', '⬇️']),
    p('easy', 'speed', ['fast', '🐆'], ['slow', '🐢']),
    p('easy', 'open', ['open', '🔓'], ['closed', '🔒']),
    p('easy', 'wet', ['wet', '💦'], ['dry', '🏜️']),
    p('easy', 'full', ['full', '🔋'], ['empty', '🪫']),
    p('easy', 'loud', ['loud', '📢'], ['quiet', '🤫']),
    p('easy', 'age', ['old', '👴'], ['young', '👶']),
    p('easy', 'size', ['tall', '🦒'], ['short', '🐧']),
    p('easy', 'weight', ['heavy', '🏋️'], ['light', '🪶']),
    p('easy', 'dir', ['left', '⬅️'], ['right', '➡️']),
    p('easy', 'colour', ['black', '⚫'], ['white', '⚪']),
    p('easy', 'touch', ['hard', '🪨'], ['soft', '🧸']),
    p('easy', 'clean', ['clean', '🧼'], ['dirty', '🐷']),
    p('easy', 'go', ['stop', '🛑'], ['go', '🟢']),
    p('easy', 'taste', ['sweet', '🍭'], ['sour', '🍋']),
    p('easy', 'sleep', ['awake', '👀'], ['asleep', '😴']),
    p('easy', 'in', ['in', '📥'], ['out', '📤']),
    p('easy', 'mood', ['laugh', '😂'], ['cry', '😭']),

    p('mid', 'size', ['thick', '📚'], ['thin', '📄']),
    p('mid', 'near', ['near', '👉'], ['far', '🔭']),
    p('mid', 'dir', ['top', '🔝'], ['bottom', '⏬']),
    p('mid', 'time', ['summer', '🏖️'], ['winter', '⛄']),
    p('mid', 'in', ['inside', '🏠'], ['outside', '🌳']),
    p('mid', 'win', ['win', '🏆'], ['lose', '💔']),
    p('mid', 'give', ['give', '🎁'], ['take', '🤲']),
    p('mid', 'go', ['start', '🚦'], ['finish', '🏁']),
    p('mid', 'touch', ['smooth', '🪞'], ['rough', '🌵']),
    p('mid', 'strong', ['strong', '💪'], ['weak', '🥀']),
    p('mid', 'mood', ['brave', '🦁'], ['scared', '😱']),
    p('mid', 'light', ['dark', '🌑'], ['bright', '💡']),
    p('mid', 'dir', ['high', '✈️'], ['low', '🐜']),
    p('mid', 'ask', ['ask', '❓'], ['answer', '💬']),

    p('hard', 'rich', ['rich'], ['poor']),
    p('hard', 'time', ['early'], ['late']),
    p('hard', 'many', ['few'], ['many']),
    p('hard', 'always', ['always'], ['never']),
    p('hard', 'time', ['before'], ['after']),
    p('hard', 'mind', ['remember'], ['forget']),
    p('hard', 'true', ['true'], ['false']),
    p('hard', 'easy', ['easy'], ['difficult']),
    p('hard', 'price', ['cheap'], ['expensive']),
    p('hard', 'polite', ['polite'], ['rude']),
    p('hard', 'loud', ['whisper'], ['shout']),
    p('hard', 'safe', ['safe'], ['dangerous']),
    p('hard', 'clean', ['tidy'], ['messy']),
    p('hard', 'give', ['buy'], ['sell']),
  ],
  hu: [
    p('easy', 'temp', ['forró', '🔥'], ['hideg', '🧊']),
    p('easy', 'size', ['nagy', '🐘'], ['kicsi', '🐭']),
    p('easy', 'time', ['nappal', '☀️'], ['éjjel', '🌙']),
    p('easy', 'mood', ['vidám', '😀'], ['szomorú', '😢']),
    p('easy', 'dir', ['fel', '⬆️'], ['le', '⬇️']),
    p('easy', 'speed', ['gyors', '🐆'], ['lassú', '🐢']),
    p('easy', 'open', ['nyitva', '🔓'], ['zárva', '🔒']),
    p('easy', 'wet', ['vizes', '💦'], ['száraz', '🏜️']),
    p('easy', 'full', ['tele', '🔋'], ['üres', '🪫']),
    p('easy', 'loud', ['hangos', '📢'], ['halk', '🤫']),
    p('easy', 'age', ['öreg', '👴'], ['fiatal', '👶']),
    p('easy', 'size', ['magas', '🦒'], ['alacsony', '🐧']),
    p('easy', 'weight', ['nehéz', '🏋️'], ['könnyű', '🪶']),
    p('easy', 'dir', ['bal', '⬅️'], ['jobb', '➡️']),
    p('easy', 'colour', ['fekete', '⚫'], ['fehér', '⚪']),
    p('easy', 'touch', ['kemény', '🪨'], ['puha', '🧸']),
    p('easy', 'clean', ['tiszta', '🧼'], ['piszkos', '🐷']),
    p('easy', 'go', ['megáll', '🛑'], ['elindul', '🟢']),
    p('easy', 'taste', ['édes', '🍭'], ['savanyú', '🍋']),
    p('easy', 'sleep', ['felébred', '⏰'], ['elalszik', '😴']),
    p('easy', 'in', ['be', '📥'], ['ki', '📤']),
    p('easy', 'mood', ['nevet', '😂'], ['sír', '😭']),

    p('mid', 'size', ['vastag', '📚'], ['vékony', '📄']),
    p('mid', 'near', ['közel', '👉'], ['messze', '🔭']),
    p('mid', 'dir', ['fent', '🔝'], ['lent', '⏬']),
    p('mid', 'time', ['nyár', '🏖️'], ['tél', '⛄']),
    p('mid', 'in', ['bent', '🏠'], ['kint', '🌳']),
    p('mid', 'win', ['nyer', '🏆'], ['veszít', '💔']),
    p('mid', 'give', ['ad', '🎁'], ['kap', '🤲']),
    p('mid', 'go', ['rajt', '🚦'], ['cél', '🏁']),
    p('mid', 'touch', ['sima', '🪞'], ['érdes', '🌵']),
    p('mid', 'strong', ['erős', '💪'], ['gyenge', '🥀']),
    p('mid', 'mood', ['bátor', '🦁'], ['gyáva', '😱']),
    p('mid', 'light', ['sötét', '🌑'], ['világos', '💡']),
    p('mid', 'size', ['hosszú', '🐍'], ['rövid', '✏️']),
    p('mid', 'ask', ['kérdez', '❓'], ['válaszol', '💬']),

    p('hard', 'rich', ['gazdag'], ['szegény']),
    p('hard', 'time', ['korán'], ['későn']),
    p('hard', 'many', ['kevés'], ['sok']),
    p('hard', 'always', ['mindig'], ['soha']),
    p('hard', 'time', ['előtt'], ['után']),
    p('hard', 'mind', ['emlékszik'], ['elfelejt']),
    p('hard', 'true', ['igaz'], ['hamis']),
    p('hard', 'easy', ['egyszerű'], ['bonyolult']),
    p('hard', 'price', ['olcsó'], ['drága']),
    p('hard', 'polite', ['udvarias'], ['goromba']),
    p('hard', 'loud', ['suttog'], ['kiabál']),
    p('hard', 'safe', ['biztonságos'], ['veszélyes']),
    p('hard', 'clean', ['rendes'], ['rendetlen']),
    p('hard', 'give', ['vesz'], ['elad']),
  ],
}

export const poolFor = (list: Pair[], level: number) => list.filter((q) => q.minLevel <= level && q.maxLevel >= level)
