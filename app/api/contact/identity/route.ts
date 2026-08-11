import { verifyGoogleCredential } from "../../../google-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { credential?: unknown } | null;
  const credential = typeof body?.credential === "string" ? body.credential : "";
  const user = await verifyGoogleCredential(credential);
  if (!user) return Response.json({ error: "Google sign-in could not be verified." }, { status: 401 });
  return Response.json({ displayName: user.displayName, email: user.email });
}
