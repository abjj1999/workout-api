import { getUserId, unauthorized } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { insertExercises, parseWorkout } from "@/lib/workouts";

/** GET /api/workouts — the user's finished workouts, newest first. */
export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { data, error } = await getSupabase()
    .from("workouts")
    .select(
      `id, started_at, finished_at, note,
       workout_exercises (
         id, exercise_id, position,
         workout_sets ( id, set_number, weight, reps, completed )
       )`,
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("GET /api/workouts failed:", error.message);
    return Response.json({ error: "Failed to load workouts" }, { status: 500 });
  }

  return Response.json({
    data: data.map((w) => ({
      id: w.id,
      startedAt: w.started_at,
      finishedAt: w.finished_at,
      note: w.note,
      exercises: w.workout_exercises
        .sort((a, b) => a.position - b.position)
        .map((e) => ({
          id: e.id,
          exerciseId: e.exercise_id,
          position: e.position,
          sets: e.workout_sets
            .sort((a, b) => a.set_number - b.set_number)
            .map((s) => ({
              id: s.id,
              setNumber: s.set_number,
              weight: Number(s.weight),
              reps: s.reps,
              completed: s.completed,
            })),
        })),
    })),
  });
}

/** POST /api/workouts — save a finished session with all exercises/sets. */
export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const workout = parseWorkout(await request.json().catch(() => null));
  if (!workout) {
    return Response.json({ error: "Invalid workout payload" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: workoutRow, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      started_at: workout.startedAt,
      finished_at: workout.finishedAt,
      note: workout.note,
    })
    .select("id")
    .single();

  if (workoutError) {
    console.error("POST /api/workouts insert failed:", workoutError.message);
    return Response.json({ error: "Failed to save workout" }, { status: 500 });
  }

  try {
    await insertExercises(supabase, workoutRow.id, workout.exercises);
  } catch (error) {
    // Don't leave a half-written session behind; cascade removes children.
    await supabase.from("workouts").delete().eq("id", workoutRow.id);
    console.error("POST /api/workouts children failed:", error);
    return Response.json({ error: "Failed to save workout" }, { status: 500 });
  }

  return Response.json({ data: { id: workoutRow.id } }, { status: 201 });
}
