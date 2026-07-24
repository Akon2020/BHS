/**
 * Matrice de permissions — RÉPLIQUE EXACTE de Frontend/lib/permissions.ts.
 * Toute divergence est un bug (cf. Mobile/CLAUDE.md §6). À resynchroniser si le
 * web évolue ; idéalement extraite dans un package partagé plus tard.
 */

export type UserRole = "admin" | "editeur" | "membre";

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
    "/admin/calendrier",
    "/admin/profile",
  ],
  membre: ["/admin", "/admin/team", "/admin/taches", "/admin/profile"],
};

/** Le rôle `admin` a accès à tout ; sinon, correspondance exacte ou préfixe. */
export const hasAccessToPage = (role: UserRole, path: string): boolean => {
  if (role === "admin") return true;
  const allowed = ADMIN_PAGE_PERMISSIONS[role] ?? [];
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
};
