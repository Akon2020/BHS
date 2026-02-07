import api from "@/lib/axios";

export type StatutEnum = "actif" | "inactif" | "desabonne";

export interface AddAbonnePayload {
  nomComplet: string;
  email: string;
}

export interface Abonne {
  id: number;
  nomComplet: string;
  email: string;
  statut: StatutEnum;
  dateInscription: string;
}
export interface GetAllAbonnesResponse {
  nombre: number;
  abonnes: Abonne[];
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
