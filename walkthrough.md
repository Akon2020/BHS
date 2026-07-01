# 🛠️ Walkthrough — Burning Heart

> Journal des étapes d'implémentation, lot par lot (cf. [`plan.md`](plan.md)).

---

## LOT 0 — Bugs critiques & dette technique

### 0.1 Permissions & navigation ✅

**Objectif** : unifier le contrôle d'accès admin par rôle et corriger les incohérences/bugs de navigation.

**Modifications**

1. **Renommage `middleware.ts` → `proxy.ts`** (Frontend)
   - Convention Next.js 16 : le fichier `middleware.ts` devient `proxy.ts`, la fonction `middleware()` devient `proxy()` et l'export `config` devient `proxyConfig`.
   - `Frontend/middleware.ts` supprimé ; `Frontend/proxy.ts` créé.
   - Aucune autre référence à `middleware` dans le code (vérifié).

2. **Source unique de permissions** (`Frontend/lib/permissions.ts`)
   - La matrice `ADMIN_PAGE_PERMISSIONS` y est désormais l'unique source de vérité.
   - `proxy.ts` importe `hasAccessToPage` + `UserRole` depuis `@/lib/permissions` (plus de duplication de matrice côté middleware).
   - `hasAccessToPage` : le rôle `admin` a un accès total (court-circuit `return true`).
   - Matrice appliquée :
     - `admin` → tout l'espace admin.
     - `editeur` → `/admin`, `/admin/blog`, `/admin/categories`, `/admin/events`, `/admin/files`, `/admin/contact`, `/admin/team`, `/admin/pointage`, `/admin/profile`.
     - `membre` → `/admin`, `/admin/team`, `/admin/profile`.
   - Corrige les bugs : `membre` n'a plus plus de droits qu'`editeur` ; `/admin/files`, `/admin/abonnes`, `/admin/identities` ne redirigent plus pour l'admin.

3. **Correction de lien cassé** `/admin/profil` → `/admin/profile`
   - `Frontend/components/header.tsx`
   - `Frontend/components/admin/header.tsx`

**Vérification**
- `npx tsc --noEmit` : aucune erreur sur les fichiers modifiés (`proxy.ts`, `lib/permissions.ts`, les deux headers).
- 5 erreurs TS préexistantes restantes (pages `blog`/`events`) — hors périmètre, traitées au goal 0.2.
- `eslint` non installé côté Frontend (absent des `devDependencies`) — à ajouter (suivi en 0.2 / Lot 4).

### 0.2 Configuration build ✅ (partiel)

**Objectif** : durcir la config build et préparer le SEO.

**Modifications**

1. **Correction des 5 erreurs TS préexistantes** (pour pouvoir retirer `ignoreBuildErrors`) :
   - `app/blog/page.tsx` : suppression de l'interface locale `BlogPost`, usage du type partagé `Blog` ; garde optionnelle sur `post.extrait` dans le filtre de recherche.
   - `app/events/[slug]/page.tsx` : suppression de l'interface locale `EventDetails`, usage du type partagé `Evenement` (corrige l'incompatibilité `statut` et `slug`).
   - `app/events/page.tsx` : `totalPages` calculé (`Math.ceil(total / pageSize)`), car absent de `GetAllEventsResponse`.

2. **`next.config.mjs`** : retrait de `typescript.ignoreBuildErrors: true`.

3. **`app/layout.tsx`** : ajout de `metadataBase` (`NEXT_PUBLIC_SITE_URL` avec fallback `https://burningheartihs.org`).

**Différé**
- Réactivation de l'optimisation d'images (`images.unoptimized` → `remotePatterns`) : repoussée au **Lot 2.4** (nombreux `next/image` distants → risque runtime ; nécessite host/port de dev + test visuel). Un commentaire `NOTE (Lot 2.4)` est laissé dans `next.config.mjs`.

**Vérification**
- `npx tsc --noEmit` : **0 erreur**.
- `npm run build` : **succès** (route table complète ; `ƒ Proxy (Middleware)` confirme la prise en compte de `proxy.ts` par Next.js 16).

### 0.3 Auth httpOnly + notifications ✅

**Objectif** : sécuriser l'authentification (token hors du JS) et retirer les placeholders.

**Diagnostic initial**
- `cookie-parser` était installé mais **non monté** dans `app.js` → `req.cookies` indéfini ; l'auth reposait en réalité uniquement sur le header `Authorization: Bearer` (token du `localStorage`).
- Le front écrasait le cookie httpOnly du backend par un cookie JS (`js-cookie`) — faille XSS.
- `secure: true` en dur sur les cookies → cookie rejeté en dev (http).

**Backend**
- `app.js` : montage de `cookie-parser` (`app.use(cookieParser())`).
- `config/env.js` : export de `COOKIE_DOMAIN`.
- `utils/user.utils.js` : helper `getAuthCookieOptions()` (httpOnly, `secure` en prod uniquement, `sameSite=lax`, `path=/`, `domain` si `COOKIE_DOMAIN`, `maxAge` 7 j optionnel).
- `controllers/auth.controller.js` :
  - `login` : pose le cookie via le helper ; ne renvoie plus le token dans le corps JSON.
  - `register` : **suppression du `res.cookie`** (endpoint admin → ne doit pas écraser la session de l'admin appelant) ; ne renvoie plus le token.
  - `logout` : `clearCookie` avec les mêmes options.

**Frontend**
- `lib/axios.ts` : suppression de l'intercepteur qui injectait le Bearer depuis `localStorage` (cookie + `withCredentials` suffisent).
- `actions/auth.ts` : `login` ne stocke plus que le profil (`user`) ; `logout` nettoie `user` ; `getProfile` sans header manuel ; retrait de `js-cookie` et `getAuthHeaders`.
- `lib/auth.ts` : suppression de `getAuthHeaders`.
- `hooks/useAuth.ts` : validation de session via `/api/auth/profile` (cookie), persistance du profil, nettoyage si échec.
- `types/user.ts` : `AuthResponse.data.token` rendu optionnel.
- `proxy.ts` : inchangé — lit le cookie côté serveur et relaie le Bearer à `/api/auth/profile`.

**Notifications**
- `components/admin/header.tsx` : badge factice « 3 » → `0` + état vide « Aucune notification ».

**⚠️ À faire avant prod / à tester**
- Tester le flux réel : connexion, accès `/admin`, refresh, déconnexion.
- En **production**, définir `COOKIE_DOMAIN=.burningheartihs.org` (cookie partagé entre `burningheartihs.org` et `api.burningheartihs.org`, lisible par `proxy.ts`). En dev, laisser vide (host-only `localhost`).
- `js-cookie` / `@types/js-cookie` désormais inutilisés (nettoyage possible au Lot 4).

**Vérification**
- Front : `npx tsc --noEmit` → 0 erreur ; `npm run build` → succès.
- Back : `node --check` OK sur `app.js`, `config/env.js`, `utils/user.utils.js`, `controllers/auth.controller.js`.

### 0.4 Qualité backend ✅ (partiel)

**Modifications**
- `app.js` : montage de **Helmet** avec une config adaptée à l'API :
  - `contentSecurityPolicy: false` (évite de casser l'UI Swagger `/api-docs`).
  - `crossOriginResourcePolicy: { policy: "cross-origin" }` (autorise le front, autre sous-domaine, à charger les fichiers de `/uploads`).
  - `crossOriginEmbedderPolicy: false`.

**Constats / vérifications**
- `syncModels()` : `db.sync({ alter: false })` → **non destructif** (OK).
- `upload.middleware.js` : Multer **sans limite de taille ni filtre de type** ; `bodyParser` à 1024 Mo → **décision requise** sur les tailles/types max (traité avec le module Fichiers / Lot 4).
- Audit fin de la gestion d'erreurs des contrôleurs : reporté (non bloquant ; `errorMiddleware` global + `try/catch` déjà en place).

**Vérification** : `node --check app.js` → OK.

---

## LOT 0 — Bilan

Lot 0 traité (0.1 → 0.4). Restes connus, non bloquants : optimisation d'images (→ Lot 2.4), témoignages statiques (→ Lot 3.2), limites d'upload (décision), audit fin des contrôleurs. Prochaine étape : **Lot 1 — Responsivité**.

---

## LOT 1 — Responsivité

### 1.1 Admin — sidebar drawer + layout ✅

**Objectif** : rendre l'espace admin réellement responsive (la sidebar restait visible et rognait l'écran sur mobile).

**Modifications**
- `components/admin/sidebar.tsx` : réécriture en **drawer piloté CSS** (SSR-safe, sans hook de breakpoint).
  - Props `collapsed` / `onToggleCollapse` (desktop) et `mobileOpen` / `onMobileClose` (mobile).
  - `<lg` : `position: fixed`, `w-64`, masqué via `-translate-x-full`, ouvert via `translate-x-0` + **backdrop** `lg:hidden` + bouton **X**.
  - `≥lg` : `lg:static`, largeur `lg:w-64` ↔ `lg:w-16` (collapse via chevron) ; libellés masqués en mode réduit (`lg:hidden`), icônes `shrink-0`, `title` au survol.
  - Fermeture du drawer au clic sur un lien (`onMobileClose`).
- `app/admin/layout.tsx` : deux états distincts (`collapsed`, `mobileOpen`), `overflow-hidden` sur le conteneur, `main` en `overflow-y-auto p-4 md:p-6`.
- `components/admin/header.tsx` : prop `onOpenSidebar` ; bouton menu `lg:hidden` (au lieu de `md:hidden`) avec `aria-label`.

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.

### 1.1 Admin — tableaux & dashboard ✅ (structurel)

- **Tableaux** : le primitif `components/ui/table.tsx` enveloppe déjà dans `overflow-x-auto` ; les 8 pages liste utilisent ce composant → défilement horizontal mobile déjà assuré. (Variante « cartes » mobile = enhancement optionnel.)
- **Dashboard** (`app/admin/page.tsx`) : grille stats déjà adaptive ; en-tête d'actions rendu responsive (`flex-col` empilé sur mobile → `sm:flex-row`, titre `text-2xl sm:text-3xl`, boutons `flex-wrap`).
- **En-têtes de pages** : motif responsive (`flex-col` empilé sur mobile → `sm:flex-row sm:items-center sm:justify-between`, titre `text-2xl sm:text-3xl`) appliqué aux 7 pages admin avec boutons d'action : blog, events, newsletter, team, users, identities, contact.

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.

### 1.1 Admin — formulaires & modales ✅

- **Grilles de formulaires** : audit des pages new/edit → déjà majoritairement responsives (`grid-cols-1 lg:grid-cols-3`, `md:grid-cols-2`). Corrigé les 2 grilles `grid-cols-2` fixes (champs Heure début/fin) dans `events/new` et `events/edit` → `grid-cols-1 sm:grid-cols-2`.
- **Modales utilisateur** (`add-user-modal`, `edit-user-modal`) : le layout label-gauche `grid-cols-4` s'empile désormais sur mobile (`grid-cols-1 sm:grid-cols-4`, labels `sm:text-right`).
- **Reste (optionnel)** : variantes « cartes » de tableaux sur très petit écran (non bloquant, tables déjà scrollables).

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.

**Bilan 1.1** : responsivité de l'espace admin traitée (sidebar drawer, layout, tables, dashboard, en-têtes, formulaires, modales). Prochaine étape : **Lot 1.2 — Public**.

### 1.1 Admin — correctifs après tests mobile ✅

Suite aux retours (captures) de test sur téléphone :
- **« Utilisateurs récents » / « Articles récents »** (`components/admin/recent-users.tsx`, `recent-posts.tsx`) : débordement corrigé — bloc gauche `min-w-0 flex-1` + `truncate` (nom/email/titre), bloc droit `shrink-0 flex-col items-end`, date au format court `toLocaleDateString("fr-FR")`.
- **Recherche fiches d'identité** : la rangée de filtres utilisait `items-end` (largeur réduite sur mobile) → `flex-col gap-4 md:flex-row md:items-end` + champ `w-full md:flex-1`.
- **Filtres de statut** (newsletter, événements) : `SelectTrigger` passait `w-[150px]` fixe → `w-full sm:w-[180px]` (pleine largeur sur mobile ; conteneur events `w-full sm:w-auto`).
- **Débordement création newsletter** : groupe de boutons `flex gap-2` (avec `min-w-[200px]`) → `flex-col gap-2 sm:flex-row`, boutons `w-full sm:w-auto` (supprime le scroll horizontal de page).
- **Débordement création/édition événement** : en-tête `flex items-center justify-between` non responsive → `flex-col gap-4 sm:flex-row…`, boutons d'action empilés `w-full sm:w-auto`, titre `text-2xl sm:text-3xl`.
- **Visualisation d'article** (`/admin/blog/view/[id]`) : en-tête (titre + badge + Modifier/Supprimer) rendu responsive (`flex-col sm:flex-row`, titre `truncate min-w-0`, boutons `flex-wrap`) ; contenu HTML protégé contre le débordement (`break-words`, images `max-w-full`, `pre`/`table` scrollables).

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.

### 3.6 Boîte d'envoi admin (Contact) ✅

Décision : **boîte d'envoi admin** avec **envoi réel** (Nodemailer).

**Backend**
- `models/messageEnvoye.model.js` : `MessageEnvoye` (destinataireEmail, destinataireNom, sujet, message, statut `envoye`/`echec`, erreur, envoyePar, timestamps ; table `messagesEnvoyes`).
- `models/index.model.js` : import + association `belongsTo Utilisateur (as expediteur)` + export.
- `utils/email.template.js` : nouveau `messageAdminTemplate(nom, sujet, message)` (branding existant).
- `controllers/messageEnvoye.controller.js` : `envoyerMessage` (valide, envoie via transporter, enregistre `envoye` ; en cas d'échec enregistre `echec` + erreur et renvoie 502), `getMessagesEnvoyes`, `getMessageEnvoyeById`, `deleteMessageEnvoye`.
- `routes/messageEnvoye.route.js` + montage `app.use("/api/messages", …)` ; accès `admin`+`editeur` (DELETE `admin`) ; Swagger inline (scanné via `./routes/*.js`).

**Frontend**
- `types/user.ts` : `MessageEnvoye`, `GetMessagesEnvoyesResponse`, `EnvoyerMessagePayload`.
- `actions/message.ts` : `envoyerMessage`, `getMessagesEnvoyes`, `getMessageEnvoye`, `deleteMessageEnvoye`.
- `app/admin/contact/new/page.tsx` : formulaire de composition (destinataire, sujet, message) + envoi + états chargement/erreur/succès → redirige vers `/sent`.
- `app/admin/contact/sent/page.tsx` : liste (table scrollable), badge statut, dialog de lecture, suppression (réutilise `DeleteConfirmationModal`).
- `app/admin/contact/page.tsx` : boutons « Messages envoyés » (`/sent`) et « Écrire un nouveau message » (`/new`) ajoutés à l'en-tête (groupe responsive).
- Accès : `/admin/contact/*` couvert par la matrice (`admin`, `editeur`).

**Vérification** : Front `tsc` → 0 erreur, `build` → succès ; Back `node --check` OK sur tous les fichiers.
**À tester en runtime** : envoi réel d'un email + apparition dans « Messages envoyés ».

### 1.1 Admin — pages de visualisation/détail ✅

Passe groupée (même motif d'en-tête débordant que `blog/view`) :
- **En-têtes rendus responsive** (`flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`, groupe gauche `min-w-0`, titre `truncate text-2xl sm:text-3xl`, bouton d'action `w-full sm:w-auto`, back `shrink-0`) : `identities/view/[id]`, `team/[id]/view`, `users/[id]`, `newsletter/view/[id]`, `contact/view/[id]`, `files/view/[id]`.
- Déjà responsives (non touchées) : `events/view/[id]`, `abonnes/view/[id]`.
- **Contenu HTML protégé** du débordement (`break-words`, `[&_img]:max-w-full`, `pre`/`table` scrollables) : `blog/view`, `events/view`, `newsletter/view`.

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.

**Bilan 1.1** : responsivité de l'admin complète (navigation, layout, tableaux, dashboard, en-têtes liste, formulaires, modales, pages détail). Prochaine étape : **Lot 1.2 — Public**.

### 1.2 Public — audit & correctifs structurels ✅ (partiel)

**Audit** des motifs à risque (grilles fixes sans préfixe responsive, flex non-wrap, hauteurs/largeurs figées) sur les pages publiques → site déjà majoritairement mobile-first ; peu d'écarts.

**Corrigé**
- **Home** (`app/page.tsx`) : hero `h-[100vh]` → `min-h-[100svh]` (évite le saut de barre d'URL mobile et le clipping du contenu).
- **Connexion** (`/connexion`, `/connexion/reset`, `/connexion/reset-request`) : wrapper `flex h-screen …` → `min-h-[100svh]` (la carte n'est plus coupée si elle dépasse la hauteur de l'écran).

**Sans risque (laissé tel quel)** : `min-w-[200px]`/`min-w-[220px]` des boutons « Charger plus » (< 360 px) ; `grid-cols-2` de métadonnées `text-xs` sur `/files` (libellés courts).

**Reste (passe visuelle)** : vérification fine au navigateur (360→1440) — carte Google Maps, grille contact, carrousel témoignages, a11y tactile.

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.

---

## LOT 3 — Nouvelles fonctionnalités

### 3.1 Pointage — Backend ✅

**Modèles**
- `models/profilPointage.model.js` : `ProfilPointage` (nomComplet, fonction, `source` systeme/manuel, idUtilisateur FK nullable, actif). Table `profilsPointage`.
- `models/pointage.model.js` : `Pointage` (idProfil FK, date, heureDebut, heureFin nullable, `dureeMinutes` calculée par hook `beforeSave` — uniquement si début+fin et fin>début, sinon pointage simple, note, createdBy). Table `pointages`.
- `models/index.model.js` : associations (`profil`/`pointages` CASCADE, `utilisateur`, `createur`) + exports.

**Helpers & PDF**
- `utils/pointage.utils.js` : `getPeriodeRange(periode, anchor)` (hebdo ISO lun–dim / mensuel / annuel, fuseau **UTC+2**), `formatDuree`, `formatPeriodeLabel`.
- `utils/pointage-pdf.js` : `generatePointagePdf(stream, data)` (pdfkit, branding crimson, résumé + table avec en-tête/zébrage + pagination).

**Contrôleur** `controllers/pointage.controller.js`
- Profils : `getProfils`, `createProfil` (manuel ou depuis utilisateur système, anti-doublon), `updateProfil`, `deleteProfil`.
- Sessions : `getPointages` (filtres profil/période/dates), `createPointage`, `updatePointage` (**clôture a posteriori**), `deletePointage`.
- Stats : `getStats` (profils actifs, présences, temps cumulé, graphique top 10, récap) — agrégation JS.
- Export : `exportPdf` (scope `global`/`individuel`, stream PDF en réponse).

**Route & montage**
- `routes/pointage.route.js` : garde `authenticationJWT` + `authorizeRoles("admin","editeur")` ; routes spécifiques (`/profils`, `/stats`, `/export`) avant `/:id` ; Swagger inline.
- `app.js` : `app.use("/api/pointages", pointageRouter)`.

**Vérification** : `node --check` OK sur tous les fichiers. Table créée par `syncModels` au démarrage.

### 3.1 Pointage — Frontend ✅

- `types/user.ts` : `ProfilPointage`, `Pointage`, `PointageStatsResponse`, payloads, `PointagePeriode`.
- `actions/pointage.ts` : profils (get/create/delete), pointages (get/create/update/delete), `getPointageStats`, `getPointageExportUrl` (ouverture nouvel onglet, cookie httpOnly envoyé automatiquement).
- `app/admin/pointage/page.tsx` :
  - En-tête responsive + **filtre période** (hebdo/mensuel/annuel) + **export global** (PDF).
  - Cartes stats (profils actifs, présences, temps cumulé).
  - **Graphique `Bar`** (chart.js, profils les plus actifs en heures) + **tableau récapitulatif** (export PDF **individuel** par ligne).
  - **Saisie d'une présence** : sélecteur de profil + dialog d'ajout de profil (manuel ou depuis un utilisateur système, persistant), date, heure début, heure fin optionnelle (sinon « pointage simple »), note.
  - **Liste des présences** de la période : édition (clôture a posteriori via dialog) + suppression (`DeleteConfirmationModal`).
- `components/admin/sidebar.tsx` : entrée « Pointage » (icône `Timer`), visible pour `admin`/`editeur` via la matrice.

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.
**À tester en runtime** : créer un profil (manuel + système), saisir des présences (avec/sans heure de fin), vérifier stats + graphique + récap par période, clôture a posteriori, exports PDF global et individuel.

---

## LOT 2 — SEO

### 2.1 Fondations techniques ✅

- `app/sitemap.ts` : sitemap **dynamique** — pages statiques publiques + blogs publiés + événements publiés + fichiers publics (fetch API server-side, `revalidate: 3600`, échec → liste vide non bloquante). Basé sur `NEXT_PUBLIC_SITE_URL` (fallback `https://burningheartihs.org`).
- `app/robots.ts` : `allow /`, **`disallow /admin` et `/connexion`**, référence du `sitemap.xml`.
- `app/manifest.ts` : PWA légère (nom, description, `start_url`, `display standalone`, `theme_color #8B1538`, icônes `logon.png`).

**Vérification** : `npm run build` génère `sitemap.xml`, `robots.txt`, `manifest.webmanifest` ; `tsc` → 0 erreur.

### 2.2 Métadonnées par page (1/2) ✅

- **Pages serveur** `a-propos`, `services`, `don` : métadonnées enrichies (`title`, `description`, `alternates.canonical`, `openGraph`) typées `Metadata`.
- **Home** : convertie en wrapper **Server Component** (`app/page.tsx`) + contenu client déplacé dans `app/home-client.tsx`. Le wrapper expose `metadata` (title/description/canonical/OG) **et** un **JSON-LD `NGO`/Organization** (nom, logo, adresse Bukavu, contacts, réseaux sociaux).

**Vérification** : `tsc` → 0 erreur ; `npm run build` → home en statique avec métadonnées.
### 2.2 / 2.3 — Pages détail & JSON-LD ✅

- **`events/[slug]`** : converti en wrapper serveur (`page.tsx` + `event-detail-client.tsx` recevant `slug` en prop) avec `generateMetadata` (title/description/canonical/OG/Twitter) **et JSON-LD `Event`** (dates, lieu, organisateur, image).
- **`files/[slug]`** : wrapper serveur (`page.tsx` + `file-detail-client.tsx`) avec `generateMetadata`.
- **`blog/[slug]`** : ajout du **JSON-LD `Article`** (headline, image, dates, auteur, publisher) au wrapper serveur existant.
- **Organization/`NGO`** : déjà sur la home (2.2).

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.
### 2.2 — Pages liste en wrappers serveur ✅

Les pages publiques restées `"use client"` sont passées en wrappers serveur (contenu déplacé dans `*-client.tsx`, `page.tsx` serveur exposant `metadata`) :
- `/blog` → `blog-list-client.tsx` · `/events` → `events-list-client.tsx` · `/files` → `files-list-client.tsx` · `/contact` → `contact-client.tsx` · `/identity` → `identity-client.tsx`.
- Chaque wrapper : `title`, `description`, `alternates.canonical`, `openGraph`.

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès (pages en statique avec métadonnées).

### 2.3 — Image OpenGraph par défaut ✅

- `app/opengraph-image.tsx` : image **générée** via `next/og` (`ImageResponse`, 1200×630, dégradé crimson + « Burning Heart / Pèlerins avec le Christ »). Légère (générée, pas de gros JPG) et héritée par toutes les pages.
- Les pages détail blog/événement conservent leur propre image OG (via `generateMetadata`).

**Vérification** : `npm run build` génère la route `/opengraph-image` (statique) ; `tsc` → 0 erreur.

### 2.4 — Optimisation des images ✅

- `next.config.mjs` : retrait de `images.unoptimized`, ajout des `remotePatterns` :
  - prod : `https://api.burningheartihs.org`, `https://burningheartihs.org`
  - dev : `http://localhost:5500`, `http://127.0.0.1:5500` (valeur de `NEXT_PUBLIC_API_URL`)
- Les `next/image` distants (blog, événements) sont désormais optimisés ; le hero garde `priority`.
- Polices `next/font` : `display: swap` par défaut → OK.

**Vérification** : `npm run build` → succès.
**À tester en runtime** : affichage des images distantes (blog/événements) en dev **et** prod ; Lighthouse ≥ 90 sur le site lancé.
**Reste (optionnel)** : `BreadcrumbList` JSON-LD ; passe a11y (alt systématiques, hiérarchie h1).

---

## LOT 3.2 — Témoignages dynamiques

### Backend ✅

- `models/temoignage.model.js` : `Temoignage` (auteur, fonction, contenu, photo, `statut` brouillon/publié, `ordre`, createdBy). Table `temoignages`.
- `models/index.model.js` : association `belongsTo Utilisateur (as createur)` + export.
- `controllers/temoignage.controller.js` : `getTemoignagesPublic` (publiés, triés par `ordre`), `getTemoignages` (admin), `getTemoignageById`, `createTemoignage`, `updateTemoignage`, `deleteTemoignage` (upload photo via champ `image`).
- `routes/temoignage.route.js` : `GET /public` (public) ; `GET /`, `POST /`, `GET/PUT/DELETE /:id` (admin+editeur, upload `image` + `normalizeUploadPaths`) ; Swagger inline ; montage `app.use("/api/temoignages", …)`.

**Vérification** : `node --check` OK sur tous les fichiers. Table créée par `syncModels`.

### Frontend — Admin ✅

- `types/user.ts` : `Temoignage`, `GetTemoignagesResponse`, `TemoignageStatut`.
- `actions/temoignage.ts` : `getTemoignagesPublic`, `getTemoignages`, `createTemoignage`/`updateTemoignage` (FormData + photo), `deleteTemoignage`.
- `app/admin/temoignages/page.tsx` : liste (avatar, extrait, badge statut, ordre) + dialog création/édition (auteur, fonction, contenu, statut, ordre, photo) + suppression (`DeleteConfirmationModal`).
- `lib/permissions.ts` : `/admin/temoignages` ajouté pour `editeur` (admin via wildcard).
- `components/admin/sidebar.tsx` : entrée « Témoignages » (icône `Quote`).

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.

### Frontend — Carrousel home ✅

- `components/sections/testimonials.tsx` : section « Témoignages » dynamique — fetch `getTemoignagesPublic`, **carrousel** shadcn (`Carousel`/embla, `loop` si > 1), carte crimson (photo/initiales, citation, auteur, fonction), flèches centrées. **Masquée** s'il n'y a aucun témoignage publié ; skeleton au chargement.
- `app/home-client.tsx` : remplacement de la section statique (Samuel Diambu codé en dur + flèches inertes) par `<TestimonialsSection />` ; nettoyage des imports `ChevronLeft/Right` devenus inutiles.

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.
**Bilan 3.2** : témoignages dynamiques complets (backend CRUD + admin + carrousel public). **À tester en runtime** : créer un témoignage publié → vérifier l'apparition dans le carrousel de la home.

---

## LOT 3.3 — Don (manuel + formulaire d'intention)

### Backend ✅

- `models/don.model.js` : `Don` (nom, email, montant `DECIMAL`, devise, `moyen` carte/virement/mobile, message, `statut` annonce/confirme). Table `dons`.
- `utils/email.template.js` : `donThankYouTemplate` (remerciement donateur) + `donIntentionAdminTemplate` (notification admin), via un wrapper de carte commun.
- `controllers/don.controller.js` : `createDon` (public, valide, crée l'intention, **envoie 2 emails** non bloquants : admin + donateur), `getDons`, `getDonById`, `updateDonStatut` (annonce/confirme), `deleteDon`.
- `routes/don.route.js` : `POST /` public ; `GET /`, `GET/PATCH /:id` (admin+editeur) ; `DELETE /:id` (admin) ; Swagger inline ; montage `app.use("/api/dons", …)`.

**Vérification** : `node --check` OK sur tous les fichiers. Table créée par `syncModels`.

### Frontend — Page publique `/don` ✅

- `types/user.ts` : `Don`, `GetDonsResponse`, `CreateDonPayload`, `DonMoyen`, `DonStatut`.
- `actions/don.ts` : `createDon` (public), `getDons`, `updateDonStatut`, `deleteDon`.
- `app/don/donation-client.tsx` (client) : cartes des moyens (Virement avec coordonnées + **boutons Copier**, Mobile Money réel copiable, Carte « bientôt disponible ») + **formulaire « Je déclare un don »** (nom, email, montant, devise USD/CDF/EUR, moyen, message) → `createDon`.
- `app/don/page.tsx` : reste **serveur** (métadonnées conservées), intro + `<DonationClient />` + carte de remerciement. Bouton « Donner maintenant » inactif supprimé.
- ⚠️ Coordonnées bancaires : placeholders « À compléter » dans `donation-client.tsx` (`BANK_DETAILS`) à remplacer par les vraies infos.

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.

### Frontend — Admin `/admin/dons` ✅

- `app/admin/dons/page.tsx` : cartes récap (total dons, confirmés, montant confirmé USD) + tableau (donateur, montant, moyen, statut, date) avec **bascule de statut** annoncé/confirmé, **vue du message** (dialog) et suppression (`DeleteConfirmationModal`).
- `lib/permissions.ts` : `/admin/dons` ajouté pour `editeur`. `components/admin/sidebar.tsx` : entrée « Dons » (icône `HandHeart`).

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.
**Bilan 3.3** : dons complets (backend + page publique avec formulaire d'intention + suivi admin). **À tester en runtime** : déclarer un don sur `/don` → réception des 2 emails + apparition dans `/admin/dons` + bascule de statut.
**À compléter** : vraies coordonnées bancaires dans `donation-client.tsx` (`BANK_DETAILS`).

---

## LOT 3.4 — Recherche globale

### Backend ✅

- `controllers/recherche.controller.js` : `rechercheGlobale` — recherche publique (`q` ≥ 2 caractères) sur **blogs publiés** (titre/extrait/tags), **événements publiés** (titre/description/lieu) et **fichiers publics** (nomReference/description, + catégorie), via `Op.like`, limite 8 par type, résultats **groupés** (`{ query, total, blogs, evenements, fichiers }`).
- `routes/recherche.route.js` : `GET /api/recherche` (public) + Swagger inline ; montage `app.use("/api/recherche", …)`.
- `api-docs.json` régénéré (85 chemins).

**Vérification** : `node --check` OK.

### Frontend ✅

- `types/user.ts` : `RechercheResponse` + items (blog/event/fichier).
- `actions/recherche.ts` : `rechercheGlobale(q)`.
- `app/recherche/page.tsx` : wrapper serveur (métadonnées, `robots: noindex`) + `Suspense` autour du client + Header/Footer.
- `app/recherche/search-client.tsx` : input (prérempli depuis `?q=`), fetch sur changement d'URL, résultats **groupés** (Articles / Événements / Ressources) avec liens, états chargement/vide.
- `components/header.tsx` : bouton **Recherche** (icône) dans les actions desktop + lien « Rechercher » dans le menu mobile.

**Vérification** : `tsc` → 0 erreur ; `npm run build` → route `/recherche` générée.
**Bilan 3.4** : recherche globale complète. **À tester en runtime** : rechercher un terme → résultats blog/événements/fichiers cliquables.

---

## LOT 3.7 — Événement : inscription dynamique + paiement

> ⚠️ **Garde-fou données** : toutes les évolutions de schéma sont **additives** (`queryInterface.addColumn` si la colonne est absente) — aucune donnée existante n'est perdue.

### Schéma (colonnes additives) ✅

- `models/evenement.model.js` : `estPayant` (bool, def. false), `montant` (decimal), `devise` (string, def. USD), `champsPersonnalises` (JSON, config des champs additionnels).
- `models/inscriptionEvenement.model.js` : `statutPaiement` (`non_paye`|`partiel`|`paye`|`accepte_non_paye`, def. `paye`), `montantPaye` (decimal, def. 0), `reponsesPersonnalisees` (JSON). Les champs de base (nomComplet, email, sexe, telephone, typeInscription auto) existaient déjà.
- `models/index.model.js` : helper `addColumnIfMissing(table, column, def)` + backfill des tables `evenements` et `inscriptionsevenements` dans `syncModels` (non destructif).

**Vérification** : `node --check` OK. Les colonnes sont ajoutées automatiquement au démarrage du backend sur une base existante, sans perte.

### Contrôleurs & flux (backend) ✅

- `createEvent`/`updateEvent` : acceptent `estPayant`, `montant`, `devise`, `champsPersonnalises` (parsing `FormData`/JSON).
- `registerToEvent` : intègre `reponsesPersonnalisees` (texte + **fichiers** via `upload.any()`), fixe `statutPaiement` (`non_paye` si payant, sinon `paye`). **Gratuit** → billet + email (inchangé) ; **payant** → email « à payer » (sans billet). `ensureAbonne` factorisé.
- `mettreAJourPaiement` (`PATCH /:id/inscriptions/:inscriptionId/paiement`, admin/editeur) : met à jour statut + montant ; si **payé** → génère **billet + reçu PDF** et envoie l'email (`eventPaymentConfirmedTemplate`).
- `getStatsFinancieresEvenement` (`GET /:id/finances`, admin/editeur) : attendu / encaissé / reste / répartition par statut / nb inscrits.
- `getSingleEventAdmin` : renvoie désormais `statutPaiement`, `montantPaye`, `reponsesPersonnalisees` par inscription.
- `utils/recu-pdf.js` : reçu PDF stylisé (attend la fin d'écriture). Templates emails ajoutés.
- Route d'inscription : `upload.any()` pour les champs `fichier`. Swagger régénéré (87 chemins).

**Vérification** : `node --check` OK sur tous les fichiers ; `swagger:gen` OK.

### Frontend — étapes 1 & 2 ✅

- **Types + actions** : `ChampPersonnalise`, `StatutPaiement`, `EvenementFinancesResponse` ; `Evenement`/`Inscription` enrichis. `registerToEvent` (FormData/fichiers), `updateEvent` (FormData/objet), `mettreAJourPaiementInscription`, `getEventFinances`.
- **Constructeur admin** (`components/admin/event-payment-fields.tsx`, contrôlé) : carte Paiement (toggle `estPayant` + montant + devise) + constructeur de champs personnalisés (ajout/suppression, type parmi 9, libellé, requis, options pour `select`). Intégré aux pages `events/new` et `events/edit` (état `paymentFields`, init depuis l'événement en édition, append dans le submit).

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.

### Frontend — étape 3 (inscription publique dynamique) ✅

- `components/modals/register-event-modal.tsx` : reçoit `champs`, `estPayant`, `montant`, `devise`. Rend les champs de base + les champs personnalisés **par type** (input typé, textarea, select, checkbox, date, **fichier**). Validation des champs requis. Soumission en **FormData** (`reponsesPersonnalisees` JSON + fichiers appendus par id de champ). Bandeau « payant » + message adapté (billet immédiat si gratuit, sinon email « à payer »).
- `app/events/[slug]/event-detail-client.tsx` : passe la config de l'événement au modal.

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.

### Frontend — étape 4 (suivi paiement admin) ✅

- `app/admin/events/view/[id]/page.tsx` : pour les événements **payants**, colonne **Paiement** dans la table des inscrits (Select : non payé / partiel [+ montant via prompt] / payé / accepté non payé → `mettreAJourPaiementInscription`, mise à jour locale + refetch finances) + **carte « Suivi financier »** (attendu / encaissé / reste / inscrits + répartition par statut) via `getEventFinances`.

**Vérification** : `tsc` → 0 erreur ; `npm run build` → succès.

**Bilan 3.7** ✅ : événement à inscription dynamique + paiement **complet** (backend schéma additif + flux + PDF billet/reçu + finances ; frontend constructeur admin + inscription publique dynamique + suivi paiement). **À tester en runtime** : créer un événement payant avec champs perso → s'inscrire (public) → email « à payer » → marquer payé en admin → réception billet + reçu → vérifier le suivi financier. **Garde-fou données respecté** (colonnes additives).

---

## LOT 3.8 — Newsletter : progression d'envoi

### Backend ✅

- `controllers/newsletter.controller.js` : refonte de `sendNewsletter` en **job d'arrière-plan**.
  - `startNewsletterSend(newsletter)` : garde anti-double-envoi (lignes `attente`), repart d'une base propre, `bulkCreate` des lignes de suivi `NewsletterAbonne` (`attente`), lance `runNewsletterSend` **sans await**.
  - `runNewsletterSend` : envoie chaque email et passe la ligne à `envoye`/`echec` ; à la fin, `newsletter.statut = "envoye"`.
  - `sendNewsletter` (handler) répond **202** immédiatement (`{ message, total }`).
  - `getNewsletterProgress` : compte les lignes par statut → `{ total, envoye, echec, attente, traite, pourcentage, statut }`.
  - `processScheduledNewsletters` réutilise `startNewsletterSend` (plus de faux `res`).
- `routes/newsletter.route.js` : `GET /:id/progress` (admin/editeur/membre). Swagger régénéré (88 chemins).

**Vérification** : `node --check` OK ; `swagger:gen` OK.
**Reste** : front (redirection vers la vue après envoi + barre de progression par polling).

---

## LOT 3.5 — Commentaires blog

**Constat** : la partie **publique existait déjà** dans `app/blog/[slug]/blog-post-client.tsx` (formulaire nom/email/contenu → `createCommentaire`, liste des commentaires approuvés + réponses imbriquées, états chargement/vide). Il manquait la **modération admin** (sans elle, les commentaires en `attente` ne s'affichent jamais) et un **anti-spam**.

### Modifications ✅

- **Sécurité backend** : `GET /api/commentaires` (`getAllCommentaires`, données sensibles : emails/IP) passé derrière `authenticationJWT` + `authorizeRoles("admin","editeur","membre")` (était **public**).
- **Action** : `actions/comment.ts` → ajout de `getAllCommentaires`.
- **Modération admin** : `app/admin/comments/page.tsx` — liste filtrable par statut (en attente / approuvés / refusés / tous), **Approuver** / **Refuser** (`modererCommentaire`, `modereBy` = utilisateur courant), **Supprimer**. Entrée sidebar « Commentaires » (icône `MessageSquareText`) + permission `editeur` (`/admin/comments`).
- **Anti-spam** : champ **honeypot** masqué (`website`) ajouté au formulaire public ; si rempli → soumission ignorée silencieusement.

**Vérification** : Front `tsc` → 0 erreur, `build` → `/admin/comments` généré ; Back `node --check` OK.
**Bilan 3.5** : commentaires activés de bout en bout. **À tester en runtime** : poster un commentaire → le modérer (approuver) dans `/admin/comments` → il apparaît sous l'article.

### Note Swagger

- `swagger.js` exporte `swaggerSpec` ; `generate-swagger.js` + `npm run swagger:gen` régénèrent `api-docs.json` (à relancer après chaque changement d'API).
