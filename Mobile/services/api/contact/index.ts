import { api } from "../client";

/** Envoi d'un message de contact (public). */
export const sendContact = async (payload: {
  nomComplet: string;
  email: string;
  sujet: string;
  message: string;
}): Promise<string> => {
  const res = await api.post<{ message: string }>(
    "/api/contacts/add",
    payload,
  );
  return res.data.message;
};
