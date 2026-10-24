import type { Match, Team, TournamentState } from '../domain/types'

export interface TournamentMode {
  id: string
  name: string
  description: string
  /** Standard-Teamanzahl */
  teamCount: number
  /** Falls gesetzt, kann die Teamanzahl beim Erstellen in diesem Bereich gewählt werden. */
  teamCountRange?: [number, number]
  /** Einzel = 1, Doppel = 2 */
  playersPerTeam: 1 | 2
  groups: string[]
  /** `random` nur für Tests, damit eine Auslosung reproduzierbar ist */
  createGroupMatches(teams: Team[], random?: () => number): Match[]
  /** Leitet die K.O.-Paarungen aus Tabelle und Ergebnissen ab; noch unbekannte Teams sind null. */
  resolveKnockout(state: TournamentState): Match[]
  /** Anzeige für K.O.-Spiele, solange die Teams noch nicht feststehen (pro Match-ID) */
  knockoutPlaceholders: Record<string, [string, string]>
}
