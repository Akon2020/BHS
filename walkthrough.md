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
- **Reste (passe visuelle)** : grilles de formulaires new/edit (`grid-cols-1 md:grid-cols-2`) + variantes « cartes » de tableaux sur mobile — à valider au navigateur (360→1440).

**Vérification** : `tsc --noEmit` → 0 erreur ; `npm run build` → succès.
