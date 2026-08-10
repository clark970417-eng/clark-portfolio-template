import { env } from "cloudflare:workers";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!env.DB || !env.PHOTOS) return new Response("Not found", { status: 404 });
  const photo = await env.DB.prepare("SELECT object_key,thumbnail_key FROM photos WHERE id = ? LIMIT 1").bind((await params).id).first<{ object_key: string; thumbnail_key: string | null }>();
  if (!photo) return new Response("Not found", { status: 404 });
  const wantsThumbnail = new URL(request.url).searchParams.get("variant") === "thumb";
  const object = await env.PHOTOS.get(wantsThumbnail && photo.thumbnail_key ? photo.thumbnail_key : photo.object_key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("etag", object.httpEtag); headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
