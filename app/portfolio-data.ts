import { env } from "cloudflare:workers";

export type PortfolioEvent = { id: string; title: string; slug: string; coverUrl: string | null };
export type EventPhoto = { id: string; alt: string; url: string };

export async function getPublishedEvents(): Promise<PortfolioEvent[]> {
  if (!env.DB) return [];
  try {
    const result = await env.DB.prepare(`
      SELECT e.id, e.title, e.slug,
        (SELECT p.id FROM photos p WHERE p.event_id = e.id ORDER BY p.position ASC LIMIT 1) AS cover_id
      FROM events e WHERE e.status = 'published' ORDER BY e.position ASC, e.created_at DESC
    `).all<{ id: string; title: string; slug: string; cover_id: string | null }>();
    return result.results.map((row) => ({ ...row, coverUrl: row.cover_id ? `/api/photos/${row.cover_id}` : null }));
  } catch { return []; }
}

export async function getPublishedEvent(slug: string) {
  if (!env.DB) return null;
  try {
    const event = await env.DB.prepare("SELECT id, title, slug FROM events WHERE slug = ? AND status = 'published' LIMIT 1").bind(slug).first<{ id: string; title: string; slug: string }>();
    if (!event) return null;
    const photos = await env.DB.prepare("SELECT id, alt FROM photos WHERE event_id = ? ORDER BY position ASC").bind(event.id).all<{ id: string; alt: string }>();
    return { ...event, photos: photos.results.map((photo): EventPhoto => ({ ...photo, url: `/api/photos/${photo.id}` })) };
  } catch { return null; }
}
