import { env } from "cloudflare:workers";
import { isAdmin } from "../../auth";
import { ensureSchema } from "../../../../../db/ensure-schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema(env.DB);
  const { status, category, title, coverPhotoId, coverX, coverY } = await request.json();
  const id = (await params).id;

  if (status !== undefined) {
    if (!["draft", "published"].includes(status)) return Response.json({ error: "Invalid status" }, { status: 400 });
    await env.DB.prepare("UPDATE events SET status=?,updated_at=? WHERE id=?").bind(status, Date.now(), id).run();
    return Response.json({ ok: true });
  }
  if (category !== undefined) {
    if (!["school", "outside-school"].includes(category)) return Response.json({ error: "Invalid category" }, { status: 400 });
    await env.DB.prepare("UPDATE events SET category=?,updated_at=? WHERE id=?").bind(category, Date.now(), id).run();
    return Response.json({ ok: true });
  }
  if (title !== undefined) {
    const nextTitle = String(title).trim().slice(0, 120);
    if (!nextTitle) return Response.json({ error: "Add an event title." }, { status: 400 });
    await env.DB.prepare("UPDATE events SET title=?,updated_at=? WHERE id=?").bind(nextTitle, Date.now(), id).run();
    return Response.json({ ok: true, title: nextTitle });
  }
  if (coverPhotoId !== undefined) {
    if (typeof coverPhotoId !== "string") return Response.json({ error: "Choose a valid cover photo." }, { status: 400 });
    const photo = await env.DB.prepare("SELECT id FROM photos WHERE id=? AND event_id=? LIMIT 1").bind(coverPhotoId, id).first<{ id: string }>();
    if (!photo) return Response.json({ error: "Choose a photo from this event." }, { status: 400 });
    const parsedX = Number(coverX);
    const parsedY = Number(coverY);
    const x = Math.max(0, Math.min(100, Math.round(Number.isFinite(parsedX) ? parsedX : 50)));
    const y = Math.max(0, Math.min(100, Math.round(Number.isFinite(parsedY) ? parsedY : 50)));
    await env.DB.prepare("UPDATE events SET cover_photo_id=?,cover_x=?,cover_y=?,updated_at=? WHERE id=?").bind(coverPhotoId, x, y, Date.now(), id).run();
    return Response.json({ ok: true, coverPhotoId, coverX: x, coverY: y });
  }
  return Response.json({ error: "No changes supplied" }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema(env.DB);
  const id = (await params).id;
  const photos = await env.DB.prepare("SELECT object_key,thumbnail_key FROM photos WHERE event_id=?").bind(id).all<{ object_key: string; thumbnail_key: string | null }>();
  await Promise.all(photos.results.flatMap((photo) => [env.PHOTOS.delete(photo.object_key), ...(photo.thumbnail_key ? [env.PHOTOS.delete(photo.thumbnail_key)] : [])]));
  await env.DB.batch([
    env.DB.prepare("DELETE FROM photos WHERE event_id=?").bind(id),
    env.DB.prepare("DELETE FROM events WHERE id=?").bind(id),
  ]);
  return Response.json({ ok: true });
}
