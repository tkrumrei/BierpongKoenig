-- BierpongKönig: einmal im Supabase SQL-Editor ausführen.

create table if not exists public.tournaments (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  mode        text not null,
  cups        int  not null check (cups in (6, 10)),
  state       jsonb not null,
  version     int  not null default 1,
  created_at  timestamptz not null default now()
);

alter table public.tournaments enable row level security;

-- Bewusst offen: Jeder mit Code darf lesen, anlegen und bearbeiten. Löschen ist nicht erlaubt.
drop policy if exists "tournaments_select" on public.tournaments;
drop policy if exists "tournaments_insert" on public.tournaments;
drop policy if exists "tournaments_update" on public.tournaments;
create policy "tournaments_select" on public.tournaments for select to anon, authenticated using (true);
create policy "tournaments_insert" on public.tournaments for insert to anon, authenticated with check (true);
create policy "tournaments_update" on public.tournaments for update to anon, authenticated using (true) with check (true);

-- Realtime für Live-Updates aktivieren
alter publication supabase_realtime add table public.tournaments;
