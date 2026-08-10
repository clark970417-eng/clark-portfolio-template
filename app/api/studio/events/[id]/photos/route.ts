import { env } from "cloudflare:workers";
import { isAdmin } from "../../../auth";
import { ensureSchema } from "../../../../../../db/ensure-schema";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await isAdmin()))return Response.json({error:"Unauthorized"},{status:401});
 await ensureSchema(env.DB);
 const eventId=(await params).id;
 const result=await env.DB.prepare("SELECT id,alt,position FROM photos WHERE event_id=? ORDER BY position ASC,created_at ASC").bind(eventId).all<{id:string;alt:string;position:number}>();
 return Response.json({photos:result.results.map(photo=>({...photo,url:`/api/photos/${photo.id}`}))});
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await isAdmin()))return Response.json({error:"Unauthorized"},{status:401});
 await ensureSchema(env.DB);
 const eventId=(await params).id, form=await request.formData(), files=form.getAll("photos").filter((value):value is File=>value instanceof File);
 if(!files.length)return Response.json({error:"Choose at least one photo."},{status:400}); if(files.length>30)return Response.json({error:"Upload up to 30 photos at a time."},{status:400});
 const allowed=new Set(["image/jpeg","image/png","image/webp"]);let count=0;
 const thumbnail=form.get("thumbnail");
 const width=Math.max(1,Math.min(10000,Number(form.get("width"))||1));
 const height=Math.max(1,Math.min(10000,Number(form.get("height"))||1));
 for(const file of files){
  if(!allowed.has(file.type)||file.size>15*1024*1024)continue;
  const id=crypto.randomUUID(),key=`events/${eventId}/${id}.webp`;
  const thumbnailKey=thumbnail instanceof File&&allowed.has(thumbnail.type)&&thumbnail.size<=2*1024*1024?`events/${eventId}/${id}-thumb.webp`:null;
  await env.PHOTOS.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:"public, max-age=31536000"}});
  if(thumbnailKey&&thumbnail instanceof File)await env.PHOTOS.put(thumbnailKey,thumbnail.stream(),{httpMetadata:{contentType:thumbnail.type,cacheControl:"public, max-age=31536000"}});
  await env.DB.prepare("INSERT INTO photos (id,event_id,object_key,thumbnail_key,alt,width,height,position,created_at) VALUES (?,?,?,?,'',?,?,(SELECT COALESCE(MAX(position),-1)+1 FROM photos WHERE event_id=?),?)").bind(id,eventId,key,thumbnailKey,width,height,eventId,Date.now()).run();count++
 }
 return count?Response.json({count}):Response.json({error:"No supported photos were uploaded."},{status:400});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await isAdmin()))return Response.json({error:"Unauthorized"},{status:401});
 await ensureSchema(env.DB);
 const eventId=(await params).id;
 const body=await request.json().catch(()=>null),ids=body?.ids;
 if(!Array.isArray(ids)||!ids.length||ids.length>100||ids.some((id)=>typeof id!=="string")||new Set(ids).size!==ids.length)return Response.json({error:"Invalid photo order."},{status:400});
 const existing=await env.DB.prepare("SELECT id FROM photos WHERE event_id=?").bind(eventId).all<{id:string}>();
 const existingIds=new Set(existing.results.map(photo=>photo.id));
 if(ids.length!==existingIds.size||ids.some((id)=>!existingIds.has(id)))return Response.json({error:"Photo order is incomplete."},{status:400});
 await env.DB.batch(ids.map((id,index)=>env.DB.prepare("UPDATE photos SET position=? WHERE id=? AND event_id=?").bind(index,id,eventId)));
 return Response.json({ok:true});
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSchema(env.DB);
  const eventId = (await params).id;

  const photos = await env.DB.prepare("SELECT object_key,thumbnail_key FROM photos WHERE event_id=?").bind(eventId).all<{ object_key: string; thumbnail_key: string | null }>();
  await Promise.all(photos.results.flatMap((photo) => [env.PHOTOS.delete(photo.object_key), ...(photo.thumbnail_key ? [env.PHOTOS.delete(photo.thumbnail_key)] : [])]));

  await env.DB.batch([
    env.DB.prepare("DELETE FROM photos WHERE event_id=?").bind(eventId),
    env.DB.prepare("UPDATE events SET cover_photo_id=NULL, cover_x=50, cover_y=50, updated_at=? WHERE id=?").bind(Date.now(), eventId),
  ]);

  return Response.json({ ok: true });
}
