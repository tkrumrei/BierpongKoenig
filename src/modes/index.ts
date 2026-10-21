import type { Match, TournamentState } from '../domain/types'
import { saufsuenden } from './saufsuenden'
import type { TournamentMode } from './types'

export const MODES: Record<string, TournamentMode> = {
  [saufsuenden.id]: saufsuenden,
}

export function getMode(id: string): TournamentMode {
  const mode = MODES[id]
  if (!mode) throw new Error(`Unbekannter Turniermodus: ${id}`)
  return mode
}

export function allMatches(state: TournamentState, modeId: string): Match[] {
  return [...state.groupMatches, ...getMode(modeId).resolveKnockout(state)]
}

export type { TournamentMode }
