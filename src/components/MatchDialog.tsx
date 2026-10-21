import { useState } from 'react'
import type { CupMark, Match, MatchResult, Team, TournamentState } from '../domain/types'
import { CupPyramid, nextMark, playerInitials, type CupColor } from './CupPyramid'
import { Button } from './ui'

const OVERTIME_CUPS = 3 // § 7 TBG

function fit(marks: CupMark[] | undefined, length: number): CupMark[] {
  return Array.from({ length }, (_, i) => marks?.[i] ?? 0)
}

export function MatchDialog({
  state,
  match,
  cups,
  onSave,
  onClose,
}: {
  state: TournamentState
  match: Match
  cups: number
  onSave: (result: MatchResult | null) => Promise<void>
  onClose: () => void
}) {
  const team1 = state.teams.find((t) => t.id === match.team1Id)!
  const team2 = state.teams.find((t) => t.id === match.team2Id)!
  const existing = state.results[match.id]

  const [overtime, setOvertime] = useState(existing?.overtime ?? false)
  const total = cups + (overtime ? OVERTIME_CUPS : 0)
  const [marks, setMarks] = useState<Record<string, CupMark[]>>(() => ({
    [team1.id]: fit(existing?.cups[team1.id], cups + OVERTIME_CUPS),
    [team2.id]: fit(existing?.cups[team2.id], cups + OVERTIME_CUPS),
  }))
  const [deathCup, setDeathCup] = useState(existing?.deathCup ?? false)
  const [multiHit, setMultiHit] = useState(existing?.multiHit ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hitCount = (teamId: string, length = total) =>
    marks[teamId].slice(0, length).filter((m) => m !== 0).length

  /** Automatischer Sieger: genau ein Team hat alle Becher abgeräumt. */
  const cleared = [team1, team2].filter((t) => hitCount(t.id) === total)
  const autoWinner = cleared.length === 1 ? cleared[0].id : null

  // Manuelle Wahl (z. B. bei Todesbecher) hat Vorrang vor der automatischen
  const [manualWinner, setManualWinner] = useState<string | null>(() => {
    if (!existing) return null
    const existingTotal = cups + (existing.overtime ? OVERTIME_CUPS : 0)
    const clearedBefore = (existing.cups[existing.winnerId] ?? []).filter((m) => m !== 0).length === existingTotal
    return clearedBefore ? null : existing.winnerId
  })
  const winnerId = manualWinner ?? autoWinner

  function tap(shooter: Team, index: number) {
    const updated = [...marks[shooter.id]]
    updated[index] = nextMark(updated[index], shooter.playerIds.length)
    setMarks({ ...marks, [shooter.id]: updated })
  }

  function chooseWinner(teamId: string) {
    setManualWinner((current) => (current === teamId ? null : teamId))
  }

  async function save(result: MatchResult | null) {
    setSaving(true)
    setError(null)
    try {
      await onSave(result)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  const playersOf = (team: Team) => team.playerIds.map((id) => state.players.find((p) => p.id === id)!)

  function TeamLabel({ team }: { team: Team }) {
    return (
      <div className={`rounded-lg px-3 py-2 ${winnerId === team.id ? 'bg-surface/80 ring-2 ring-beer' : 'bg-surface/50'}`}>
        <div className="flex items-baseline justify-between">
          <span className="font-bold">
            {winnerId === team.id && '🏆 '}
            {team.name}
          </span>
          <span className="text-2xl font-black tabular-nums">
            {hitCount(team.id)}
            <span className="text-sm text-subtle">/{total}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {playersOf(team).map((p, i) => (
            <span key={p.id} className="flex items-center gap-1">
              <span className="rounded bg-cup-hit px-1 font-black text-ink/80">{playerInitials(playersOf(team))[i]}</span>
              {p.name}
            </span>
          ))}
        </div>
      </div>
    )
  }

  /** Tischhälfte eines Teams: hier stehen SEINE Becher, eingetragen werden die Treffer des Gegners (`shooter`). */
  function TableSide({ shooter, tip, color }: { shooter: Team; tip: 'down' | 'up'; color: CupColor }) {
    const pyramid = (start: number, count: number) => (
      <CupPyramid
        marks={marks[shooter.id]}
        players={playersOf(shooter)}
        start={start}
        count={count}
        tip={tip}
        color={color}
        onTap={(i) => tap(shooter, i)}
      />
    )
    const parts = [pyramid(0, cups)]
    if (overtime) parts.push(pyramid(cups, OVERTIME_CUPS))
    // Reihenfolge von der Tischkante zur Mitte: oben Hauptpyramide zuerst, unten umgekehrt
    if (tip === 'up') parts.reverse()
    return (
      <div className="flex flex-col items-center gap-4 py-2">
        {parts.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg/95 backdrop-blur" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">{match.label}</h2>
          <button onClick={onClose} className="rounded-lg px-3 py-1 text-2xl text-muted hover:text-ink" aria-label="Schließen">
            ×
          </button>
        </div>

        <p className="text-xs text-muted">
          Getroffene Becher auf der Seite des Gegners antippen: 1× = Spieler 1 · 2× = Spieler 2 · 3× = beide · 4× = wieder
          zurücksetzen
        </p>

        {/* Tisch: Team 1 oben, Team 2 unten – jede Seite zeigt die eigenen Becher, die Spitzen zeigen zur Mitte */}
        <div className="mx-auto max-w-md space-y-2 rounded-2xl border-4 border-wood-dark bg-wood shadow-inner p-3">
          {TeamLabel({ team: team1 })}
          {TableSide({ shooter: team2, tip: 'down', color: 'red' })}
          <div className="my-2 border-t-2 border-dashed border-wood-dark/60" />
          {TableSide({ shooter: team1, tip: 'up', color: 'blue' })}
          {TeamLabel({ team: team2 })}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted">
            Gewinner{' '}
            <span className="text-xs">
              {manualWinner ? '(manuell gewählt – nochmal tippen zum Aufheben)' : autoWinner ? '(automatisch: alle Becher getroffen)' : ''}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[team1, team2].map((t) => (
              <Button key={t.id} variant={winnerId === t.id ? 'primary' : 'secondary'} onClick={() => chooseWinner(t.id)}>
                🏆 {t.name}
              </Button>
            ))}
          </div>
          {cleared.length === 2 && !manualWinner && (
            <p className="text-xs text-beer-ink">
              Beide Teams haben alle Becher getroffen → Verlängerung (§ 7) ankreuzen.
              <br />
              Zählte der letzte Becher mehrfach (beide Bälle oder Aufsetzer), gewinnt dieses Team direkt: „Mehrtreffer“ ankreuzen und
              Sieger oben antippen.
            </p>
          )}
          {multiHit && !winnerId && <p className="text-xs text-beer-ink">Mehrtreffer: Bitte den Sieger oben antippen.</p>}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={deathCup} onChange={(e) => setDeathCup(e.target.checked)} className="h-4 w-4 accent-[var(--color-beer)]" />
            ☠️ Todesbecher getroffen (§ 5 Abs. 2)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={overtime} onChange={(e) => setOvertime(e.target.checked)} className="h-4 w-4 accent-[var(--color-beer)]" />
            ⏱️ Verlängerung (+3 Becher, § 7)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={multiHit} onChange={(e) => setMultiHit(e.target.checked)} className="h-4 w-4 accent-[var(--color-beer)]" />
            ➕ Mehrtreffer: letzter Becher zählt mehrfach – beide Bälle oder Aufsetzer (§ 4 Abs. 4–5)
          </label>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-2">
          {existing && (
            <Button variant="ghost" disabled={saving} onClick={() => save(null)}>
              Ergebnis löschen
            </Button>
          )}
          <Button
            className="flex-1 py-3"
            disabled={!winnerId || saving}
            onClick={() =>
              save({
                winnerId: winnerId!,
                cups: { [team1.id]: marks[team1.id].slice(0, total), [team2.id]: marks[team2.id].slice(0, total) },
                deathCup,
                overtime,
                multiHit,
              })
            }
          >
            {saving ? 'Speichert…' : 'Speichern'}
          </Button>
        </div>
      </div>
    </div>
  )
}
