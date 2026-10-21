import type { Player, Team } from './types'

export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

/**
 * Verteilt die eingetragenen Namen zufällig auf alle Spieler-Plätze der Teams.
 * Plätze (und damit Teams und Gruppen) bleiben fest – nur wer wo steht, ändert sich.
 * Bei weniger Spielern als Plätzen (z. B. 11 statt 12) bekommt zuerst jedes Team einen Spieler,
 * die übrigen Namen landen auf zufälligen zweiten Plätzen. So bleibt nie ein Team leer.
 */
export function shuffleNames(players: Player[], teams: Team[], random: () => number = Math.random): Player[] {
  const names = shuffled(
    players.map((p) => p.name).filter((n) => n.trim()),
    random,
  )
  const slotOrder = [
    ...teams.map((t) => t.playerIds[0]),
    ...shuffled(teams.flatMap((t) => t.playerIds.slice(1)), random),
  ]
  const byId = new Map(slotOrder.map((id, i) => [id, names[i] ?? '']))
  return players.map((p) => ({ ...p, name: byId.get(p.id) ?? '' }))
}
