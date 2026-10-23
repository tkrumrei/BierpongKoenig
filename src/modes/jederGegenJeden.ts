import { roundRobin } from '../domain/roundRobin'
import { groupComplete, groupStandings } from '../domain/standings'
import type { Match, TournamentState } from '../domain/types'
import type { TournamentMode } from './types'

const GROUP = 'A'

function place(state: TournamentState, rank: number): string | null {
  if (!groupComplete(state, GROUP)) return null
  return groupStandings(state, GROUP)[rank - 1]?.teamId ?? null
}

function liga(playersPerTeam: 1 | 2): TournamentMode {
  const doppel = playersPerTeam === 2
  return {
    // ID des Einzelmodus bleibt unverändert, damit bestehende Turniere weiter laden
    id: doppel ? 'jeder-gegen-jeden-doppel' : 'jeder-gegen-jeden',
    name: doppel ? 'Jeder gegen Jeden (Doppel)' : 'Jeder gegen Jeden',
    description: `${doppel ? 'Doppel-Teams' : 'Einzel'} in einer Gruppe, jeder spielt gegen jeden. Danach spielen Platz 1 und 2 das Finale, Platz 3 und 4 das Spiel um Platz 3.`,
    teamCount: 6,
    teamCountRange: [4, 10],
    playersPerTeam,
    groups: [GROUP],

    createGroupMatches(teams) {
      return roundRobin(teams, GROUP)
    },

    resolveKnockout(state) {
      const p3: Match = { id: 'p3', stage: 'p3', label: 'Spiel um Platz 3', team1Id: place(state, 3), team2Id: place(state, 4) }
      const final: Match = { id: 'final', stage: 'final', label: 'Finale', team1Id: place(state, 1), team2Id: place(state, 2) }
      return [p3, final]
    },

    knockoutPlaceholders: {
      p3: ['3. Platz', '4. Platz'],
      final: ['1. Platz', '2. Platz'],
    },
  }
}

export const jederGegenJeden = liga(1)
export const jederGegenJedenDoppel = liga(2)
