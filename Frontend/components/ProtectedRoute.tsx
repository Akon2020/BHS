"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { hasAccessToPage } from "@/lib/permissions";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
  checkPagePermissions?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  checkPagePermissions = false,
}: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/connexion");
      return;
    }

    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/403");
      return;
    }

    // Vérifier les permissions granulaires de page si activé
    if (
      checkPagePermissions &&
      user &&
      pathname.startsWith("/admin") &&
      !hasAccessToPage(user.role, pathname)
    ) {
      router.push("/403");
      return;
    }
  }, [user, loading, pathname, allowedRoles, checkPagePermissions, router]);

  if (loading) return null;
  if (!user) return null;

  // Si checkPagePermissions est activé, vérifier que l'utilisateur a accès
  if (
    checkPagePermissions &&
    pathname.startsWith("/admin") &&
    !hasAccessToPage(user.role, pathname)
  ) {
    return null;
  }

  return <>{children}</>;
}
