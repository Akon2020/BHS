import { api } from "../client";

/** Abonnement à la newsletter (public). */
export const subscribeNewsletter = async (payload: {
  nomComplet: string;
  email: string;
}): Promise<string> => {
  const res = await api.post<{ message: string }>(
    "/api/abonnes/subscribe",
    payload,
  );
  return res.data.message;
};
