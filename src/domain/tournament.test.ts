import { describe, expect, it } from 'vitest'
import { saufsuenden } from '../modes/saufsuenden'
import { playerCups, teamCups } from './results'
import { shuffleNames } from './shuffle'
import { groupStandings } from './standings'
import { playerStats } from './stats'
import type { CupMark, MatchResult, Player, Team, TournamentState } from './types'

const players: Player[] = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, name: `Spieler ${i}` }))

function makeTeams(): Team[] {
  // A: a1,a2,a3  B: b1,b2,b3
  return ['a1', 'a2', 'a3', 'b1', 'b2', 'b3'].map((id, i) => ({
    id,
    name: id.toUpperCase(),
    playerIds: [`p${i * 2}`, `p${i * 2 + 1}`],
    group: id[0].toUpperCase(),
  }))
}

function makeState(): TournamentState {
  const teams = makeTeams()
  return { players, teams, groupMatches: saufsuenden.createGroupMatches(teams), results: {} }
}

/** Ergebnis mit `c1`/`c2` getroffenen Bechern (alle von Spieler 1) */
function result(team1: string, team2: string, winner: string, c1: number, c2: number): MatchResult {
  const marks = (n: number): CupMark[] => Array.from({ length: 6 }, (_, i) => (i < n ? 1 : 0))
  return { winnerId: winner, cups: { [team1]: marks(c1), [team2]: marks(c2) }, deathCup: false, overtime: false }
}

/** Trägt ein Gruppenspiel zwischen zwei Teams ein, egal in welcher Reihenfolge es im Spielplan steht. */
function play(state: TournamentState, x: string, y: string, winner: string, cx: number, cy: number) {
  const m = state.groupMatches.find(
    (m) => (m.team1Id === x && m.team2Id === y) || (m.team1Id === y && m.team2Id === x),
  )!
  state.results[m.id] = result(x, y, winner, cx, cy)
}

describe('Saufsünden-Modus', () => {
  it('erzeugt 3 Spiele pro Gruppe, jeder gegen jeden', () => {
    const state = makeState()
    expect(state.groupMatches).toHaveLength(6)
    for (const g of ['A', 'B']) {
      const pairs = state.groupMatches
        .filter((m) => m.group === g)
        .map((m) => [m.team1Id, m.team2Id].sort().join('-'))
      expect(new Set(pairs).size).toBe(3)
    }
  })

  it('K.O.-Paarungen bleiben offen, solange die Gruppe läuft', () => {
    const ko = saufsuenden.resolveKnockout(makeState())
    expect(ko.every((m) => m.team1Id === null && m.team2Id === null)).toBe(true)
  })

  it('setzt VF, HF, Platz 3 und Finale korrekt', () => {
    const state = makeState()
    // Gruppe A: a1 > a2 > a3, Gruppe B: b1 > b2 > b3
    play(state, 'a1', 'a2', 'a1', 6, 3)
    play(state, 'a1', 'a3', 'a1', 6, 2)
    play(state, 'a2', 'a3', 'a2', 6, 4)
    play(state, 'b1', 'b2', 'b1', 6, 3)
    play(state, 'b1', 'b3', 'b1', 6, 2)
    play(state, 'b2', 'b3', 'b2', 6, 4)

    let ko = Object.fromEntries(saufsuenden.resolveKnockout(state).map((m) => [m.id, m]))
    expect([ko.qfA.team1Id, ko.qfA.team2Id]).toEqual(['a2', 'b3'])
    expect([ko.qfB.team1Id, ko.qfB.team2Id]).toEqual(['b2', 'a3'])
    expect([ko.sf1.team1Id, ko.sf1.team2Id]).toEqual(['a1', null])

    state.results.qfA = result('a2', 'b3', 'b3', 2, 6)
    state.results.qfB = result('b2', 'a3', 'b2', 6, 1)
    ko = Object.fromEntries(saufsuenden.resolveKnockout(state).map((m) => [m.id, m]))
    expect([ko.sf1.team1Id, ko.sf1.team2Id]).toEqual(['a1', 'b2'])
    expect([ko.sf2.team1Id, ko.sf2.team2Id]).toEqual(['b1', 'b3'])

    state.results.sf1 = result('a1', 'b2', 'a1', 6, 5)
    state.results.sf2 = result('b1', 'b3', 'b3', 4, 6)
    ko = Object.fromEntries(saufsuenden.resolveKnockout(state).map((m) => [m.id, m]))
    expect([ko.final.team1Id, ko.final.team2Id]).toEqual(['a1', 'b3'])
    expect([ko.p3.team1Id, ko.p3.team2Id]).toEqual(['b2', 'b1'])
  })

  it('verwirft ein K.O.-Ergebnis, wenn sich die Paarung durch Korrektur ändert', () => {
    const state = makeState()
    play(state, 'a1', 'a2', 'a1', 6, 3)
    play(state, 'a1', 'a3', 'a1', 6, 2)
    play(state, 'a2', 'a3', 'a2', 6, 4)
    play(state, 'b1', 'b2', 'b1', 6, 3)
    play(state, 'b1', 'b3', 'b1', 6, 2)
    play(state, 'b2', 'b3', 'b2', 6, 4)
    state.results.qfA = result('a2', 'b3', 'a2', 6, 1)
    // Korrektur: a3 schlägt a2 deutlich → a3 wird Zweiter
    play(state, 'a2', 'a3', 'a3', 1, 6)
    const ko = Object.fromEntries(saufsuenden.resolveKnockout(state).map((m) => [m.id, m]))
    expect(ko.qfA.team1Id).toBe('a3')
    expect(ko.sf2.team2Id).toBeNull()
  })
})

describe('Gruppentabelle', () => {
  it('sortiert Siege → Becherdifferenz', () => {
    const state = makeState()
    // Jeder gewinnt einmal (Kreis), Differenz entscheidet
    play(state, 'a1', 'a2', 'a1', 6, 5) // a1 +1, a2 -1
    play(state, 'a2', 'a3', 'a2', 6, 1) // a2 +5, a3 -5
    play(state, 'a3', 'a1', 'a3', 6, 4) // a3 +2, a1 -2
    // a1: -1, a2: +4, a3: -3
    expect(groupStandings(state, 'A').map((r) => r.teamId)).toEqual(['a2', 'a1', 'a3'])
  })

  it('nutzt den direkten Vergleich bei gleicher Differenz', () => {
    const state = makeState()
    play(state, 'a1', 'a2', 'a2', 3, 6) // a1 -3, a2 +3
    play(state, 'a1', 'a3', 'a1', 6, 3) // a1 +3, a3 -3
    play(state, 'a2', 'a3', 'a3', 3, 6) // a2 -3, a3 +3
    // alle 1 Sieg, Differenz 0 → Kreis, direkter Vergleich jeweils 1 → getroffene Becher
    const rows = groupStandings(state, 'A')
    expect(rows.every((r) => r.wins === 1 && r.diff === 0)).toBe(true)
  })

  it('direkter Vergleich entscheidet zwischen zwei Teams', () => {
    const state = makeState()
    play(state, 'a1', 'a2', 'a2', 5, 6) // a1 -1, a2 +1
    play(state, 'a1', 'a3', 'a1', 6, 0) // a1 +6
    play(state, 'a2', 'a3', 'a2', 6, 2) // a2 +4
    // a1: 1 Sieg, +5; a2: 2 Siege
    expect(groupStandings(state, 'A')[0].teamId).toBe('a2')
  })
})

describe('Becher-Zählung', () => {
  it('zählt "beide" einmal fürs Team, aber für jeden Spieler', () => {
    const team = makeTeams()[0]
    const r: MatchResult = { winnerId: 'a1', cups: { a1: [1, 2, 3, 0, 0, 0] }, deathCup: false, overtime: false }
    expect(teamCups(r, 'a1')).toBe(3)
    expect(playerCups(r, team, team.playerIds[0])).toBe(2)
    expect(playerCups(r, team, team.playerIds[1])).toBe(2)
  })

  it('Statistik summiert Becher pro Spieler', () => {
    const state = makeState()
    play(state, 'a1', 'a2', 'a1', 6, 3)
    const stats = playerStats(state, [...state.groupMatches, ...saufsuenden.resolveKnockout(state)])
    expect(stats[0]).toMatchObject({ playerId: 'p0', cups: 6, matches: 1 })
  })
})

describe('Zufällig mischen', () => {
  it('tauscht nur die Namen, jeder Name bleibt genau einmal erhalten', () => {
    for (let run = 0; run < 20; run++) {
      const result = shuffleNames(players, makeTeams())
      expect(result.map((p) => p.id)).toEqual(players.map((p) => p.id))
      expect([...result.map((p) => p.name)].sort()).toEqual([...players.map((p) => p.name)].sort())
    }
  })

  it('verändert die Reihenfolge tatsächlich', () => {
    let calls = 0
    const result = shuffleNames(players, makeTeams(), () => (calls++ % 2 ? 0 : 0.99))
    expect(result.map((p) => p.name)).not.toEqual(players.map((p) => p.name))
  })

  it('lässt bei 10 oder 11 Spielern kein Team leer', () => {
    for (const count of [10, 11]) {
      const partial = players.map((p, i) => ({ ...p, name: i < count ? p.name : '' }))
      for (let run = 0; run < 50; run++) {
        const result = shuffleNames(partial, makeTeams())
        const name = (id: string) => result.find((p) => p.id === id)!.name
        expect(makeTeams().every((t) => t.playerIds.some((id) => name(id)))).toBe(true)
        expect(result.filter((p) => p.name).length).toBe(count)
      }
    }
  })
})
