import type { Match, TournamentState } from '../domain/types'
import { jederGegenJeden, jederGegenJedenDoppel } from './jederGegenJeden'
import { ligaphase } from './ligaphase'
import { saufsuenden } from './saufsuenden'
import type { ModeSettings, TournamentMode } from './types'

export const MODES: Record<string, TournamentMode> = {
  [saufsuenden.id]: saufsuenden,
  [jederGegenJeden.id]: jederGegenJeden,
  [jederGegenJedenDoppel.id]: jederGegenJedenDoppel,
  [ligaphase.id]: ligaphase,
}

export function getMode(id: string): TournamentMode {
  const mode = MODES[id]
  if (!mode) throw new Error(`Unbekannter Turniermodus: ${id}`)
  return mode
}

export function allMatches(state: TournamentState, modeId: string): Match[] {
  return [...state.groupMatches, ...getMode(modeId).resolveKnockout(state)]
}

export type { ModeSettings, TournamentMode }
