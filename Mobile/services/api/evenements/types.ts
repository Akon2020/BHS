// Aligné sur les modèles Sequelize `evenements` / `inscriptionsevenements` (/info.md §3.1).

export type ChampType =
  | "texte"
  | "email"
  | "tel"
  | "nombre"
  | "select"
  | "checkbox"
  | "date"
  | "textarea"
  | "fichier";

export interface ChampPersonnalise {
  id: string;
  type: ChampType;
  label: string;
  requis?: boolean;
  options?: string[];
}

export type StatutPaiement =
  | "non_paye"
  | "partiel"
  | "paye"
  | "accepte_non_paye";

export type EvenementStatut = "brouillon" | "publie" | "annule" | "termine";

export interface Evenement {
  idEvenement: number;
  titre: string;
  slug: string;
  description: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  nombrePlaces: number;
  nombreInscrits: number;
  imageEvenement?: string | null;
  statut: EvenementStatut;
  estPayant?: boolean;
  montant?: string | number | null;
  devise?: string;
  champsPersonnalises?: ChampPersonnalise[] | null;
}

export interface GetEvenementsResponse {
  total: number;
  page: number;
  pageSize: number;
  events: Evenement[];
}

export interface GetEvenementResponse {
  event: Evenement;
}

// Valeurs des champs de base + réponses personnalisées (hors fichiers).
export interface InscriptionBase {
  nomComplet: string;
  email: string;
  telephone: string;
  sexe: "homme" | "femme";
}

// Fichier sélectionné (expo-document-picker) pour un champ de type "fichier".
export interface ChampFichier {
  champId: string;
  uri: string;
  name: string;
  mimeType: string;
}
