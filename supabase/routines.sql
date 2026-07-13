-- Routine templates (v2 migration — run after schema.sql).
-- A routine is a named, ordered list of exercises the user starts
-- sessions from. Same access model as workouts: RLS on, no public
-- policies, all access through the API's service-role key.

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  -- Clerk user id, e.g. "user_2abc...".
  user_id text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index routines_user_idx
  on public.routines (user_id, created_at desc);

create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  -- Exercise id in the app's bundled dataset, e.g. "0025".
  exercise_id text not null,
  -- Order of the exercise within the routine, 0-based.
  position int not null
);

create index routine_exercises_routine_idx
  on public.routine_exercises (routine_id);

alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
