import { env } from "cloudflare:workers";
import { ensureSchema } from "../../../../../db/ensure-schema";

export async function POST(request: Request) {
  try {
    const { sessionId, code } = await request.json();
    if (!sessionId || !code) {
      return Response.json({ error: "Session ID and code are required." }, { status: 400 });
    }

    if (!env.DB) {
      return Response.json({ error: "Database not available." }, { status: 500 });
    }

    await ensureSchema(env.DB);

    // Look up verification record
    const record = await env.DB.prepare(
      "SELECT * FROM verification_codes WHERE id = ? AND code = ? AND verified = 0 AND expires_at > ?"
    )
      .bind(sessionId, code.trim(), Date.now())
      .first<{ id: string; expires_at: number }>();

    if (!record) {
      return Response.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    // Extend expiry time for session: 7 days
    const sessionDuration = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + sessionDuration;

    // Update record to verified and extend expiry
    await env.DB.prepare(
      "UPDATE verification_codes SET verified = 1, expires_at = ? WHERE id = ?"
    )
      .bind(expiresAt, sessionId)
      .run();

    // Set cookie header
    const cookieValue = `studio_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;
    
    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": cookieValue,
        },
      }
    );
  } catch (err: any) {
    console.error("Auth verify error:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
