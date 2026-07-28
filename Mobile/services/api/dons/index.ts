import { api } from "../client";

export type DonStatut = "annonce" | "confirme";

export interface Don {
  idDon: number;
  nom: string;
  email: string;
  montant?: string | number | null;
  devise: string;
  moyen: "carte" | "virement" | "mobile";
  message?: string | null;
  statut: DonStatut;
  createdAt: string;
}

/** Liste des dons (admin/éditeur). */
export const getDons = async (): Promise<Don[]> => {
  const res = await api.get<{ nombre: number; dons: Don[] }>("/api/dons");
  return res.data.dons ?? [];
};

/** Bascule du statut d'un don (annoncé/confirmé). */
export const updateDonStatut = async (
  id: number,
  statut: DonStatut,
): Promise<Don> => {
  const res = await api.patch<{ message: string; data: Don }>(
    `/api/dons/${id}`,
    { statut },
  );
  return res.data.data;
};
