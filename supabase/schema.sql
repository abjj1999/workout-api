-- Workout history schema. Run this in the Supabase SQL editor (or via
-- `supabase db push`). Tables are keyed by the Clerk user id; all access
-- goes through the Next.js API using the service-role key, so RLS is
-- enabled with no public policies.

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  -- Clerk user id, e.g. "user_2abc...". Not a FK: auth lives in Clerk.
  user_id text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  note text,
  created_at timestamptz not null default now()
);

create index workouts_user_started_idx
  on public.workouts (user_id, started_at desc);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  -- Exercise id in the app's bundled dataset, e.g. "0025".
  exercise_id text not null,
  -- Order of the exercise within the workout, 0-based.
  position int not null
);

create index workout_exercises_workout_idx
  on public.workout_exercises (workout_id);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null
    references public.workout_exercises (id) on delete cascade,
  set_number int not null,
  weight numeric not null,
  reps int not null,
  completed boolean not null default false
);

create index workout_sets_exercise_idx
  on public.workout_sets (workout_exercise_id);

-- Lock the tables down: no anon/authenticated access. The API talks to
-- Supabase with the service-role key, which bypasses RLS.
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
