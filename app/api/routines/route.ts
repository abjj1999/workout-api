import { getUserId, unauthorized } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

interface RoutineInput {
  name: string;
  exerciseIds: string[];
}

function parseRoutine(body: unknown): RoutineInput | null {
  const r = body as RoutineInput;
  if (
    !r ||
    typeof r.name !== "string" ||
    r.name.trim().length === 0 ||
    !Array.isArray(r.exerciseIds) ||
    r.exerciseIds.length === 0 ||
    r.exerciseIds.some((id) => typeof id !== "string")
  ) {
    return null;
  }
  return { name: r.name.trim(), exerciseIds: r.exerciseIds };
}

/** GET /api/routines — the user's routines, newest first. */
export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { data, error } = await getSupabase()
    .from("routines")
    .select("id, name, routine_exercises ( exercise_id, position )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/routines failed:", error.message);
    return Response.json({ error: "Failed to load routines" }, { status: 500 });
  }

  return Response.json({
    data: data.map((routine) => ({
      id: routine.id,
      name: routine.name,
      exerciseIds: routine.routine_exercises
        .sort((a, b) => a.position - b.position)
        .map((exercise) => exercise.exercise_id),
    })),
  });
}

/** POST /api/routines — create a routine from a name and exercise ids. */
export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const routine = parseRoutine(await request.json().catch(() => null));
  if (!routine) {
    return Response.json({ error: "Invalid routine payload" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: routineRow, error: routineError } = await supabase
    .from("routines")
    .insert({ user_id: userId, name: routine.name })
    .select("id")
    .single();

  if (routineError) {
    console.error("POST /api/routines insert failed:", routineError.message);
    return Response.json({ error: "Failed to save routine" }, { status: 500 });
  }

  const { error: exercisesError } = await supabase
    .from("routine_exercises")
    .insert(
      routine.exerciseIds.map((exerciseId, position) => ({
        routine_id: routineRow.id,
        exercise_id: exerciseId,
        position,
      })),
    );

  if (exercisesError) {
    await supabase.from("routines").delete().eq("id", routineRow.id);
    console.error("POST /api/routines children failed:", exercisesError.message);
    return Response.json({ error: "Failed to save routine" }, { status: 500 });
  }

  return Response.json({ data: { id: routineRow.id } }, { status: 201 });
}
