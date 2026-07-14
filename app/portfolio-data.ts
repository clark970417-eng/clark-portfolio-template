import { env } from "cloudflare:workers";
import { ensureSchema } from "../db/ensure-schema";

export type EventCategory = "school" | "outside-school";
export type PortfolioEvent = { id: string; title: string; slug: string; category: EventCategory; coverUrl: string | null };
export type EventPhoto = { id: string; alt: string; url: string };

export async function getPublishedEvents(): Promise<PortfolioEvent[]> {
  if (!env.DB) return [];
  try {
    await ensureSchema(env.DB);
    const result = await env.DB.prepare(`
      SELECT e.id, e.title, e.slug, e.category,
        (SELECT p.id FROM photos p WHERE p.event_id = e.id ORDER BY p.position ASC LIMIT 1) AS cover_id
      FROM events e WHERE e.status = 'published' ORDER BY e.position ASC, e.created_at DESC
    `).all<{ id: string; title: string; slug: string; category: EventCategory; cover_id: string | null }>();
    return result.results.map((row) => ({ ...row, coverUrl: row.cover_id ? `/api/photos/${row.cover_id}` : null }));
  } catch { return []; }
}

export async function getPublishedEvent(slug: string) {
  if (!env.DB) return null;
  try {
    await ensureSchema(env.DB);
    const event = await env.DB.prepare("SELECT id, title, slug FROM events WHERE slug = ? AND status = 'published' LIMIT 1").bind(slug).first<{ id: string; title: string; slug: string }>();
    if (!event) return null;
    const photos = await env.DB.prepare("SELECT id, alt FROM photos WHERE event_id = ? ORDER BY position ASC").bind(event.id).all<{ id: string; alt: string }>();
    return { ...event, photos: photos.results.map((photo): EventPhoto => ({ ...photo, url: `/api/photos/${photo.id}` })) };
  } catch { return null; }
}
