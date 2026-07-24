# WALKTHROUGH.md — Mobile — Journal d'implémentation

> Journal chronologique, lot par lot, de l'implémentation de `Mobile/`. Même convention que [`/walkthrough.md`](../walkthrough.md) racine : une entrée par tâche/lot terminé, mise à jour au moment du commit correspondant (voir `Mobile/CLAUDE.md` §7-8). Aucune trace d'outil d'assistance.

---

## Phase 0 — Fondations

### Socle (1re passe) ✅ (partiel)

**Thème & style**
- **NativeWind v4** configuré : `babel.config.js` (preset `nativewind/babel` + `jsxImportSource`), `metro.config.js` (`withNativeWind`, entrée `global.css`), `tailwind.config.js` (preset NativeWind, `darkMode: class`, couleurs mappées sur variables CSS, rayons, familles de polices), `nativewind-env.d.ts`.
- **Tokens portés depuis `Frontend/app/globals.css`** : les valeurs **OKLCH** du web (React Native ne rend pas oklch) sont converties en **hex sRGB** et déclarées dans `global.css` (`:root` clair + `.dark:root` sombre) et dupliquées en typé dans `theme/colors.ts` (usages hors NativeWind : navigation, StatusBar, icônes). Primaire crimson `#900d30` (clair) / `#ce3e57` (sombre).
- **Polices** : `Inter` (corps) + `Crimson Pro` (titres) via `@expo-google-fonts`, chargées dans `app/_layout.tsx`, familles exposées en classes (`font-sans/medium/semibold/bold`, `font-serif/serif-bold`).

**Données & session**
- **Client HTTP unique** `services/api/client.ts` : `baseURL = EXPO_PUBLIC_API_URL` (fallback prod), **intercepteur `Authorization: Bearer`** depuis `expo-secure-store` (`services/api/session.ts`), gestion 401 (purge + handler), `getApiErrorMessage` FR.
- **TanStack Query** `lib/query-client.ts` : client + **persistance AsyncStorage** (lecture hors-ligne), fourni via `PersistQueryClientProvider`.
- **Zustand** `stores/session.ts` : `bootstrap()` (lecture token → `GET /api/auth/profile`), `setSession/refreshProfile/logout`, `can(path)` aligné sur `lib/permissions.ts` (**réplique exacte** de `Frontend/lib/permissions.ts`).

**Design system (base)** `components/ui/` : `Text`/`Heading`, `Button` (variantes + loading, cible ≥ 44 px), `Card`, `Badge` (couleur + texte), `EmptyState`, `Skeleton` (pulsant), `Screen` (safe-area). Chaînes FR centralisées dans `i18n/fr.ts`.

**Navigation** : template de démo Expo retiré (`(tabs)`, `modal`, composants `themed-*`/hooks/constants) ; `app/_layout.tsx` refait (providers + polices + bootstrap) ; `app/index.tsx` → redirection ; groupe **`(public)`** avec un écran d'accueil branché sur **l'API réelle** (`GET /api/temoignages/public`) démontrant états chargement/erreur/vide.

**Vérifs** : `tsc --noEmit` propre ; `expo lint` propre. ⚠️ Rendu runtime non vérifié ici (pas d'émulateur) — à valider via `npx expo start`.

### Complétion ✅

- **Primitives UI** : `Input` (libellé/erreur/aide, compatible RHF), `Avatar` (photo ou initiales), `Toast` (store Zustand + hôte animé, auto-dismiss) et `Sheet` (feuille modale native). `ToastHost` monté à la racine.
- **Connectivité** : `hooks/use-online.ts` (NetInfo) + `OfflineBanner` (bandeau discret hors-ligne) ; `onlineManager` de TanStack Query branché sur NetInfo (requêtes en pause hors-ligne).
- **Borne d'erreur globale** : `ErrorBoundary` exporté depuis `app/_layout.tsx` (expo-router) → `ErrorScreen` réutilisable.
- **Sentry** : `lib/sentry.ts` (`initSentry` conditionnel au DSN, no-op sinon ; `Sentry.wrap` sur le layout racine) ; plugin `@sentry/react-native` ajouté à `app.json`.
- **EAS** : `eas.json` (profils development/preview/production + channels).
- **Outillage** : Prettier (`.prettierrc.json`, `.prettierignore`), `eslint-config-prettier`, scripts `format`/`format:check`/`typecheck`, config `lint-staged` (hook husky à brancher plus tard).

**Runtime validé** : l'app démarre, thème crimson + dark mode système, polices serif, et l'appel API réel (`/api/temoignages/public`) affiche l'état vide correctement (capture confirmée). Correctif appliqué : tokens en canaux RGB pour les opacités NativeWind ; `babel-preset-expo` ajouté en dépendance directe.

**Reste (mineur, non bloquant)** : créer `.env` depuis `.env.example` ; brancher un hook husky pour `lint-staged` ; groupes de routes `(auth)/(member)/(admin)` livrés avec leurs écrans (Phases 1/4/5).

---

## Phase 1 — Authentification & compte

_(à compléter)_

---

## Phase 2 — Contenus publics

_(à compléter)_

---

## Phase 3 — Membre : RDV, calendrier, anniversaires, notifications

_(à compléter)_

---

## Phase 4 — Admin : modules déjà réels

_(à compléter)_

---

## Phase 5 — Admin : modules avancés

_(à compléter)_

---

## Phase 6 — Notifications push

_(à compléter)_

---

## Phase 7 — Durcissement

_(à compléter)_

---

## Phase 8 — Publication

_(à compléter)_

---

## Phase 9 — Post-lancement

_(à compléter)_
