import { redirect } from "next/navigation";
import { getChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { Studio } from "./studio";
import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "clark970417@gmail.com";

export default async function StudioPage() {
  const user = await getChatGPTUser();
  if (!user) redirect("/signin-with-chatgpt?return_to=%2Fstudio");
  if (user.email.toLowerCase() !== ADMIN_EMAIL) return <main className="studio-shell"><p>This studio belongs to Clark Lo.</p><a href={chatGPTSignOutPath("/")}>Sign out</a></main>;
  let events: { id:string; title:string; slug:string; status:string; position:number; photoCount:number }[] = [];
  if (env.DB) {
    try {
      const result = await env.DB.prepare("SELECT e.id, e.title, e.slug, e.status, e.position, COUNT(p.id) AS photoCount FROM events e LEFT JOIN photos p ON p.event_id=e.id GROUP BY e.id ORDER BY e.position ASC, e.created_at DESC").all<typeof events[number]>();
      events = result.results;
    } catch { /* first deployment runs migrations before use */ }
  }
  return <Studio initialEvents={events} signOutPath={chatGPTSignOutPath("/")} />;
}
