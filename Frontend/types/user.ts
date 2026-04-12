export type UserRole = "admin" | "editeur" | "membre";
export type ContactStatut = "nouveau" | "lu" | "traite" | "archive";
export type AbonneStatut = "actif" | "inactif" | "desabonne";
export type BlogStatut = "publie" | "brouillon";
export type NewsletterStatut = "brouillon" | "programme" | "envoye";
export type NewsletterEnvoiStatut = "envoye" | "echec";
export type EvenementStatut = "brouillon" | "publie" | "annule" | "termine";
export type Sexe = "homme" | "femme";
export type TypeInscription = "utilisateur" | "visiteur";
export type StatutInscription = "confirme" | "en_attente" | "annule";
export type CommentaireStatut = "attente" | "approuve" | "refuse";

export interface User {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
  role: UserRole;
  avatar?: string;
  derniereConnexion?: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    blogsEcrits: number;
    evenementsInscrits: number;
    commentairesEcrits: number;
  };
  blogs?: Blog[];
  inscriptions?: InscriptionEvenement[];
  commentaires?: BlogCommentaire[];
}

export interface AuthResponse {
  message: string;
  data: {
    token: string;
    userInfo: User;
  };
}

export interface GetAllUsersResponse {
  nombre: number;
  usersInfo: User[];
}

export interface Contact {
  idContact: number;
  nomComplet: string;
  email: string;
  sujet: string;
  message: string;
  statut: ContactStatut;
  repondu: boolean;
  createdAt: string;
}

export interface GetAllContactsResponse {
  nombre: number;
  contactsInfo: Contact[];
}

export type PieceTypeIdentite =
  | "carte d'électeur"
  | "carte d'étudiant"
  | "carte d'élève"
  | "passeport"
  | "carte de baptême";

export type SexeIdentite = "Masculin" | "Feminin";
export type EtatCivilIdentite = "Célibataire" | "Marié(e)" | "Veuf(ve)";

export interface MedicalToggleDetails {
  has: boolean;
  details: string;
}

export interface IdentityFormPayload {
  identite: {
    piece: {
      type: PieceTypeIdentite;
      numero: string;
    };
    nom: string;
    postnom: string;
    prenom: string;
    naissance: string;
    sexe: SexeIdentite;
    etatCivil: EtatCivilIdentite;
    adresse: string;
    tel: string;
    email: string;
    paroisse: string;
  };
  urgence: {
    nom: string;
    lien: string;
    tel: {
      principal: string;
      secondaire?: string;
    };
    email: string;
  };
  medical: {
    allergies: MedicalToggleDetails;
    traitement: MedicalToggleDetails;
    maladie: MedicalToggleDetails;
    regime: MedicalToggleDetails;
    autres: string;
  };
}

export interface FicheIdentite {
  idFicheIdentite: number;
  pieceType: PieceTypeIdentite;
  pieceNumero: string;
  nom: string;
  postnom: string;
  prenom: string;
  naissance: string;
  sexe: SexeIdentite;
  etatCivil: EtatCivilIdentite;
  adresse: string;
  tel: string;
  email: string;
  paroisse: string;
  urgenceNom: string;
  urgenceLien: string;
  urgenceTelPrincipal: string;
  urgenceTelSecondaire?: string | null;
  urgenceEmail: string;
  allergiesHas: boolean;
  allergiesDetails?: string | null;
  traitementHas: boolean;
  traitementDetails?: string | null;
  maladieHas: boolean;
  maladieDetails?: string | null;
  regimeHas: boolean;
  regimeDetails?: string | null;
  autres?: string | null;
  dateSoumission: string;
  lu: boolean;
  approuve: boolean;
}

export interface GetAllIdentityResponse {
  nombre: number;
  fichesIdentites: FicheIdentite[];
}

export interface GetIdentityByIdResponse {
  ficheIdentiteInfo: FicheIdentite;
}

export interface CreateIdentityResponse {
  message: string;
  emailStatus?: string;
  data: FicheIdentite;
}

export interface UpdateIdentityResponse {
  message: string;
  data: FicheIdentite;
}

export interface DeleteIdentityResponse {
  message: string;
}

export interface Abonne {
  idAbonne: number;
  nomComplet: string;
  email: string;
  statut: AbonneStatut;
  dateAbonnement: string;
  dateDesabonnement?: string | null;
}

export interface GetAllAbonnesResponse {
  nombre: number;
  abonnes: Abonne[];
}

export interface AbonneReception {
  idNewsletterAbonne: number;
  statut: NewsletterEnvoiStatut | "attente";
  dateEnvoi?: string | null;
  newsletter?: {
    idNewsletter: number;
    titreInterne: string;
    objetMail: string;
    dateEnvoi?: string | null;
  };
}

export interface GetSingleAbonneResponse {
  abonne: Abonne & {
    receptions?: AbonneReception[];
  };
  stats: {
    totalReceptions: number;
    totalRecues: number;
  };
}

export interface AbonneMutationResponse {
  message: string;
  data?: Abonne;
}

export interface Equipe {
  idEquipe: number;
  nomComplet: string;
  fonction: string;
  biographie: string;
  photoProfil?: string;
  ordre: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllEquipesResponse {
  total: number;
  equipes: Equipe[];
}

export interface GetAllAuthResponse {
  message: string;
  data: Auth;
}

export interface Auth {
  token: string;
  userInfo: User;
  data: any;
}

export interface BlogAuteur {
  idUtilisateur?: number;
  nomComplet: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface BlogCategorie {
  idCategorie: number;
  nomCategorie: string;
  slug: string;
  createdAt: string;
}

export interface BlogCommentaire {
  idCommentaire?: number;
  contenu?: string;
  dateCommentaire?: string;
  utilisateur?: {
    nomComplet: string;
    avatar?: string;
  };
}

export interface Commentaire {
  idCommentaire: number;
  idBlog: number;
  idUtilisateur: number | null;
  idCommentaireParent: number | null;
  nomComplet: string;
  email: string;
  siteWeb?: string;
  contenu: string;
  statut: CommentaireStatut;
  ipAddress?: string;
  userAgent?: string;
  dateCommentaire: string;
  modereBy?: number;
  createdAt: string;
  updatedAt: string;
  utilisateur?: {
    idUtilisateur?: number;
    nomComplet: string;
    avatar?: string;
  };
  reponses?: Commentaire[];
}

export interface CreateCommentairePayload {
  idBlog: number;
  idUtilisateur?: number | null;
  idCommentaireParent?: number | null;
  nomComplet: string;
  email: string;
  siteWeb?: string;
  contenu: string;
}

export interface GetCommentairesResponse {
  total: number;
  commentaires: Commentaire[];
}

export interface GetCommentairesParBlogResponse {
  total: number;
  commentaires: Commentaire[];
}

export interface CreateCommentaireResponse {
  message: string;
  data: Commentaire;
}

export interface ModererCommentairePayload {
  statut: CommentaireStatut;
  modereBy: number;
}

export interface Blog {
  idBlog: number;
  titre: string;
  slug: string;
  extrait?: string;
  contenu: string;
  tags?: string;
  imageUne: string;
  statut: BlogStatut;
  estimationLecture?: number;
  idAuteur: number;
  idCategorie: number;
  nombreVues?: number;
  createdAt: string;
  updatedAt: string;

  auteur: BlogAuteur;
  categorie: BlogCategorie;
  commentaires?: BlogCommentaire[];
}

export interface GetAllBlogsResponse {
  nombre: number;
  page: number;
  totalPages: number;
  blogs: Blog[];
}
export interface GetSingleBlogResponse {
  blog: Blog;
  commentaires: BlogCommentaire[];
}

export interface GetBlogBySlugResponse {
  blog: Blog;
  commentaires?: BlogCommentaire[];
}

export interface Categorie {
  idCategorie: number;
  nomCategorie: string;
  slug: string;
  createdAt: string;
}

export interface GetAllCategoriesResponse {
  total: number;
  categories: Categorie[];
}

export interface GetCategorieByIdResponse {
  categorie: Categorie;
}

export interface GetCategorieBySlugResponse {
  categorie: Categorie;
}

export interface CategorieMutationResponse {
  message: string;
  data: Categorie;
}

export interface NewsletterRedacteur {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
}

export interface NewsletterAbonne {
  idNewsletterAbonne: number;
  idNewsletter: number;
  idAbonne: number;
  statut: NewsletterEnvoiStatut;
  dateEnvoi?: string;
  abonne: {
    idAbonne: number;
    nomComplet: string;
    email: string;
    statut: AbonneStatut;
    dateAbonnement: string;
    dateDesabonnement?: string | null;
  };
}

export interface Newsletter {
  idNewsletter: number;
  titreInterne: string;
  objetMail: string;
  contenu: string;
  statut: NewsletterStatut;
  dateProgrammee?: string | null;
  dateEnvoi?: string | null;
  writedBy: number;
  createdAt: string;
  updatedAt: string;

  redacteur: NewsletterRedacteur;
  envois?: NewsletterAbonne[];
}

export interface GetAllNewslettersResponse {
  total: number;
  page: number;
  pages: number;
  data: Newsletter[];
}

export type GetSingleNewsletterResponse = Newsletter;

export interface NewsletterStatsResponse {
  total: number;
  envoye: number;
  echec: number;
  tauxSucces: number | string;
}

export interface NewsletterMutationResponse {
  message: string;
  data: Newsletter;
}

export interface EvenementCreateur {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
}

export interface InscriptionEvenement {
  idInscription: number;
  nomComplet: string;
  email: string;
  sexe: Sexe;
  telephone: string;
  statut: StatutInscription;
  typeInscription: TypeInscription;
  dateInscription: string;
  utilisateur: EvenementCreateur | null;
}

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
  imageEvenement: string;
  statut: EvenementStatut;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  createur: EvenementCreateur;
}

export interface GetAllEventsResponse {
  total: number;
  page: number;
  pageSize: number;
  events: Evenement[];
}

export interface GetSingleEventResponse {
  event: Evenement;
}

export interface EvenementAdmin extends Evenement {
  inscriptions: InscriptionEvenement[];
}

export interface GetSingleEventAdminResponse {
  event: EvenementAdmin;
}

export interface CreateEvenementBody {
  titre: string;
  description: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  nombrePlaces?: number;
  statut?: EvenementStatut;
}

export interface CreateEvenementResponse {
  mailSend: string;
  message: string;
  data: Evenement;
}

export interface UpdateEvenementBody {
  titre?: string;
  slug?: string;
  description?: string;
  dateEvenement?: string;
  heureDebut?: string;
  heureFin?: string;
  lieu?: string;
  nombrePlaces?: number;
  statut?: EvenementStatut;
}

export interface UpdateEvenementResponse {
  message: string;
  data: Evenement;
}

export interface DeleteEvenementResponse {
  message: string;
}

export interface InscriptionEvenementBody {
  nomComplet?: string;
  email?: string;
  sexe?: Sexe;
  telephone?: string;
}

export interface InscriptionEvenementResponse {
  message: string;
  inscription: InscriptionEvenement;
  pdfUrl: string;
}

export type FichierStatut = "brouillon" | "publie" | "programme" | "archive";

export interface FichierItem {
  nomOriginal: string;
  nomStocke: string;
  chemin: string;
  typeMime: string;
  taille: number;
}

export interface FichierRessource {
  idFichier: number;
  nomReference: string;
  slug: string;
  description: string;
  statut: FichierStatut;
  datePublication?: string | null;
  fichiers: FichierItem[];
  nombreFichiers: number;
  tailleTotale: number;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  createur?: {
    idUtilisateur: number;
    nomComplet: string;
    email: string;
  } | null;
}

export interface GetAllFichiersResponse {
  nombre: number;
  fichiers: FichierRessource[];
}

export interface GetSingleFichierResponse {
  fichier: FichierRessource;
}

export interface FichierMutationResponse {
  message: string;
  data?: FichierRessource;
}
