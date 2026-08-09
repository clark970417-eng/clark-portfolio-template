import { headers } from "next/headers";
import { getChatGPTUser } from "../../chatgpt-auth";

const ADMIN_EMAILS = new Set(["mary680616@gmail.com"]);

export async function isAdmin() {
  const host = (await headers()).get("host") ?? "";
  if (host.startsWith("localhost:") || host.startsWith("127.0.0.1:")) return true;
  const user = await getChatGPTUser();
  return !!user && ADMIN_EMAILS.has(user.email.toLowerCase());
}
