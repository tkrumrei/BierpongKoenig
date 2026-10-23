import type { Match, Team } from './types'

/**
 * Jeder gegen jeden nach der Kreismethode: Spiele werden Runde für Runde sortiert,
 * damit niemand ewig wartet. Bei ungerader Anzahl setzt pro Runde ein Team aus.
 */
export function roundRobin(teams: Team[], group: string): Match[] {
  const slots: (Team | null)[] = teams.length % 2 ? [...teams, null] : [...teams]
  const n = slots.length
  const pairs: [Team, Team][] = []
  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const a = slots[i]
      const b = slots[n - 1 - i]
      // Heim/Auswärts abwechseln, damit nicht immer dasselbe Team links steht
      if (a && b) pairs.push(round % 2 ? [b, a] : [a, b])
    }
    // Erstes Team bleibt stehen, alle anderen rotieren
    slots.splice(1, 0, slots.pop()!)
  }
  return pairs.map(([a, b], i) => ({
    id: `g${group}${i + 1}`,
    stage: 'group',
    label: `Spiel ${i + 1}`,
    group,
    team1Id: a.id,
    team2Id: b.id,
  }))
}
