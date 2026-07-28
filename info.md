# 🔥 Burning Heart (BHS) — Dossier de projet

> **But de ce document** : présenter l'**intégralité du projet** (frontend, backend, architecture, état d'avancement) afin qu'une personne — ou un agent — puisse comprendre le système sans accès à l'historique de développement. Il servira notamment de base de réflexion pour la future **application mobile**.
>
> Documents complémentaires à la racine : [`CLAUDE.md`](CLAUDE.md) (guide opérationnel), [`plan.md`](plan.md) (roadmap, source de vérité des tâches), [`walkthrough.md`](walkthrough.md) (journal d'implémentation lot par lot).

---

## 1. Présentation & mission

**Burning Heart – Pèlerins avec le Christ** est un **apostolat spirituel et médiatique** de spiritualité **ignatienne**.

- **Nature** : plateforme web (site public premium + back-office admin) pour le blog, les événements, les ressources/fichiers, la newsletter, les fiches d'identité de pèlerins, les dons, les rendez-vous, etc.
- **Public** : francophone (RD Congo — Bukavu — + diaspora).
- **Langue** : **français uniquement** (i18n reporté). Le **domaine métier est en français** : modèles, champs de base de données, routes et libellés d'interface sont en FR (`utilisateur`, `evenement`, `idFichier`…).
- **Domaines de production** :
  - Web (frontend) : `https://burningheartihs.org`
  - API (backend) : `https://api.burningheartihs.org`
- **Objectif produit** : site **premium, moderne, élégant, 100 % responsive**, avec un **SEO solide**.

---

## 2. Architecture générale

Monorepo à deux applications indépendantes :

```
BHS/
├── Frontend/   → Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · TypeScript · axios
└── Backend/    → Express 5 · Sequelize (MySQL) · JWT · Nodemailer · Multer · Swagger · PDFKit/QRCode · node-cron
```

- Le **frontend** ne parle **jamais** directement à la base : il consomme l'**API REST** du backend via une couche `actions/` (axios).
- L'**API** est montée sous `/api/*` ; les fichiers téléversés sont servis depuis `/uploads`.
- La documentation d'API vivante est **Swagger** : `https://api.burningheartihs.org/api-docs` (source : `Backend/api-docs.json`, **103 chemins**).
- **Branche de travail Git** : `dev`. Commits en français, préfixés (`feat:`, `fix:`, `refactor:`…).

### Arborescence

**Frontend/**
```
app/            routes App Router (public + app/admin/*)
actions/        toute la communication front↔back (axios) — 1 fonction par opération API
types/          typage TS partagé (user.ts, dashboard.ts)
lib/            axios.ts, permissions.ts, ics.ts, utils.ts, auth.ts
components/      ui/ (shadcn) · admin/ (+ admin/charts/) · sections/ · modals/ · header/footer/…
contexts/        theme-context.tsx (clair/sombre)
hooks/           useAuth.ts, use-mobile.ts, use-toast.ts
proxy.ts         protection des routes admin (ex-middleware.ts, convention Next.js 16)
app/globals.css  design tokens (thème crimson, OKLCH, dark mode)
```

**Backend/**
```
app.js           point d'entrée Express (middlewares, montage des routes, listen)
routes/          routeurs par domaine (→ contrôleurs)
controllers/     logique métier par domaine
models/          modèles Sequelize + index.model.js (associations + syncModels)
middlewares/     auth · error · upload (Multer) · email
utils/           PDF · templates emails · scheduler (node-cron) · stats · helpers
config/          env.js · nodemailer.js
database/        db.js (connexion Sequelize MySQL)
swagger.js       configuration Swagger ; generate-swagger.js → api-docs.json
uploads/         fichiers téléversés (servis en statique)
```

---

## 3. Backend en détail

### 3.1 Modèles / tables (26)

Base MySQL via Sequelize. PK = INTEGER auto-incrément sauf mention contraire. « ts » = timestamps `createdAt/updatedAt`.

| Modèle | Table | Champs clés |
|---|---|---|
| `Utilisateur` | `utilisateurs` (ts) | nomComplet, email (unique), password (bcrypt), **role** ENUM(`admin`,`editeur`,`membre`), avatar, derniereConnexion |
| `Categorie` | `categories` | nomCategorie (unique), slug (unique) |
| `Blog` | `blogs` (ts) | titre, slug (unique), extrait, contenu, tags, imageUne, statut(`brouillon`/`publie`), estimationLecture (hook), idAuteur→utilisateurs, idCategorie→categories |
| `Newsletter` | `newsletters` (ts) | titreInterne, objetMail, contenu, statut(`brouillon`/`envoye`/`programme`), dateProgrammee, dateEnvoi, writedBy→utilisateurs |
| `Evenement` | `evenements` (ts) | titre, slug (unique), description, dateEvenement, heureDebut/Fin, lieu, nombrePlaces, nombreInscrits, imageEvenement, statut(`brouillon`/`publie`/`annule`/`termine`), **estPayant**, **montant**, **devise**(déf. USD), **champsPersonnalises** JSON, createdBy |
| `Equipe` | `equipes` (ts) | nomComplet, fonction, biographie, photoProfil, ordre, actif |
| `Abonne` | `abonnes` | nomComplet, email (unique), statut(`actif`/`inactif`/`desabonne`), dateAbonnement, dateDesabonnement |
| `Contact` | `contacts` | nomComplet, email, sujet, message, statut(`nouveau`/`lu`/`traite`/`archive`), repondu |
| `ReponseContact` | `reponsescontacts` | idContact→contacts, sujetReponse, messageReponse, emailDestinataire, sentAt |
| `FicheIdentite` | `fichesIdentite` | pièce (type+numéro), nom/postnom/prenom, naissance, sexe, étatCivil, adresse, tel, email, paroisse, contact d'urgence (nom/lien/tels/email), santé (allergies/traitement/maladie/régime + détails), lu, approuve |
| `InscriptionEvenement` | `inscriptionsevenements` | idEvenement, idUtilisateur (null=visiteur), nomComplet, email, sexe, telephone, statut, **statutPaiement**(`non_paye`/`partiel`/`paye`/`accepte_non_paye`), **montantPaye**, **reponsesPersonnalisees** JSON, typeInscription(auto) |
| `NewsletterAbonne` | `newslettersabonnes` | (join N:M) idNewsletter, idAbonne, statut(`envoye`/`echec`/`attente`), dateEnvoi |
| `Commentaire` | `commentaires` | idBlog, idUtilisateur (null=visiteur), idCommentaireParent (threads), nomComplet, email, contenu, statut(`attente`/`approuve`/`rejete`/`spam`), ipAddress, userAgent, signalements, modereBy |
| `Fichier` | `fichiers` (ts) | nomReference, slug (unique), description, idCategorie, statut, modeAcces(`lecture`/`telechargement`), **fichiers** JSON (liste), nombreFichiers, tailleTotale, createdBy |
| `MessageEnvoye` | `messagesEnvoyes` (ts) | destinataireEmail/Nom, sujet, message, statut(`envoye`/`echec`), erreur, envoyePar |
| `ProfilPointage` | `profilsPointage` (ts) | nomComplet, fonction, source(`systeme`/`manuel`), idUtilisateur (null si manuel), actif |
| `Pointage` | `pointages` (ts) | idProfil, date, heureDebut, heureFin (null=session simple), **dureeMinutes** (hook), note, createdBy |
| `Temoignage` | `temoignages` (ts) | auteur, fonction, contenu, photo, statut(`brouillon`/`publie`), ordre, createdBy |
| `Don` | `dons` (ts) | nom, email, montant, devise, moyen(`carte`/`virement`/`mobile`), message, statut(`annonce`/`confirme`) |
| `CreneauRdv` | `creneauxRdv` (ts) | date, heureDebut/Fin, capacite, actif |
| `RendezVous` | `rendezVous` (ts) | idCreneau, nom, email, telephone, motif, date, heureDebut/Fin, statut(`en_attente`/`approuve`/`refuse`/`reprogramme`), note |
| `ParametreAgenda` | `parametresAgenda` (ts) | (singleton) coordinateurNom, coordinateurFonction, message, actif |
| `Anniversaire` | `anniversaires` (ts) | nom, jour, mois, annee?, email?, note, delaiRappelJours (déf. 3), actif |
| `Tache` | `taches` (ts) | titre, description, statut(`a_faire`/`en_cours`/`fait`), priorite(`basse`/`normale`/`haute`), echeance, recurrence(`aucune`/`quotidien`/`hebdo`/`mensuel`), **assignes** JSON (idUtilisateur[]), rappelJoursAvant, dernierRappel, createdBy |
| `TacheCommentaire` | `tachecommentaires` (ts) | idTache, idUtilisateur, contenu |
| `EntreeCalendrier` | `entreescalendrier` (ts) | titre, description, date, heureDebut/Fin, lieu, journeeEntiere, createdBy |

Remarque : les colonnes JSON critiques (`champsPersonnalises`, `reponsesPersonnalisees`, `assignes`) ont un **getter Sequelize** qui garantit un tableau/objet même si le driver renvoie une chaîne (robustesse prod).

### 3.2 Relations clés (`models/index.model.js`)

- **Blog** ↔ Utilisateur (`auteur`), ↔ Categorie ; **Blog** hasMany **Commentaire** (`CASCADE`).
- **Commentaire** self-référence (`commentaireParent`/`reponses` = fils de discussion), belongsTo Utilisateur (`utilisateur`, `moderateur`).
- **Newsletter** ↔ **Abonne** en **N:M** via `NewsletterAbonne` (suivi d'envoi par abonné).
- **Evenement** hasMany **InscriptionEvenement** ; Inscription belongsTo Utilisateur (facultatif).
- **Fichier** ↔ Categorie, ↔ Utilisateur (`createur`).
- **ProfilPointage** hasMany **Pointage** (`CASCADE`).
- **CreneauRdv** hasMany **RendezVous**.
- **Tache** hasMany **TacheCommentaire** (`CASCADE`) ; Tache/Entree/Temoignage/MessageEnvoye belongsTo Utilisateur (`createur`/`expediteur`).
- **Contact** hasMany **ReponseContact** (`CASCADE`).

### 3.3 API REST — routeurs & endpoints

Gardes : **public** (aucune) · **JWT** = `authenticationJWT` · rôles via `authorizeRoles(...)`. Montage dans `app.js`.

| Base | Points d'accès (résumé) | Accès |
|---|---|---|
| `/api/auth` | `/login`, `/logout`, `/reset-password`, `/resetpassword` (public) ; `/status`, `/profile` (JWT) ; `/register` (admin) | mixte |
| `/api/users` | CRUD utilisateurs, `/update/:id/password` | admin (+ membre lecture, self update) |
| `/api/equipes` | CRUD équipe (`/fonction/:fonction`) | lecture staff ; écriture admin |
| `/api/contacts` | `POST /add` (public) ; liste/détail/`repondre`/delete | admin/editeur (delete admin) |
| `/api/categories` | GET (public) ; add/update/delete | admin/editeur |
| `/api/blogs` | GET public (`/`, `/slug/:slug`, `/auteur`, `/statut`) ; add/update/delete | admin/editeur |
| `/api/commentaires` | `/blog/:idBlog`, `/reponses/:id`, `POST /add` (public) ; liste, `moderate`, delete | staff (liste/modération) |
| `/api/evenements` | GET public (`/`, `/slug/:slug`, `/date`) ; admin (`/admin`, CRUD) ; **inscription** `POST /slug/:slug/inscription` (public, `optionalAuthJWT`, `upload.any`) ; **paiement** `PATCH …/paiement` ; **finances** `GET /:id/finances` + `/export` (PDF) ; renvoi ticket ; doublons | mixte |
| `/api/abonnes` | `POST /subscribe` (public) ; liste/actifs/update/delete | staff / admin |
| `/api/newsletters` | CRUD ; `POST /:id/send` (envoi arrière-plan) ; `GET /:id/progress` ; `/:id/stats` | staff |
| `/api/dashboard` | `GET /` (agrégats du tableau de bord) | staff |
| `/api/identites` | `POST /add` (public) ; liste/détail/update/`approuver`/delete | staff / admin |
| `/api/fichiers` | public (`/public`, `/slug/:slug`, `/slug/:slug/download/:index`) ; admin CRUD + `download/:index` (`upload.array(30)`) | staff |
| `/api/messages` | boîte d'envoi admin (liste/détail/envoyer/delete) | admin/editeur |
| `/api/pointages` | profils (CRUD), sessions (CRUD), `/stats`, `/export` (PDF) | **admin/editeur** (garde au niveau routeur) |
| `/api/temoignages` | `GET /public` ; CRUD (`upload image`) | admin/editeur |
| `/api/dons` | `POST /` (public) ; liste/détail/statut/delete | admin/editeur (delete admin) |
| `/api/recherche` | `GET /?q=` recherche globale (blogs+événements+fichiers) | public |
| `/api/agenda` | paramètre (get public/put admin), créneaux (dispo public), **réserver** + **suivi** (public), gestion RDV (admin) | mixte |
| `/api/anniversaires` | CRUD + `POST /verifier` (déclenchement manuel) | admin/editeur |
| `/api/taches` | CRUD + commentaires + `POST /rappels` | staff (admin/editeur/membre) |
| `/api/calendrier` | CRUD entrées manuelles | admin/editeur |

> Référence exhaustive et à jour : **Swagger `/api-docs`** (`Backend/api-docs.json`). Régénérer avec `npm run swagger:gen` après tout changement d'API.

### 3.4 Authentification (état actuel, factuel)

- **Connexion** (`POST /api/auth/login`) : vérifie email + mot de passe (bcrypt), génère un **JWT** (payload `{email}`, signé avec `JWT_SECRET`, expiration `JWT_EXPIRES_IN` = « 1d ») et le pose dans un **cookie httpOnly** nommé **`token`**.
- **Options du cookie** (`utils/user.utils.js`) : `httpOnly:true`, `secure` uniquement en production, `sameSite:'lax'`, `path:'/'`, `domain` **seulement si `COOKIE_DOMAIN` est défini** (actuellement non défini → cookie mono-hôte), `maxAge` 7 jours.
- **Vérification** (`authenticationJWT`) : lit le token depuis l'en-tête `Authorization: Bearer <token>` **puis, à défaut, depuis le cookie `token`**. Charge l'`Utilisateur` (sans le mot de passe) dans `req.user`.
- **Rôles** (`authorizeRoles(...)`) : `admin`, `editeur`, `membre`. 403 si non autorisé.
- **`optionalAuthJWT`** : attache `req.user` si un token valide est présent, sinon continue en anonyme — utilisé pour l'inscription publique aux événements (visiteur ou connecté).
- **Déconnexion** : `clearCookie('token')`. **`register`** (admin) ne pose volontairement pas de cookie (ne pas écraser la session de l'admin appelant).
- Côté frontend, `lib/axios.ts` envoie le cookie automatiquement (`withCredentials`) et **ne manipule jamais le token en JS** (anti-XSS). Le profil non sensible est mis en cache dans `localStorage.user`.

### 3.5 Middlewares

- `auth.middleware.js` — `authenticationJWT`, `authorizeRoles`, `optionalAuthJWT`, `checkAuthStatus`.
- `error.middleware.js` — logger **Winston** (`logs/error.log`) + `errorMiddleware` global (mappe les erreurs Sequelize/SQL → codes HTTP ; messages détaillés seulement en dev).
- `upload.middleware.js` — **Multer** `diskStorage` : destination selon le champ (`avatar`→`uploads/avatars`, `image`→`uploads/images`, sinon `uploads/autres`). ⚠️ **Aucune limite de taille ni filtre de type** configuré ; `bodyParser` à **1024 Mo** (à durcir — cf. §6).
- `email.middleware.js` — validateur d'email par regex.

### 3.6 Utils

- `scheduler.js` — **node-cron**, fuseau **Africa/Lubumbashi** : **07:00** → `verifierAnniversaires()` (alerte jour J aux abonnés + rappel J-N aux admins) ; **07:30** → `verifierRappelsTaches()` (rappels d'échéance aux assignés).
- `user.utils.js` — `generateToken`, `getAuthCookieOptions`, `getUserWithoutPassword`, validation mot de passe.
- **Générateurs PDF (PDFKit)** : `event-pdf.js` (billet + **QR**), `recu-pdf.js` (reçu de paiement + QR), `event-finances-pdf.js` (rapport financier événement), `identity-pdf.js` (fiche d'identité), `pointage-pdf.js` (rapport de présence). Couleur de marque `#a42223`.
- **Templates emails HTML** : `email.template.js` (welcome, reset, contact, message admin, dons, paiement événement, identité, newsletter, inscription…), `agenda-email.template.js`, `anniversaire-email.template.js`, `tache-email.template.js`. Toutes les entrées sont échappées.
- `stats.utils.js` (variations mensuelles), `pointage.utils.js` (périodes UTC+2), `normalizeUploadPaths.js` (chemins Windows), `deletefile.js`.

### 3.7 Configuration & variables d'environnement

Chargées depuis `.env.${NODE_ENV}.local` par `config/env.js` (noms uniquement, **jamais de secrets committés**) :

- Serveur : `NODE_ENV`, `PORT` (5500), `URL_ORIGIN`, `HOST_URL`, `FRONT_URL`
- Base : `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- JWT : `JWT_SECRET`, `JWT_EXPIRES_IN`
- Email/SMTP : `EMAIL_HOST`, `EMAIL`, `EMAIL_PASSWORD`, `CONTACT_EMAIL` (Nodemailer : port 465, `secure:true`)
- Divers : `DEFAULT_PASSWD`, **`COOKIE_DOMAIN`** (référencé mais **non défini** actuellement → à poser en prod, cf. §6)

### 3.8 Démarrage & garde-fou données

Au `listen`, `app.js` exécute `syncModels()` puis `startScheduler()`.
`syncModels()` = **`db.sync({ alter: false })`** (jamais destructeur) + **backfills additifs** via QueryInterface (`addColumnIfMissing`) pour les colonnes ajoutées après coup (ex. `evenements.estPayant/montant/devise/champsPersonnalises`, `inscriptionsevenements.statutPaiement/montantPaye/reponsesPersonnalisees`, `fichiers.idCategorie/modeAcces`). **Règle absolue : aucune perte de données** — toute évolution de schéma passe par colonnes additives ou nouvelles tables.

---

## 4. Frontend en détail

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui. Motif récurrent : un **`page.tsx` serveur** (métadonnées + JSON-LD) qui rend un composant client frère **`*-client.tsx`** faisant les appels via `actions/`.

### 4.1 Routes publiques

`/` · `/a-propos` · `/services` · `/blog` (+ `/blog/[slug]`) · `/events` (+ `/events/[slug]`) · `/files` (+ `/files/[slug]`) · `/contact` · `/identity` (formulaire fiche d'identité) · `/don` · `/recherche` · `/rendez-vous` · `/connexion` (+ `/connexion/reset-request`, `/connexion/reset`) · `/403` · `not-found`.

**SEO** : `generateMetadata` + JSON-LD (`Article` sur blog, `Event` sur événement, `NGO`/Organization sur home), `app/sitemap.ts`, `app/robots.ts` (bloque `/admin` et `/connexion`), `app/manifest.ts`, `app/opengraph-image.tsx` (image OG générée), `metadataBase`.

### 4.2 Espace admin (`/admin/*`)

Tableau de bord (`/admin`) + sections : `users`, `blog` (+ new/edit/view), `categories`, `comments`, `events` (+ new/edit/view), `files` (+ new/edit/view), `identities` (+ view), `abonnes` (+ view), `newsletter` (+ new/view), `contact` (+ new/sent/view), `team` (+ new/[id]/edit/view), `pointage`, `temoignages`, `dons`, `agenda`, `anniversaires`, `taches`, `calendrier`, `profile`, `settings`. Layout dédié (`app/admin/layout.tsx`) avec **sidebar drawer** responsive (groupée par sections).

### 4.3 Couche `actions/` (front↔back)

**Toute** la communication passe par `actions/` (une fonction par opération). 22 fichiers : `auth`, `dashboard`, `users`, `blog`, `categorie`, `comment`, `event`, `file`, `identity`, `abonne`, `newsletter`, `contact`, `message`, `equipe`, `pointage`, `temoignage`, `don`, `agenda`, `anniversaire`, `tache`, `calendrier`, `recherche`. Chaque fonction cible un endpoint `/api/*` (cf. §3.3).

### 4.4 Types

- `types/user.ts` (~1000 lignes) : tous les domaines + leurs enums (rôles, statuts, paiement, récurrence de tâches, etc.) et wrappers requête/réponse.
- `types/dashboard.ts` : formes d'agrégats du tableau de bord (`DashboardResponse` : users, abonnes, evenements, blogs, rendezVous, anniversaires, taches, pointage, dons, finances, **`serie`** = séries mensuelles 6 mois).

### 4.5 `lib/`

- `axios.ts` — instance unique : `baseURL = NEXT_PUBLIC_API_URL`, `withCredentials: true`, **aucun intercepteur token**.
- `permissions.ts` — **matrice de rôles** (source unique, partagée avec `proxy.ts`) :
  - **`admin`** → accès total à `/admin/*`.
  - **`editeur`** → `/admin`, `/admin/blog`, `/admin/comments`, `/admin/categories`, `/admin/events`, `/admin/files`, `/admin/contact`, `/admin/team`, `/admin/pointage`, `/admin/temoignages`, `/admin/dons`, `/admin/agenda`, `/admin/anniversaires`, `/admin/taches`, `/admin/calendrier`, `/admin/profile`.
  - **`membre`** → `/admin`, `/admin/team`, `/admin/taches`, `/admin/profile`.
- `ics.ts` — génération de fichiers **`.ics`** (iCalendar) + liens **Google Agenda** (journée entière + récurrence annuelle).
- `utils.ts` (`cn`), `auth.ts` (helpers localStorage `user`).

### 4.6 `proxy.ts` (protection des routes)

Ex-`middleware.ts` (convention Next.js 16). Matcher : `["/admin/:path*", "/connexion"]`. Lit le cookie `token`, valide la session côté serveur via `GET /api/auth/profile` (relaie le Bearer), applique `hasAccessToPage(role, pathname)`. Redirige vers `/connexion` si non authentifié, vers `/admin` si accès refusé.

### 4.7 Composants

- `components/ui/` — primitives **shadcn/Radix** (~65 fichiers).
- `components/admin/` — `sidebar`, `header`, `dashboard-overview`, `blog-editor`, `recent-users`, `recent-posts`, `event-payment-fields`, `newsletter-progress`, et **`admin/charts/`** (`kpi-sparkline`, `growth-bar`, `donut-chart`, `hours-line`, `category-bar`, `chart-core`) basés sur **chart.js / react-chartjs-2**.
- `components/sections/` — sections home (`testimonials`, `upcoming-events`, `actus`, `departments`).
- `components/modals/` — `register-event-modal` (inscription publique + champs personnalisés), modales user/catégorie/suppression.
- `components/add-to-calendar.tsx` (utilise `lib/ics`), `header.tsx`, `footer.tsx`.

### 4.8 Thème & design system

- Tokens **OKLCH** dans `app/globals.css` : **crimson** `--primary`, palette `--chart-1..5` (variantes clair **et** sombre), rayons, tokens sidebar.
- Polices : **Crimson Pro** (serif, titres) / **Inter** (sans, corps).
- Dark mode via `contexts/theme-context.tsx` (classe `.dark` sur `<html>`, persistée en localStorage).
- **Règle** : couleurs **via les tokens** (`bg-primary`, `text-muted-foreground`…), **jamais** de hex en dur. Les graphiques lisent les tokens `--chart-*` **au runtime** (theme-aware).

---

## 5. Modules fonctionnels (vue métier, bout-en-bout)

- **Auth / Utilisateurs / Équipe** — comptes (3 rôles), profils, gestion d'équipe publique.
- **Blog / Catégories / Commentaires** — articles (brouillon/publié, image, tags, temps de lecture), catégories, commentaires publics avec **modération admin** + fils de discussion + anti-spam honeypot.
- **Événements** — CRUD, **inscription publique dynamique** avec **champs personnalisés** (texte/email/tél/nombre/select/checkbox/date/textarea/**fichier**) ; **gratuit** → billet PDF + QR par email ; **payant** → suivi **manuel** du paiement (payé / partiel + montant / accepté non payé), **billet + reçu PDF** une fois payé, **suivi financier** + export PDF ; devise configurable par événement.
- **Fichiers / Ressources** — regroupements de fichiers (JSON), mode accès lecture/téléchargement, versions publique et admin.
- **Newsletter** — rédaction, **envoi en arrière-plan** (job non bloquant, réponse 202) + **barre de progression** (polling), suivi par abonné, stats.
- **Abonnés** — inscription publique, gestion des statuts (actif/inactif/désabonné).
- **Contact** — réception des messages publics + **boîte d'envoi admin** (envoi réel via Nodemailer).
- **Fiches d'identité de pèlerins** — formulaire public complet (état civil, contact d'urgence, santé), génération PDF, approbation admin.
- **Dons** — page publique (coordonnées + **formulaire d'intention** ; paiement **hors-ligne**), notification email (admin + remerciement), suivi admin (annoncé/confirmé).
- **Recherche globale** — endpoint public agrégeant blogs + événements + fichiers.
- **Témoignages** — CRUD admin (photo, ordre, statut) + carrousel dynamique sur la home.
- **Pointage** (temps au bureau) — profils (système ou manuels), saisie manuelle de sessions (date + heures, **clôture a posteriori**), plusieurs sessions/jour, fuseau **UTC+2**, stats + **export PDF**.
- **Agenda / RDV** — **coordinateur unique** configurable, créneaux, **réservation publique**, suivi par email, gestion admin (approuver/refuser/reprogrammer), emails automatiques.
- **Anniversaires** — saisie + **rappels automatiques** (cron) : alerte jour J aux abonnés, rappel J-N aux admins.
- **Tâches / Kanban** — vue Kanban (À faire / En cours / Fait) **drag & drop**, priorité, échéance, **récurrence**, assignation multi-staff, commentaires, **rappels** (cron). Une tâche récurrente marquée « Fait » engendre automatiquement l'occurrence suivante.
- **Calendrier agrégé** — vue mois/liste réunissant événements + RDV + anniversaires + **entrées manuelles** (ajout/édition/suppression) ; **export `.ics` / Google Agenda** par élément.
- **Tableau de bord analytique** — KPIs (utilisateurs, abonnés, événements, articles, heures pointées, dons) avec tendance + **sparklines** ; **séries 6 mois** (croissance) ; donuts (répartition événements à venir/passés, abonnés par statut) ; **top contributeurs** pointage ; articles par catégorie ; panneaux opérationnels (prochains RDV, anniversaires, tâches) ; salutation dynamique + horloge live.

---

## 6. État d'avancement

### ✅ Fait
- **Lot 0** — bugs critiques, config build (`ignoreBuildErrors` retiré), **auth httpOnly**, Helmet, notifications factices masquées.
- **Lot 1** — responsivité **admin** (sidebar drawer, tables, formulaires, pages détail) et **public** (correctifs structurels).
- **Lot 2** — **SEO** (sitemap, robots, manifest, métadonnées par page, JSON-LD, image OG, images optimisées).
- **Lot 3** — Pointage (3.1), Témoignages (3.2), Dons (3.3), Recherche (3.4), Commentaires (3.5), Boîte d'envoi contact (3.6), **Événement inscription+paiement** (3.7), **Newsletter progression** (3.8).
- **Lot 5** — Agenda/RDV (5.1), **Calendrier agrégé** (5.2) + **entrées manuelles**, Anniversaires (5.3), **Tâches/Kanban** (5.4), **Dashboard** (5.5) + refontes analytiques successives.

### 🔶 En cours / partiel
- Audit fin de la **gestion d'erreurs** des contrôleurs (homogénéité codes/messages) — non bloquant.
- **Passe visuelle responsive** publique (360→1440) + **accessibilité tactile** (cibles ≥ 44 px, focus, `aria-*`).

### ⏳ À faire — Lot 4 (polish & finitions)
- Pages **`not-found` et `403`** soignées et cohérentes avec la marque.
- **Skeletons** et gestion d'erreurs UI homogènes.
- **Audit accessibilité** (clavier / lecteur d'écran / contrastes).
- **README** projet (remplacer le boilerplate) + **`.env.example`** (front & back).
- Vérifier le **tracking newsletter** et les **liens de désabonnement**.
- **Limites d'upload** Multer (taille/type par usage) — décision à prendre.
- **`BreadcrumbList`** JSON-LD ; nettoyage de la dépendance `js-cookie` inutilisée.
- Mesurer **Lighthouse ≥ 90** (perf/SEO/best-practices/a11y) sur le site lancé.

### ⚠️ Points de vigilance connus
- **`COOKIE_DOMAIN=.burningheartihs.org`** à définir en production (cookie partagé entre `burningheartihs.org` et `api.burningheartihs.org`). En dev : laisser vide.
- **Coordonnées bancaires** « À compléter » dans `Frontend/app/don/donation-client.tsx` (`BANK_DETAILS`).
- **`NEXT_PUBLIC_SITE_URL`** est consommé (métadonnées/JSON-LD) mais absent de `.env` (fallback `https://burningheartihs.org`) — à documenter.
- **Deux systèmes de thème** coexistent : `contexts/theme-context.tsx` (actif, câblé dans `layout.tsx`) et `next-themes` (dépendance installée mais inutilisée).
- **Deux librairies de charts** installées : **chart.js** (active, dashboard) et **recharts** (installée, non utilisée dans le dashboard actuel).
- **Redéploiement backend requis** après tout ajout de modèle/endpoint (nouvelles tables créées au démarrage ; sinon les nouvelles clés d'API manquent).
- **Multer** sans limite de taille/type (cf. Lot 4).

---

## 7. Lancer le projet

| Action | Frontend (`Frontend/`) | Backend (`Backend/`) |
|---|---|---|
| Dev | `npm run dev` | `npm run dev` (nodemon) |
| Build | `npm run build` | — |
| Prod | `npm start` | `npm start` |
| Lint | `npm run lint` | `eslint .` |
| Swagger | — | `npm run swagger:gen` (régénère `api-docs.json`) |

- **Shell par défaut : PowerShell (Windows)** — pas d'opérateurs `&&`/`||` en ligne.
- Variables d'environnement requises : voir §3.7 (backend) et `NEXT_PUBLIC_API_URL` (+ `NEXT_PUBLIC_SITE_URL`) côté frontend.
- Documentation d'API : `${HOST_URL}/api-docs` (Swagger UI).
- Le frontend écoute par défaut sur le port 3000 ; le backend sur `PORT` (5500). CORS autorise `localhost:3000`, `127.0.0.1:3000`, `burningheartihs.org`, `api.burningheartihs.org`.

---

## 8. Conventions & garde-fous

1. **Domaine en français** — ne pas angliciser modèles, champs, routes, libellés.
2. **Appels API uniquement via `actions/`** — jamais d'axios brut dans un composant.
3. **Server Components par défaut** ; `"use client"` seulement si interactivité réelle. Pages publiques compatibles `generateMetadata` (SEO).
4. **UI = shadcn/ui + Tailwind**, couleurs **via tokens** (jamais de hex), thème crimson + dark mode, `font-serif` (titres) / `font-sans` (corps), icônes `lucide-react`, toasts `sonner`/`use-toast`.
5. **Sécurité des données** : évolutions de modèle en **colonnes additives** (`queryInterface.addColumn`) ou **nouvelles tables** (`db.sync({alter:false})`). **Jamais** de `force`/`alter` destructeur.
6. **Sécurité d'accès** : garder `proxy.ts` et `lib/permissions.ts` **synchronisés** (matrice de rôles unique). Ne pas exposer de données admin en public.
7. **Backend** : réponses JSON cohérentes, codes HTTP corrects, validation des entrées, slugs via `slugify`, mots de passe via `bcryptjs`, ne jamais renvoyer `password`. Toute nouvelle route → contrôleur + entrée Swagger (+ action front + type).
8. **Definition of Done** (par tâche) : compile sans `ignoreBuildErrors` + lint propre · responsive (360→1440) + accessible · états chargement/vide/erreur · SEO (si page publique) · flux front↔back testé + Swagger à jour · cases cochées dans `plan.md` + `walkthrough.md` mis à jour.
9. **Commits** en français, préfixés (`feat:`/`fix:`/`refactor:`…), sur `dev`, **sans** trace d'outil d'assistance.

---

*Pour le détail chronologique des implémentations, se référer à [`walkthrough.md`](walkthrough.md) ; pour la roadmap et l'état des tâches, à [`plan.md`](plan.md).*
