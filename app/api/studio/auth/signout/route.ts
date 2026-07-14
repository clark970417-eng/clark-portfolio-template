export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL("/studio", url.origin);
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      "Set-Cookie": "studio_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=Strict",
    },
  });
}
