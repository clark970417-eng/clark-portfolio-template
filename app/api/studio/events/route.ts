import { env } from "cloudflare:workers";
import { isAdmin } from "../auth";
import { ensureSchema } from "../../../../db/ensure-schema";

function slugify(value:string){return value.toLowerCase().trim().normalize("NFKD").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,60)||`event-${Date.now()}`}
export async function POST(request:Request){
  if(!(await isAdmin())) return Response.json({error:"Unauthorized"},{status:401});
  if(!env.DB) return Response.json({error:"Storage is unavailable."},{status:503});
  await ensureSchema(env.DB);
  const form=await request.formData();const title=String(form.get("title")??"").trim().slice(0,120);if(!title)return Response.json({error:"Add an event title."},{status:400});
  const category=String(form.get("category")??"school");if(!["school","outside-school"].includes(category))return Response.json({error:"Choose a valid category."},{status:400});
  const id=crypto.randomUUID(), now=Date.now(), slug=`${slugify(title)}-${id.slice(0,6)}`;
  await env.DB.prepare("INSERT INTO events (id,title,slug,category,status,position,created_at,updated_at) VALUES (?,?,?,?,'draft',(SELECT COALESCE(MAX(position),-1)+1 FROM events),?,?)").bind(id,title,slug,category,now,now).run();
  return Response.json({event:{id,title,slug,category,status:"draft",coverPhotoId:null,coverX:50,coverY:50,position:999,photoCount:0}});
}

export async function PATCH(request:Request){
  if(!(await isAdmin())) return Response.json({error:"Unauthorized"},{status:401});
  if(!env.DB) return Response.json({error:"Storage is unavailable."},{status:503});
  await ensureSchema(env.DB);
  const body=await request.json().catch(()=>null);
  const ids=body?.ids;
  if(!Array.isArray(ids)||!ids.length||ids.length>200||ids.some((id)=>typeof id!=="string")||new Set(ids).size!==ids.length){
    return Response.json({error:"Invalid event order."},{status:400});
  }
  await env.DB.batch(ids.map((id,index)=>env.DB.prepare("UPDATE events SET position=?,updated_at=? WHERE id=?").bind(index,Date.now(),id)));
  return Response.json({ok:true});
}
