import { describe, expect, it } from 'vitest'
import { initials, playerInitials } from './CupPyramid'

describe('Spieler-Kürzel', () => {
  it('nimmt die ersten zwei Buchstaben, bei Nachnamen dessen ersten dazu', () => {
    expect(initials('Tobias')).toBe('TO')
    expect(initials('Tobias Krumrei')).toBe('TOK')
    expect(initials('  anna   maria schmidt ')).toBe('ANS')
    expect(initials('Jo')).toBe('JO')
    expect(initials('')).toBe('')
  })

  it('nummeriert gleiche Kürzel im Team durch', () => {
    const p = (name: string) => ({ id: name, name })
    expect(playerInitials([p('Tobias Krumrei'), p('Tom Kaiser')])).toEqual(['TOK1', 'TOK2'])
    expect(playerInitials([p('Tobias'), p('Lena')])).toEqual(['TO', 'LE'])
  })
})
