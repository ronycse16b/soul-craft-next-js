
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    // cookieName:
    //   process.env.NODE_ENV === "production"
    //     ? "__Secure-authjs.session-token"
    //     : "authjs.session-token",
  });

  // Dev debug
  if (process.env.NODE_ENV !== "production") {
    console.log("Auth Check:", {
      pathname,
      hasToken: !!token,
      role: token?.role,
    });
  }

  // Dashboard → Admin/Moderator only
  if (pathname.startsWith("/dashboard")) {
    if (!token || (token.role !== "moderator" && token.role !== "admin")) {
      const loginUrl = new URL("/auth/sign-in", req.url);
      loginUrl.searchParams.set("reason", "not-authorize");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Account → User only
  if (pathname.startsWith("/account")) {
    if (!token || token.role !== "user") {
      const loginUrl = new URL("/auth/sign-in", req.url);
      loginUrl.searchParams.set("reason", "login-required");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};



