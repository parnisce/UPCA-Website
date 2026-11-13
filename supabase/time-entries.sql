-- Run once in Supabase > SQL Editor, after admin-extras.sql. Safe to run again.
-- Time log used by Admin > Insights (and the "Time logged" total on the task board).

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks (id) on delete set null,
  title text not null,
  category text not null default 'shoots' check (category in ('shoots', 'editing', 'marketing', 'admin')),
  minutes integer not null check (minutes > 0 and minutes <= 1440),
  day date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists time_entries_day_idx on public.time_entries (day desc);

alter table public.time_entries enable row level security;
drop policy if exists "time_entries admin all" on public.time_entries;
create policy "time_entries admin all" on public.time_entries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.time_entries from anon;
grant all on public.time_entries to authenticated;

notify pgrst, 'reload schema';
