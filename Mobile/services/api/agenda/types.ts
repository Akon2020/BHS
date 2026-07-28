// Aligné sur les modèles Sequelize `parametresAgenda` / `creneauxRdv` / `rendezVous` (/info.md §3.1).

export interface ParametreAgenda {
  coordinateurNom: string;
  coordinateurFonction?: string | null;
  message?: string | null;
  actif: boolean;
}

export interface CreneauRdv {
  idCreneau: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  capacite: number;
  actif: boolean;
  reste?: number;
}

export type RdvStatut =
  | "en_attente"
  | "approuve"
  | "refuse"
  | "reprogramme";

export interface RendezVous {
  idRendezVous: number;
  idCreneau?: number | null;
  nom: string;
  email: string;
  telephone: string;
  motif?: string | null;
  date: string;
  heureDebut: string;
  heureFin?: string | null;
  statut: RdvStatut;
  note?: string | null;
}

export interface ReserverRdvPayload {
  idCreneau: number;
  nom: string;
  email: string;
  telephone: string;
  motif?: string;
}
