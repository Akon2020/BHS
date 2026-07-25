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
