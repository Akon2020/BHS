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
    token?: string;
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

export type TypeChampPersonnalise =
  | "texte"
  | "email"
  | "telephone"
  | "nombre"
  | "select"
  | "checkbox"
  | "date"
  | "textarea"
  | "fichier";

export interface ChampPersonnalise {
  id: string;
  type: TypeChampPersonnalise;
  label: string;
  requis?: boolean;
  options?: string[];
}

export type StatutPaiement =
  | "non_paye"
  | "partiel"
  | "paye"
  | "accepte_non_paye";

export interface InscriptionEvenement {
  idInscription: number;
  nomComplet: string;
  email: string;
  sexe: Sexe;
  telephone: string;
  statut: StatutInscription;
  statutPaiement?: StatutPaiement;
  montantPaye?: string | number;
  reponsesPersonnalisees?: Record<string, string> | null;
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
  dateLimiteInscription?: string | null;
  nombrePlaces: number;
  nombreInscrits: number;
  imageEvenement: string;
  statut: EvenementStatut;
  estPayant?: boolean;
  montant?: string | number | null;
  devise?: string;
  champsPersonnalises?: ChampPersonnalise[] | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  createur: EvenementCreateur;
}

export interface EvenementFinancesResponse {
  evenement: {
    idEvenement: number;
    titre: string;
    estPayant: boolean;
    montant: number;
    devise: string;
  };
  nbInscrits: number;
  parStatut: Record<StatutPaiement, number>;
  attendu: number;
  encaisse: number;
  reste: number;
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
  dateLimiteInscription?: string | null;
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
  dateLimiteInscription?: string | null;
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
export type FichierModeAcces = "lecture" | "telechargement";

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
  idCategorie: number;
  modeAcces: FichierModeAcces;
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
  categorie?: {
    idCategorie: number;
    nomCategorie: string;
    slug: string;
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

export type MessageEnvoyeStatut = "envoye" | "echec";

export interface MessageEnvoye {
  idMessage: number;
  destinataireEmail: string;
  destinataireNom?: string | null;
  sujet: string;
  message: string;
  statut: MessageEnvoyeStatut;
  erreur?: string | null;
  envoyePar?: number | null;
  createdAt: string;
  updatedAt: string;
  expediteur?: {
    idUtilisateur: number;
    nomComplet: string;
    email: string;
    avatar?: string;
  } | null;
}

export interface GetMessagesEnvoyesResponse {
  nombre: number;
  messages: MessageEnvoye[];
}

export interface EnvoyerMessagePayload {
  destinataireEmail: string;
  destinataireNom?: string;
  sujet: string;
  message: string;
}

/* -------------------------------- Pointage -------------------------------- */

export type PointageSource = "systeme" | "manuel";
export type PointagePeriode = "hebdo" | "mensuel" | "annuel";

export interface ProfilPointage {
  idProfil: number;
  nomComplet: string;
  fonction?: string | null;
  source: PointageSource;
  idUtilisateur?: number | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  utilisateur?: {
    idUtilisateur: number;
    nomComplet: string;
    email: string;
    avatar?: string;
  } | null;
}

export interface Pointage {
  idPointage: number;
  idProfil: number;
  date: string;
  heureDebut: string;
  heureFin?: string | null;
  dureeMinutes?: number | null;
  note?: string | null;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
  profil?: {
    idProfil: number;
    nomComplet: string;
    fonction?: string | null;
    source: PointageSource;
  };
}

export interface GetProfilsResponse {
  nombre: number;
  profils: ProfilPointage[];
}

export interface GetPointagesResponse {
  nombre: number;
  pointages: Pointage[];
}

export interface PointageStatsResponse {
  periode: { start: string; end: string; periode: PointagePeriode };
  stats: {
    profilsActifs: number;
    presences: number;
    tempsCumuleMinutes: number;
    tempsCumuleLabel: string;
  };
  graph: { nomComplet: string; heures: number; minutes: number }[];
  recap: {
    idProfil: number;
    nomComplet: string;
    fonction: string;
    presences: number;
    tempsMinutes: number;
    tempsLabel: string;
  }[];
}

export interface CreateProfilPayload {
  nomComplet?: string;
  fonction?: string;
  source?: PointageSource;
  idUtilisateur?: number;
}

export interface CreatePointagePayload {
  idProfil: number;
  date: string;
  heureDebut: string;
  heureFin?: string;
  note?: string;
}

/* ------------------------------ Témoignages ------------------------------ */

export type TemoignageStatut = "brouillon" | "publie";

export interface Temoignage {
  idTemoignage: number;
  auteur: string;
  fonction?: string | null;
  contenu: string;
  photo?: string | null;
  statut: TemoignageStatut;
  ordre: number;
  createdBy?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetTemoignagesResponse {
  nombre: number;
  temoignages: Temoignage[];
}

/* ---------------------------------- Dons ---------------------------------- */

export type DonMoyen = "carte" | "virement" | "mobile";
export type DonStatut = "annonce" | "confirme";

export interface Don {
  idDon: number;
  nom: string;
  email: string;
  montant?: string | number | null;
  devise: string;
  moyen: DonMoyen;
  message?: string | null;
  statut: DonStatut;
  createdAt: string;
  updatedAt: string;
}

export interface GetDonsResponse {
  nombre: number;
  dons: Don[];
}

export interface CreateDonPayload {
  nom: string;
  email: string;
  montant?: number;
  devise?: string;
  moyen: DonMoyen;
  message?: string;
}

/* ------------------------------- Recherche ------------------------------- */

export interface RechercheBlogItem {
  idBlog: number;
  titre: string;
  slug: string;
  extrait?: string | null;
  imageUne?: string | null;
}

export interface RechercheEventItem {
  idEvenement: number;
  titre: string;
  slug: string;
  lieu: string;
  dateEvenement: string;
  imageEvenement?: string | null;
}

export interface RechercheFichierItem {
  idFichier: number;
  nomReference: string;
  slug: string;
  description?: string | null;
  categorie?: { nomCategorie: string } | null;
}

export interface RechercheResponse {
  query: string;
  total: number;
  blogs: RechercheBlogItem[];
  evenements: RechercheEventItem[];
  fichiers: RechercheFichierItem[];
}

export interface NewsletterProgress {
  total: number;
  envoye: number;
  echec: number;
  attente: number;
  traite: number;
  pourcentage: number;
  statut: "en_cours" | "termine" | "inconnu";
}

/* -------------------------------- Agenda -------------------------------- */

export type RdvStatut = "en_attente" | "approuve" | "refuse" | "reprogramme";

export interface CreneauRdv {
  idCreneau: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  capacite: number;
  actif: boolean;
  reste?: number;
}

export interface RendezVous {
  idRendezVous: number;
  idCreneau: number | null;
  nom: string;
  email: string;
  telephone: string;
  motif?: string | null;
  date: string;
  heureDebut: string;
  heureFin?: string | null;
  statut: RdvStatut;
  note?: string | null;
  createdAt: string;
  creneau?: CreneauRdv | null;
}

export interface ParametreAgenda {
  idParametre: number;
  coordinateurNom: string;
  coordinateurFonction?: string | null;
  message?: string | null;
  actif: boolean;
}

export interface GetCreneauxResponse {
  nombre: number;
  creneaux: CreneauRdv[];
}

export interface GetRendezVousResponse {
  nombre: number;
  rendezVous: RendezVous[];
}

/* ----------------------------- Anniversaires ----------------------------- */

export interface Anniversaire {
  idAnniversaire: number;
  nom: string;
  jour: number;
  mois: number;
  annee?: number | null;
  email?: string | null;
  note?: string | null;
  delaiRappelJours: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAnniversairesResponse {
  nombre: number;
  anniversaires: Anniversaire[];
}

/* --------------------------- Entrées calendrier --------------------------- */

export interface EntreeCalendrier {
  idEntree: number;
  titre: string;
  description?: string | null;
  date: string;
  heureDebut?: string | null;
  heureFin?: string | null;
  lieu?: string | null;
  journeeEntiere: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetEntreesCalendrierResponse {
  nombre: number;
  entrees: EntreeCalendrier[];
}

export interface EntreeCalendrierBody {
  titre: string;
  description?: string;
  date: string;
  heureDebut?: string | null;
  heureFin?: string | null;
  lieu?: string;
  journeeEntiere?: boolean;
}

/* -------------------------------- Tâches -------------------------------- */

export type StatutTache = "a_faire" | "en_cours" | "fait";
export type PrioriteTache = "basse" | "normale" | "haute";
export type RecurrenceTache = "aucune" | "quotidien" | "hebdo" | "mensuel";

export interface TacheAssigne {
  idUtilisateur: number;
  nomComplet: string;
  role?: UserRole;
}

export interface TacheCommentaire {
  idCommentaireTache: number;
  idTache: number;
  idUtilisateur: number;
  contenu: string;
  createdAt: string;
  updatedAt: string;
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
  dernierRappel?: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  createur?: { idUtilisateur: number; nomComplet: string };
  commentaires?: TacheCommentaire[];
}

export interface GetTachesResponse {
  nombre: number;
  taches: Tache[];
  assignables: TacheAssigne[];
}

export interface GetTacheResponse {
  tache: Tache;
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
