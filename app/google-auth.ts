import { createRemoteJWKSet, jwtVerify } from "jose";

export type GoogleUser = {
  id: string;
  displayName: string;
  email: string;
};

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function verifyGoogleCredential(credential: string): Promise<GoogleUser | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !credential || credential.length > 10000) return null;

  try {
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });
    if (!payload.sub || payload.email_verified !== true || typeof payload.email !== "string") return null;

    return {
      id: payload.sub,
      displayName: typeof payload.name === "string" && payload.name.trim() ? payload.name : payload.email,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
