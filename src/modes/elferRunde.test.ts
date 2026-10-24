import { describe, expect, it } from 'vitest'
import type { CupMark, MatchResult, Team, TournamentState } from '../domain/types'
import { elferRunde } from './elferRunde'

function makeState(): TournamentState {
  const teams: Team[] = Array.from({ length: 11 }, (_, i) => ({
    id: `t${i + 1}`,
    name: `T${i + 1}`,
    playerIds: [`p${i + 1}`],
    group: 'A',
  }))
  const players = teams.map((t) => ({ id: t.playerIds[0], name: t.name }))
  return { players, teams, groupMatches: elferRunde.createGroupMatches(teams), results: {} }
}

function result(team1: string, team2: string, winner: string): MatchResult {
  const marks = (n: number): CupMark[] => Array.from({ length: 6 }, (_, i) => (i < n ? 1 : 0))
  return { winnerId: winner, cups: { [team1]: marks(winner === team1 ? 6 : 2), [team2]: marks(winner === team2 ? 6 : 2) }, deathCup: false, overtime: false }
}

const num = (id: string) => Number(id.slice(1))

describe('11er-Runde', () => {
  it('lost die Gegner zufällig aus', () => {
    const { teams } = makeState()
    const pairings = (random: () => number) =>
      elferRunde
        .createGroupMatches(teams, random)
        .map((m) => [m.team1Id, m.team2Id].sort().join('-'))
        .sort()
        .join(' ')
    const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    expect(pairings(seeded(1))).toBe(pairings(seeded(1)))
    expect(pairings(seeded(1))).not.toBe(pairings(seeded(2)))
  })

  it('jeder spielt genau 4 Gruppenspiele gegen 4 verschiedene Gegner', () => {
    const { groupMatches } = makeState()
    expect(groupMatches).toHaveLength(22)
    const pairs = groupMatches.map((m) => [m.team1Id, m.team2Id].sort().join('-'))
    expect(new Set(pairs).size).toBe(22)
    for (let i = 1; i <= 11; i++) {
      const games = groupMatches.filter((m) => m.team1Id === `t${i}` || m.team2Id === `t${i}`)
      expect(games).toHaveLength(4)
    }
  })

  it('niemand spielt zwei Spiele direkt hintereinander', () => {
    const { groupMatches } = makeState()
    for (let i = 1; i < groupMatches.length; i++) {
      const prev = [groupMatches[i - 1].team1Id, groupMatches[i - 1].team2Id]
      expect(prev).not.toContain(groupMatches[i].team1Id)
      expect(prev).not.toContain(groupMatches[i].team2Id)
    }
  })

  it('maximal 5 Spiele pro Spieler und ein Sieger im Finale', () => {
    const state = makeState()
    // Kleinere Nummer gewinnt immer
    for (const m of state.groupMatches) {
      const winner = num(m.team1Id!) < num(m.team2Id!) ? m.team1Id! : m.team2Id!
      state.results[m.id] = result(m.team1Id!, m.team2Id!, winner)
    }
    const ko = Object.fromEntries(elferRunde.resolveKnockout(state).map((m) => [m.id, m]))
    expect(ko.final.team1Id).not.toBeNull()
    expect(ko.p3.team1Id).not.toBeNull()

    state.results.final = result(ko.final.team1Id!, ko.final.team2Id!, ko.final.team1Id!)
    const all = [...state.groupMatches, ...elferRunde.resolveKnockout(state)]
    for (let i = 1; i <= 11; i++) {
      expect(all.filter((m) => m.team1Id === `t${i}` || m.team2Id === `t${i}`).length).toBeLessThanOrEqual(5)
    }
    expect(state.results.final.winnerId).toBe(ko.final.team1Id)
  })
})
