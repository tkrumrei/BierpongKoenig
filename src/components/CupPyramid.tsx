import type { CupMark, Player } from '../domain/types'

export type CupColor = 'red' | 'blue'

/**
 * Reihengrößen von der Tischkante zur Tischmitte: 6 → [3,2,1], 10 → [4,3,2,1], 3 → [2,1].
 * `tip` = wohin die Spitze zeigt (immer zur Tischmitte).
 */
function rows(count: number, tip: 'down' | 'up'): number[] {
  let n = 1
  while ((n * (n + 1)) / 2 < count) n++
  const fromEdge = Array.from({ length: n }, (_, i) => n - i)
  return tip === 'down' ? fromEdge : fromEdge.reverse()
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.trim().slice(0, 2)).toUpperCase()
}

/** Kürzel pro Spieler eines Teams; bei gleichen Kürzeln wird durchnummeriert (z. B. TO1/TO2). */
export function playerInitials(players: Player[]): string[] {
  const labels = players.map((p) => initials(p.name) || '?')
  return labels.length === 2 && labels[0] === labels[1] ? [`${labels[0]}1`, `${labels[1]}2`] : labels
}

export function nextMark(mark: CupMark, playerCount: number): CupMark {
  if (playerCount < 2) return mark === 0 ? 1 : 0
  return ((mark + 1) % 4) as CupMark
}

const COLORS: Record<CupColor, string> = {
  red: 'bg-cup border-white/70',
  blue: 'bg-cup-blue border-white/70',
}

export function CupPyramid({
  marks,
  players,
  onTap,
  start,
  count,
  tip,
  color,
}: {
  marks: CupMark[]
  players: Player[]
  onTap: (index: number) => void
  /** Bereich in `marks`, der als Pyramide gezeigt wird (Verlängerung = eigene Pyramide) */
  start: number
  count: number
  tip: 'down' | 'up'
  color: CupColor
}) {
  const labels = playerInitials(players)
  let index = start
  return (
    <div className="flex flex-col items-center gap-1.5">
      {rows(count, tip).map((size, r) => (
        <div key={r} className="flex gap-1.5">
          {Array.from({ length: size }, () => {
            const i = index++
            const mark = marks[i] ?? 0
            return (
              <button
                key={i}
                type="button"
                onClick={() => onTap(i)}
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 font-black leading-none transition active:scale-90 sm:h-14 sm:w-14 ${
                  mark === 0
                    ? `${COLORS[color]} shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]`
                    : 'border-dashed border-muted/60 bg-cup-hit text-ink/80'
                }`}
                aria-label={`Becher ${i + 1}${mark ? ' – getroffen' : ''}`}
              >
                {mark === 3 ? (
                  <span className="text-base">2×</span>
                ) : mark !== 0 ? (
                  <span className="text-sm">{labels[mark - 1]}</span>
                ) : null}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
