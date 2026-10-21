import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { MatchCard } from '../components/MatchCard'
import { MatchDialog } from '../components/MatchDialog'
import { Card, SectionTitle } from '../components/ui'
import { teamById, validResult } from '../domain/results'
import { groupStandings } from '../domain/standings'
import { playerStats } from '../domain/stats'
import type { Match, MatchResult, Tournament } from '../domain/types'
import { normalizeCode } from '../lib/code'
import { rememberTournament } from '../lib/recent'
import { supabaseConfigured } from '../lib/supabase'
import { loadTournament, subscribeTournament, updateTournament } from '../lib/tournamentStore'
import { getMode } from '../modes'
import { RulesContent } from './Rules'

type Tab = 'gruppen' | 'ko' | 'statistik' | 'regeln'

const TABS: [Tab, string][] = [
  ['gruppen', 'Gruppen'],
  ['ko', 'K.O.'],
  ['statistik', 'Statistik'],
  ['regeln', 'Regeln'],
]

// Platzhalter für K.O.-Spiele, solange die Teams noch nicht feststehen (Saufsünden)
const KO_PLACEHOLDERS: Record<string, [string, string]> = {
  qfA: ['2. Gruppe A', '3. Gruppe B'],
  qfB: ['2. Gruppe B', '3. Gruppe A'],
  sf1: ['1. Gruppe A', 'Sieger VF B'],
  sf2: ['1. Gruppe B', 'Sieger VF A'],
  p3: ['Verlierer HF 1', 'Verlierer HF 2'],
  final: ['Sieger HF 1', 'Sieger HF 2'],
}

export function TournamentPage() {
  const code = normalizeCode(useParams().code ?? '')
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [status, setStatus] = useState<'loading' | 'notfound' | 'error' | 'ok'>('loading')
  const [tab, setTab] = useState<Tab>('gruppen')
  const [openMatch, setOpenMatch] = useState<Match | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!supabaseConfigured) return
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    loadTournament(code)
      .then((t) => {
        if (cancelled) return
        if (!t) return setStatus('notfound')
        setTournament(t)
        setStatus('ok')
        rememberTournament({ code: t.code, name: t.name })
        unsubscribe = subscribeTournament(t.id, (updated) =>
          setTournament((current) => (!current || updated.version >= current.version ? updated : current)),
        )
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [code])

  const knockout = useMemo(
    () => (tournament ? getMode(tournament.mode).resolveKnockout(tournament.state) : []),
    [tournament],
  )

  if (status === 'notfound')
    return (
      <Card className="text-center">
        <p className="mb-2">Kein Turnier mit Code <b className="font-mono">{code}</b> gefunden.</p>
        <Link to="/" className="text-beer-ink">← Zurück</Link>
      </Card>
    )
  if (status === 'error') return <p className="text-red-700">Turnier konnte nicht geladen werden.</p>
  if (!tournament) return <p className="text-muted">Lädt…</p>

  const { state } = tournament
  const mode = getMode(tournament.mode)
  const final = knockout.find((m) => m.stage === 'final')
  const champion = final && validResult(state, final) ? teamById(state, validResult(state, final)!.winnerId) : undefined

  async function saveResult(match: Match, result: MatchResult | null) {
    const updated = await updateTournament(tournament!.id, (s) => {
      const results = { ...s.results }
      if (result) results[match.id] = result
      else delete results[match.id]
      return { ...s, results }
    })
    setTournament(updated)
  }

  async function share() {
    const url = `${location.origin}${location.pathname}#/t/${tournament!.code}`
    try {
      if (navigator.share) await navigator.share({ title: tournament!.name, text: `Turniercode: ${tournament!.code}`, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Teilen abgebrochen
    }
  }

  const stats = playerStats(state, [...state.groupMatches, ...knockout])
  const playerName = (id: string) => state.players.find((p) => p.id === id)?.name ?? '?'

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">{tournament.name}</h1>
          <p className="text-sm text-muted">
            {mode.name} · {tournament.cups} Becher · {mode.playersPerTeam === 2 ? 'Doppel' : 'Einzel'}
          </p>
        </div>
        <button onClick={share} className="shrink-0 rounded-lg bg-surface-2 px-3 py-2 text-center hover:bg-line">
          <div className="font-mono text-lg font-black tracking-widest text-beer-ink">{tournament.code}</div>
          <div className="text-[10px] text-muted">{copied ? 'Link kopiert!' : 'teilen'}</div>
        </button>
      </div>

      {champion && (
        <div className="rounded-xl border border-beer bg-beer/10 p-4 text-center">
          <div className="text-4xl">👑</div>
          <div className="text-sm text-ink">Bierpong-König</div>
          <div className="text-xl font-black text-beer-ink">{champion.name}</div>
        </div>
      )}

      <nav className="sticky top-0 z-10 -mx-4 flex gap-1 bg-bg/95 px-4 py-2 backdrop-blur">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${tab === id ? 'bg-beer text-ink' : 'text-muted hover:bg-surface-2'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'gruppen' && (
        <div className="space-y-6">
          {mode.groups.map((g) => {
            const rows = groupStandings(state, g)
            return (
              <section key={g}>
                <SectionTitle>Gruppe {g}</SectionTitle>
                <Card className="mb-3 overflow-x-auto p-0">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-subtle">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Team</th>
                        <th className="p-2">Sp</th>
                        <th className="p-2">S</th>
                        <th className="p-2">Becher</th>
                        <th className="p-2">Diff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => {
                        const team = teamById(state, r.teamId)!
                        return (
                          <tr key={r.teamId} className="border-t border-line">
                            <td className="p-2 text-subtle">{i + 1}.</td>
                            <td className="p-2">
                              <div className="font-semibold">{team.name}</div>
                              <div className="text-xs text-subtle">{team.playerIds.map(playerName).join(' & ')}</div>
                            </td>
                            <td className="p-2 text-center tabular-nums">{r.played}</td>
                            <td className="p-2 text-center font-bold tabular-nums">{r.wins}</td>
                            <td className="p-2 text-center tabular-nums">
                              {r.cupsFor}:{r.cupsAgainst}
                            </td>
                            <td className="p-2 text-center tabular-nums">{r.diff > 0 ? `+${r.diff}` : r.diff}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Card>
                <div className="grid gap-2 sm:grid-cols-3">
                  {state.groupMatches
                    .filter((m) => m.group === g)
                    .map((m) => (
                      <MatchCard key={m.id} state={state} match={m} onOpen={setOpenMatch} />
                    ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {tab === 'ko' && (
        <div className="space-y-5">
          {(
            [
              ['qf', 'Viertelfinale'],
              ['sf', 'Halbfinale'],
              ['p3', 'Spiel um Platz 3'],
              ['final', 'Finale'],
            ] as const
          ).map(([stage, title]) => (
            <section key={stage}>
              <SectionTitle>{title}</SectionTitle>
              <div className="grid gap-2 sm:grid-cols-2">
                {knockout
                  .filter((m) => m.stage === stage)
                  .map((m) => (
                    <MatchCard key={m.id} state={state} match={m} onOpen={setOpenMatch} placeholder={KO_PLACEHOLDERS[m.id]} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'statistik' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="text-xs text-subtle">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Spieler</th>
                <th className="p-2">Spiele</th>
                <th className="p-2">Becher</th>
                <th className="p-2">Ø</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={s.playerId} className="border-t border-line">
                  <td className="p-2 text-subtle">{i + 1}.</td>
                  <td className="p-2">
                    <div className="font-semibold">{playerName(s.playerId)}</div>
                    <div className="text-xs text-subtle">{teamById(state, s.teamId ?? null)?.name}</div>
                  </td>
                  <td className="p-2 text-center tabular-nums">{s.matches}</td>
                  <td className="p-2 text-center font-bold text-beer-ink tabular-nums">{s.cups}</td>
                  <td className="p-2 text-center tabular-nums">{s.average.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'regeln' && <RulesContent />}

      {openMatch && (
        <MatchDialog
          state={state}
          match={openMatch}
          cups={tournament.cups}
          onSave={(r) => saveResult(openMatch, r)}
          onClose={() => setOpenMatch(null)}
        />
      )}
    </div>
  )
}
