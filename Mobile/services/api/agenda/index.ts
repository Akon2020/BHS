import { api } from "../client";
import type {
  ParametreAgenda,
  CreneauRdv,
  RendezVous,
  RdvStatut,
  ReserverRdvPayload,
} from "./types";

/** Paramètre agenda (coordinateur unique) — public. */
export const getParametreAgenda = async (): Promise<ParametreAgenda> => {
  const res = await api.get<{ parametre: ParametreAgenda }>(
    "/api/agenda/parametre",
  );
  return res.data.parametre;
};

/** Créneaux disponibles (public) — inclut le nombre de places restantes. */
export const getCreneauxDisponibles = async (): Promise<CreneauRdv[]> => {
  const res = await api.get<{ creneaux: CreneauRdv[] }>(
    "/api/agenda/creneaux/disponibles",
  );
  return res.data.creneaux ?? [];
};

/** Réservation d'un rendez-vous (public). */
export const reserverRdv = async (
  payload: ReserverRdvPayload,
): Promise<RendezVous> => {
  const res = await api.post<{ message: string; data: RendezVous }>(
    "/api/agenda/rendez-vous",
    payload,
  );
  return res.data.data;
};

/** Suivi de ses rendez-vous par email (public). */
export const suiviRdv = async (email: string): Promise<RendezVous[]> => {
  const res = await api.get<{ rendezVous: RendezVous[] }>(
    "/api/agenda/rendez-vous/suivi",
    { params: { email } },
  );
  return res.data.rendezVous ?? [];
};

/* --------------------------- Admin : paramètre --------------------------- */

/** Mise à jour du paramètre coordinateur (admin). */
export const updateParametreAgenda = async (
  payload: Partial<ParametreAgenda>,
): Promise<ParametreAgenda> => {
  const res = await api.put<{ message: string; data: ParametreAgenda }>(
    "/api/agenda/parametre",
    payload,
  );
  return res.data.data;
};

/* --------------------------- Admin : créneaux --------------------------- */

/** Tous les créneaux (admin) — inclut le nombre de places restantes. */
export const getCreneaux = async (): Promise<CreneauRdv[]> => {
  const res = await api.get<{ creneaux: CreneauRdv[] }>("/api/agenda/creneaux");
  return res.data.creneaux ?? [];
};

/** Création d'un créneau (admin). */
export const createCreneau = async (payload: {
  date: string;
  heureDebut: string;
  heureFin: string;
  capacite?: number;
}): Promise<CreneauRdv> => {
  const res = await api.post<{ message: string; data: CreneauRdv }>(
    "/api/agenda/creneaux",
    payload,
  );
  return res.data.data;
};

/** Suppression d'un créneau (admin). */
export const deleteCreneau = async (id: number): Promise<void> => {
  await api.delete(`/api/agenda/creneaux/${id}`);
};

/* -------------------------- Admin : rendez-vous -------------------------- */

/** File des demandes de rendez-vous (admin), filtrable par statut. */
export const getRendezVous = async (
  statut?: RdvStatut,
): Promise<RendezVous[]> => {
  const res = await api.get<{ rendezVous: RendezVous[] }>(
    "/api/agenda/rendez-vous",
    { params: statut ? { statut } : {} },
  );
  return res.data.rendezVous ?? [];
};

/** Mise à jour du statut d'un rendez-vous (approuver / refuser / reprogrammer). */
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
  const res = await api.patch<{ message: string; data: RendezVous }>(
    `/api/agenda/rendez-vous/${id}`,
    payload,
  );
  return res.data.data;
};

/** Suppression d'un rendez-vous (admin). */
export const deleteRdv = async (id: number): Promise<void> => {
  await api.delete(`/api/agenda/rendez-vous/${id}`);
};
