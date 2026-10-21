import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Card, Input, SectionTitle } from '../components/ui'
import { shuffleNames } from '../domain/shuffle'
import type { Player, Team } from '../domain/types'
import { newId } from '../lib/code'
import { rememberTournament } from '../lib/recent'
import { createTournament } from '../lib/tournamentStore'
import { MODES, getMode } from '../modes'

function emptySetup(modeId: string) {
  const mode = getMode(modeId)
  const players: Player[] = Array.from({ length: mode.teamCount * mode.playersPerTeam }, () => ({
    id: newId(),
    name: '',
  }))
  const teamsPerGroup = mode.teamCount / mode.groups.length
  const teams: Team[] = Array.from({ length: mode.teamCount }, (_, i) => ({
    id: newId(),
    name: '',
    playerIds: players.slice(i * mode.playersPerTeam, (i + 1) * mode.playersPerTeam).map((p) => p.id),
    group: mode.groups[Math.floor(i / teamsPerGroup)],
  }))
  return { players, teams }
}

export function CreateTournament() {
  const navigate = useNavigate()
  const [modeId, setModeId] = useState(Object.keys(MODES)[0])
  const mode = getMode(modeId)
  const [name, setName] = useState('')
  const cups = 6
  const [{ players, teams }, setSetup] = useState(() => emptySetup(modeId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playerName = (id: string) => players.find((p) => p.id === id)?.name.trim() ?? ''
  const filledCount = players.filter((p) => p.name.trim()).length

  const problems = useMemo(() => {
    const list: string[] = []
    const filled = (id: string) => Boolean(players.find((p) => p.id === id)?.name.trim())
    if (!name.trim()) list.push('Turniername fehlt')
    // Ein-Personen-Teams sind erlaubt (§ 4 Abs. 1 TBG), leere Teams nicht
    if (teams.some((t) => !t.playerIds.some(filled))) list.push('Jedes Team braucht mindestens einen Spieler')
    return list
  }, [name, players, teams])

  function changeMode(id: string) {
    setModeId(id)
    setSetup(emptySetup(id))
  }

  function setPlayerName(id: string, value: string) {
    setSetup((s) => ({ ...s, players: s.players.map((p) => (p.id === id ? { ...p, name: value } : p)) }))
  }

  function updateTeam(id: string, patch: Partial<Team>) {
    setSetup((s) => ({ ...s, teams: s.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  }

  function shuffle() {
    setSetup((s) => ({ ...s, players: shuffleNames(s.players, s.teams) }))
  }

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      // Leere Plätze fallen weg → Teams mit nur einem Spieler
      const finalPlayers = players.filter((p) => p.name.trim()).map((p) => ({ ...p, name: p.name.trim() }))
      const finalTeams = teams.map((t, i) => {
        const playerIds = t.playerIds.filter((id) => playerName(id))
        return {
          ...t,
          playerIds,
          name: t.name.trim() || playerIds.map(playerName).join(' & ') || `Team ${i + 1}`,
        }
      })
      const t = await createTournament({
        name: name.trim(),
        mode: modeId,
        cups,
        state: {
          players: finalPlayers,
          teams: finalTeams,
          groupMatches: mode.createGroupMatches(finalTeams),
          results: {},
        },
      })
      rememberTournament({ code: t.code, name: t.name })
      navigate(`/t/${t.code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Neues Turnier</h1>

      <Card className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Silvester 2026" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Turniermodus</label>
          <div className="grid gap-2">
            {Object.values(MODES).map((m) => (
              <button
                key={m.id}
                onClick={() => changeMode(m.id)}
                className={`rounded-lg border p-3 text-left ${m.id === modeId ? 'border-beer bg-beer/10' : 'border-line'}`}
              >
                <div className="font-bold">
                  {m.name}{' '}
                  <span className="text-xs font-normal text-muted">
                    · {m.playersPerTeam === 2 ? 'Doppel' : 'Einzel'} · {m.teamCount} Teams
                  </span>
                </div>
                <div className="text-sm text-muted">{m.description}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Becher pro Team</label>
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1">
              6 Becher
            </Button>
            {/* 10 Becher vorerst deaktiviert */}
            <Button variant="secondary" disabled className="flex-1" title="Kommt später">
              10 Becher <span className="text-xs">(bald)</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <SectionTitle>
            Teams · {filledCount}/{players.length} Spieler
          </SectionTitle>
          <Button
            variant="secondary"
            onClick={shuffle}
            disabled={filledCount < teams.length}
            title="Namen zufällig auf alle Teams verteilen (mind. ein Spieler pro Team)"
            className="text-sm"
          >
            🎲 Zufällig
          </Button>
        </div>
        <div className="space-y-5">
          {mode.groups.map((g) => (
            <div key={g}>
              <h3 className="mb-2 font-bold text-beer-ink">Gruppe {g}</h3>
              <div className="space-y-2">
                {teams
                  .filter((t) => t.group === g)
                  .map((t) => {
                    const number = teams.indexOf(t) + 1
                    return (
                      <div key={t.id} className="space-y-2 rounded-lg bg-surface-2 p-3">
                        <Input
                          value={t.name}
                          onChange={(e) => updateTeam(t.id, { name: e.target.value })}
                          placeholder={`Teamname (optional) – Team ${number}`}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {t.playerIds.map((pid, slot) => (
                            <Input
                              key={pid}
                              value={players.find((p) => p.id === pid)?.name ?? ''}
                              onChange={(e) => setPlayerName(pid, e.target.value)}
                              placeholder={slot === 0 ? "Spieler 1" : "Spieler 2 (optional)"}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {problems.length > 0 && (
        <ul className="list-inside list-disc text-sm text-muted">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button className="w-full py-4 text-lg" disabled={problems.length > 0 || saving} onClick={submit}>
        {saving ? 'Wird erstellt…' : 'Turnier starten'}
      </Button>
    </div>
  )
}
