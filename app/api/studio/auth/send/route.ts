import { env } from "cloudflare:workers";
import { ensureSchema } from "../../../../../db/ensure-schema";

const ADMIN_EMAIL = "clark970417@gmail.com";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || email.trim().toLowerCase() !== ADMIN_EMAIL) {
      return Response.json({ error: "Only the administrator email is allowed." }, { status: 400 });
    }

    if (!env.DB) {
      return Response.json({ error: "Database not available." }, { status: 500 });
    }

    await ensureSchema(env.DB);

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Insert into database
    await env.DB.prepare(
      "INSERT INTO verification_codes (id, email, code, expires_at, verified) VALUES (?, ?, ?, ?, 0)"
    )
      .bind(sessionId, ADMIN_EMAIL, code, expiresAt)
      .run();

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Email delivery service not configured." }, { status: 503 });
    }

    const fromEmail = process.env.CONTACT_FROM_EMAIL || "Clark Lo Portfolio <onboarding@resend.dev>";
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [ADMIN_EMAIL],
        subject: "Portfolio Studio Login Verification Code",
        text: `Your verification code is: ${code}\n\nIt will expire in 10 minutes.\nSession ID: ${sessionId}`,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return Response.json({ error: "Failed to send email." }, { status: 502 });
    }

    return Response.json({ ok: true, sessionId });
  } catch (err: any) {
    console.error("Auth send error:", err);
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
