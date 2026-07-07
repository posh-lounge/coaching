// middleware.ts

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const currentPath = req.nextUrl.pathname;

 

  // Handle root "/"
  if (currentPath === "/") {
    if (!token) {
      return NextResponse.next();
    }

    switch (token.role) {
      case "admin":
        return NextResponse.redirect(new URL("/admin", req.url));

      case "coach":
        return NextResponse.redirect(new URL("/coach", req.url));

      case "coachee":
        return NextResponse.redirect(new URL("/coachee", req.url));

      case "other":
        return NextResponse.redirect(new URL("/other", req.url));

      default:
        return NextResponse.next();
    }
  }

  // Protected routes
  const rolePaths = {
    "/admin": "admin",
    "/coach": "coach",
    "/coachee": "coachee",
    "/other": "other",
  };

  for (const [path, requiredRole] of Object.entries(rolePaths)) {
    
    // Exact match OR child route match
    if (
      currentPath === path ||
      currentPath.startsWith(`${path}/`)
    ) {

      // No authentication
      if (!token) {
        return NextResponse.redirect(
          new URL("/", req.url)
        );
      }

      // Wrong role
      if (token.role !== requiredRole) {

        console.log("[middleware] Wrong role:", {
          currentPath,
          userRole: token.role,
          requiredRole,
          redirect: `/${token.role}`,
        });

        return NextResponse.redirect(
          new URL(`/${token.role}`, req.url)
        );
      }

      break;
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/coach/:path*",
    "/coachee/:path*",
    "/other/:path*",
  ],
};