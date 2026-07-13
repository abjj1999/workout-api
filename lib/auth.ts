import { verifyToken } from "@clerk/backend";

/**
 * Verifies the Clerk session JWT from the Authorization header and returns
 * the user id, or null when the token is missing/invalid. The Expo app and
 * this API must use the same Clerk application.
 */
export async function getUserId(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey?.startsWith("sk_")) {
    console.error(
      "CLERK_SECRET_KEY is missing or not a secret key (must start with sk_). " +
        "Get it from Clerk Dashboard → API keys → Secret keys.",
    );
    return null;
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    return payload.sub;
  } catch (error) {
    console.warn(
      "Token verification failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export const unauthorized = () =>
  Response.json({ error: "Unauthorized" }, { status: 401 });
