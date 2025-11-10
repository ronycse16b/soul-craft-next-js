import { getToken } from "next-auth/jwt";

export async function adminOnlyMiddleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token || token.role !== "admin" ) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  return null; // continue if admin
}

export async function userOnlyMiddleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token || token.role !== "user") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  // Return user info
  return token;
}