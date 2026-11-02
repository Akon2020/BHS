import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasAccessToPage, type UserRole } from "@/lib/permissions";

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

export async function proxy(req: NextRequest) {
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
    // Jeton expiré/invalide (ou API injoignable) : sur `/connexion` on laisse
    // afficher le formulaire — rediriger vers lui-même bouclerait à l'infini.
    if (isLoginRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/connexion", req.url));
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
