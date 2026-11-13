-- UPCA website: database setup for Supabase.
-- Run this once in Supabase: SQL Editor > New query > paste > Run.
--
-- BEFORE YOU RUN: replace both copies of  your-admin@example.com  below with the
-- email you will use to sign in to the admin (/login).
-- AFTER YOU RUN: Authentication > Users > Add user, create that same email with a
-- password. Optionally switch off "Allow new users to sign up" under
-- Authentication > Sign In / Providers. Admin access is checked against the
-- admins table below, so strangers cannot get in even if sign-ups stay on.

-- ---------------------------------------------------------------- admins
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- No policies on purpose: the website can never read or change this list.

insert into public.admins (email) values (lower('your-admin@example.com'))
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------- site content
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "site_content public read" on public.site_content;
create policy "site_content public read" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "site_content admin write" on public.site_content;
create policy "site_content admin write" on public.site_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------- posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;

drop policy if exists "posts public read published" on public.posts;
create policy "posts public read published" on public.posts
  for select to anon, authenticated using (published = true or public.is_admin());

drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write" on public.posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------- enquiries
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  phone text not null default '' check (char_length(phone) <= 60),
  package text not null default '' check (char_length(package) <= 100),
  area text not null default '' check (char_length(area) <= 300),
  message text not null default '' check (char_length(message) <= 5000),
  source text not null default 'website' check (char_length(source) <= 100),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  notes text not null default '' check (char_length(notes) <= 5000)
);
alter table public.enquiries enable row level security;

-- Visitors can submit an enquiry (and only as "new"), but can never read any.
drop policy if exists "enquiries public insert" on public.enquiries;
create policy "enquiries public insert" on public.enquiries
  for insert to anon, authenticated
  with check (status = 'new' and notes = '');

drop policy if exists "enquiries admin all" on public.enquiries;
create policy "enquiries admin all" on public.enquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- grants
grant usage on schema public to anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select, update, delete on public.enquiries to authenticated;

-- ---------------------------------------------------------------- images
-- Public bucket for blog cover images. Only the admin can upload or delete.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
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
-- Run once in Supabase > SQL Editor. Safe to run again.
-- Adds: task board (admin only), website analytics (anonymous page views).

-- ---------- Task board ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text not null default '',
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
drop policy if exists "tasks admin all" on public.tasks;
create policy "tasks admin all" on public.tasks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.tasks from anon;
grant all on public.tasks to authenticated;

-- ---------- Analytics ----------
-- Anonymous page views: path, referring site, random per-tab id, device type. No IPs, no cookies.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  referrer text not null default '',
  session_id text not null,
  device text not null default 'desktop'
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
alter table public.page_views enable row level security;
drop policy if exists "page_views insert" on public.page_views;
create policy "page_views insert" on public.page_views
  for insert to anon, authenticated
  with check (char_length(path) <= 300 and char_length(referrer) <= 200 and char_length(session_id) <= 64);
drop policy if exists "page_views admin read" on public.page_views;
create policy "page_views admin read" on public.page_views
  for select to authenticated using (public.is_admin());
revoke all on public.page_views from anon;
grant insert (path, referrer, session_id, device) on public.page_views to anon;
grant all on public.page_views to authenticated;

create or replace function public.analytics_summary(days int default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(1, least(days, 365)));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  select jsonb_build_object(
    'views', (select count(*) from page_views where created_at >= since),
    'visitors', (select count(distinct session_id) from page_views where created_at >= since),
    'daily', (
      select coalesce(jsonb_agg(to_jsonb(x) order by x.day), '[]'::jsonb) from (
        select to_char(created_at at time zone 'America/Toronto', 'YYYY-MM-DD') as day,
               count(*) as views, count(distinct session_id) as visitors
        from page_views where created_at >= since group by 1
      ) x),
    'pages', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select path, count(*) as views, count(distinct session_id) as visitors
        from page_views where created_at >= since group by path order by count(*) desc limit 10
      ) x),
    'referrers', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select case when referrer = '' then 'Direct' else referrer end as source,
               count(distinct session_id) as visitors
        from page_views where created_at >= since group by 1 order by 2 desc limit 8
      ) x),
    'devices', (
      select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from (
        select device, count(distinct session_id) as visitors
        from page_views where created_at >= since group by device order by 2 desc
      ) x)
  ) into result;
  return result;
end;
$$;
revoke all on function public.analytics_summary(int) from public, anon;
grant execute on function public.analytics_summary(int) to authenticated;

notify pgrst, 'reload schema';
-- Run once in Supabase > SQL Editor, after admin-extras.sql. Safe to run again.
-- Upgrades the task board to four columns (Open, In progress, Blocked, Done)
-- and adds tags, a time estimate and a checklist to each task.

alter table public.tasks drop constraint if exists tasks_status_check;
update public.tasks set status = 'open' where status = 'todo';
alter table public.tasks alter column status set default 'open';
alter table public.tasks add constraint tasks_status_check check (status in ('open', 'doing', 'blocked', 'done'));

alter table public.tasks add column if not exists tags text[] not null default '{}';
alter table public.tasks add column if not exists estimate_min integer;
alter table public.tasks add column if not exists checklist jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
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

alter table public.tasks add column if not exists start_at timestamptz;
notify pgrst, 'reload schema';

alter table public.tasks add column if not exists timer_started_at timestamptz;
alter table public.tasks add column if not exists category text not null default 'shoots';
alter table public.tasks drop constraint if exists tasks_category_check;
alter table public.tasks add constraint tasks_category_check check (category in ('shoots', 'editing', 'marketing', 'admin'));

notify pgrst, 'reload schema';
