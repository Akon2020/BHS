import api from "@/lib/axios";
import type { CreateDonPayload, Don, GetDonsResponse } from "@/types/user";

// Public : enregistrer une intention de don.
export const createDon = async (payload: CreateDonPayload): Promise<Don> => {
  try {
    const res = await api.post<{ message: string; data: Don }>(
      "/api/dons",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l'enregistrement de votre don",
    );
  }
};

// Admin
export const getDons = async (): Promise<GetDonsResponse> => {
  try {
    const res = await api.get<GetDonsResponse>("/api/dons");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la récupération des dons",
    );
  }
};

export const updateDonStatut = async (
  id: number,
  statut: "annonce" | "confirme",
): Promise<Don> => {
  try {
    const res = await api.patch<{ message: string; data: Don }>(
      `/api/dons/${id}`,
      { statut },
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour du statut",
    );
  }
};

export const deleteDon = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/dons/${id}`);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la suppression du don",
    );
  }
};
