import { describe, expect, it } from 'vitest'
import { fold, search } from './search'

const list = [
  { item: 'monster', titles: ['Feed the Monster', 'Etesd a szörnyet!'], more: ['Count the food', 'Matek'] },
  { item: 'shop', titles: ['Acorn Shop', 'Makkbolt'], more: ['Pay the squirrel', 'Fizesd ki a mókusnak', 'Matek'] },
  { item: 'map', titles: ['Hungary Map Hunt', 'Magyar vaktérkép'], more: ['Földrajz', 'Felfedezők partja'] },
]

describe('fold', () => {
  it('drops accents and case', () => {
    expect(fold('Szörnyű ŐSZ, Árvíztűrő')).toBe('szornyu osz, arvizturo')
  })
})

describe('search', () => {
  it('finds a game typed without accents, in either language', () => {
    expect(search(list, 'szorny')).toEqual(['monster'])
    expect(search(list, 'monster')).toEqual(['monster'])
    expect(search(list, 'MOKUS')).toEqual(['shop'])
  })

  it('needs every typed word in the game, inside glued Hungarian words too', () => {
    expect(search(list, 'magyar terkep')).toEqual(['map'])
    expect(search(list, 'bolt')).toEqual(['shop'])
    expect(search(list, 'magyar bolt')).toEqual([])
  })

  it('needs a short word to start a word', () => {
    expect(search(list, 'ak')).toEqual([])
    expect(search(list, 'ma')).toEqual(['shop', 'map', 'monster'])
  })

  it('puts title hits before games that only mention the word', () => {
    expect(search(list, 'mat')).toEqual(['monster', 'shop'])
    expect(search([...list, { item: 'maths', titles: ['Matek kaland'], more: [] }], 'matek')).toEqual(['maths', 'monster', 'shop'])
  })

  it('returns nothing for an empty query', () => {
    expect(search(list, '  ')).toEqual([])
  })
})
