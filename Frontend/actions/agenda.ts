import api from "@/lib/axios";
import type {
  CreneauRdv,
  GetCreneauxResponse,
  GetRendezVousResponse,
  ParametreAgenda,
  RdvStatut,
  RendezVous,
} from "@/types/user";

/* ----------------------------- Paramètres ----------------------------- */

export const getParametreAgenda = async (): Promise<ParametreAgenda> => {
  const res = await api.get<{ parametre: ParametreAgenda }>(
    "/api/agenda/parametre",
  );
  return res.data.parametre;
};

export const updateParametreAgenda = async (
  payload: Partial<ParametreAgenda>,
): Promise<ParametreAgenda> => {
  try {
    const res = await api.put<{ message: string; data: ParametreAgenda }>(
      "/api/agenda/parametre",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour des paramètres",
    );
  }
};

/* ------------------------------ Créneaux ------------------------------ */

export const getCreneaux = async (): Promise<GetCreneauxResponse> => {
  const res = await api.get<GetCreneauxResponse>("/api/agenda/creneaux");
  return res.data;
};

export const getCreneauxDisponibles =
  async (): Promise<GetCreneauxResponse> => {
    const res = await api.get<GetCreneauxResponse>(
      "/api/agenda/creneaux/disponibles",
    );
    return res.data;
  };

export const createCreneau = async (payload: {
  date: string;
  heureDebut: string;
  heureFin: string;
  capacite?: number;
}): Promise<CreneauRdv> => {
  try {
    const res = await api.post<{ message: string; data: CreneauRdv }>(
      "/api/agenda/creneaux",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la création du créneau",
    );
  }
};

export const updateCreneau = async (
  id: number,
  payload: Partial<CreneauRdv>,
): Promise<CreneauRdv> => {
  try {
    const res = await api.put<{ message: string; data: CreneauRdv }>(
      `/api/agenda/creneaux/${id}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour du créneau",
    );
  }
};

export const deleteCreneau = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/agenda/creneaux/${id}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du créneau",
    );
  }
};

/* ----------------------------- Rendez-vous ---------------------------- */

export const reserverRdv = async (payload: {
  idCreneau: number;
  nom: string;
  email: string;
  telephone: string;
  motif?: string;
}): Promise<RendezVous> => {
  try {
    const res = await api.post<{ message: string; data: RendezVous }>(
      "/api/agenda/rendez-vous",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la réservation",
    );
  }
};

export const getRendezVous = async (
  statut?: string,
): Promise<GetRendezVousResponse> => {
  const res = await api.get<GetRendezVousResponse>("/api/agenda/rendez-vous", {
    params: statut ? { statut } : {},
  });
  return res.data;
};

export const suiviRdv = async (
  email: string,
): Promise<GetRendezVousResponse> => {
  const res = await api.get<GetRendezVousResponse>(
    "/api/agenda/rendez-vous/suivi",
    { params: { email } },
  );
  return res.data;
};

export const updateStatutRdv = async (
  id: number,
  payload: {
    statut?: RdvStatut;
    note?: string;
    date?: string;
    heureDebut?: string;
    heureFin?: string;
  },
): Promise<RendezVous> => {
  try {
    const res = await api.patch<{ message: string; data: RendezVous }>(
      `/api/agenda/rendez-vous/${id}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour du rendez-vous",
    );
  }
};

export const deleteRdv = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/agenda/rendez-vous/${id}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du rendez-vous",
    );
  }
};
