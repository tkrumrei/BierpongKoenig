import { loserOf, validResult } from '../domain/results'
import { groupComplete, groupStandings } from '../domain/standings'
import type { Match, Team, TournamentState } from '../domain/types'
import type { TournamentMode } from './types'

const GROUPS = ['A', 'B']

function roundRobin(teams: Team[], group: string): Match[] {
  const [t1, t2, t3] = teams
  const pairs: [Team, Team][] = [[t1, t2], [t3, t1], [t2, t3]]
  return pairs.map(([a, b], i) => ({
    id: `g${group}${i + 1}`,
    stage: 'group',
    label: `Gruppe ${group} · Spiel ${i + 1}`,
    group,
    team1Id: a.id,
    team2Id: b.id,
  }))
}

function place(state: TournamentState, group: string, rank: number): string | null {
  if (!groupComplete(state, group)) return null
  return groupStandings(state, group)[rank - 1]?.teamId ?? null
}

function winner(state: TournamentState, match: Match): string | null {
  return validResult(state, match)?.winnerId ?? null
}

export const saufsuenden: TournamentMode = {
  id: 'saufsuenden',
  name: 'Saufsünden',
  description:
    '6 Doppel-Teams, 2 Gruppen à 3 (bei ungerader Spielerzahl spielt ein Team allein). Alle kommen weiter: Gruppenzweite und -dritte spielen das Viertelfinale, Gruppensieger stehen direkt im Halbfinale.',
  teamCount: 6,
  playersPerTeam: 2,
  groups: GROUPS,

  createGroupMatches(teams) {
    const [a, b] = GROUPS.map((g) => roundRobin(teams.filter((t) => t.group === g), g))
    // Abwechselnd, damit beide Gruppen parallel an zwei Tischen laufen können
    return a.flatMap((m, i) => [m, b[i]])
  },

  resolveKnockout(state) {
    const qfA: Match = { id: 'qfA', stage: 'qf', label: 'Viertelfinale A', team1Id: place(state, 'A', 2), team2Id: place(state, 'B', 3) }
    const qfB: Match = { id: 'qfB', stage: 'qf', label: 'Viertelfinale B', team1Id: place(state, 'B', 2), team2Id: place(state, 'A', 3) }
    const sf1: Match = { id: 'sf1', stage: 'sf', label: 'Halbfinale 1', team1Id: place(state, 'A', 1), team2Id: winner(state, qfB) }
    const sf2: Match = { id: 'sf2', stage: 'sf', label: 'Halbfinale 2', team1Id: place(state, 'B', 1), team2Id: winner(state, qfA) }
    const p3: Match = {
      id: 'p3',
      stage: 'p3',
      label: 'Spiel um Platz 3',
      team1Id: loserOf(sf1, validResult(state, sf1)),
      team2Id: loserOf(sf2, validResult(state, sf2)),
    }
    const final: Match = { id: 'final', stage: 'final', label: 'Finale', team1Id: winner(state, sf1), team2Id: winner(state, sf2) }
    return [qfA, qfB, sf1, sf2, p3, final]
  },
}
