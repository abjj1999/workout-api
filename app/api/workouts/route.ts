import { getUserId, unauthorized } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

// Shape the Expo app POSTs when the user taps "Finish Workout".
interface SetInput {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

interface ExerciseInput {
  exerciseId: string;
  position: number;
  sets: SetInput[];
}

interface WorkoutInput {
  startedAt: string;
  finishedAt: string;
  note: string | null;
  exercises: ExerciseInput[];
}

function parseWorkout(body: unknown): WorkoutInput | null {
  const w = body as WorkoutInput;
  if (
    !w ||
    typeof w.startedAt !== "string" ||
    Number.isNaN(Date.parse(w.startedAt)) ||
    typeof w.finishedAt !== "string" ||
    Number.isNaN(Date.parse(w.finishedAt)) ||
    (w.note !== null && typeof w.note !== "string") ||
    !Array.isArray(w.exercises)
  ) {
    return null;
  }
  for (const e of w.exercises) {
    if (
      typeof e?.exerciseId !== "string" ||
      typeof e?.position !== "number" ||
      !Array.isArray(e?.sets) ||
      e.sets.some(
        (s) =>
          typeof s?.setNumber !== "number" ||
          typeof s?.weight !== "number" ||
          typeof s?.reps !== "number" ||
          typeof s?.completed !== "boolean",
      )
    ) {
      return null;
    }
  }
  return w;
}

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
    for (const exercise of workout.exercises) {
      const { data: exerciseRow, error: exerciseError } = await supabase
        .from("workout_exercises")
        .insert({
          workout_id: workoutRow.id,
          exercise_id: exercise.exerciseId,
          position: exercise.position,
        })
        .select("id")
        .single();
      if (exerciseError) throw new Error(exerciseError.message);

      if (exercise.sets.length > 0) {
        const { error: setsError } = await supabase.from("workout_sets").insert(
          exercise.sets.map((set) => ({
            workout_exercise_id: exerciseRow.id,
            set_number: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            completed: set.completed,
          })),
        );
        if (setsError) throw new Error(setsError.message);
      }
    }
  } catch (error) {
    // Don't leave a half-written session behind; cascade removes children.
    await supabase.from("workouts").delete().eq("id", workoutRow.id);
    console.error("POST /api/workouts children failed:", error);
    return Response.json({ error: "Failed to save workout" }, { status: 500 });
  }

  return Response.json({ data: { id: workoutRow.id } }, { status: 201 });
}
