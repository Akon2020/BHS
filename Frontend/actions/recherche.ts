import api from "@/lib/axios";
import type { RechercheResponse } from "@/types/user";

export const rechercheGlobale = async (
  q: string,
): Promise<RechercheResponse> => {
  try {
    const res = await api.get<RechercheResponse>("/api/recherche", {
      params: { q },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de la recherche",
    );
  }
};
