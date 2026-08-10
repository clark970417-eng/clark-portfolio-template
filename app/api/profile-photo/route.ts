import { env } from "cloudflare:workers";
import { ensureSchema } from "../../../db/ensure-schema";

export async function GET() {
  if (!env.DB || !env.PHOTOS) return new Response("Not found", { status: 404 });
  await ensureSchema(env.DB);
  const setting = await env.DB.prepare("SELECT value FROM site_settings WHERE key='profilePhotoKey'").first<{ value: string }>();
  if (!setting?.value) return new Response("Not found", { status: 404 });
  const object = await env.PHOTOS.get(setting.value);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
