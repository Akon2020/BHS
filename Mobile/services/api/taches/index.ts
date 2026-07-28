import { api } from "../client";

export type StatutTache = "a_faire" | "en_cours" | "fait";
export type PrioriteTache = "basse" | "normale" | "haute";
export type RecurrenceTache = "aucune" | "quotidien" | "hebdo" | "mensuel";

export interface TacheAssigne {
  idUtilisateur: number;
  nomComplet: string;
  role?: string;
}

export interface TacheCommentaire {
  idCommentaireTache: number;
  idTache: number;
  idUtilisateur: number;
  contenu: string;
  createdAt: string;
  auteur?: { idUtilisateur: number; nomComplet: string };
}

export interface Tache {
  idTache: number;
  titre: string;
  description?: string | null;
  statut: StatutTache;
  priorite: PrioriteTache;
  echeance?: string | null;
  recurrence: RecurrenceTache;
  assignes: number[];
  assignesDetails?: TacheAssigne[];
  rappelJoursAvant: number;
  createdBy: number;
  createdAt: string;
  createur?: { idUtilisateur: number; nomComplet: string };
  commentaires?: TacheCommentaire[];
}

export interface CreateTacheBody {
  titre: string;
  description?: string;
  statut?: StatutTache;
  priorite?: PrioriteTache;
  echeance?: string | null;
  recurrence?: RecurrenceTache;
  assignes?: number[];
  rappelJoursAvant?: number;
}

export interface GetTachesResult {
  taches: Tache[];
  assignables: TacheAssigne[];
}

/** Liste des tâches + utilisateurs assignables (staff). */
export const getTaches = async (): Promise<GetTachesResult> => {
  const res = await api.get<{ nombre: number; taches: Tache[]; assignables: TacheAssigne[] }>(
    "/api/taches",
  );
  return { taches: res.data.taches ?? [], assignables: res.data.assignables ?? [] };
};

/** Détail d'une tâche (avec commentaires). */
export const getTache = async (id: number): Promise<Tache> => {
  const res = await api.get<{ tache: Tache }>(`/api/taches/${id}`);
  return res.data.tache;
};

/** Création d'une tâche. */
export const createTache = async (payload: CreateTacheBody): Promise<Tache> => {
  const res = await api.post<{ message: string; data: Tache }>("/api/taches", payload);
  return res.data.data;
};

/** Mise à jour d'une tâche (statut, contenu, assignations…). */
export const updateTache = async (
  id: number,
  payload: Partial<CreateTacheBody>,
): Promise<Tache> => {
  const res = await api.put<{ message: string; data: Tache }>(`/api/taches/${id}`, payload);
  return res.data.data;
};

/** Suppression d'une tâche. */
export const deleteTache = async (id: number): Promise<void> => {
  await api.delete(`/api/taches/${id}`);
};

/** Ajout d'un commentaire à une tâche. */
export const addTacheCommentaire = async (
  id: number,
  contenu: string,
): Promise<TacheCommentaire> => {
  const res = await api.post<{ message: string; data: TacheCommentaire }>(
    `/api/taches/${id}/commentaires`,
    { contenu },
  );
  return res.data.data;
};

/** Suppression d'un commentaire de tâche. */
export const deleteTacheCommentaire = async (
  id: number,
  commentaireId: number,
): Promise<void> => {
  await api.delete(`/api/taches/${id}/commentaires/${commentaireId}`);
};
