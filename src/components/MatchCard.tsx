import { teamById, teamCups, validResult } from '../domain/results'
import type { Match, TournamentState } from '../domain/types'

export function MatchCard({
  state,
  match,
  onOpen,
  placeholder,
}: {
  state: TournamentState
  match: Match
  onOpen: (match: Match) => void
  /** Text für noch unbekannte Teams, z. B. "2. Gruppe A" */
  placeholder?: [string, string]
}) {
  const result = validResult(state, match)
  const ready = Boolean(match.team1Id && match.team2Id)
  const sides = [match.team1Id, match.team2Id].map((id, i) => ({
    id,
    name: teamById(state, id)?.name ?? placeholder?.[i] ?? 'offen',
    known: Boolean(id),
    cups: result && id ? teamCups(result, id) : null,
    won: result?.winnerId === id,
  }))

  return (
    <button
      disabled={!ready}
      onClick={() => onOpen(match)}
      className={`w-full rounded-xl border p-3 text-left transition ${
        ready ? 'border-line bg-surface hover:border-beer/60' : 'border-dashed border-line opacity-60'
      }`}
    >
      <div className="mb-1 flex justify-between text-xs text-subtle">
        <span>{match.label}</span>
        <span>
          {result?.deathCup && '☠️ '}
          {result?.overtime && '⏱️ '}
          {result?.multiHit && '➕ '}
          {ready && !result && <span className="text-beer-ink">Eintragen →</span>}
        </span>
      </div>
      {sides.map((s, i) => (
        <div key={i} className="flex items-center justify-between py-0.5">
          <span className={`${s.won ? 'font-bold text-beer-ink' : ''} ${s.known ? '' : 'text-subtle italic'}`}>
            {s.won && '🏆 '}
            {s.name}
          </span>
          <span className="font-mono tabular-nums">{s.cups ?? ''}</span>
        </div>
      ))}
    </button>
  )
}
