import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest) {
  const token = await getToken({ req });
  const result = await fetch(
    `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/revoke`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID || "",
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
        token: token?.refreshToken || "",
      }).toString(),
    }
  );

  if (result.ok) {
    return NextResponse.json({ status: 200 });
  } else {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
