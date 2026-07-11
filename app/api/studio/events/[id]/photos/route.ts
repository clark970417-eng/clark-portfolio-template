import { env } from "cloudflare:workers";
import { isAdmin } from "../../../auth";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await isAdmin()))return Response.json({error:"Unauthorized"},{status:401});
 const eventId=(await params).id, form=await request.formData(), files=form.getAll("photos").filter((value):value is File=>value instanceof File);
 if(!files.length)return Response.json({error:"Choose at least one photo."},{status:400}); if(files.length>30)return Response.json({error:"Upload up to 30 photos at a time."},{status:400});
 const allowed=new Set(["image/jpeg","image/png","image/webp"]);let count=0;
 for(const file of files){if(!allowed.has(file.type)||file.size>15*1024*1024)continue;const id=crypto.randomUUID(),key=`events/${eventId}/${id}.webp`;await env.PHOTOS.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:"public, max-age=31536000"}});await env.DB.prepare("INSERT INTO photos (id,event_id,object_key,alt,position,created_at) VALUES (?,?,?,'',(SELECT COALESCE(MAX(position),-1)+1 FROM photos WHERE event_id=?),?)").bind(id,eventId,key,eventId,Date.now()).run();count++}
 return count?Response.json({count}):Response.json({error:"No supported photos were uploaded."},{status:400});
}
