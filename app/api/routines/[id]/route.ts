import { getUserId, unauthorized } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

/** DELETE /api/routines/:id — remove a routine (exercises cascade). */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const { data, error } = await getSupabase()
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("DELETE /api/routines/[id] failed:", error.message);
    return Response.json({ error: "Failed to delete routine" }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Routine not found" }, { status: 404 });
  }
  return Response.json({ data: { id: data.id } });
}
