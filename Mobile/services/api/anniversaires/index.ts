import { api } from "../client";

export interface AnniversaireAVenir {
  nom: string;
  jour: number;
  mois: number;
  dansJours: number;
}

/** Prochains anniversaires (membres connectés) — sans année de naissance. */
export const getAnniversairesAVenir = async (): Promise<AnniversaireAVenir[]> => {
  const res = await api.get<{ nombre: number; anniversaires: AnniversaireAVenir[] }>(
    "/api/anniversaires/a-venir",
  );
  return res.data.anniversaires ?? [];
};

/* ------------------------------- Admin ------------------------------- */

export interface Anniversaire {
  idAnniversaire: number;
  nom: string;
  jour: number;
  mois: number;
  annee?: number | null;
  email?: string | null;
  note?: string | null;
  delaiRappelJours?: number;
}

export interface AnniversairePayload {
  nom: string;
  jour: number;
  mois: number;
  annee?: number | null;
  email?: string | null;
  note?: string | null;
  delaiRappelJours?: number;
}

/** Liste complète des anniversaires (admin). */
export const getAnniversaires = async (): Promise<Anniversaire[]> => {
  const res = await api.get<{ nombre: number; anniversaires: Anniversaire[] }>(
    "/api/anniversaires",
  );
  return res.data.anniversaires ?? [];
};

/** Création d'un anniversaire (admin). */
export const createAnniversaire = async (
  payload: AnniversairePayload,
): Promise<Anniversaire> => {
  const res = await api.post<{ message: string; data: Anniversaire }>(
    "/api/anniversaires",
    payload,
  );
  return res.data.data;
};

/** Mise à jour d'un anniversaire (admin). */
export const updateAnniversaire = async (
  id: number,
  payload: Partial<AnniversairePayload>,
): Promise<Anniversaire> => {
  const res = await api.put<{ message: string; data: Anniversaire }>(
    `/api/anniversaires/${id}`,
    payload,
  );
  return res.data.data;
};

/** Suppression d'un anniversaire (admin). */
export const deleteAnniversaire = async (id: number): Promise<void> => {
  await api.delete(`/api/anniversaires/${id}`);
};
