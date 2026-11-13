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
