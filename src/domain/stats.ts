import { playerCups, validResult } from './results'
import type { Match, TournamentState } from './types'

export interface PlayerStat {
  playerId: string
  teamId: string | undefined
  matches: number
  cups: number
  average: number
}

export function playerStats(state: TournamentState, matches: Match[]): PlayerStat[] {
  const stats = new Map<string, PlayerStat>(
    state.players.map((p) => [
      p.id,
      {
        playerId: p.id,
        teamId: state.teams.find((t) => t.playerIds.includes(p.id))?.id,
        matches: 0,
        cups: 0,
        average: 0,
      },
    ]),
  )
  for (const match of matches) {
    const result = validResult(state, match)
    if (!result) continue
    for (const teamId of [match.team1Id, match.team2Id]) {
      const team = state.teams.find((t) => t.id === teamId)
      if (!team) continue
      for (const pid of team.playerIds) {
        const s = stats.get(pid)
        if (!s) continue
        s.matches++
        s.cups += playerCups(result, team, pid)
      }
    }
  }
  for (const s of stats.values()) s.average = s.matches ? s.cups / s.matches : 0
  return [...stats.values()].sort((a, b) => b.cups - a.cups || b.average - a.average)
}
