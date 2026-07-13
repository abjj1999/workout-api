import { getUserId, unauthorized } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

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
