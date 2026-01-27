import api from "@/lib/axios";

export interface AddAbonnePayload {
  nomComplet: string;
  email: string;
}

export const addAbonne = async (data: AddAbonnePayload): Promise<void> => {
  try {
    await api.post("/api/abonnes/subscribe", data);
  } catch (error: any) {
    console.error("Erreur lors de l'abonnement à la newsletter: ", error);
    throw new Error(error.response?.data?.message || "Erreur inconnue");
  }
};
