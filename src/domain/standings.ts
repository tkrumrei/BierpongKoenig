import { teamCups, validResult } from './results'
import type { Match, TournamentState } from './types'

export interface StandingRow {
  teamId: string
  played: number
  wins: number
  losses: number
  cupsFor: number
  cupsAgainst: number
  diff: number
}

function playedMatches(state: TournamentState, matches: Match[]) {
  return matches.flatMap((m) => {
    const result = validResult(state, m)
    return result ? [{ match: m, result }] : []
  })
}

/** Tabelle einer Gruppe: Siege → Becherdifferenz → direkter Vergleich → getroffene Becher. */
export function groupStandings(state: TournamentState, group: string): StandingRow[] {
  const teams = state.teams.filter((t) => t.group === group)
  const matches = state.groupMatches.filter((m) => m.group === group)
  const rows = new Map<string, StandingRow>(
    teams.map((t) => [t.id, { teamId: t.id, played: 0, wins: 0, losses: 0, cupsFor: 0, cupsAgainst: 0, diff: 0 }]),
  )
  const played = playedMatches(state, matches)

  for (const { match, result } of played) {
    const t1 = match.team1Id!
    const t2 = match.team2Id!
    const c1 = teamCups(result, t1)
    const c2 = teamCups(result, t2)
    for (const [teamId, own, other] of [[t1, c1, c2], [t2, c2, c1]] as const) {
      const row = rows.get(teamId)
      if (!row) continue
      row.played++
      row.cupsFor += own
      row.cupsAgainst += other
      if (result.winnerId === teamId) row.wins++
      else row.losses++
    }
  }
  for (const row of rows.values()) row.diff = row.cupsFor - row.cupsAgainst

  const headToHeadWins = (teamId: string, among: Set<string>) =>
    played.filter(
      ({ match, result }) =>
        result.winnerId === teamId && among.has(match.team1Id!) && among.has(match.team2Id!),
    ).length

  const sorted = [...rows.values()].sort((a, b) => b.wins - a.wins || b.diff - a.diff)

  // Direkter Vergleich innerhalb von Blöcken mit gleichen Siegen und gleicher Differenz
  const ranked: StandingRow[] = []
  for (let i = 0; i < sorted.length; ) {
    let j = i + 1
    while (j < sorted.length && sorted[j].wins === sorted[i].wins && sorted[j].diff === sorted[i].diff) j++
    const block = sorted.slice(i, j)
    const among = new Set(block.map((r) => r.teamId))
    block.sort(
      (a, b) => headToHeadWins(b.teamId, among) - headToHeadWins(a.teamId, among) || b.cupsFor - a.cupsFor,
    )
    ranked.push(...block)
    i = j
  }
  return ranked
}

export function groupComplete(state: TournamentState, group: string): boolean {
  return state.groupMatches.filter((m) => m.group === group).every((m) => validResult(state, m))
}
