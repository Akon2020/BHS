import api from "@/lib/axios";
import type {
  EntreeCalendrier,
  EntreeCalendrierBody,
  GetEntreesCalendrierResponse,
} from "@/types/user";

export const getEntreesCalendrier =
  async (): Promise<GetEntreesCalendrierResponse> => {
    const res = await api.get<GetEntreesCalendrierResponse>("/api/calendrier");
    return res.data;
  };

export const createEntreeCalendrier = async (
  payload: EntreeCalendrierBody,
): Promise<EntreeCalendrier> => {
  try {
    const res = await api.post<{ message: string; data: EntreeCalendrier }>(
      "/api/calendrier",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la création de l'entrée",
    );
  }
};

export const updateEntreeCalendrier = async (
  id: number,
  payload: Partial<EntreeCalendrierBody>,
): Promise<EntreeCalendrier> => {
  try {
    const res = await api.put<{ message: string; data: EntreeCalendrier }>(
      `/api/calendrier/${id}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de l'entrée",
    );
  }
};

export const deleteEntreeCalendrier = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/calendrier/${id}`);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de l'entrée",
    );
  }
};
