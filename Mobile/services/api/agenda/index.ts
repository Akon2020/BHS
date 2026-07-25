import { api } from "../client";
import type {
  ParametreAgenda,
  CreneauRdv,
  RendezVous,
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
