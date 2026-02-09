import api from "@/lib/axios";
import type { DashboardResponse } from "@/types/dashboard";

export const getDashboard = async (): Promise<DashboardResponse> => {
  try {
    const res = await api.get<DashboardResponse>("/api/dashboard");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération du dashboard",
    );
  }
};
