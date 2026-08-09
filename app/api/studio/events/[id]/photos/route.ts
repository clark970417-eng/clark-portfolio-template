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
 for(const file of files){if(!allowed.has(file.type)||file.size>15*1024*1024)continue;const id=crypto.randomUUID(),key=`events/${eventId}/${id}.webp`;await env.PHOTOS.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:"public, max-age=31536000"}});await env.DB.prepare("INSERT INTO photos (id,event_id,object_key,alt,position,created_at) VALUES (?,?,?,'',(SELECT COALESCE(MAX(position),-1)+1 FROM photos WHERE event_id=?),?)").bind(id,eventId,key,eventId,Date.now()).run();count++}
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

  const photos = await env.DB.prepare("SELECT object_key FROM photos WHERE event_id=?").bind(eventId).all<{ object_key: string }>();
  await Promise.all(photos.results.map((photo) => env.PHOTOS.delete(photo.object_key)));

  await env.DB.batch([
    env.DB.prepare("DELETE FROM photos WHERE event_id=?").bind(eventId),
    env.DB.prepare("UPDATE events SET cover_photo_id=NULL, cover_x=50, cover_y=50, updated_at=? WHERE id=?").bind(Date.now(), eventId),
  ]);

  return Response.json({ ok: true });
}
