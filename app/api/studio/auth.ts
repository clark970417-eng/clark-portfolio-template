import { headers } from "next/headers";
import { env } from "cloudflare:workers";
import { ensureSchema } from "../../../db/ensure-schema";

const ADMIN_EMAIL = "clark970417@gmail.com";

export async function isAdmin() {
  const host = (await headers()).get("host") ?? "";
  if (host.startsWith("localhost:") || host.startsWith("127.0.0.1:")) return true;

  const cookieHeader = (await headers()).get("cookie") ?? "";
  const sessionToken = getCookieValue(cookieHeader, "studio_session");
  if (!sessionToken || !env.DB) return false;

  try {
    await ensureSchema(env.DB);
    const session = await env.DB.prepare(
      "SELECT id FROM verification_codes WHERE id = ? AND email = ? AND verified = 1 AND expires_at > ?"
    )
      .bind(sessionToken, ADMIN_EMAIL, Date.now())
      .first();
    return !!session;
  } catch (e) {
    console.error("isAdmin auth check error:", e);
    return false;
  }
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const parts = cookie.trim().split("=");
    if (parts[0] === name) return parts[1];
  }
  return null;
}
