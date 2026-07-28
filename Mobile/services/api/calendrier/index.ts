import { api } from "../client";

export interface EntreeCalendrier {
  idEntree: number;
  titre: string;
  description?: string | null;
  date: string;
  heureDebut?: string | null;
  heureFin?: string | null;
  lieu?: string | null;
  journeeEntiere: boolean;
}

export interface EntreeCalendrierPayload {
  titre: string;
  description?: string | null;
  date: string;
  heureDebut?: string | null;
  heureFin?: string | null;
  lieu?: string | null;
  journeeEntiere?: boolean;
}

/** Entrées manuelles du calendrier (staff). */
export const getEntreesCalendrier = async (): Promise<EntreeCalendrier[]> => {
  const res = await api.get<{ nombre: number; entrees: EntreeCalendrier[] }>(
    "/api/calendrier",
  );
  return res.data.entrees ?? [];
};

/** Création d'une entrée (staff). */
export const createEntreeCalendrier = async (
  payload: EntreeCalendrierPayload,
): Promise<EntreeCalendrier> => {
  const res = await api.post<{ message: string; data: EntreeCalendrier }>(
    "/api/calendrier",
    payload,
  );
  return res.data.data;
};

/** Mise à jour d'une entrée (staff). */
export const updateEntreeCalendrier = async (
  id: number,
  payload: Partial<EntreeCalendrierPayload>,
): Promise<EntreeCalendrier> => {
  const res = await api.put<{ message: string; data: EntreeCalendrier }>(
    `/api/calendrier/${id}`,
    payload,
  );
  return res.data.data;
};

/** Suppression d'une entrée (staff). */
export const deleteEntreeCalendrier = async (id: number): Promise<void> => {
  await api.delete(`/api/calendrier/${id}`);
};
