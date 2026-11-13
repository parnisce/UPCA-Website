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
alter table public.tasks add column if not exists start_at timestamptz;

notify pgrst, 'reload schema';
