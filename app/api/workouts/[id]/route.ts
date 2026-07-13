import { getUserId, unauthorized } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { insertExercises, parseWorkout } from "@/lib/workouts";

/**
 * PUT /api/workouts/:id — replace a workout after it was edited and
 * re-finished in the app. Exercises and sets are swapped wholesale; the
 * note is only overwritten when the payload actually carries one, so a
 * note added from the History tab survives an exercise edit.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const workout = parseWorkout(await request.json().catch(() => null));
  if (!workout) {
    return Response.json({ error: "Invalid workout payload" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: existing, error: updateError } = await supabase
    .from("workouts")
    .update({
      started_at: workout.startedAt,
      finished_at: workout.finishedAt,
      ...(workout.note !== null ? { note: workout.note } : {}),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("PUT /api/workouts/[id] update failed:", updateError.message);
    return Response.json({ error: "Failed to update workout" }, { status: 500 });
  }
  if (!existing) {
    return Response.json({ error: "Workout not found" }, { status: 404 });
  }

  // Replace the children: delete (sets cascade with their exercises), then
  // re-insert from the payload.
  const { error: deleteError } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("workout_id", id);
  if (deleteError) {
    console.error("PUT /api/workouts/[id] delete failed:", deleteError.message);
    return Response.json({ error: "Failed to update workout" }, { status: 500 });
  }

  try {
    await insertExercises(supabase, id, workout.exercises);
  } catch (error) {
    console.error("PUT /api/workouts/[id] children failed:", error);
    return Response.json({ error: "Failed to update workout" }, { status: 500 });
  }

  return Response.json({ data: { id } });
}

/** PATCH /api/workouts/:id — update the workout's note. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    note?: unknown;
  } | null;
  if (!body || (body.note !== null && typeof body.note !== "string")) {
    return Response.json({ error: "Invalid note payload" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("workouts")
    .update({ note: body.note })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("PATCH /api/workouts/[id] failed:", error.message);
    return Response.json({ error: "Failed to update note" }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Workout not found" }, { status: 404 });
  }
  return Response.json({ data: { id: data.id } });
}
