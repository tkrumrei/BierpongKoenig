import type { Match, Team, TournamentState } from '../domain/types'

export interface TournamentMode {
  id: string
  name: string
  description: string
  teamCount: number
  /** Einzel = 1, Doppel = 2 */
  playersPerTeam: 1 | 2
  groups: string[]
  createGroupMatches(teams: Team[]): Match[]
  /** Leitet die K.O.-Paarungen aus Tabelle und Ergebnissen ab; noch unbekannte Teams sind null. */
  resolveKnockout(state: TournamentState): Match[]
}
