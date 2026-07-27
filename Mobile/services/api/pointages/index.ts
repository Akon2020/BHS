import { api } from "../client";

export type PointagePeriode = "hebdo" | "mensuel" | "annuel";

export interface ProfilPointage {
  idProfil: number;
  nomComplet: string;
  fonction?: string | null;
  source?: string | null;
  actif?: boolean;
}

export interface Pointage {
  idPointage: number;
  idProfil: number;
  date: string;
  heureDebut: string;
  heureFin?: string | null;
  dureeMinutes?: number | null;
  note?: string | null;
  profil?: { idProfil: number; nomComplet: string; fonction?: string | null };
}

export interface PointageStats {
  periode: { start: string; end: string; label?: string };
  stats: {
    profilsActifs: number;
    presences: number;
    tempsCumuleMinutes: number;
    tempsCumuleLabel: string;
  };
  recap: {
    idProfil?: number;
    nomComplet: string;
    tempsMinutes: number;
    tempsLabel: string;
  }[];
}

/** Profils de pointage actifs. */
export const getProfils = async (): Promise<ProfilPointage[]> => {
  const res = await api.get<{ nombre: number; profils: ProfilPointage[] }>(
    "/api/pointages/profils",
  );
  return res.data.profils ?? [];
};

/** Liste des pointages (filtrable par profil/période). */
export const getPointages = async (params?: {
  idProfil?: number;
  periode?: PointagePeriode;
}): Promise<Pointage[]> => {
  const res = await api.get<{ nombre: number; pointages: Pointage[] }>(
    "/api/pointages",
    { params },
  );
  return res.data.pointages ?? [];
};

/** Saisie manuelle d'une session (flux web existant). */
export const createPointage = async (payload: {
  idProfil: number;
  date: string;
  heureDebut: string;
  heureFin?: string | null;
  note?: string | null;
}): Promise<Pointage> => {
  const res = await api.post<{ message: string; data: Pointage }>(
    "/api/pointages",
    payload,
  );
  return res.data.data;
};

/** Démarre une session horodatée « maintenant » (UTC+2 serveur). */
export const pointerMaintenant = async (
  idProfil: number,
  note?: string,
): Promise<Pointage> => {
  const res = await api.post<{ message: string; data: Pointage }>(
    "/api/pointages/pointer",
    { idProfil, note },
  );
  return res.data.data;
};

/** Clôture une session ouverte (heure de fin = maintenant, UTC+2 serveur). */
export const cloturerPointage = async (id: number): Promise<Pointage> => {
  const res = await api.post<{ message: string; data: Pointage }>(
    `/api/pointages/${id}/cloturer`,
  );
  return res.data.data;
};

/** Suppression d'un pointage. */
export const deletePointage = async (id: number): Promise<void> => {
  await api.delete(`/api/pointages/${id}`);
};

/** Statistiques agrégées pour une période. */
export const getPointageStats = async (
  periode: PointagePeriode = "mensuel",
): Promise<PointageStats> => {
  const res = await api.get<PointageStats>("/api/pointages/stats", {
    params: { periode },
  });
  return res.data;
};
