import api from "@/lib/axios";
import type {
  Anniversaire,
  GetAnniversairesResponse,
} from "@/types/user";

export const getAnniversaires =
  async (): Promise<GetAnniversairesResponse> => {
    const res = await api.get<GetAnniversairesResponse>("/api/anniversaires");
    return res.data;
  };

export const createAnniversaire = async (payload: {
  nom: string;
  jour: number;
  mois: number;
  annee?: number;
  email?: string;
  note?: string;
  delaiRappelJours?: number;
}): Promise<Anniversaire> => {
  try {
    const res = await api.post<{ message: string; data: Anniversaire }>(
      "/api/anniversaires",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la création de l'anniversaire",
    );
  }
};

export const updateAnniversaire = async (
  id: number,
  payload: Partial<Anniversaire>,
): Promise<Anniversaire> => {
  try {
    const res = await api.put<{ message: string; data: Anniversaire }>(
      `/api/anniversaires/${id}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de l'anniversaire",
    );
  }
};

export const deleteAnniversaire = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/anniversaires/${id}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de l'anniversaire",
    );
  }
};

export const declencherVerificationAnniversaires = async (): Promise<string> => {
  try {
    const res = await api.post<{ message: string }>(
      "/api/anniversaires/verifier",
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la vérification",
    );
  }
};
