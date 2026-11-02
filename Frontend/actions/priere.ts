import api from "@/lib/axios";
import type {
  CreateDemandePrierePayload,
  DemandePriere,
  DemandePriereStatut,
  GetDemandesPriereResponse,
  PrieresDuJourResponse,
  UpdateDemandePrierePayload,
} from "@/types/user";

// Public : intentions portées aujourd'hui (home + /priere).
export const getPrieresDuJour = async (): Promise<PrieresDuJourResponse> => {
  try {
    const res = await api.get<PrieresDuJourResponse>("/api/prieres/aujourdhui");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des intentions du jour",
    );
  }
};

// Public : dépôt d'une demande de prière.
export const createDemandePriere = async (
  payload: CreateDemandePrierePayload,
): Promise<string> => {
  try {
    const res = await api.post<{ message: string }>("/api/prieres", payload);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l'envoi de votre intention",
    );
  }
};

// Admin : demandes filtrables.
export const getDemandesPriere = async (params?: {
  statut?: DemandePriereStatut;
  date?: string;
  q?: string;
}): Promise<GetDemandesPriereResponse> => {
  try {
    const res = await api.get<GetDemandesPriereResponse>("/api/prieres", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des demandes",
    );
  }
};

export const createIntentionEquipe = async (payload: {
  intention: string;
  datePriere?: string;
}): Promise<DemandePriere> => {
  try {
    const res = await api.post<{ message: string; data: DemandePriere }>(
      "/api/prieres/equipe",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de l'ajout de l'intention",
    );
  }
};

export const updateDemandePriere = async (
  id: number,
  payload: UpdateDemandePrierePayload,
): Promise<DemandePriere> => {
  try {
    const res = await api.put<{ message: string; data: DemandePriere }>(
      `/api/prieres/${id}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour de la demande",
    );
  }
};

export const deleteDemandePriere = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/prieres/${id}`);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression de la demande",
    );
  }
};
