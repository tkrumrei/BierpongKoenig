import { describe, expect, it } from 'vitest'
import type { CupMark, MatchResult, Team, TournamentState } from '../domain/types'
import { jederGegenJeden } from './jederGegenJeden'

function makeState(count: number): TournamentState {
  const teams: Team[] = Array.from({ length: count }, (_, i) => ({
    id: `t${i + 1}`,
    name: `T${i + 1}`,
    playerIds: [`p${i + 1}`],
    group: 'A',
  }))
  const players = teams.map((t) => ({ id: t.playerIds[0], name: t.name }))
  return { players, teams, groupMatches: jederGegenJeden.createGroupMatches(teams), results: {} }
}

function result(team1: string, team2: string, winner: string, c1: number, c2: number): MatchResult {
  const marks = (n: number): CupMark[] => Array.from({ length: 6 }, (_, i) => (i < n ? 1 : 0))
  return { winnerId: winner, cups: { [team1]: marks(c1), [team2]: marks(c2) }, deathCup: false, overtime: false }
}

/** Das Team mit der kleineren Nummer gewinnt immer → Tabelle t1, t2, t3, … */
function playAll(state: TournamentState) {
  for (const m of state.groupMatches) {
    const [a, b] = [m.team1Id!, m.team2Id!].sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)))
    state.results[m.id] = result(a, b, a, 6, 2)
  }
}

describe('Jeder-gegen-Jeden-Modus', () => {
  it.each([4, 5, 6, 7, 10])('erzeugt bei %i Spielern jede Paarung genau einmal', (count) => {
    const state = makeState(count)
    const pairs = state.groupMatches.map((m) => [m.team1Id, m.team2Id].sort().join('-'))
    expect(pairs).toHaveLength((count * (count - 1)) / 2)
    expect(new Set(pairs).size).toBe(pairs.length)
    expect(state.groupMatches.every((m) => m.team1Id !== m.team2Id)).toBe(true)
  })

  it('Finale und Spiel um Platz 3 bleiben offen, solange die Gruppe läuft', () => {
    const state = makeState(5)
    playAll(state)
    delete state.results[state.groupMatches[0].id]
    const ko = jederGegenJeden.resolveKnockout(state)
    expect(ko.every((m) => m.team1Id === null && m.team2Id === null)).toBe(true)
  })

  it('setzt 1 vs. 2 ins Finale und 3 vs. 4 ins Spiel um Platz 3', () => {
    const state = makeState(6)
    playAll(state)
    const ko = Object.fromEntries(jederGegenJeden.resolveKnockout(state).map((m) => [m.id, m]))
    expect([ko.final.team1Id, ko.final.team2Id]).toEqual(['t1', 't2'])
    expect([ko.p3.team1Id, ko.p3.team2Id]).toEqual(['t3', 't4'])
  })
})
