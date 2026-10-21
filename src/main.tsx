import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router'
import './index.css'
import { Layout } from './components/Layout'
import { CreateTournament } from './pages/CreateTournament'
import { Home } from './pages/Home'
import { Rules } from './pages/Rules'
import { TournamentPage } from './pages/Tournament'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="neu" element={<CreateTournament />} />
          <Route path="regeln" element={<Rules />} />
          <Route path="t/:code" element={<TournamentPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
