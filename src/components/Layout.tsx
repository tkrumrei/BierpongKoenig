import { Link, Outlet } from 'react-router'
import { supabaseConfigured } from '../lib/supabase'

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mb-4 bg-head text-surface shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-black tracking-tight">
            🍺 Bierpong<span className="text-beer">König</span>
          </Link>
          <Link to="/regeln" className="text-sm text-surface-2/80 hover:text-surface">
            Regeln (TBG)
          </Link>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
      {!supabaseConfigured && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Supabase ist nicht konfiguriert. Lege eine <code>.env.local</code> mit <code>VITE_SUPABASE_URL</code> und{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> an (siehe README).
        </div>
      )}
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
      </div>
    </div>
  )
}
