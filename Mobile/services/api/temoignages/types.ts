// Aligné sur le modèle Sequelize `temoignages` (cf. /info.md §3.1).
export interface Temoignage {
  idTemoignage: number;
  auteur: string;
  fonction?: string | null;
  contenu: string;
  photo?: string | null;
  ordre: number;
}

export interface TemoignagesPublicResponse {
  temoignages: Temoignage[];
}
