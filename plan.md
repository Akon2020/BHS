# 🔥 Burning Heart — Plan de développement complet

> Plateforme **Burning Heart – Pèlerins avec le Christ** (apostolat spirituel & médiatique, spiritualité ignatienne).
> Objectif : amener le **Frontend** et le **Backend** à **100 %** (qualité production, design premium, responsive, SEO).

- **Frontend** : Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · TypeScript · axios
- **Backend** : Express 5 · Sequelize · MySQL · JWT · Nodemailer · Multer · Swagger · PDFKit/QRCode
- **Domaines** : `burningheartihs.org` (web) · `api.burningheartihs.org` (API)

---

## 🎯 Décisions validées (source de vérité)

| Sujet | Décision |
|---|---|
| Paiement dons | Manuel + formulaire d'intention (enregistré en admin + email ; paiement hors-ligne) |
| Pointage – saisie | Manuelle (date + heure début / fin) |
| Pointage – profil manuel | Nom + fonction ; profil persistant pour sélection future |
| Pointage – accès | Rôles **admin** et **editeur** |
| Pointage – sessions multiples/jour | **Oui** (plusieurs sessions le même jour pour un même profil) |
| Pointage – fuseau horaire | **Africa/Lubumbashi (UTC+2)** |
| Pointage – clôture a posteriori | **Oui** (ajouter l'heure de fin plus tard sur une session ouverte) |
| Matrice de rôles | `admin` = tout · `editeur` = contenu (blog, catégories, événements, fichiers, contacts, profil, équipe) + lecture limitée · `membre` = profil + équipe + lecture limitée |
| Renommage middleware | **`Frontend/middleware.ts` → `Frontend/proxy.ts`** (convention Next.js 16) |
| Langues | **FR uniquement** (i18n reporté) |
| Priorité de démarrage | **Lot 0 (bugs) → Lot 1 (responsivité)** |
| Nouvelles fonctionnalités | Pointage · Témoignages · Don (manuel + intention) · Recherche globale · Commentaires blog |
| Événements payants | Suivi **manuel** (admin) : payé / partiel (montant reçu) / accepté non payé. **Pas** de passerelle en ligne |
| Devise événements | **Configurable par événement** (USD/CDF/EUR) |
| Champs d'inscription | Base (Prénom-Nom, Email, Tél, Sexe, Type auto, Date/heure auto) + **champs personnalisés** (texte, email, tél, nombre, select, case à cocher, date, zone de texte, **téléversement de fichier**) |
| Newsletter (envoi) | **Job en arrière-plan + polling** de progression (suivi en continuant à travailler) |
| Coordinateur RDV | **Un seul**, configurable |
| Réservation RDV | **Publique** (tout le monde) |
| Anniversaires | Rappel en amont → **admins/équipe** ; alerte jour J → **tous (abonnés newsletter)** |
| Todos | Assignation aux **admins/staff** |
| **Sécurité des données** | Évolutions de modèles en **colonnes additives** (`queryInterface.addColumn` + backfill, pattern `fichiers`) et **nouvelles tables** (`db.sync({ alter:false })`). **Jamais** de `force/alter` destructeur → **aucune perte de données** |

---

## 🏷️ Convention des goals

- 🟢 **AJOUT** — nouvelle fonctionnalité / fichier / endpoint
- 🟠 **CORRECTION** — bug, incohérence, dette technique
- 🔵 **MISE À JOUR** — amélioration / refonte d'un existant

Chaque goal est cochable. Statut : `[ ]` à faire · `[~]` en cours · `[x]` fait.

---

## 📦 LOT 0 — Bugs critiques & dette technique  *(priorité 1)*

### 0.1 Permissions & navigation
- [x] 🟠 **Renommer `Frontend/middleware.ts` → `Frontend/proxy.ts`** (convention Next.js 16 : fonction `proxy()` + `proxyConfig`). Aucune référence interne ailleurs.
- [x] 🟠 **Aligner `proxy.ts` et `lib/permissions.ts`** sur une **matrice de permissions unique** : `lib/permissions.ts` est désormais la source unique (`proxy.ts` importe `hasAccessToPage`). Matrice appliquée :
  - **`admin`** : accès à **tout** l'espace admin (court-circuit dans `hasAccessToPage`).
  - **`editeur`** : `/admin`, `/admin/blog`, `/admin/categories`, `/admin/events`, `/admin/files`, `/admin/contact`, `/admin/team`, `/admin/pointage`, `/admin/profile`.
  - **`membre`** : `/admin`, `/admin/team`, `/admin/profile`.
  - **`/admin/pointage`** (Lot 3.1) : `admin` + `editeur` (pré-autorisé).
- [x] 🟠 **Corriger le lien `/admin/profil` → `/admin/profile`** (`components/header.tsx`, `components/admin/header.tsx`).
- [x] 🟠 Vérifier que toutes les routes de la sidebar existent et sont autorisées pour les bons rôles (toutes les routes existent ; autorisation gérée par la matrice unique).

### 0.2 Configuration build
- [x] 🟠 **Retirer `typescript.ignoreBuildErrors: true`** de `next.config.mjs` : 5 erreurs TS préexistantes corrigées (blog/events utilisent désormais les types partagés `Blog`/`Evenement` ; `totalPages` calculé). `next build` passe ✅.
- [ ] 🔵 **Réactiver l'optimisation d'images** (`images.unoptimized` → `remotePatterns` pour l'API prod + dev) — **différé au Lot 2.4** (perf) : risque d'erreur runtime sur les nombreux `next/image` distants tant que le host/port de dev n'est pas confirmé + test visuel requis.
- [x] 🔵 Ajouter `metadataBase` dans `app/layout.tsx` (URLs OG/canonical absolues, via `NEXT_PUBLIC_SITE_URL` avec fallback `https://burningheartihs.org`).

### 0.3 Contenus factices / placeholders
- [x] 🟠 **Notifications admin factices masquées** (`components/admin/header.tsx`) : badge à 0 + état vide « Aucune notification » tant qu'il n'y a pas de source réelle.
- [x] 🟠 Section **Témoignages** de la home branchée sur le module dynamique (Lot 3.2) — carrousel alimenté par l'API.
- [x] 🟠 **Auth unifiée en cookie httpOnly** : le backend pose le token dans un cookie httpOnly (`secure` en prod uniquement, `sameSite=lax`, `domain` partagé via `COOKIE_DOMAIN`). Ajout de `cookie-parser` (manquant) dans `app.js`. Le front ne manipule plus de token JS (`lib/axios.ts` sans Bearer, `js-cookie`/`localStorage.token` retirés, `useAuth`/`getProfile` via cookie). Cookie parasite retiré de `/register` (n'écrase plus la session admin). ⚠️ **À tester en runtime** (login/logout/refresh) et **définir `COOKIE_DOMAIN=.burningheartihs.org` en prod**.

### 0.4 Qualité backend
- [ ] 🟠 *(en cours)* Auditer les contrôleurs pour la gestion d'erreurs homogène (codes HTTP, messages) et la validation des entrées. État : un `errorMiddleware` global existe et la plupart des contrôleurs ont des `try/catch` ; audit fin reporté (non bloquant).
- [x] 🔵 **Helmet monté** dans `app.js` (CSP off pour Swagger, CORP `cross-origin` pour servir `/uploads`). CORS déjà correct (origines + `credentials`).
- [ ] 🔵 ⚠️ **Limites d'upload à définir** : Multer n'a **aucune** limite de taille ni filtre de type ; `bodyParser` est à 1024 Mo. **Décision requise** sur la taille/type max par usage (avatars/images vs module Fichiers) avant de poser des limites — à traiter avec le Lot 3 (Fichiers) / Lot 4.
- [x] 🔵 **`syncModels()` non destructif** vérifié : `db.sync({ alter: false })` (pas de `force`/`alter`).

---

## 📱 LOT 1 — Responsivité complète  *(priorité 1)*

### 1.1 Admin (refonte responsive)
- [x] 🔵 **Sidebar admin → drawer mobile** : refonte effectuée (drawer CSS, SSR-safe).
  - **Desktop (≥ lg)** : sidebar statique, collapsible 64 ↔ 16 (icônes) via chevron.
  - **Mobile/tablette (< lg)** : sidebar masquée (`-translate-x-full`), ouverte en **overlay** via le bouton menu de `admin/header.tsx`, avec backdrop + bouton X + fermeture au clic sur un lien.
- [x] 🔵 Adapter `app/admin/layout.tsx` : deux états (`collapsed` desktop / `mobileOpen` drawer), padding `p-4 md:p-6`, `overflow` maîtrisé.
- [x] 🔵 **Tableaux admin scrollables** : confirmé — le primitif `components/ui/table.tsx` enveloppe déjà dans `overflow-x-auto`, et les 8 pages liste (users, blog, events, files, identities, abonnes, newsletter, contact) utilisent ce composant. (Variante « cartes » sur mobile : enhancement optionnel, non bloquant.)
- [x] 🔵 Dashboard responsive : cartes stats en grille adaptive (déjà en place) + en-tête d'actions corrigé (`flex-col` → `sm:flex-row`, boutons `flex-wrap`).
- [x] 🔵 **En-têtes de pages responsive** : motif `flex-col` empilé → `sm:flex-row` + titre fluide `text-2xl sm:text-3xl` appliqué aux 7 pages avec actions (blog, events, newsletter, team, users, identities, contact).
- [x] 🔵 **Formulaires admin responsives** : grilles déjà majoritairement `grid-cols-1 lg:grid-cols-3` / `md:grid-cols-2` ; corrigé les 2 grilles `grid-cols-2` fixes (events new/edit → `sm:grid-cols-2`) ; modales user (add/edit) empilées sur mobile (`grid-cols-1 sm:grid-cols-4`, labels `sm:text-right`).
- [x] 🔵 **Pages de visualisation/détail responsives** : en-têtes (titre + actions) empilés sur mobile + titres tronqués sur `identities/view`, `team/[id]/view`, `users/[id]`, `newsletter/view`, `contact/view`, `files/view` (events/view & abonnes/view déjà OK). Contenu HTML protégé du débordement (`break-words`, images/pre/table) sur `blog/view`, `events/view`, `newsletter/view`.
- [ ] 🔵 *(optionnel)* Variantes « cartes » de tableaux sur très petit écran — enhancement non bloquant (tables déjà scrollables).

### 1.2 Public
- [~] 🔵 Audit responsive page par page (`/`, `/a-propos`, `/services`, `/don`, `/contact`, `/events`, `/files`, `/blog`, `/identity`, `/connexion`) : audit des motifs à risque effectué (grilles fixes, flex non-wrap, hauteurs/largeurs figées) → pages déjà majoritairement mobile-first ; seuls 2 points concrets corrigés (ci-dessous). Polish fin à valider visuellement.
- [x] 🔵 Home : hero `h-[100vh]` → `min-h-[100svh]` (évite le saut de barre mobile + le clipping).
- [x] 🔵 Connexion : wrappers `h-screen` → `min-h-[100svh]` (`/connexion`, `/connexion/reset`, `/connexion/reset-request`) pour éviter la coupure de la carte sur petit écran.
- [ ] 🔵 Vérifier visuellement `max-w`, tailles de police, espacements et images sur 360 / 768 / 1024 / 1440 px (carte Google Maps, grille contact, carrousel témoignages).
- [ ] 🟠 Accessibilité tactile : tailles de cibles ≥ 44 px, focus visibles, `aria-*` sur les menus/dialogs.

---

## 🔍 LOT 2 — SEO  *(priorité 2)*

### 2.1 Fondations techniques
- [x] 🟢 **`app/sitemap.ts`** dynamique : pages statiques + blogs publiés + événements publiés + fichiers publics (fetch API, `revalidate: 3600`).
- [x] 🟢 **`app/robots.ts`** : `allow /`, **bloque `/admin` et `/connexion`**, référence le sitemap.
- [x] 🟢 **`app/manifest.ts`** (PWA légère : nom, description, icônes `logon.png`, `theme_color` crimson).
- [x] 🔵 `metadataBase` (fait en 0.2) ; favicons/apple-touch supplémentaires → optionnel (Lot 4).

### 2.2 Métadonnées par page
- [x] 🟠 **Pages publiques `"use client"` en wrappers serveur** : `/` (home), `/blog`, `/events`, `/files`, `/contact`, `/identity` → toutes converties (contenu client dans `*-client.tsx`, métadonnées exposées par le `page.tsx` serveur).
- [x] 🟢 `generateMetadata` sur `/events/[slug]` (+ JSON-LD Event) et `/files/[slug]` (titre, description, OG, canonical) — wrappers serveur créés (`event-detail-client.tsx`, `file-detail-client.tsx`).
- [x] 🟢 Métadonnées dédiées pour `/a-propos`, `/services`, `/don` (+ home). `/contact` → avec la conversion de la page liste.

### 2.3 Données structurées & social
- [~] 🟢 **JSON-LD** : `NGO`/Organization (home) **fait**, `Article` (blog/[slug]) **fait**, `Event` (events/[slug]) **fait**. `BreadcrumbList` → optionnel (à ajouter).
- [x] 🟢 **Images OpenGraph** : `app/opengraph-image.tsx` (générée via `next/og`, branding crimson, héritée par toutes les pages) ; blog/événements utilisent leur propre image (`imageUne`/`imageEvenement`) via `generateMetadata`.
- [ ] 🔵 Balises `alt` systématiques, titres `h1` uniques par page, hiérarchie `h1→h6` propre (passe visuelle / a11y).

### 2.4 Performance (Core Web Vitals)
- [x] 🔵 **`next/image` optimisé réactivé** : `images.unoptimized` retiré, `remotePatterns` configurés (prod `api.burningheartihs.org` + dev `localhost:5500`). `priority` déjà sur le hero. ⚠️ vérifier l'affichage des images distantes en runtime (dev + prod).
- [x] 🔵 Polices `Inter` + `Crimson_Pro` via `next/font` → `display: swap` par défaut (rien à faire).
- [ ] 🔵 Objectif Lighthouse ≥ 90 — à mesurer sur le site lancé (perf/SEO/best-practices/a11y).

---

## ✨ LOT 3 — Nouvelles fonctionnalités

### 3.1 ⏱️ Pointage (temps au bureau)  🟢 *(fonctionnalité majeure)*

**Règles métier**
- Saisie **manuelle** d'une présence : date + heure début (+ heure fin optionnelle).
- **Session sans heure de fin = pointage simple** (présence enregistrée, durée non comptée).
- **Temps total = somme des sessions complétées uniquement** (avec début **et** fin).
- Profils : choisis parmi les **utilisateurs du système** *ou* **ajoutés manuellement** (nom + fonction) ; un profil manuel **persiste** comme proposition future.
- Accès : rôles **admin** + **editeur**.
- **Plusieurs sessions le même jour** pour un même profil : **autorisé**.
- **Fuseau horaire** de référence : **Africa/Lubumbashi (UTC+2)** (calculs de durée et affichage).
- **Clôture a posteriori** : on peut compléter une session ouverte en lui ajoutant l'heure de fin plus tard (la durée se calcule alors).

**Backend** ✅
- [x] 🟢 Modèle `ProfilPointage` (`idProfil`, `nomComplet`, `fonction`, `source`, `idUtilisateur`, `actif`, timestamps).
- [x] 🟢 Modèle `Pointage` (`idPointage`, `idProfil`, `date`, `heureDebut`, `heureFin`, `dureeMinutes` calculée par hook, `note`, `createdBy`, timestamps).
- [x] 🟢 Endpoints CRUD profils + sessions (`/api/pointages`, `/api/pointages/profils`) + clôture a posteriori (PUT). Accès `admin`+`editeur`. Swagger inline.
- [x] 🟢 Endpoint **stats** `/api/pointages/stats?periode=` (profils actifs, présences, temps cumulé, graphique « profils les plus actifs », récap tabulaire) — fuseau UTC+2.
- [x] 🟢 **Export PDF** `/api/pointages/export?scope=global|individuel` stylisé (pdfkit, `utils/pointage-pdf.js`) par période.

**Frontend** ✅
- [x] 🟢 Page admin `/admin/pointage` (+ entrée sidebar « Pointage », permissions admin/editeur déjà dans la matrice).
- [x] 🟢 Actions `actions/pointage.ts` + types dédiés.
- [x] 🟢 UI : sélecteur de profil + dialog « Ajouter un profil » (manuel **ou** depuis un utilisateur système), formulaire de saisie (date + heure début/fin optionnelle + note), liste des présences avec édition (clôture a posteriori) et suppression.
- [x] 🟢 Tableau de bord : cartes stats (profils actifs, présences, temps cumulé), graphique `Bar` (profils les plus actifs), tableau récapitulatif, **filtre hebdo/mensuel/annuel**.
- [x] 🟢 Boutons d'export PDF : global (en-tête) + individuel (par ligne du récap).

> ✅ **Décisions confirmées** : plusieurs sessions/jour **autorisées** · fuseau **Africa/Lubumbashi (UTC+2)** · **clôture a posteriori** d'une session ouverte **autorisée**.

### 3.2 💬 Témoignages dynamiques  🟢
- [x] 🟢 Backend : modèle `Temoignage` (`auteur`, `fonction`, `contenu`, `photo`, `statut` brouillon/publié, `ordre`), CRUD `/api/temoignages` + endpoint **public** `/api/temoignages/public` (publiés). Upload photo (`image`), accès admin+editeur, Swagger inline.
- [x] 🟢 Admin : page `/admin/temoignages` (CRUD + photo + statut + ordre) ; actions/types ; entrée sidebar « Témoignages » ; permission `editeur` ajoutée.
- [x] 🔵 Front : section statique de la home remplacée par un **carrousel fonctionnel** (`components/sections/testimonials.tsx`, shadcn `Carousel`/embla) alimenté par `/api/temoignages/public` (masquée si vide).

### 3.3 ❤️ Don — manuel + formulaire d'intention  🟢
- [x] 🔵 Page `/don` finalisée : coordonnées (Mobile Money réel + banque marquée « À compléter »), boutons **« copier »**, retrait du bouton « Donner maintenant » inactif, design soigné. ⚠️ Fournir les vraies coordonnées bancaires pour remplacer « À compléter » dans `donation-client.tsx`.
- [x] 🟢 Front : **formulaire « Je déclare un don »** (nom, email, montant, devise, moyen, message) → `createDon`.
- [x] 🟢 Backend : modèle `Don` (`nom`, `email`, `montant`, `devise`, `moyen` carte/virement/mobile, `message`, `statut` annonce/confirme) + endpoint public de création + **notification email** (admin + remerciement au donateur, templates dédiés). Liste/statut/suppression admin, Swagger inline.
- [x] 🟢 Admin : page `/admin/dons` (liste, cartes récap, bascule statut annoncé/confirmé, vue message, suppression) ; entrée sidebar « Dons » ; permission éditeur.

### 3.4 🔎 Recherche globale  🟢
- [x] 🟢 Backend : endpoint public `/api/recherche?q=` agrégeant blogs publiés + événements publiés + fichiers publics (recherche `LIKE` sur titre/extrait/tags/description/lieu), résultats groupés (limite 8/type). Swagger régénéré.
- [x] 🟢 Front : page `/recherche` (input + résultats groupés articles/événements/ressources, états chargement/vide) + entrée **Recherche** dans le header public (desktop icône + mobile). Page en `robots: noindex`.

### 3.6 ✉️ Boîte d'envoi admin (Contact)  🟢 — *fait*
- [x] 🟢 Backend : modèle `MessageEnvoye` + endpoints `/api/messages` (POST envoyer, GET liste, GET détail, DELETE), envoi réel via Nodemailer (template `messageAdminTemplate`), statut `envoye`/`echec`, Swagger à jour, `cookie-parser`/Helmet déjà en place. Accès `admin`+`editeur` (DELETE `admin`).
- [x] 🟢 Front : actions `actions/message.ts` + types ; page `/admin/contact/new` (composer + envoyer) ; page `/admin/contact/sent` (liste + vue + suppression) ; boutons « Messages envoyés » et « Écrire un nouveau message » sur `/admin/contact`.

### 3.5 🗨️ Commentaires blog (activation)  🟢
> Le backend a déjà `Commentaire` + modération + endpoints (`actions/comment.ts`).
- [x] 🟢 Front : affichage des commentaires publiés sous chaque article (`/blog/[slug]`) — **déjà présent** (liste + réponses imbriquées + états).
- [x] 🟢 Front : formulaire d'ajout de commentaire — **déjà présent** (nom/email/contenu → `attente`).
- [x] 🔵 Admin : **interface de modération** créée (`/admin/comments`) : filtre par statut, approuver/refuser, supprimer + entrée sidebar + permission éditeur. **Indispensable** (les commentaires en `attente` ne s'affichent qu'une fois approuvés).
- [x] 🟠 Anti-spam **honeypot** ajouté au formulaire public + **sécurisation** de `GET /api/commentaires` (auth admin/editeur/membre — évitait de fuiter emails/IP).

### 3.7 🎟️ Événement — inscription dynamique + paiement  🔵 **(TRÈS HAUTE PRIORITÉ)**

> Refonte du flux d'inscription. **Données existantes préservées** (colonnes additives via `queryInterface`, aucune suppression).

**Règles métier**
- Champs de base (toujours) : **Prénom-Nom, Email, Téléphone, Sexe**, Type d'utilisateur (**auto** : utilisateur/visiteur), Date & heure d'inscription (**auto**).
- **Événement gratuit & ouvert** → on s'arrête aux champs de base. Inscription → **email de confirmation + billet PDF** (QR, `event-pdf.js` existant).
- **Événement payant** :
  - Montant d'inscription **configuré au backend** par événement (+ **devise configurable** USD/CDF/EUR) → suivi financier par événement.
  - À l'inscription : email de confirmation **sans billet**, invitant à venir **payer** la somme due.
  - Suivi de paiement **manuel** par l'admin, statuts : **payé** · **partiellement payé** (saisir le **montant reçu**) · **accepté mais non payé** (comptabilisé **distinctement**).
  - Une fois **payé** → email avec **billet PDF + reçu de paiement PDF**.
- **Champs personnalisés** ajoutables à la création de l'événement : type (`texte`, `email`, `téléphone`, `nombre`, `select`, `case à cocher`, `date`, `zone de texte`, `fichier` [téléversement]) + **label** affiché (« Entrez votre X ») + requis (oui/non) + options (pour select). Les fichiers téléversés sont stockés côté serveur (Multer) et référencés dans `reponsesPersonnalisees`.

**Backend**
- [x] 🔵 `Evenement` — colonnes additives : `estPayant` (bool), `montant` (decimal), `devise` (string, def. USD), `champsPersonnalises` (JSON). Backfill non destructif dans `syncModels` (`addColumnIfMissing`).
- [x] 🔵 `InscriptionEvenement` — colonnes additives : `statutPaiement` (`non_paye`|`partiel`|`paye`|`accepte_non_paye`, def. `paye`), `montantPaye` (decimal, def. 0), `reponsesPersonnalisees` (JSON). `telephone`/`sexe` déjà présents. Backfill non destructif.
- [x] 🟢 Inscription (`registerToEvent`) : champs perso (texte + fichiers via `upload.any`), génération billet + email (gratuit) OU email « à payer » (payant, sans billet).
- [x] 🟢 Endpoint admin `PATCH /:id/inscriptions/:inscriptionId/paiement` : payé/partiel+montant/accepté-non-payé → si **payé**, génère **billet + reçu** et envoie l'email.
- [x] 🟢 **Reçu PDF** (`utils/recu-pdf.js`) stylisé + templates emails (`eventPaymentPendingTemplate`, `eventPaymentConfirmedTemplate`).
- [x] 🟢 **Stats financières** `GET /:id/finances` : attendu, encaissé, reste, répartition par statut, nb inscrits.
- [x] 🟢 Swagger régénéré (87 chemins).

**Frontend**
- [x] 🟢 Création/édition événement : composant `EventPaymentFields` (toggle **payant** + montant + devise + **constructeur de champs** : ajouter/supprimer, type + label + requis + options) intégré aux pages new **et** edit.
- [x] 🟢 **Formulaire d'inscription public dynamique** (`register-event-modal`) : base + champs perso rendus par type (texte/email/tél/nombre/select/checkbox/date/textarea/**fichier**), validation des requis, soumission **FormData** (fichiers) ; bandeau + message paiement si payant.
- [x] 🟢 Admin inscriptions (page vue événement) : colonne **statut paiement** (select payé/partiel[+montant]/non payé/accepté-non-payé → `mettreAJourPaiementInscription`), renvoi billet existant, **carte de suivi financier** (attendu/encaissé/reste/inscrits + répartition par statut) via `getEventFinances`.
- [x] 🟢 Types + actions mis à jour (`ChampPersonnalise`, `StatutPaiement`, `EvenementFinancesResponse` ; `registerToEvent` FormData/fichiers, `updateEvent` FormData, `mettreAJourPaiementInscription`, `getEventFinances`).

### 3.8 📧 Newsletter — progression d'envoi (job + polling)  🔵
- [x] 🟢 Backend : envoi **en arrière-plan** (`runNewsletterSend`, non bloquant), `POST /send` répond **202** immédiatement (crée les lignes `NewsletterAbonne` en `attente` puis les passe `envoye`/`echec`) ; `GET /:id/progress` (total/envoye/echec/attente/pourcentage/statut). Cœur partagé `startNewsletterSend` réutilisé par l'envoi programmé. Swagger 88 chemins.
- [x] 🟢 Front : après « Envoyer », redirection vers la vue de la newsletter qui affiche une **barre de progression** (`NewsletterProgressBar`, polling 2,5 s jusqu'à « terminé ») + compteurs (envoyés/échecs/en attente) ; message « l'envoi continue en arrière-plan ».

---

## 🧹 LOT 4 — Polish, accessibilité & finitions  *(priorité 3)*

- [ ] 🔵 Page `not-found.tsx` et `403/page.tsx` soignées et cohérentes avec la marque.
- [ ] 🔵 États de chargement (skeletons) homogènes (des `loading.tsx` existent déjà sur certaines routes).
- [ ] 🔵 Gestion d'erreurs UI homogène (toasts `sonner`, messages clairs).
- [ ] 🔵 Accessibilité : audit clavier/lecteur d'écran, contrastes (déjà bon thème crimson), `aria-label` manquants.
- [ ] 🔵 README projet (remplacer le boilerplate Next) : setup, variables d'env, scripts, déploiement.
- [ ] 🔵 Variables d'environnement documentées (`.env.example` front & back).
- [ ] 🔵 Vérifier le tracking newsletter / emails (templates) et les liens de désabonnement.

---

## 🗓️ LOT 5 — Modules internes (back-office)  🟢 *(nouveaux modules)*

> **Prérequis technique** : ajouter un **planificateur** (`node-cron`) au backend pour les rappels/alertes (anniversaires, échéances de tâches). Toutes les tables/colonnes créées de façon **non destructive**.

### 5.1 📅 Agenda / RDV avec le Père Coordinateur  🟢
> Coordinateur **unique configurable** ; réservation **publique**.

- [ ] 🟢 Backend : paramètre **Coordinateur** (nom, éventuelle photo) ; modèle `Disponibilite`/`CreneauRdv` (jour/heure, durée, récurrence hebdo ou date, capacité, actif) ; modèle `RendezVous` (nom, email, tél, motif, créneau/date-heure, `statut` `en_attente`|`approuve`|`refuse`|`reprogramme`, nouvelleDate si report, note).
- [ ] 🟢 Backend : endpoints — config des créneaux (admin), **créneaux disponibles** (public), **réserver** (public), lister (admin), **approuver / refuser / reporter** (admin), suivi de statut (public via lien/email). Emails aux étapes clés.
- [ ] 🟢 Front public : voir les créneaux disponibles, réserver, **suivre le statut** (en attente/approuvé/refusé/reprogrammé), **historique**.
- [ ] 🟢 Front admin : configuration des créneaux + gestion des RDV (approuver/refuser/reporter).

### 5.2 🗓️ Vue calendrier agrégée + export natif  🟢
- [ ] 🟢 Vue **mensuelle / liste** agrégeant : événements publics + **son propre RDV** + **anniversaires** configurés.
- [ ] 🟢 **Export vers calendrier natif** (fichier `.ics`, Google/Apple) **par item**.
- [ ] 🟢 Accessible public (son RDV/événements) et admin (vue globale).

### 5.3 🎂 Anniversaires  🟢
> Rappel **en amont** → admins/équipe ; alerte **jour J** → tous (abonnés newsletter).

- [ ] 🟢 Backend : modèle `Anniversaire` (nom, date [jour/mois, année optionnelle], email?, lien/catégorie) ; config du **délai de rappel** en amont.
- [ ] 🟢 Backend : **planificateur quotidien** (`node-cron`) → alerte **jour J** par mail à **tous les abonnés newsletter** ; **rappel en amont** (X jours) aux **admins/équipe**.
- [ ] 🟢 Front admin : liste + CRUD des anniversaires + réglage du rappel.

### 5.4 ✅ Todos / Kanban  🟢
> Assignation aux **admins/staff** (personnels **ou** communautaires).

- [ ] 🟢 Backend : modèle `Tache` (titre, description, `statut` `a_faire`|`en_cours`|`fait`, échéance, **récurrence** `aucune`|`quotidien`|`hebdo`|`mensuel`, createdBy) + assignation **multi-admins** + modèle `TacheCommentaire` + rappels (à l'échéance / avant, via `node-cron`).
- [ ] 🟢 Front admin : **vue Kanban** (À faire / En cours / Fait), création/édition (assignés, échéance, récurrence), commentaires, rappels configurables.

### 5.5 📊 Dashboard admin — mise à jour  🔵
- [ ] 🔵 Intégrer au tableau de bord : **prochains RDV**, **anniversaires à venir**, **tâches** en cours / à échéance, stats **pointage**, **dons** récents, inscriptions/finances **événements**.

---

## ✅ Definition of Done (par goal)

Un goal est « fait » quand :
1. Le code compile **sans** `ignoreBuildErrors` et passe `eslint`.
2. La fonctionnalité est **responsive** (360 → 1440 px) et **accessible** (clavier + `aria`).
3. Les états **chargement / vide / erreur** sont gérés.
4. Le SEO de la page est correct (métadonnées si page publique).
5. Testé manuellement sur le flux front ↔ back (et endpoint Swagger à jour côté API).

---

## 🗺️ Ordre d'exécution recommandé

**✅ Déjà fait** : Lot 0 (bugs/config/sécurité) · Lot 1 (responsivité admin + public) · Lot 2 (SEO) · Lot 3.1 (Pointage) · 3.2 (Témoignages) · 3.3 (Don) · 3.4 (Recherche) · 3.5 (Commentaires) · 3.6 (Boîte d'envoi contact).

**⏭️ Reste à faire (par priorité)** :
1. **Lot 3.7 — Événement : inscription dynamique + paiement** 🔺 *(très haute priorité)*.
2. **Lot 3.8 — Newsletter : progression d'envoi**.
3. **Lot 5 — Modules internes** : 5.4 Todos/Kanban · 5.1 Agenda/RDV · 5.3 Anniversaires · 5.2 Calendrier agrégé · 5.5 Dashboard.
4. **Lot 4 — Polish & finitions** (403/not-found, README, `.env.example`, a11y, nettoyage `js-cookie`, limites d'upload…).

> Validation **lot par lot** : à la fin de chaque lot, revue + ajustements avant d'enchaîner.
> **Garde-fou données** : chaque évolution de modèle = colonnes additives (`queryInterface`) ou nouvelle table ; **jamais** `force/alter` destructeur.
