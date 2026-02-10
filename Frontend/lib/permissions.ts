/**
 * Configuration des permissions par rôle pour l'admin
 * Définit quelles pages chaque rôle peut accéder
 */

export type UserRole = "admin" | "editeur" | "membre";

export const ADMIN_PAGE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "/admin",
    "/admin/dashboard",
    "/admin/blog",
    "/admin/categories",
    "/admin/events",
    "/admin/profile",
    "/admin/newsletter",
    "/admin/team",
    "/admin/users",
    "/admin/settings",
  ],
  editeur: [
    "/admin",
    "/admin/dashboard",
    "/admin/blog",
    "/admin/categories",
    "/admin/events",
    "/admin/profile",
  ],
  membre: [],
};

/**
 * Vérifie si un utilisateur avec un rôle donné a accès à une page
 */
export const hasAccessToPage = (
  userRole: UserRole,
  pathname: string,
): boolean => {
  const allowedPages = ADMIN_PAGE_PERMISSIONS[userRole];

  // Vérifier si le chemin exact est autorisé ou commence par un chemin autorisé
  return allowedPages.some(
    (page) => pathname === page || pathname.startsWith(page + "/"),
  );
};

/**
 * Récupère le rôle d'un utilisateur
 */
export const getUserRole = (): UserRole | null => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.role || null;
  } catch {
    return null;
  }
};

/**
 * Vérifie si l'utilisateur current a accès à une page
 */
export const canAccessPage = (pathname: string): boolean => {
  const role = getUserRole();
  if (!role) return false;

  return hasAccessToPage(role, pathname);
};
