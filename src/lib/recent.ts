// Zuletzt geöffnete Turniere – nur eine Bequemlichkeit pro Gerät.
const KEY = 'bierpong-recent'

export interface RecentTournament {
  code: string
  name: string
}

export function getRecent(): RecentTournament[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as RecentTournament[]
  } catch {
    return []
  }
}

export function rememberTournament(entry: RecentTournament) {
  try {
    const list = [entry, ...getRecent().filter((r) => r.code !== entry.code)].slice(0, 8)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // Speicher nicht verfügbar – egal
  }
}
