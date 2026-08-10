import { env } from "cloudflare:workers";
import { isAdmin } from "../../../../auth";
import { ensureSchema } from "../../../../../../../db/ensure-schema";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string;photoId:string}>}){
  if(!(await isAdmin()))return Response.json({error:"Unauthorized"},{status:401});
  await ensureSchema(env.DB);
  const {id,photoId}=await params;
  const body=await request.json().catch(()=>null);
  if(typeof body?.alt!=="string")return Response.json({error:"Invalid photo description."},{status:400});
  const alt=body.alt.trim().slice(0,240);
  await env.DB.prepare("UPDATE photos SET alt=? WHERE id=? AND event_id=?").bind(alt,photoId,id).run();
  return Response.json({ok:true,alt});
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string;photoId:string}>}){
  if(!(await isAdmin()))return Response.json({error:"Unauthorized"},{status:401});
  await ensureSchema(env.DB);
  const {id,photoId}=await params;
  const photo=await env.DB.prepare("SELECT object_key,thumbnail_key FROM photos WHERE id=? AND event_id=? LIMIT 1").bind(photoId,id).first<{object_key:string;thumbnail_key:string|null}>();
  if(!photo)return Response.json({error:"Photo not found."},{status:404});
  await Promise.all([env.PHOTOS.delete(photo.object_key),photo.thumbnail_key?env.PHOTOS.delete(photo.thumbnail_key):Promise.resolve()]);
  await env.DB.batch([
    env.DB.prepare("UPDATE events SET cover_photo_id=NULL,cover_x=50,cover_y=50,updated_at=? WHERE id=? AND cover_photo_id=?").bind(Date.now(),id,photoId),
    env.DB.prepare("DELETE FROM photos WHERE id=? AND event_id=?").bind(photoId,id),
  ]);
  return Response.json({ok:true});
}
