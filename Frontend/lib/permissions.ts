/**
 * Configuration des permissions par rôle pour l'admin
 * Définit quelles pages chaque rôle peut accéder
 */

export type UserRole = "admin" | "editeur" | "membre";

/**
 * Matrice de permissions par rôle (source unique partagée avec `proxy.ts`).
 * - `admin`  : accès total à l'espace admin (géré par court-circuit dans `hasAccessToPage`).
 * - `editeur`: contenu (blog, catégories, événements, fichiers, contacts, équipe, pointage) + profil + lecture du tableau de bord.
 * - `membre` : profil + équipe + lecture du tableau de bord.
 */
export const ADMIN_PAGE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [],
  editeur: [
    "/admin",
    "/admin/blog",
    "/admin/comments",
    "/admin/categories",
    "/admin/events",
    "/admin/files",
    "/admin/contact",
    "/admin/team",
    "/admin/pointage",
    "/admin/temoignages",
    "/admin/dons",
    "/admin/agenda",
    "/admin/anniversaires",
    "/admin/taches",
    "/admin/profile",
  ],
  membre: ["/admin", "/admin/team", "/admin/taches", "/admin/profile"],
};

/**
 * Vérifie si un utilisateur avec un rôle donné a accès à une page.
 * Le rôle `admin` a un accès total (toute page sous `/admin`).
 */
export const hasAccessToPage = (
  userRole: UserRole,
  pathname: string,
): boolean => {
  if (userRole === "admin") return true;

  const allowedPages = ADMIN_PAGE_PERMISSIONS[userRole] ?? [];

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
