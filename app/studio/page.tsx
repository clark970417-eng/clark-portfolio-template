import { Studio } from "./studio";
import { StudioLogin } from "./login";
import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { ensureSchema } from "../../db/ensure-schema";

export const dynamic = "force-dynamic";

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const parts = cookie.trim().split("=");
    if (parts[0] === name) return parts[1];
  }
  return null;
}

export default async function StudioPage() {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.startsWith("localhost:") || host.startsWith("127.0.0.1:");

  let authorized = false;
  if (isLocal) {
    authorized = true;
  } else {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const sessionToken = getCookieValue(cookieHeader, "studio_session");
    if (sessionToken && env.DB) {
      try {
        await ensureSchema(env.DB);
        const session = await env.DB.prepare(
          "SELECT id FROM verification_codes WHERE id = ? AND verified = 1 AND expires_at > ?"
        )
          .bind(sessionToken, Date.now())
          .first();
        if (session) {
          authorized = true;
        }
      } catch { /* first deployment runs migrations before use */ }
    }
  }

  if (!authorized) {
    return <StudioLogin />;
  }

  let events: { id:string; title:string; slug:string; category:"school"|"outside-school"; status:string; position:number; photoCount:number }[] = [];
  if (env.DB) {
    try {
      await ensureSchema(env.DB);
      const result = await env.DB.prepare("SELECT e.id, e.title, e.slug, e.category, e.status, e.position, COUNT(p.id) AS photoCount FROM events e LEFT JOIN photos p ON p.event_id=e.id GROUP BY e.id ORDER BY e.position ASC, e.created_at DESC").all<typeof events[number]>();
      events = result.results;
    } catch { /* first deployment runs migrations before use */ }
  }
  return <Studio initialEvents={events} signOutPath={isLocal ? "/" : "/api/studio/auth/signout"} />;
}
