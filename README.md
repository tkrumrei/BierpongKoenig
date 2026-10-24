# 🍺 BierpongKönig

Turnier-App für Bierpong nach dem **Telgter Bier Gesetz (TBG)**.
Wer ein Turnier erstellt, bekommt einen Code. Alle mit diesem Code können live mitsehen und Ergebnisse eintragen.

- React + TypeScript + Vite + Tailwind
- Supabase (Postgres + Realtime) als Datenbank
- Gehostet auf GitHub Pages

## Turniermodus „Saufsünden“

6 Doppel-Teams in 2 Gruppen à 3 Teams, jeder gegen jeden. Die Tabelle wird so sortiert: Siege → Becherdifferenz → direkter Vergleich.

| Spiel | Paarung |
|---|---|
| Viertelfinale A | 2. Gruppe A vs. 3. Gruppe B |
| Viertelfinale B | 2. Gruppe B vs. 3. Gruppe A |
| Halbfinale 1 | 1. Gruppe A vs. Sieger VF B |
| Halbfinale 2 | 1. Gruppe B vs. Sieger VF A |
| Spiel um Platz 3 | Verlierer der Halbfinals |
| Finale | Sieger der Halbfinals |

## Turniermodus „Jeder gegen Jeden“ (Einzel und Doppel)

Einzel mit 4–10 Spielern bzw. Doppel mit 4–10 Teams (beim Erstellen wählbar) in einer Gruppe, jeder gegen jeden. Tabelle wie oben: Siege → Becherdifferenz → direkter Vergleich.

| Spiel | Paarung |
|---|---|
| Spiel um Platz 3 | 3. vs. 4. der Tabelle |
| Finale | 1. vs. 2. der Tabelle |

## Turniermodus „Ligaphase“

Einzel wie die Champions-League-Ligaphase: eine Tabelle, jeder spielt gleich viele Gruppenspiele gegen beim Turnierstart zufällig ausgeloste Gegner. Spielerzahl (4–40) und Gruppenspiele pro Spieler sind beim Erstellen wählbar – bei ungerader Spielerzahl nur eine gerade Anzahl, damit jeder gleich oft spielt. Die Spiele sind so sortiert, dass möglichst niemand direkt hintereinander spielt.

Danach hat jeder ein Platzierungsspiel: 1. vs. 2. im Finale, 3. vs. 4. um Platz 3, 5. vs. 6. um Platz 5 usw. Bei ungerader Spielerzahl ist der Letzte der Tabelle ohne weiteres Spiel Letzter.

Beispiel: 11 Spieler mit je 4 Gruppenspielen → 22 Gruppenspiele + 5 Platzierungsspiele; alle spielen 5 Spiele, nur der 11. spielt 4.

Weitere Modi kommen als eigene Datei nach `src/modes/` und werden in `src/modes/index.ts` registriert.

## Einrichtung

### 1. Supabase
1. Auf [supabase.com](https://supabase.com) ein kostenloses Projekt anlegen.
2. Im **SQL Editor** den Inhalt von [`supabase/schema.sql`](supabase/schema.sql) ausführen.
3. Unter **Project Settings → API** die **Project URL** und den **anon public key** kopieren.

### 2. Lokal entwickeln
```bash
cp .env.example .env.local   # URL + anon key eintragen
npm install
npm run dev
npm test
```

### 3. GitHub Pages
1. Im Repo unter **Settings → Secrets and variables → Actions** zwei Secrets anlegen: `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`.
2. Unter **Settings → Pages → Source** „GitHub Actions“ auswählen.
3. Auf `main` pushen. Die App ist danach unter `https://<user>.github.io/BierpongKoenig/` erreichbar.

> Der anon key darf öffentlich im Frontend stehen. Die Datenbank ist bewusst offen: Wer einen Code kennt, darf das Turnier bearbeiten, Löschen ist nicht möglich.
