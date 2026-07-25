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

### Backend (ajouts additifs, scoping project.md §5.2-5.3) ✅
- `POST /api/auth/login` renvoie désormais `token` + `user` dans le corps (le cookie httpOnly et `data.userInfo` restent inchangés pour le web).
- Nouvel endpoint public `POST /api/auth/inscription` : crée un compte `membre` (rôle forcé côté serveur), email de bienvenue en arrière-plan, renvoie `token` + `user`. Distinct de `/register` (admin, inchangé). Swagger régénéré (104 chemins).

### Mobile — flux d'authentification ✅ (cœur)
- Service `services/api/auth` : `login`, `inscription`, `requestPasswordReset`, `getProfile`, `logout`.
- Groupe `app/(auth)` avec **garde** (`_layout` redirige vers `(public)` si déjà connecté) : écrans **Connexion**, **Inscription**, **Mot de passe oublié** — formulaires **React Hook Form + Zod**, états de chargement, toasts de succès/erreur, `KeyboardAvoidingView`.
- `ControlledInput` (RHF + Input) réutilisable.
- Accueil public : bouton **Se connecter** (invité) ou **Déconnexion** + salutation nominative (connecté).
- Session : `setSession` (token → secure-store), `bootstrap` revalide le profil au lancement.

**Vérifs** : `tsc --noEmit` + `expo lint` propres (mobile) ; `node --check` (backend). Runtime validé sur device (inscription/connexion/déconnexion OK).

### Mobile — préférences, thème, onboarding, profil ✅
- **Préférences persistées** `stores/preferences.ts` (Zustand + `persist` AsyncStorage) : `themeMode` (système/clair/sombre), `onboardingDone`, `biometricEnabled`, drapeau `hydrated`.
- **Thème sélectionnable** : `app/_layout.tsx` applique le mode via `nativewind` `colorScheme.set(...)` ; thème de navigation + StatusBar suivent le mode effectif ; le rendu attend l'hydratation des préférences (pas de flash).
- **Onboarding léger** `app/onboarding.tsx` (3 points de valeur + CTA) affiché au **premier lancement** (gating dans `app/index.tsx` sur `onboardingDone`).
- **Espace membre gardé** `app/(member)/_layout.tsx` (redirige les invités vers la connexion) + **écran Profil** `app/(member)/profil.tsx` : en-tête (avatar/nom/email/rôle), **édition du nom** et **changement de mot de passe** (feuilles `Sheet` + RHF/Zod), **sélecteur de thème**, **bascule biométrie** (`expo-local-authentication`, vérif de disponibilité), notifications (placeholder « bientôt »), **déconnexion**, **suppression de compte** (confirmation + `DELETE /api/auth/compte`).
- **Backend** : endpoint self-service `DELETE /api/auth/compte` (supprime l'utilisateur courant + efface le cookie) — additif, documenté `project.md §5.5`. Swagger 105 chemins.
- **Services** : `services/api/users` (`updateProfil` multipart, `changePassword`) ; `services/api/auth` (`supprimerCompte`). Session : `setUser`, `deleteAccount`, **purge du cache TanStack Query** à la déconnexion/suppression (CLAUDE.md §6). Primitives `SettingsRow`/`SettingsGroup` ajoutées.
- **Groupe `(admin)` gardé** `app/(admin)/_layout.tsx` (accès editeur/admin via la matrice) + placeholder — écrans remplis en Phase 4/5.

**Vérifs** : `tsc --noEmit` + `expo lint` propres ; `node --check` (backend). Commits séparés par fonctionnalité.

---

## Phase 2 — Contenus publics

### Navigation par onglets ✅
- `app/(public)/_layout.tsx` converti en **Tabs** (expo-router) : **Accueil**, **Événements**, **Compte** (icônes Ionicons, couleurs du thème).
- Onglet **Compte** (`app/(public)/compte.tsx`) : invité → CTA connexion/inscription ; connecté → carte profil + accès `Mon profil` + déconnexion.
- Helpers `utils/format.ts` : `formatDate`, `formatHeure`, `formatMontant`, `mediaUrl` (chemin `/uploads` → URL absolue via `API_BASE_URL`).

### Événements ✅ (liste, détail, inscription dynamique)
- Service `services/api/evenements` (types alignés sur `evenements`/`inscriptionsevenements`) : `getEvenements` (public, paginé), `getEvenementBySlug`, `registerToEvent` (multipart : base + `reponsesPersonnalisees` JSON + fichiers RN `{uri,name,type}`).
- **Liste** `app/(public)/evenements/index.tsx` : **FlashList**, `EventCard` (image `expo-image`, badges gratuit/payant/complet, date/heure/lieu), pull-to-refresh, états chargement/erreur/vide.
- **Détail** `app/(public)/evenements/[slug].tsx` : image, badges + montant, infos (date/heure/lieu/places restantes), description ; bouton **S'inscrire** (masqué si complet ou non publié).
- **Inscription dynamique** `components/features/evenements/register-sheet.tsx` : champs de base (nom/email/téléphone/sexe, préremplis si connecté) + `champsPersonnalises` rendus **par type** (textarea, select→chips, checkbox→switch oui/non, **fichier**→expo-document-picker, date/nombre/tel/email→input typé). Validation des requis, messages FR, `useMutation` + invalidation du détail, toast adapté gratuit/payant.

### Spiritualité (Échos / Pensée / Méditation) ✅
- Services `services/api/categories` (résolution des 3 slugs fixes), `services/api/blog` (liste par catégorie + détail avec commentaires approuvés), `services/api/commentaires` (publication publique + honeypot).
- Onglet **Spiritualité** (`app/(public)/spiritualite/`) : sélecteur segmenté 3 sections, liste (FlashList + `ArticleCard`), détail `[slug]` — **image plein écran** si Méditation sans texte, sinon texte (HTML→texte via `utils/html.ts`, rendu riche = amélioration future).
- **Commentaires** (`components/features/spiritualite/comments.tsx`) : liste des approuvés + formulaire RHF/Zod → statut `attente` (toast de modération).

### Recherche globale ✅
- Service `services/api/recherche` ; onglet `app/(public)/recherche.tsx` : champ avec **anti-rebond** (`hooks/use-debounce`), résultats groupés (Articles → détail article, Événements → détail événement, Ressources), états prompt/chargement/vide.

### Contact & Newsletter ✅
- Services `services/api/contact` (`sendContact`), `services/api/abonnes` (`subscribeNewsletter`).
- Écrans `contact.tsx` / `newsletter.tsx` (RHF/Zod, préremplis si connecté), masqués de la barre d'onglets (`href: null`), accessibles depuis l'onglet **Compte** (section Services).

### Ressources / Fichiers ✅
- Service `services/api/fichiers` (public, détail, URL de téléchargement par index). Écrans `fichiers/` (liste + détail) avec ouverture/téléchargement via `expo-web-browser` selon `modeAcces`.

### Fiche d'identité ✅
- Service `services/api/identite` (mapping formulaire plat → payload **imbriqué** identite/urgence/medical). Écran `identite.tsx` : sections (pièce, état civil, coordonnées, contact d'urgence, santé conditionnelle), `ChipSelect` pour les énumérations, validation FR. Accessible depuis Compte → Services.

**Navigation finale** : 5 onglets (Accueil · Événements · Spiritualité · Recherche · Compte). Contact/Newsletter/Fichiers/Identité en écrans masqués accessibles via Compte → Services.

**Phase 2 : ✅ complète.** Points ouverts backend notés dans `project.md §9` : « Mes inscriptions » (événements) et « Mes messages » (contact) — suivi par email/utilisateur à ajouter.

**Vérifs** : `tsc --noEmit` + `expo lint` propres. Commits séparés par fonctionnalité.

---

## Phase 3 — Membre : RDV, calendrier, notifications

### Rendez-vous ✅
- Service `services/api/agenda` (types + `getParametreAgenda`, `getCreneauxDisponibles`, `reserverRdv`, `suiviRdv`).
- Écran `app/(public)/rendez-vous/` : coordinateur, sélection de créneau, formulaire de réservation (`useMutation`), et **suivi par email** avec badges de statut. 100 % endpoints publics réels. Masqué des onglets, accès via Compte › Services.

### Calendrier agrégé ✅
- `lib/calendar-link.ts` (`googleCalendarUrl`, porté de `Frontend/lib/ics.ts`).
- Écran `app/(public)/calendrier.tsx` : navigation mensuelle, liste chronologique agrégeant **événements** publics + **ses RDV** (suivi email si connecté), **ajout à Google Agenda** par item (`expo-web-browser`). Anniversaires/entrées manuelles non agrégés (admin-only, cf. `project.md §9`).

### Notifications (mock) ✅
- Module `services/api/notifications` au pattern **mock/real/index** (bascule `EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS`) ; types alignés sur le contrat `project.md §5.1`.
- Écran `app/(member)/notifications.tsx` : liste (non-lu, catégorie, date), marquer lu / tout lu, bouton **Activer les notifications**, bandeau de démonstration.
- `lib/push.ts` : permission + token Expo (best-effort), enregistrement device token mocké tant que `/api/dispositifs` n'existe pas. `expo-notifications`/`expo-device` installés.

**Points ouverts backend** (`project.md §9`) : anniversaires accessibles aux membres (décision confidentialité + endpoint), « Mes inscriptions » événements, « Mes messages » contact.

**Phase 3 : ✅ (RDV, calendrier, notifications mock, anniversaires).**

### Anniversaires ✅ (décision : endpoint membre sans année)
- Backend : nouvel endpoint **`GET /api/anniversaires/a-venir`** (authentifié admin/éditeur/**membre**), renvoie nom + jour/mois + `dansJours` **sans l'année de naissance** (confidentialité). Swagger 106 chemins.
- Mobile : service `services/api/anniversaires` + écran `app/(member)/anniversaires.tsx` (liste, badge J-x/Aujourd'hui/Demain) + **intégration au calendrier** (items journée entière) + entrée dans Compte.

### Consolidation qualité ✅
- **Suite de tests** : `jest-expo` configuré (`jest.config.js`, script `npm test`), tests unitaires sur la logique pure — `lib/permissions`, `utils/html`, `lib/calendar-link` (**11 tests verts**).
- **Correctif de sécurité** (révélé par les tests) : `"/admin"` dans les listes `editeur`/`membre` accordait par préfixe l'accès à **toutes** les sous-pages `/admin/*`. Corrigé dans **les deux** `lib/permissions.ts` (mobile + web) : la racine `/admin` ne matche qu'en **exact**. Le backend `authorizeRoles` protégeait déjà les données.

**Vérifs** : `tsc --noEmit` + `expo lint` propres ; `npm test` (11/11) ; web `tsc` propre.

---

---

## Phase 4 — Admin : modules déjà réels

### Hub admin + dashboard ✅
- Groupe `(admin)` gardé (éditeur/admin via la matrice), accessible depuis l'onglet **Compte** (visible seulement pour le staff).
- `app/(admin)/index.tsx` : KPIs (`GET /api/dashboard`) + stats rapides + menu de gestion (`SettingsGroup`).

### Dons ✅
- `services/api/dons` (liste + bascule statut) ; écran `app/(admin)/dons.tsx` (liste, total confirmé par devise, bouton annoncé↔confirmé via `useMutation`).

### Correspondance ✅
- `services/api/correspondance` (`getContacts`, `getContact`, `replyContact`, `sendMessage`).
- `app/(admin)/contacts/` : inbox (statuts + « répondu »), détail + **formulaire de réponse**, et **composer** (boîte d'envoi `/api/messages`).

### Commentaires (modération) ✅
- `services/api/commentaires` étendu (getAll, moderer, delete). Écran `app/(admin)/commentaires.tsx` : filtre segmenté (attente/approuvés/rejetés/tous), **approuver/rejeter/supprimer** (confirmation `Alert` native).

### Événements (gestion) ✅
- `services/api/evenements` étendu (`getEvenementsAdmin`, `getEvenementAdmin`, `updatePaiement`, `getFinances`, `resendTicket`) + types (`EvenementAdmin`, `InscriptionEvenement`, `FinancesResponse`).
- `app/(admin)/evenements/` : liste (tous statuts), détail avec **carte finances** (attendu/encaissé/reste/inscrits), **liste des inscrits** + **suivi de paiement** (feuille `PaymentSheet` : non payé/partiel[+montant]/payé/accepté-non-payé) + **renvoi de billet**.

### Newsletters + Abonnés ✅
- `services/api/newsletters` (`getNewsletters`, `getNewsletter`, `createNewsletter`, `sendNewsletter`, `getNewsletterProgress`, `deleteNewsletter`) ; `services/api/abonnes` étendu (`getAbonnes`).
- `app/(admin)/newsletters/` : liste (statut brouillon/envoyée/programmée), **rédaction** (`nouveau.tsx` : titre interne/objet/contenu, auteur = utilisateur courant côté serveur), **détail** avec **envoi** (confirmation `Alert`, flux tâche de fond `/:id/send`) et **barre de progression** (polling `/:id/progress` toutes les 2 s tant que `statut === en_cours` : envoyés/échecs/en attente + %), suppression.
- `app/(admin)/abonnes.tsx` : liste des abonnés (statut actif/inactif/désabonné + date), total. Entrées **Newsletters** et **Abonnés** ajoutées au menu du hub admin.

**Reste hors périmètre Phase 4** : authoring Blog + création/édition d'événements (constructeur de champs perso) — laissés au web (UX de rédaction lourde sur mobile), décidé.

**Vérifs** : `tsc --noEmit` + `expo lint` propres ; `npm test` (11/11). Commits séparés par module.

---

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
