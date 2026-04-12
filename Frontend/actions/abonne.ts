import api from "@/lib/axios";
import type {
  Abonne,
  AbonneMutationResponse,
  GetAllAbonnesResponse,
  GetSingleAbonneResponse,
} from "@/types/user";

export type StatutEnum = "actif" | "inactif" | "desabonne";

export interface AddAbonnePayload {
  nomComplet: string;
  email: string;
}

export const getAllAbonnes = async (): Promise<GetAllAbonnesResponse> => {
  try {
    const res = await api.get<GetAllAbonnesResponse>("/api/abonnes");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des abonnés",
    );
  }
};

export const getAllActifAbonnes = async (): Promise<GetAllAbonnesResponse> => {
  try {
    const res = await api.get<GetAllAbonnesResponse>("/api/abonnes/actifs");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des abonnés",
    );
  }
};

export const addAbonne = async (data: AddAbonnePayload): Promise<void> => {
  try {
    await api.post("/api/abonnes/subscribe", data);
  } catch (error: any) {
    console.error("Erreur lors de l'abonnement à la newsletter: ", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};

export const getSingleAbonne = async (
  id: number,
): Promise<GetSingleAbonneResponse> => {
  try {
    const res = await api.get<GetSingleAbonneResponse>(`/api/abonnes/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération de l'abonné",
    );
  }
};

export const updateAbonne = async (
  id: number,
  data: { nomComplet: string; email: string },
): Promise<AbonneMutationResponse> => {
  try {
    const res = await api.patch<AbonneMutationResponse>(
      `/api/abonnes/update/${id}`,
      data,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la mise à jour",
    );
  }
};

export const deleteAbonne = async (
  id: number,
): Promise<AbonneMutationResponse> => {
  try {
    const res = await api.delete<AbonneMutationResponse>(
      `/api/abonnes/delete/${id}`,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la suppression",
    );
  }
};

export type { Abonne };
