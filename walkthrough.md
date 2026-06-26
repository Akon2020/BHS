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
