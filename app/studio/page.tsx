import { redirect } from "next/navigation";
import { Studio } from "./studio";
import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { ensureSchema } from "../../db/ensure-schema";
import { chatGPTSignOutPath, getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";
const ADMIN_EMAILS = new Set(["clark970417@gmail.com", "mary680616@gmail.com"]);

export default async function StudioPage() {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.startsWith("localhost:") || host.startsWith("127.0.0.1:");

  if (!isLocal) {
    const user = await getChatGPTUser();
    if (!user) redirect("/signin-with-chatgpt?return_to=%2Fstudio");
    if (!ADMIN_EMAILS.has(user.email.toLowerCase())) {
      return <main className="studio-shell"><p>This studio belongs to Clark Lo.</p><a href={chatGPTSignOutPath("/")}>Sign out</a></main>;
    }
  }

  let events: { id:string; title:string; slug:string; category:"school"|"outside-school"; status:string; coverPhotoId:string|null; coverX:number; coverY:number; position:number; photoCount:number }[] = [];
  if (env.DB) {
    try {
      await ensureSchema(env.DB);
      const result = await env.DB.prepare("SELECT e.id, e.title, e.slug, e.category, e.status, e.cover_photo_id AS coverPhotoId, e.cover_x AS coverX, e.cover_y AS coverY, e.position, COUNT(p.id) AS photoCount FROM events e LEFT JOIN photos p ON p.event_id=e.id GROUP BY e.id ORDER BY e.position ASC, e.created_at DESC").all<typeof events[number]>();
      events = result.results;
    } catch { /* first deployment runs migrations before use */ }
  }
  return <Studio initialEvents={events} signOutPath={isLocal ? "/" : chatGPTSignOutPath("/")} />;
}
