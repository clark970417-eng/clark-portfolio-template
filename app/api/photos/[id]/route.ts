import { env } from "cloudflare:workers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!env.DB || !env.PHOTOS) return new Response("Not found", { status: 404 });
  const photo = await env.DB.prepare("SELECT object_key FROM photos WHERE id = ? LIMIT 1").bind((await params).id).first<{ object_key: string }>();
  if (!photo) return new Response("Not found", { status: 404 });
  const object = await env.PHOTOS.get(photo.object_key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("etag", object.httpEtag); headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
