import api from "@/lib/axios";
import type {
  CreatePointagePayload,
  CreateProfilPayload,
  GetPointagesResponse,
  GetProfilsResponse,
  Pointage,
  PointagePeriode,
  PointageStatsResponse,
  ProfilPointage,
} from "@/types/user";

/* ------------------------------- Profils ------------------------------- */

export const getProfilsPointage = async (): Promise<GetProfilsResponse> => {
  try {
    const res = await api.get<GetProfilsResponse>("/api/pointages/profils");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des profils",
    );
  }
};

export const createProfilPointage = async (
  payload: CreateProfilPayload,
): Promise<ProfilPointage> => {
  try {
    const res = await api.post<{ message: string; data: ProfilPointage }>(
      "/api/pointages/profils",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la création du profil",
    );
  }
};

export const deleteProfilPointage = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/pointages/profils/${id}`,
    );
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du profil",
    );
  }
};

/* ------------------------------ Pointages ------------------------------ */

export const getPointages = async (params?: {
  idProfil?: number;
  periode?: PointagePeriode;
  start?: string;
  end?: string;
}): Promise<GetPointagesResponse> => {
  try {
    const res = await api.get<GetPointagesResponse>("/api/pointages", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des pointages",
    );
  }
};

export const createPointage = async (
  payload: CreatePointagePayload,
): Promise<Pointage> => {
  try {
    const res = await api.post<{ message: string; data: Pointage }>(
      "/api/pointages",
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de l'enregistrement du pointage",
    );
  }
};

export const updatePointage = async (
  id: number,
  payload: Partial<CreatePointagePayload>,
): Promise<Pointage> => {
  try {
    const res = await api.put<{ message: string; data: Pointage }>(
      `/api/pointages/${id}`,
      payload,
    );
    return res.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la mise à jour du pointage",
    );
  }
};

export const deletePointage = async (id: number): Promise<string> => {
  try {
    const res = await api.delete<{ message: string }>(`/api/pointages/${id}`);
    return res.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la suppression du pointage",
    );
  }
};

/* -------------------------------- Stats -------------------------------- */

export const getPointageStats = async (
  periode: PointagePeriode = "mensuel",
): Promise<PointageStatsResponse> => {
  try {
    const res = await api.get<PointageStatsResponse>("/api/pointages/stats", {
      params: { periode },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors du calcul des statistiques",
    );
  }
};

/**
 * URL d'export PDF (à ouvrir dans un nouvel onglet).
 * Le cookie httpOnly est envoyé automatiquement par le navigateur.
 */
export const getPointageExportUrl = (params: {
  periode: PointagePeriode;
  scope: "global" | "individuel";
  idProfil?: number;
}): string => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const search = new URLSearchParams({
    periode: params.periode,
    scope: params.scope,
  });
  if (params.idProfil) search.set("idProfil", String(params.idProfil));
  return `${base}/api/pointages/export?${search.toString()}`;
};
