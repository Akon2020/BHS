import api from "@/lib/axios";
import type {
  GetTemoignagesResponse,
  Temoignage,
} from "@/types/user";

// Public : témoignages publiés (utilisé sur la home).
export const getTemoignagesPublic =
  async (): Promise<GetTemoignagesResponse> => {
    try {
      const res = await api.get<GetTemoignagesResponse>(
        "/api/temoignages/public",
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des témoignages",
      );
    }
  };

// Admin : tous les témoignages.
export const getTemoignages = async (): Promise<GetTemoignagesResponse> => {
  try {
    const res = await api.get<GetTemoignagesResponse>("/api/temoignages");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des témoignages",
    );
  }
};

export const createTemoignage = async (
  data: FormData,
): Promise<Temoignage> => {
  try {
    const res = await api.post<{ message: string; data: Temoignage }>(
      "/api/temoignages",
      data,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la création du témoignage",
    );
  }
};

export const updateTemoignage = async (
  id: number,
  data: FormData,
): Promise<Temoignage> => {
  try {
    const res = await api.put<{ message: string; data: Temoignage }>(
      `/api/temoignages/${id}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour du témoignage",
    );
  }
};

export const deleteTemoignage = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/temoignages/${id}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du témoignage",
    );
  }
};
