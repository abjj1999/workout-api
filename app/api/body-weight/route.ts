import { getUserId, unauthorized } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

const MAX_ENTRIES = 60;

/** GET /api/body-weight — recent weigh-ins, newest first. */
export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { data, error } = await getSupabase()
    .from("body_weights")
    .select("id, weight, logged_at")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(MAX_ENTRIES);

  if (error) {
    console.error("GET /api/body-weight failed:", error.message);
    return Response.json(
      { error: "Failed to load body weight" },
      { status: 500 },
    );
  }

  return Response.json({
    data: data.map((entry) => ({
      id: entry.id,
      weight: Number(entry.weight),
      loggedAt: entry.logged_at,
    })),
  });
}

/** POST /api/body-weight — log a weigh-in. */
export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = (await request.json().catch(() => null)) as {
    weight?: unknown;
  } | null;
  const weight = body?.weight;
  if (
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    weight > 2000
  ) {
    return Response.json({ error: "Invalid weight" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("body_weights")
    .insert({ user_id: userId, weight })
    .select("id")
    .single();

  if (error) {
    console.error("POST /api/body-weight failed:", error.message);
    return Response.json(
      { error: "Failed to save body weight" },
      { status: 500 },
    );
  }
  return Response.json({ data: { id: data.id } }, { status: 201 });
}
