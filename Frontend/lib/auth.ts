export const getAuthHeaders = (): { Authorization: string } => {
  const token = localStorage.getItem("loginToken");

  if (!token) {
    throw new Error("Access token manquant");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

// Simple authentication utilities (client-side for demo)
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

const STORAGE_KEY = "burning_heart_user"

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  const user = localStorage.getItem(STORAGE_KEY)
  return !!user
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem(STORAGE_KEY)
  return user ? JSON.parse(user) : null
}

export function login(email: string, password: string): User | null {
  // Demo credentials
  if (email === "admin@burningheart.com" && password === "admin123") {
    const user: User = {
      id: "1",
      email: "admin@burningheart.com",
      name: "Administrateur",
      role: "admin",
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }
  return null
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin"
}
