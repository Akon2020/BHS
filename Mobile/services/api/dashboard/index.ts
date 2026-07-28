import { api } from "../client";

interface Section {
  nombre: number;
  stat: string;
}

export interface DashboardData {
  users: Section;
  abonnes: Section & {
    parStatut?: { actif: number; inactif: number; desabonne: number };
  };
  evenements: Section & {
    aVenir?: number;
    passes?: number;
    tauxRemplissage?: number;
  };
  blogs: Section;
  rendezVous?: { enAttente: number };
  taches?: { aFaire: number; enCours: number; fait: number };
  pointage?: { heuresMois: number };
  dons?: { totalParDevise: Record<string, number> };
  finances?: { nbInscrits: number; encaisseParDevise: Record<string, number> };
}

/** Agrégats du tableau de bord (admin/éditeur/membre). */
export const getDashboard = async (): Promise<DashboardData> => {
  const res = await api.get<DashboardData>("/api/dashboard");
  return res.data;
};
