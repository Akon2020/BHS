import type { UserRole } from "@/lib/permissions";

// Aligné sur le modèle Sequelize `utilisateurs` (cf. /info.md §3.1).
export interface Utilisateur {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  derniereConnexion?: string | null;
}

export interface ProfileResponse {
  authenticated?: boolean;
  user: Utilisateur;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Réponse attendue après l'ajout backend (project.md §5.2) : token dans le corps.
export interface AuthResult {
  user: Utilisateur;
  token: string;
}
