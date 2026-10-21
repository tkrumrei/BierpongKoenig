import type { Tournament, TournamentState } from '../domain/types'
import { generateCode } from './code'
import { db } from './supabase'

const TABLE = 'tournaments'

export async function createTournament(input: {
  name: string
  mode: string
  cups: number
  state: TournamentState
}): Promise<Tournament> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await db()
      .from(TABLE)
      .insert({ ...input, code: generateCode() })
      .select()
      .single()
    if (!error) return data as Tournament
    // 23505 = unique_violation → Code schon vergeben, neuer Versuch
    if (error.code !== '23505') throw error
  }
  throw new Error('Konnte keinen freien Turniercode erzeugen.')
}

export async function loadTournament(code: string): Promise<Tournament | null> {
  const { data, error } = await db().from(TABLE).select().eq('code', code).maybeSingle()
  if (error) throw error
  return data as Tournament | null
}

/** Live-Updates für ein Turnier. Gibt eine Funktion zum Abmelden zurück. */
export function subscribeTournament(id: string, onChange: (t: Tournament) => void): () => void {
  const client = db()
  const channel = client
    .channel(`tournament-${id}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE, filter: `id=eq.${id}` }, (payload) =>
      onChange(payload.new as Tournament),
    )
    .subscribe()
  return () => {
    client.removeChannel(channel)
  }
}

/**
 * Wendet eine Änderung auf den aktuellsten Stand an (optimistisches Locking über `version`).
 * Hat parallel jemand anderes gespeichert, wird neu geladen und die Änderung erneut angewendet.
 */
export async function updateTournament(
  id: string,
  change: (state: TournamentState) => TournamentState,
): Promise<Tournament> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: current, error: loadError } = await db().from(TABLE).select().eq('id', id).single()
    if (loadError) throw loadError
    const t = current as Tournament
    const { data, error } = await db()
      .from(TABLE)
      .update({ state: change(t.state), version: t.version + 1 })
      .eq('id', id)
      .eq('version', t.version)
      .select()
    if (error) throw error
    if (data && data.length > 0) return data[0] as Tournament
  }
  throw new Error('Speichern fehlgeschlagen – zu viele gleichzeitige Änderungen. Bitte nochmal versuchen.')
}
