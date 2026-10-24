import { shuffled } from '../domain/shuffle'
import type { Match, Team } from '../domain/types'
import { PLATZIERUNG_PLACEHOLDERS, platzierungsspiele } from './jederGegenJeden'
import type { TournamentMode } from './types'

const GROUP = 'A'

/** Mögliche Anzahl Gruppenspiele pro Spieler: jeder gleich oft, also muss Spieler × Spiele gerade sein. */
export function validGamesPerTeam(teamCount: number): number[] {
  return Array.from({ length: teamCount - 1 }, (_, i) => i + 1).filter((k) => (teamCount * k) % 2 === 0)
}

/** Nächster gültiger Wert (bei Gleichstand der kleinere), z. B. wenn sich die Spielerzahl ändert. */
export function closestGamesPerTeam(teamCount: number, wanted: number): number {
  const valid = validGamesPerTeam(teamCount)
  return valid.reduce((best, k) => (Math.abs(k - wanted) < Math.abs(best - wanted) ? k : best), valid[0])
}

/**
 * Abstände im Kreis: Spieler i spielt gegen i±d für jedes d. Die Abstände werden gleichmäßig
 * verteilt (z. B. 11 Spieler, 4 Spiele → 1 und 3); bei ungerader Spielanzahl kommt der Gegenüber dazu.
 */
function offsets(n: number, k: number): number[] {
  const pool = Math.ceil(n / 2) - 1
  const m = Math.floor(k / 2)
  const spread = Array.from({ length: m }, (_, i) => (m === pool ? i + 1 : 1 + Math.round((i * (pool - 1)) / Math.max(m - 1, 1))))
  return k % 2 ? [...spread, n / 2] : spread
}

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

export const ligaphase: TournamentMode = {
  id: 'ligaphase',
  name: 'Ligaphase',
  description:
    'Einzel wie in der Champions League: eine Tabelle, jeder spielt gleich viele Gruppenspiele gegen zufällig ausgeloste Gegner. Danach spielen Platz 1 und 2 das Finale, Platz 3 und 4 das Spiel um Platz 3.',
  teamCount: 11,
  teamCountRange: [4, 40],
  gamesPerTeam: 4,
  playersPerTeam: 1,
  groups: [GROUP],

  createGroupMatches(entered, settings, random: () => number = Math.random) {
    const n = entered.length
    const k = closestGamesPerTeam(n, settings?.gamesPerTeam ?? 4)
    // Auslosung: Wer gegen wen spielt, hängt nicht von der Eingabereihenfolge ab
    const teams = shuffled(entered, random)
    const pairs: [Team, Team][] = offsets(n, k).flatMap((d) =>
      teams
        // Beim Gegenüber (d = n/2) jedes Paar nur einmal
        .filter((_, i) => d !== n / 2 || i < d)
        .map((t, i): [Team, Team] => [t, teams[(i + d) % n]]),
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
