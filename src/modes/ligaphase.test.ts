import { describe, expect, it } from 'vitest'
import type { CupMark, MatchResult, Team, TournamentState } from '../domain/types'
import { closestGamesPerTeam, ligaphase, validGamesPerTeam } from './ligaphase'

function makeTeams(count: number): Team[] {
  return Array.from({ length: count }, (_, i) => ({ id: `t${i + 1}`, name: `T${i + 1}`, playerIds: [`p${i + 1}`], group: 'A' }))
}

function makeState(count: number, gamesPerTeam: number): TournamentState {
  const teams = makeTeams(count)
  const players = teams.map((t) => ({ id: t.playerIds[0], name: t.name }))
  return { players, teams, groupMatches: ligaphase.createGroupMatches(teams, { gamesPerTeam }), results: {} }
}

function result(team1: string, team2: string, winner: string): MatchResult {
  const marks = (n: number): CupMark[] => Array.from({ length: 6 }, (_, i) => (i < n ? 1 : 0))
  return { winnerId: winner, cups: { [team1]: marks(winner === team1 ? 6 : 2), [team2]: marks(winner === team2 ? 6 : 2) }, deathCup: false, overtime: false }
}

const num = (id: string) => Number(id.slice(1))
const gamesOf = (matches: { team1Id: string | null; team2Id: string | null }[], id: string) =>
  matches.filter((m) => m.team1Id === id || m.team2Id === id).length

describe('Ligaphase', () => {
  it('erlaubt nur Spielanzahlen, bei denen jeder gleich oft spielt', () => {
    expect(validGamesPerTeam(11)).toEqual([2, 4, 6, 8, 10])
    expect(validGamesPerTeam(6)).toEqual([1, 2, 3, 4, 5])
    expect(closestGamesPerTeam(11, 5)).toBe(4)
    expect(closestGamesPerTeam(4, 4)).toBe(3)
  })

  it.each([
    [4, 3],
    [7, 2],
    [11, 4],
    [12, 5],
    [23, 6],
    [40, 4],
  ])('%i Spieler, je %i Spiele: jede Paarung höchstens einmal, jeder gleich oft', (count, games) => {
    const { teams, groupMatches } = makeState(count, games)
    expect(groupMatches).toHaveLength((count * games) / 2)
    const pairs = groupMatches.map((m) => [m.team1Id, m.team2Id].sort().join('-'))
    expect(new Set(pairs).size).toBe(pairs.length)
    for (const t of teams) expect(gamesOf(groupMatches, t.id)).toBe(games)
  })

  it('mit allen Spielen ist es jeder gegen jeden', () => {
    expect(makeState(9, 8).groupMatches).toHaveLength(36)
  })

  it('niemand spielt zwei Spiele direkt hintereinander (11 Spieler, 4 Spiele)', () => {
    const { groupMatches } = makeState(11, 4)
    for (let i = 1; i < groupMatches.length; i++) {
      const prev = [groupMatches[i - 1].team1Id, groupMatches[i - 1].team2Id]
      expect(prev).not.toContain(groupMatches[i].team1Id)
      expect(prev).not.toContain(groupMatches[i].team2Id)
    }
  })

  it('lost die Gegner zufällig aus', () => {
    const teams = makeTeams(11)
    const pairings = (random: () => number) =>
      ligaphase
        .createGroupMatches(teams, { gamesPerTeam: 4 }, random)
        .map((m) => [m.team1Id, m.team2Id].sort().join('-'))
        .sort()
        .join(' ')
    const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    expect(pairings(seeded(1))).toBe(pairings(seeded(1)))
    expect(pairings(seeded(1))).not.toBe(pairings(seeded(2)))
  })

  it.each([
    [11, 4],
    [10, 3],
  ])('%i Spieler: jeder hat ein Platzierungsspiel, bei ungerader Zahl nicht der Letzte', (count, games) => {
    const state = makeState(count, games)
    // Kleinere Nummer gewinnt immer → Tabelle t1, t2, t3, …
    for (const m of state.groupMatches) {
      const winner = num(m.team1Id!) < num(m.team2Id!) ? m.team1Id! : m.team2Id!
      state.results[m.id] = result(m.team1Id!, m.team2Id!, winner)
    }
    const ko = ligaphase.resolveKnockout(state)
    expect(ko).toHaveLength(Math.floor(count / 2))
    const byId = Object.fromEntries(ko.map((m) => [m.id, m]))
    expect([byId.final.team1Id, byId.final.team2Id]).toEqual(['t1', 't2'])
    expect([byId.p3.team1Id, byId.p3.team2Id]).toEqual(['t3', 't4'])
    expect([byId.p5.team1Id, byId.p5.team2Id, byId.p5.label]).toEqual(['t5', 't6', 'Spiel um Platz 5'])

    const all = [...state.groupMatches, ...ko]
    for (const t of state.teams) {
      const expected = count % 2 && t.id === `t${count}` ? games : games + 1
      expect(gamesOf(all, t.id)).toBe(expected)
    }
  })

  it('Platzierungsspiele bleiben offen, solange die Gruppe läuft', () => {
    const ko = ligaphase.resolveKnockout(makeState(11, 4))
    expect(ko.every((m) => m.team1Id === null && m.team2Id === null)).toBe(true)
  })
})
