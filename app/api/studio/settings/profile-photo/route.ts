import { env } from "cloudflare:workers";
import { ensureSchema } from "../../../../../db/ensure-schema";
import { getSiteSettings } from "../../../../site-settings";
import { isAdmin } from "../../auth";

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!env.DB || !env.PHOTOS) return Response.json({ error: "Storage is unavailable." }, { status: 503 });
  await ensureSchema(env.DB);
  const form = await request.formData();
  const photo = form.get("photo");
  if (!(photo instanceof File)) return Response.json({ error: "Choose a profile photo." }, { status: 400 });
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(photo.type) || photo.size > 5 * 1024 * 1024) {
    return Response.json({ error: "Use a JPEG, PNG, or WebP image under 5 MB." }, { status: 400 });
  }

  const current = await env.DB.prepare("SELECT value FROM site_settings WHERE key='profilePhotoKey'").first<{ value: string }>();
  const key = `profile/${crypto.randomUUID()}.webp`;
  await env.PHOTOS.put(key, photo.stream(), { httpMetadata: { contentType: photo.type, cacheControl: "public, max-age=31536000" } });
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO site_settings (key,value,updated_at) VALUES ('profilePhotoKey',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at"
  ).bind(key, now).run();
  await env.DB.prepare("DELETE FROM site_settings WHERE key='profilePhotoHidden'").run();
  if (current?.value && current.value !== key) await env.PHOTOS.delete(current.value);
  return Response.json({ settings: await getSiteSettings() });
}

export async function DELETE() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!env.DB || !env.PHOTOS) return Response.json({ error: "Storage is unavailable." }, { status: 503 });
  await ensureSchema(env.DB);
  const current = await env.DB.prepare("SELECT value FROM site_settings WHERE key='profilePhotoKey'").first<{ value: string }>();
  if (current?.value) await env.PHOTOS.delete(current.value);
  await env.DB.prepare("DELETE FROM site_settings WHERE key='profilePhotoKey'").run();
  await env.DB.prepare(
    "INSERT INTO site_settings (key,value,updated_at) VALUES ('profilePhotoHidden','1',?) ON CONFLICT(key) DO UPDATE SET value='1',updated_at=excluded.updated_at"
  ).bind(Date.now()).run();
  return Response.json({ settings: await getSiteSettings() });
}
