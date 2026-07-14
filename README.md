# IRONLOG — API

The backend for the [IRONLOG](../workout) workout-tracking app. A Next.js
service that stores each user's workouts, routines, and body-weight log in
Supabase (PostgreSQL) and exposes them as a small REST API.

Requests are authenticated with a Clerk session token (issued by the mobile
app); the API verifies it and scopes every query to that user. The service
is hosted on Vercel — there is nothing to install; the mobile app talks to
the deployed URL.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) (App Router route handlers) |
| Language | TypeScript |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | [Clerk](https://clerk.com/) session-token verification (`@clerk/backend`) |
| Hosting | [Vercel](https://vercel.com/) |

---

## Security model

- **Row-Level Security is enabled with no public policies** on every table,
  so the tables are unreachable by the anon/publishable key.
- The API connects with the Supabase **service-role key**, which bypasses
  RLS — so every query is scoped to the authenticated user.
- Each request's `Authorization: Bearer <token>` is verified with
  `verifyToken` from `@clerk/backend`; the resulting Clerk user id
  (`user_id`) is the scope key on all rows.

The service-role key and Clerk secret key live only on the server (never in
the mobile app).

---

## API reference

Base URL: `/api`. All routes require `Authorization: Bearer <clerk-token>`
and return `401` without a valid token.

### Workouts

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/workouts` | The user's finished workouts (newest first), with exercises and sets nested. |
| `POST` | `/api/workouts` | Save a finished session (workout + exercises + sets). Rolls back on partial failure. |
| `PUT` | `/api/workouts/:id` | Replace a workout after it was edited and re-finished. |
| `PATCH` | `/api/workouts/:id` | Update just the workout's note. |

### Routines

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/routines` | The user's routine templates (newest first). |
| `POST` | `/api/routines` | Create a routine from a name and ordered exercise ids. |
| `DELETE` | `/api/routines/:id` | Delete a routine (its exercises cascade). |

### Body weight

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/body-weight` | Recent weigh-ins (newest first, capped). |
| `POST` | `/api/body-weight` | Log a weigh-in (weight in lbs). |

Weights are stored in **lbs**; unit display (lbs/kg) is handled client-side.

---

## Data model

Three chained tables per concern; children cascade-delete with their parent.

```
workouts                       one row per finished session
├─ id (uuid)
├─ user_id (text)              Clerk user id — the scope key
├─ started_at / finished_at
└─ note

workout_exercises              one row per exercise in a session
├─ id (uuid)
├─ workout_id  → workouts.id
├─ exercise_id (text)          id in the app's bundled dataset (e.g. "0025")
└─ position (int)              order within the workout

workout_sets                   one row per set
├─ id (uuid)
├─ workout_exercise_id → workout_exercises.id
├─ set_number (int)
├─ weight (numeric)            lbs
├─ reps (int)
└─ completed (bool)

routines / routine_exercises   named, ordered exercise templates
body_weights                   one row per weigh-in (weight lbs, logged_at)
```

The SQL that defines these tables lives in [`supabase/`](supabase/):
`schema.sql` (workouts), `routines.sql`, and `body_weight.sql`.

---

## Credits

Part of the [IRONLOG](../workout) project. Exercise ids reference the app's
bundled dataset, derived from public
[free exercise datasets](https://github.com/hasaneyldrm/exercises-dataset).
