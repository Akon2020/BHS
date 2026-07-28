import { api } from "../client";

export const PIECE_TYPES = [
  "carte d'électeur",
  "carte d'étudiant",
  "carte d'élève",
  "passeport",
  "carte de baptême",
] as const;
export const SEXES = ["Masculin", "Feminin"] as const;
export const ETATS_CIVILS = ["Célibataire", "Marié(e)", "Veuf(ve)"] as const;

export interface IdentiteForm {
  pieceType: (typeof PIECE_TYPES)[number];
  pieceNumero: string;
  nom: string;
  postnom: string;
  prenom: string;
  naissance: string; // AAAA-MM-JJ
  sexe: (typeof SEXES)[number];
  etatCivil: (typeof ETATS_CIVILS)[number];
  adresse: string;
  tel: string;
  email: string;
  paroisse: string;
  urgenceNom: string;
  urgenceLien: string;
  urgenceTelPrincipal: string;
  urgenceTelSecondaire: string;
  urgenceEmail: string;
  allergiesHas: boolean;
  allergiesDetails: string;
  traitementHas: boolean;
  traitementDetails: string;
  maladieHas: boolean;
  maladieDetails: string;
  regimeHas: boolean;
  regimeDetails: string;
  autres: string;
}

/** Soumet une fiche d'identité (public) — mappe le formulaire plat en payload imbriqué. */
export const submitIdentite = async (f: IdentiteForm): Promise<string> => {
  const payload = {
    identite: {
      piece: { type: f.pieceType, numero: f.pieceNumero },
      nom: f.nom,
      postnom: f.postnom,
      prenom: f.prenom,
      naissance: f.naissance,
      sexe: f.sexe,
      etatCivil: f.etatCivil,
      adresse: f.adresse,
      tel: f.tel,
      email: f.email,
      paroisse: f.paroisse,
    },
    urgence: {
      nom: f.urgenceNom,
      lien: f.urgenceLien,
      tel: { principal: f.urgenceTelPrincipal, secondaire: f.urgenceTelSecondaire },
      email: f.urgenceEmail,
    },
    medical: {
      allergies: { has: f.allergiesHas, details: f.allergiesDetails },
      traitement: { has: f.traitementHas, details: f.traitementDetails },
      maladie: { has: f.maladieHas, details: f.maladieDetails },
      regime: { has: f.regimeHas, details: f.regimeDetails },
    },
    autres: f.autres,
  };
  const res = await api.post<{ message: string }>("/api/identites/add", payload);
  return res.data.message;
};
