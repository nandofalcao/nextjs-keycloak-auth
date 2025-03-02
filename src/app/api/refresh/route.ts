import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextApiRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  return new Response(JSON.stringify({ token }), {
    status: 200,
  });
}
