import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type UserRole = "admin" | "editeur" | "membre";

const ADMIN_PAGE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "/admin",
    "/admin/blog",
    "/admin/categories",
    "/admin/events",
    "/admin/contact",
    "/admin/profile",
    "/admin/newsletter",
    "/admin/team",
    "/admin/users",
    "/admin/settings",
  ],
  editeur: [
    "/admin",
    "/admin/blog",
    "/admin/categories",
    "/admin/events",
    "/admin/contact",
    "/admin/profile",
  ],
  membre: [
    "/admin",
    "/admin/blog",
    "/admin/categories",
    "/admin/events",
    "/admin/contact",
    "/admin/profile",
    "/admin/newsletter",
    "/admin/team",
    "/admin/users",
  ],
};

const hasAccessToPage = (userRole: UserRole, pathname: string): boolean => {
  const allowedPages = ADMIN_PAGE_PERMISSIONS[userRole] || [];
  return allowedPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );
};

const getUserFromSession = async (token: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    const user = data?.user;

    if (!user?.role) return null;
    return user;
  } catch {
    return null;
  }
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/connexion";

  if (!isAdminRoute && !isLoginRoute) {
    return NextResponse.next();
  }

  if (!token) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/connexion", req.url));
    }
    return NextResponse.next();
  }

  const user = await getUserFromSession(token);

  if (!user) {
    const response = NextResponse.redirect(new URL("/connexion", req.url));
    response.cookies.delete("token");
    return response;
  }

  const role = user.role as UserRole;

  if (isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (!hasAccessToPage(role, pathname)) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/connexion"],
};
