import type { Match, Team } from '../domain/types'
import { PLATZIERUNG_PLACEHOLDERS, platzierungsspiele } from './jederGegenJeden'
import type { TournamentMode } from './types'

const GROUP = 'A'
/** Spieler i spielt gegen i±1 und i±3 (im Kreis) → jeder hat genau 4 verschiedene Gegner */
const OFFSETS = [1, 3]

/**
 * Sortiert die Spiele so, dass immer die am längsten wartenden Spieler als Nächstes dran sind.
 * Bei Gleichstand gewinnt das Spiel, das im Plan weiter vorne steht.
 */
function restedOrder(pairs: [Team, Team][]): [Team, Team][] {
  const lastPlayed = new Map<string, number>()
  const remaining = [...pairs]
  const order: [Team, Team][] = []
  const last = (t: Team) => lastPlayed.get(t.id) ?? -Infinity
  while (remaining.length) {
    let best = 0
    for (let i = 1; i < remaining.length; i++) {
      const [a, b] = remaining[i]
      const [x, y] = remaining[best]
      if (Math.max(last(a), last(b)) < Math.max(last(x), last(y))) best = i
    }
    const [pair] = remaining.splice(best, 1)
    for (const t of pair) lastPlayed.set(t.id, order.length)
    order.push(pair)
  }
  return order
}

export const elferRunde: TournamentMode = {
  id: 'elfer-runde',
  name: '11er-Runde',
  description:
    '11 Spieler im Einzel, jeder spielt 4 Gruppenspiele gegen wechselnde Gegner. Danach spielen Platz 1 und 2 das Finale, Platz 3 und 4 das Spiel um Platz 3 – so hat niemand mehr als 5 Spiele.',
  teamCount: 11,
  playersPerTeam: 1,
  groups: [GROUP],

  createGroupMatches(teams) {
    const n = teams.length
    const pairs: [Team, Team][] = OFFSETS.flatMap((offset) =>
      teams.map((t, i): [Team, Team] => [t, teams[(i + offset) % n]]),
    )
    return restedOrder(pairs).map(([a, b], i): Match => ({
      id: `g${GROUP}${i + 1}`,
      stage: 'group',
      label: `Spiel ${i + 1}`,
      group: GROUP,
      team1Id: a.id,
      team2Id: b.id,
    }))
  },

  resolveKnockout: platzierungsspiele,
  knockoutPlaceholders: PLATZIERUNG_PLACEHOLDERS,
}
