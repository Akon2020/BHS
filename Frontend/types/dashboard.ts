import { User, Abonne, Evenement, Blog } from "./user";

export interface DashboardSection<T> {
  nombre: number;
  stat: string;
  data: T[];
}

export interface DashboardRdv {
  idRendezVous: number;
  nom: string;
  date: string;
  heureDebut: string;
  statut: "en_attente" | "approuve" | "refuse" | "reprogramme";
  motif?: string | null;
}

export interface DashboardAnniversaire {
  idAnniversaire: number;
  nom: string;
  jour: number;
  mois: number;
  dansJours: number;
}

export interface DashboardTache {
  idTache: number;
  titre: string;
  statut: "a_faire" | "en_cours" | "fait";
  priorite: "basse" | "normale" | "haute";
  echeance: string | null;
}

export interface DashboardDon {
  idDon: number;
  nom: string;
  montant: string | number | null;
  devise: string;
  statut: "annonce" | "confirme";
  createdAt: string;
}

export interface DashboardResponse {
  users: DashboardSection<User>;
  abonnes: DashboardSection<Abonne>;
  evenements: DashboardSection<Evenement>;
  blogs: DashboardSection<Blog>;
  rendezVous: {
    enAttente: number;
    data: DashboardRdv[];
  };
  anniversaires: {
    data: DashboardAnniversaire[];
  };
  taches: {
    aFaire: number;
    enCours: number;
    data: DashboardTache[];
  };
  pointage: {
    sessionsMois: number;
    minutesMois: number;
    heuresMois: number;
  };
  dons: {
    totalParDevise: Record<string, number>;
    data: DashboardDon[];
  };
  finances: {
    nbInscrits: number;
    encaisseParDevise: Record<string, number>;
  };
}
