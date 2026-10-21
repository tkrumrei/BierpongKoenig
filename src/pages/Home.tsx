import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Card, Input, SectionTitle } from '../components/ui'
import { normalizeCode } from '../lib/code'
import { getRecent } from '../lib/recent'

export function Home() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const recent = getRecent()

  return (
    <div className="space-y-6">
      <section className="py-6 text-center">
        <h1 className="text-3xl font-black">Wer wird Bierpong-König?</h1>
        <p className="mt-2 text-muted">Turnier erstellen, Code teilen, alle tragen live ein.</p>
      </section>

      <Card>
        <SectionTitle>Turnier beitreten</SectionTitle>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const c = normalizeCode(code)
            if (c) navigate(`/t/${c}`)
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            maxLength={8}
            autoCapitalize="characters"
            className="text-center font-mono text-xl tracking-[0.3em]"
          />
          <Button type="submit" disabled={!normalizeCode(code)}>
            Los
          </Button>
        </form>
      </Card>

      <Link
        to="/neu"
        className="block rounded-lg bg-beer py-4 text-center text-lg font-bold text-ink transition hover:bg-beer-dark"
      >
        + Neues Turnier erstellen
      </Link>

      {recent.length > 0 && (
        <Card>
          <SectionTitle>Zuletzt geöffnet</SectionTitle>
          <ul className="divide-y divide-line">
            {recent.map((r) => (
              <li key={r.code}>
                <Link to={`/t/${r.code}`} className="flex items-center justify-between py-2.5 hover:text-beer-ink">
                  <span>{r.name}</span>
                  <span className="font-mono text-sm text-subtle">{r.code}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
