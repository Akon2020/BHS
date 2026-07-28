import { api } from "../client";
import type {
  Evenement,
  EvenementAdmin,
  FinancesResponse,
  StatutPaiement,
  GetEvenementResponse,
  GetEvenementsResponse,
  InscriptionBase,
  ChampFichier,
} from "./types";

/** Événements publiés (endpoint public, paginé). */
export const getEvenements = async (params?: {
  page?: number;
  limit?: number;
}): Promise<GetEvenementsResponse> => {
  const res = await api.get<GetEvenementsResponse>("/api/evenements", {
    params,
  });
  return res.data;
};

/** Détail d'un événement par slug (public). */
export const getEvenementBySlug = async (
  slug: string,
): Promise<Evenement> => {
  const res = await api.get<GetEvenementResponse>(
    `/api/evenements/slug/${slug}`,
  );
  return res.data.event;
};

/**
 * Inscription publique à un événement (visiteur ou connecté).
 * Envoi multipart : champs de base + reponsesPersonnalisees (JSON) + fichiers.
 */
export const registerToEvent = async (
  slug: string,
  base: InscriptionBase,
  reponses: Record<string, string>,
  fichiers: ChampFichier[],
): Promise<{ message: string }> => {
  const fd = new FormData();
  fd.append("nomComplet", base.nomComplet);
  fd.append("email", base.email);
  fd.append("telephone", base.telephone);
  fd.append("sexe", base.sexe);
  fd.append("reponsesPersonnalisees", JSON.stringify(reponses));

  for (const f of fichiers) {
    // FormData React Native : { uri, name, type }.
    fd.append(f.champId, {
      uri: f.uri,
      name: f.name,
      type: f.mimeType,
    } as unknown as Blob);
  }

  const res = await api.post<{ message: string }>(
    `/api/evenements/slug/${slug}/inscription`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

/* --------------------------------- Admin --------------------------------- */

/** Liste admin de tous les événements (tous statuts). */
export const getEvenementsAdmin = async (): Promise<Evenement[]> => {
  const res = await api.get<GetEvenementsResponse>("/api/evenements/admin", {
    params: { limit: 200 },
  });
  return res.data.events ?? [];
};

/** Détail admin d'un événement avec ses inscriptions. */
export const getEvenementAdmin = async (
  id: number,
): Promise<EvenementAdmin> => {
  const res = await api.get<{ event: EvenementAdmin }>(
    `/api/evenements/admin/${id}`,
  );
  return res.data.event;
};

/** Met à jour le statut de paiement d'une inscription (admin/éditeur). */
export const updatePaiement = async (
  eventId: number,
  inscriptionId: number,
  statutPaiement: StatutPaiement,
  montantPaye?: number,
): Promise<void> => {
  await api.patch(
    `/api/evenements/${eventId}/inscriptions/${inscriptionId}/paiement`,
    { statutPaiement, montantPaye },
  );
};

/** Statistiques financières d'un événement. */
export const getFinances = async (id: number): Promise<FinancesResponse> => {
  const res = await api.get<FinancesResponse>(`/api/evenements/${id}/finances`);
  return res.data;
};

/** Renvoie le billet (+ reçu si payant réglé) d'une inscription. */
export const resendTicket = async (
  eventId: number,
  inscriptionId: number,
): Promise<string> => {
  const res = await api.post<{ message: string }>(
    `/api/evenements/${eventId}/inscriptions/${inscriptionId}/renvoyer-ticket`,
  );
  return res.data.message;
};
