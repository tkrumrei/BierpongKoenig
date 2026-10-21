import type { CupMark, Match, MatchResult, Team, TournamentState } from './types'

/** Becher, die ein Team getroffen hat (ein Becher zählt einmal, auch wenn beide getroffen haben). */
export function teamCups(result: MatchResult, teamId: string): number {
  return (result.cups[teamId] ?? []).filter((m) => m !== 0).length
}

function markIncludes(mark: CupMark, playerIndex: number): boolean {
  return mark === 3 || mark === playerIndex + 1
}

/** Becher, an denen ein Spieler beteiligt war ("beide" zählt für jeden der beiden). */
export function playerCups(result: MatchResult, team: Team, playerId: string): number {
  const index = team.playerIds.indexOf(playerId)
  if (index < 0) return 0
  return (result.cups[team.id] ?? []).filter((m) => markIncludes(m, index)).length
}

/** Ergebnis nur gültig, wenn der Gewinner (noch) in diesem Match steht – wichtig für K.O.-Spiele nach Korrekturen. */
export function validResult(state: TournamentState, match: Match): MatchResult | undefined {
  const result = state.results[match.id]
  if (!result || !match.team1Id || !match.team2Id) return undefined
  return result.winnerId === match.team1Id || result.winnerId === match.team2Id ? result : undefined
}

export function loserOf(match: Match, result: MatchResult | undefined): string | null {
  if (!result) return null
  return result.winnerId === match.team1Id ? match.team2Id : match.team1Id
}

export function teamById(state: TournamentState, id: string | null): Team | undefined {
  return id ? state.teams.find((t) => t.id === id) : undefined
}
