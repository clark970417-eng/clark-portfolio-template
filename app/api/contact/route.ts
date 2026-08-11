import { getSiteSettings } from "../../site-settings";
import { verifyGoogleCredential } from "../../google-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const credential = String(form.get("googleCredential") ?? "");
  const user = await verifyGoogleCredential(credential);
  if (!user) return Response.json({ error: "Sign in with Google before sending a message." }, { status: 401 });
  const name = String(form.get("name") ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  if (!name) return Response.json({ error: "Enter your name before sending." }, { status: 400 });
  const message = String(form.get("message") ?? "").trim().slice(0, 5000);
  if (message.length < 2) return Response.json({ error: "Write a message before sending." }, { status: 400 });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return Response.json({ error: "Email delivery has not been configured yet. Please email Clark directly." }, { status: 503 });
  const destination = (await getSiteSettings()).contactEmail;
  const response = await fetch("https://api.resend.com/emails", { method:"POST", headers:{ Authorization:`Bearer ${apiKey}`, "Content-Type":"application/json" }, body:JSON.stringify({ from:process.env.CONTACT_FROM_EMAIL || "Clark Lo Portfolio <onboarding@resend.dev>", to:[destination], reply_to:user.email, subject:`Portfolio message from ${name}`, text:`Name: ${name}\nVerified Gmail: ${user.email}\n\n${message}` }) });
  if (!response.ok) {
    const providerMessage = await response.text();
    console.error("Resend rejected a portfolio message", response.status, providerMessage);
    return Response.json({ error: "The email provider rejected this message. Please email Clark directly." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
