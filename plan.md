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
- [ ] 🟠 ⏸️ Brancher la section **Témoignages** de la home (statique) sur le module dynamique — **bloqué par le Lot 3.2** (module pas encore créé).
- [x] 🟠 **Auth unifiée en cookie httpOnly** : le backend pose le token dans un cookie httpOnly (`secure` en prod uniquement, `sameSite=lax`, `domain` partagé via `COOKIE_DOMAIN`). Ajout de `cookie-parser` (manquant) dans `app.js`. Le front ne manipule plus de token JS (`lib/axios.ts` sans Bearer, `js-cookie`/`localStorage.token` retirés, `useAuth`/`getProfile` via cookie). Cookie parasite retiré de `/register` (n'écrase plus la session admin). ⚠️ **À tester en runtime** (login/logout/refresh) et **définir `COOKIE_DOMAIN=.burningheartihs.org` en prod**.

### 0.4 Qualité backend
- [ ] 🟠 Auditer les contrôleurs pour la gestion d'erreurs homogène (codes HTTP, messages) et la validation des entrées.
- [ ] 🔵 Vérouiller CORS / Helmet / limites d'upload (Multer 1024 Mo est très élevé — confirmer la limite réelle voulue par type de fichier).
- [ ] 🔵 S'assurer que `syncModels()` n'utilise pas `force/alter` destructeur en production.

---

## 📱 LOT 1 — Responsivité complète  *(priorité 1)*

### 1.1 Admin (refonte responsive)
- [ ] 🔵 **Sidebar admin → drawer mobile** : aujourd'hui `h-screen` toujours visible (se réduit à 70px). Comportement cible :
  - **Desktop (≥ lg)** : sidebar fixe, collapsible 64 ↔ 16 (icônes).
  - **Mobile/tablette (< lg)** : sidebar masquée par défaut, ouverte en **overlay/Sheet** via le bouton menu de `admin/header.tsx`, avec backdrop et fermeture au clic/route change.
- [ ] 🔵 Adapter `app/admin/layout.tsx` (flux flex → grille responsive, padding `p-4 md:p-6`).
- [ ] 🔵 **Tableaux admin** (users, blog, events, files, identities, abonnes, newsletter, contact) : rendre scrollables horizontalement + variante « cartes » sur mobile pour les colonnes clés.
- [ ] 🔵 Formulaires admin (new/edit) : grilles `grid-cols-1 md:grid-cols-2`, boutons d'action sticky en bas sur mobile.
- [ ] 🔵 Dashboard : graphiques (`chart.js`/`recharts`) responsives + cartes stats en grille adaptive.

### 1.2 Public
- [ ] 🔵 Audit responsive page par page : `/`, `/a-propos`, `/services`, `/don`, `/contact`, `/events` (+ `[slug]`), `/files` (+ `[slug]`), `/blog` (+ `[slug]`), `/identity`, `/connexion`.
- [ ] 🔵 Home : hero `h-[100vh]` → `min-h-[100svh]` (évite le saut de barre mobile) ; vérifier la carte Google Maps, la grille contact, le carrousel témoignages sur petit écran.
- [ ] 🔵 Vérifier les `max-w`, tailles de police fluides, espacements et images sur 360 px / 768 px / 1024 px / 1440 px.
- [ ] 🟠 Accessibilité tactile : tailles de cibles ≥ 44 px, focus visibles, `aria-*` sur les menus/dialogs.

---

## 🔍 LOT 2 — SEO  *(priorité 2)*

### 2.1 Fondations techniques
- [ ] 🟢 **`app/sitemap.ts`** dynamique : pages statiques + blogs publiés + événements publiés + fichiers publics (via fetch API).
- [ ] 🟢 **`app/robots.ts`** : autoriser le public, **bloquer `/admin` et `/connexion`**, référencer le sitemap.
- [ ] 🟢 **`app/manifest.ts`** (PWA légère : nom, icônes, couleurs de marque crimson).
- [ ] 🔵 `metadataBase` + favicons/icônes complets (déjà `logon.png`, ajouter tailles + apple-touch).

### 2.2 Métadonnées par page
- [ ] 🟠 **Convertir les pages publiques `"use client"` en Server Components** (ou extraire un wrapper client) pour exposer `generateMetadata` : `/`, `/contact`, `/events`, `/files`, `/blog`, `/identity`. (Modèle déjà correct : `app/blog/[slug]/page.tsx`.)
- [ ] 🟢 `generateMetadata` sur `/events/[slug]` et `/files/[slug]` (titre, description, OG, canonical) comme pour le blog.
- [ ] 🟢 Métadonnées dédiées pour `/a-propos`, `/services`, `/don`, `/contact`.

### 2.3 Données structurées & social
- [ ] 🟢 **JSON-LD** : `Organization`/`NGO` (global), `Article` (blog), `Event` (événements), `BreadcrumbList`.
- [ ] 🟢 **Images OpenGraph** : `opengraph-image` par défaut + dynamiques pour blog/événements (ou réutiliser `imageUne`/`imageEvenement`).
- [ ] 🔵 Balises `alt` systématiques, titres `h1` uniques par page, hiérarchie `h1→h6` propre.

### 2.4 Performance (Core Web Vitals)
- [ ] 🔵 Réactiver `next/image` optimisé (cf. Lot 0.2), `priority` sur le hero, `loading="lazy"` ailleurs.
- [ ] 🔵 Vérifier le poids des polices (`Inter` + `Crimson_Pro`), `display: swap`.
- [ ] 🔵 Objectif Lighthouse ≥ 90 (Perf/SEO/Best-practices/A11y) sur les pages clés.

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

**Backend**
- [ ] 🟢 Modèle `ProfilPointage` : `idProfil`, `nomComplet`, `fonction`, `source` (`systeme` | `manuel`), `idUtilisateur` (nullable, FK si source = système), `actif`, timestamps.
- [ ] 🟢 Modèle `Pointage` (session) : `idPointage`, `idProfil` (FK), `date`, `heureDebut`, `heureFin` (nullable), `dureeMinutes` (calculée à la complétion), `note`, `createdBy`, timestamps.
- [ ] 🟢 Endpoints CRUD profils + sessions (`/api/pointages`, `/api/pointages/profils`).
- [ ] 🟢 Endpoint **stats** avec filtre `periode` (`hebdo` | `mensuel` | `annuel`) + bornes de dates :
  - Nb de profils actifs · Nb de présences enregistrées · Temps de travail cumulé.
  - Profils les plus actifs (heures) → données graphique.
  - Récapitulatif tabulaire (par profil : présences, temps cumulé).
- [ ] 🟢 **Export PDF** stylisé (réutiliser le style de `utils/identity-pdf.js` / `event-pdf.js`) : **global** ou **individuel**, par période (hebdo/mensuel/annuel).

**Frontend**
- [ ] 🟢 Page admin `/admin/pointage` (+ entrée sidebar, permissions admin/editeur).
- [ ] 🟢 Actions `actions/pointage.ts` + types dédiés.
- [ ] 🟢 UI : sélecteur de profil (combobox cherchable : users système + manuels + « ajouter »), formulaire de saisie de session, liste/édition des présences.
- [ ] 🟢 Tableau de bord pointage : cartes stats, graphique « profils les plus actifs », tableau récapitulatif, **filtre hebdo/mensuel/annuel**.
- [ ] 🟢 Boutons d'export PDF (global + individuel) selon la période.

> ✅ **Décisions confirmées** : plusieurs sessions/jour **autorisées** · fuseau **Africa/Lubumbashi (UTC+2)** · **clôture a posteriori** d'une session ouverte **autorisée**.

### 3.2 💬 Témoignages dynamiques  🟢
- [ ] 🟢 Backend : modèle `Temoignage` (`auteur`, `fonction/role`, `contenu`, `photo`, `statut` brouillon/publié, `ordre`), CRUD + endpoint public (publiés).
- [ ] 🟢 Admin : page `/admin/temoignages` (CRUD + modération + ordre).
- [ ] 🔵 Front : remplacer la section statique de la home par un **carrousel fonctionnel** (embla déjà présent) alimenté par l'API.

### 3.3 ❤️ Don — manuel + formulaire d'intention  🟢
- [ ] 🔵 Finaliser la page `/don` : **vraies coordonnées** bancaires + Mobile Money (à fournir), bouton « copier », design soigné, retrait du bouton « Donner maintenant » inactif.
- [ ] 🟢 Backend : modèle `Don` (`nom`, `email`, `montant`, `devise`, `moyen` carte/virement/mobile, `message`, `statut` annoncé/confirmé, timestamps) + endpoint de création + notification email (admin + reçu/merci au donateur via Nodemailer/templates existants).
- [ ] 🟢 Front : **formulaire « Je déclare un don »** (montant, moyen, message) → enregistre l'intention.
- [ ] 🟢 Admin : page `/admin/dons` (liste, statut, marquage « confirmé », export éventuel).

### 3.4 🔎 Recherche globale  🟢
- [ ] 🟢 Backend : endpoint `/api/recherche?q=` agrégeant blogs + événements + fichiers publics (titre/extrait/tags), résultats paginés et typés.
- [ ] 🟢 Front : composant de recherche (barre dans le header public + page `/recherche` de résultats), command palette (`cmdk` déjà présent) en option.

### 3.5 🗨️ Commentaires blog (activation)  🟢
> Le backend a déjà `Commentaire` + modération + endpoints (`actions/comment.ts`).
- [ ] 🟢 Front : affichage des commentaires publiés sous chaque article (`/blog/[slug]`).
- [ ] 🟢 Front : formulaire d'ajout de commentaire (+ réponses si supporté).
- [ ] 🔵 Admin : interface de **modération** (approuver/supprimer) si absente.
- [ ] 🟠 Anti-spam minimal (honeypot / rate-limit) sur la soumission publique.

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

## ✅ Definition of Done (par goal)

Un goal est « fait » quand :
1. Le code compile **sans** `ignoreBuildErrors` et passe `eslint`.
2. La fonctionnalité est **responsive** (360 → 1440 px) et **accessible** (clavier + `aria`).
3. Les états **chargement / vide / erreur** sont gérés.
4. Le SEO de la page est correct (métadonnées si page publique).
5. Testé manuellement sur le flux front ↔ back (et endpoint Swagger à jour côté API).

---

## 🗺️ Ordre d'exécution recommandé

1. **Lot 0** (bugs/permissions/config) — base saine.
2. **Lot 1** (responsivité admin + public).
3. **Lot 3.1** (Pointage) — fonctionnalité phare.
4. **Lot 2** (SEO).
5. **Lot 3.2 → 3.5** (témoignages, don, recherche, commentaires).
6. **Lot 4** (polish final).

> Validation **lot par lot** : à la fin de chaque lot, revue + ajustements avant d'enchaîner.
