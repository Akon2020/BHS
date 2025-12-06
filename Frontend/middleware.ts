import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    // Check for authentication cookie/token
    const authCookie = request.cookies.get("burning_heart_user")

    // If no auth and not on login page, redirect to login
    if (!authCookie && pathname !== "/connexion") {
      return NextResponse.redirect(new URL("/connexion", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
