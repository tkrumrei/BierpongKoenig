export interface Player {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
  playerIds: string[]
  group: string
}

/** 'place' = Spiel um Platz 5, 7, … */
export type Stage = 'group' | 'qf' | 'sf' | 'place' | 'p3' | 'final'

export interface Match {
  id: string
  stage: Stage
  label: string
  group?: string
  team1Id: string | null
  team2Id: string | null
}

/** Wer einen Becher getroffen hat: 0 = nicht getroffen, 1 = Spieler 1, 2 = Spieler 2, 3 = beide */
export type CupMark = 0 | 1 | 2 | 3

export interface MatchResult {
  winnerId: string
  /**
   * Pro Team-ID die Becher, die DIESES Team beim Gegner getroffen hat.
   * Länge = Becheranzahl (+3 bei Verlängerung, § 7 TBG).
   */
  cups: Record<string, CupMark[]>
  deathCup: boolean
  overtime: boolean
  /** Letzter Becher zählte mehrfach (beide Bälle oder Aufsetzer) → direkter Sieg ohne Verlängerung */
  multiHit?: boolean
}

export interface TournamentState {
  players: Player[]
  teams: Team[]
  groupMatches: Match[]
  results: Record<string, MatchResult>
}

export interface Tournament {
  id: string
  code: string
  name: string
  mode: string
  cups: number
  state: TournamentState
  version: number
  created_at: string
}
