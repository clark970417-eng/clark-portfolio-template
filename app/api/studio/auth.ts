import { getChatGPTUser } from "../../chatgpt-auth";
const ADMIN_EMAIL = "clark970417@gmail.com";
export async function isAdmin() { const user = await getChatGPTUser(); return user?.email.toLowerCase() === ADMIN_EMAIL; }
