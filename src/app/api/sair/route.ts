import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log(token);

  const shouldRefreshTime =
    Math.floor(Math.floor(Date.now() / 1000)) >=
    ((token?.accessTokenExpires as number) || 0);

  console.log(`shouldRefreshTime`, shouldRefreshTime);

  return new Response(JSON.stringify({ token }), {
    status: 200,
  });
}

export { handler as GET, handler as POST };
