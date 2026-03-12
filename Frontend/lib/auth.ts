export const getAuthHeaders = (): { Authorization: string } => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Access token manquant");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface User {
  id?: string | number;
  idUtilisateur?: string | number;
  email: string;
  name?: string;
  nomComplet?: string;
  role: string;
  avatar?: string;
}

const STORAGE_KEY = "user";
const LEGACY_STORAGE_KEY = "burning_heart_user";

const readStoredUser = (): string | null => {
  const currentUser = localStorage.getItem(STORAGE_KEY);
  if (currentUser) return currentUser;

  // Backward compatibility for old key still present in some environments.
  return localStorage.getItem(LEGACY_STORAGE_KEY);
};

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!getCurrentUser();
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const rawUser = readStoredUser();
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }
}

// export function login(email: string, password: string): User | null {
//   // Demo credentials
//   if (email === "admin@burningheart.com" && password === "admin123") {
//     const user: User = {
//       id: "1",
//       email: "admin@burningheart.com",
//       name: "Administrateur",
//       role: "admin",
//     }
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
//     return user
//   }
//   return null
// }

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem("token");
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin";
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return "Utilisateur";
  return user.nomComplet || user.name || "Utilisateur";
}

export function getUserInitials(user: User | null): string {
  const displayName = getUserDisplayName(user).trim();
  if (!displayName) return "U";

  const parts = displayName.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function getRoleLabel(role?: string): string {
  switch (role) {
    case "admin":
      return "Administrateur";
    case "editeur":
      return "Editeur";
    case "membre":
      return "Membre";
    case "user":
      return "Utilisateur";
    default:
      return role || "Inconnu";
  }
}
