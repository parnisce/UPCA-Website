-- Run this once in Supabase > SQL Editor. Safe to run again.
-- One row per booked 15-minute consultation slot. The primary key on
-- slot_start means the database itself refuses a second booking of the same time.

create table if not exists public.bookings (
  slot_start timestamptz primary key,
  email text not null default '',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "bookings public insert" on public.bookings;
create policy "bookings public insert" on public.bookings
  for insert to anon, authenticated with check (true);

drop policy if exists "bookings public read" on public.bookings;
create policy "bookings public read" on public.bookings
  for select to anon, authenticated using (true);

drop policy if exists "bookings admin all" on public.bookings;
create policy "bookings admin all" on public.bookings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Visitors can only see WHICH times are taken, never who booked them.
revoke all on public.bookings from anon;
grant select (slot_start) on public.bookings to anon;
grant insert (slot_start, email) on public.bookings to anon;
grant all on public.bookings to authenticated;

notify pgrst, 'reload schema';
