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
