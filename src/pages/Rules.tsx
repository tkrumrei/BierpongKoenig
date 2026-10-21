import { useState } from 'react'
import { TBG, TBG_VERSION } from '../rules'

// Bierpong-relevante Paragraphen werden standardmäßig aufgeklappt
const BIERPONG = new Set([4, 5, 6, 7, 8, 9])

export function RulesContent() {
  const [open, setOpen] = useState<Set<number>>(() => new Set(BIERPONG))

  const toggle = (id: number) =>
    setOpen((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-black">Telgter Bier Gesetz (TBG)</h1>
          <p className="text-sm text-muted">{TBG_VERSION}</p>
        </div>
        <a href={`${import.meta.env.BASE_URL}TBG.pdf`} target="_blank" rel="noreferrer" className="text-sm text-beer-ink">
          PDF ↗
        </a>
      </div>
      {TBG.map((section) => (
        <div key={section.id} className="rounded-xl border border-line bg-surface">
          <button onClick={() => toggle(section.id)} className="flex w-full items-center justify-between p-3 text-left">
            <span>
              <span className="mr-2 font-mono text-beer-ink">§ {section.id}</span>
              <span className="font-semibold">{section.title}</span>
            </span>
            <span className="text-subtle">{open.has(section.id) ? '−' : '+'}</span>
          </button>
          {open.has(section.id) && (
            <ol className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-ink">
              {section.paragraphs.map((p, i) => (
                <li key={i} className="flex gap-2">
                  {section.paragraphs.length > 1 && <span className="shrink-0 text-subtle">({i + 1})</span>}
                  {typeof p === 'string' ? (
                    <span>{p}</span>
                  ) : (
                    <div>
                      {p.text}
                      <ol className="mt-1 list-decimal space-y-1 pl-5">
                        {p.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  )
}

export function Rules() {
  return <RulesContent />
}
