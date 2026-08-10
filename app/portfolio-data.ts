import { env } from "cloudflare:workers";
import { ensureSchema } from "../db/ensure-schema";

export type EventCategory = "school" | "outside-school";
export type PortfolioEvent = { id: string; title: string; slug: string; category: EventCategory; coverUrl: string | null; coverX: number; coverY: number };
export type EventPhoto = { id: string; alt: string; url: string; width: number | null; height: number | null };
export type HeroPhoto = { id: string; title: string; slug: string; url: string; x: number; y: number };

export async function getPublishedEvents(): Promise<PortfolioEvent[]> {
  if (!env.DB) return [];
  try {
    await ensureSchema(env.DB);
    const result = await env.DB.prepare(`
      SELECT e.id, e.title, e.slug, e.category, e.cover_x, e.cover_y,
        COALESCE(
          (SELECT p.id FROM photos p WHERE p.id = e.cover_photo_id AND p.event_id = e.id LIMIT 1),
          (SELECT p.id FROM photos p WHERE p.event_id = e.id ORDER BY p.position ASC LIMIT 1)
        ) AS cover_id
      FROM events e WHERE e.status = 'published' ORDER BY e.position ASC, e.created_at DESC
    `).all<{ id: string; title: string; slug: string; category: EventCategory; cover_id: string | null; cover_x: number; cover_y: number }>();
    return result.results.map((row) => ({ ...row, coverX: row.cover_x, coverY: row.cover_y, coverUrl: row.cover_id ? `/api/photos/${row.cover_id}?variant=thumb` : null }));
  } catch { return []; }
}

export async function getHeroPhotos(): Promise<HeroPhoto[]> {
  if (!env.DB) return [];
  try {
    await ensureSchema(env.DB);
    const result = await env.DB.prepare(`
      SELECT p.id, e.title, e.slug,
        CASE WHEN p.id = e.cover_photo_id THEN e.cover_x ELSE 50 END AS x,
        CASE WHEN p.id = e.cover_photo_id THEN e.cover_y ELSE 50 END AS y
      FROM photos p
      JOIN events e ON e.id = p.event_id
      WHERE e.status = 'published'
      ORDER BY e.position ASC, CASE WHEN p.id = e.cover_photo_id THEN 0 ELSE 1 END, p.position ASC
      LIMIT 80
    `).all<{ id: string; title: string; slug: string; x: number; y: number }>();
    return result.results.map((photo) => ({ ...photo, url: `/api/photos/${photo.id}?variant=thumb` }));
  } catch { return []; }
}

export async function getPublishedEvent(slug: string) {
  if (!env.DB) return null;
  try {
    await ensureSchema(env.DB);
    const event = await env.DB.prepare("SELECT id, title, slug FROM events WHERE slug = ? AND status = 'published' LIMIT 1").bind(slug).first<{ id: string; title: string; slug: string }>();
    if (!event) return null;
    const photos = await env.DB.prepare("SELECT id, alt, width, height FROM photos WHERE event_id = ? ORDER BY position ASC").bind(event.id).all<{ id: string; alt: string; width: number | null; height: number | null }>();
    return { ...event, photos: photos.results.map((photo): EventPhoto => ({ ...photo, url: `/api/photos/${photo.id}` })) };
  } catch { return null; }
}
