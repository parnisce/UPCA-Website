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
