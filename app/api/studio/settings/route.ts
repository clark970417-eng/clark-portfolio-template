import { env } from "cloudflare:workers";
import { ensureSchema } from "../../../../db/ensure-schema";
import { editableSettingKeys, getSiteSettings, settingLimits } from "../../../site-settings";
import { isAdmin } from "../auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ settings: await getSiteSettings() });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!env.DB) return Response.json({ error: "Storage is unavailable." }, { status: 503 });
  await ensureSchema(env.DB);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "No settings supplied." }, { status: 400 });

  const updates = editableSettingKeys.flatMap((key) => {
    if (!(key in body)) return [];
    const value = String(body[key] ?? "").trim().slice(0, settingLimits[key]);
    if ((key === "instagramUrl" || key === "xUrl") && value && !/^https:\/\//i.test(value)) return [];
    if (key === "contactEmail" && value && !/^\S+@\S+\.\S+$/.test(value)) return [];
    return [{ key, value }];
  });
  if (!updates.length) return Response.json({ error: "No valid settings supplied." }, { status: 400 });

  const now = Date.now();
  await env.DB.batch(updates.map(({ key, value }) => env.DB.prepare(
    "INSERT INTO site_settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at"
  ).bind(key, value, now)));
  return Response.json({ settings: await getSiteSettings() });
}
