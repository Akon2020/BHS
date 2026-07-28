import { api } from "../client";

export type AbonneStatut = "actif" | "inactif" | "desabonne";

export interface Abonne {
  idAbonne: number;
  nomComplet: string;
  email: string;
  statut: AbonneStatut;
  dateAbonnement: string;
  dateDesabonnement?: string | null;
}

/** Liste des abonnés à la newsletter (staff). */
export const getAbonnes = async (): Promise<Abonne[]> => {
  const res = await api.get<{ nombre: number; abonnes: Abonne[] }>(
    "/api/abonnes",
  );
  return res.data.abonnes ?? [];
};

/** Abonnement à la newsletter (public). */
export const subscribeNewsletter = async (payload: {
  nomComplet: string;
  email: string;
}): Promise<string> => {
  const res = await api.post<{ message: string }>(
    "/api/abonnes/subscribe",
    payload,
  );
  return res.data.message;
};
