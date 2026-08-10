import { getSiteSettings } from "../../site-settings";

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim().slice(0, 100);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const message = String(form.get("message") ?? "").trim().slice(0, 5000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 2) return Response.json({ error: "Check the form fields." }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: "Email delivery is not configured yet." }, { status: 503 });
  const destination = (await getSiteSettings()).contactEmail;
  const response = await fetch("https://api.resend.com/emails", { method:"POST", headers:{ Authorization:`Bearer ${apiKey}`, "Content-Type":"application/json" }, body:JSON.stringify({ from:process.env.CONTACT_FROM_EMAIL || "Clark Lo Portfolio <onboarding@resend.dev>", to:[destination], reply_to:email, subject:`Portfolio message from ${name}`, text:`From: ${name} <${email}>\n\n${message}` }) });
  if (!response.ok) return Response.json({ error: "Message delivery failed." }, { status: 502 });
  return Response.json({ ok: true });
}
