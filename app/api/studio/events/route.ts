import { env } from "cloudflare:workers";
import { isAdmin } from "../auth";

function slugify(value:string){return value.toLowerCase().trim().normalize("NFKD").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,60)||`event-${Date.now()}`}
export async function POST(request:Request){
  if(!(await isAdmin())) return Response.json({error:"Unauthorized"},{status:401});
  if(!env.DB) return Response.json({error:"Storage is unavailable."},{status:503});
  const form=await request.formData();const title=String(form.get("title")??"").trim().slice(0,120);if(!title)return Response.json({error:"Add an event title."},{status:400});
  const id=crypto.randomUUID(), now=Date.now(), slug=`${slugify(title)}-${id.slice(0,6)}`;
  await env.DB.prepare("INSERT INTO events (id,title,slug,status,position,created_at,updated_at) VALUES (?,?,?,'draft',(SELECT COALESCE(MAX(position),-1)+1 FROM events),?,?)").bind(id,title,slug,now,now).run();
  return Response.json({event:{id,title,slug,status:"draft",position:999,photoCount:0}});
}
