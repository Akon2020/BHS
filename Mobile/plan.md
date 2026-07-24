# PLAN.md — Mobile — Séquencement du développement

> Stratégie : **API réelle dès le départ**. La quasi-totalité du backend nécessaire existe déjà et est en production (`/info.md`). Seul le module Notifications push est mocké en attendant son implémentation backend (§5.1 de `project.md`). Chaque phase se termine par une checklist "Definition of Done" (DoD) — reprend les mêmes exigences que `/plan.md` racine (responsive, accessible, états complets), adaptées au mobile.

---

## Phase 0 — Fondations

- [x] Init `Mobile/` (Expo, TypeScript strict) dans le monorepo, sans toucher à `Frontend/`/`Backend/`
- [x] EAS configuré (`eas.json` : profils development/preview/production + channels)
- [x] NativeWind + tokens extraits de `Frontend/app/globals.css` (crimson, OKLCH→sRGB clair/sombre en canaux RGB pour les opacités, `--chart-*`, `--radius`) → `global.css` + `theme/colors.ts`
- [x] Polices `Crimson Pro` + `Inter` via `@expo-google-fonts`
- [~] `expo-router` : groupe (public) fait ; (auth), (member), (admin) créés **avec leurs écrans** dans leurs phases respectives (Phase 1/4/5)
- [x] Client HTTP : instance unique (`services/api/client.ts`), `baseURL` = `EXPO_PUBLIC_API_URL`, intercepteur `Authorization: Bearer` depuis `expo-secure-store`
- [x] TanStack Query + persistance cache (lecture hors-ligne) + `onlineManager` (NetInfo)
- [x] Zustand : store d'auth (session, profil, rôle — revalidé via `/api/auth/profile`)
- [x] Design system de base : Button, Card, Badge, EmptyState, Skeleton, Text, Screen, **Input, Avatar, Toast, Sheet**
- [x] Sentry configuré (init conditionnelle sur `EXPO_PUBLIC_SENTRY_DSN`, no-op sans DSN)
- [x] Gestion offline (bannière hors-ligne + pause des requêtes) + **borne d'erreur globale** (expo-router)
- [x] ESLint/Prettier (`eslint-config-prettier`, `.prettierrc`, scripts `format`/`typecheck`) ; config `lint-staged` prête (hook husky à brancher plus tard)

**DoD** : app démarre, navigation stylée cohérente avec la marque BHS, un appel réel à `GET /api/dashboard` (ou tout endpoint public simple) fonctionne de bout en bout.

---

## Phase 1 — Authentification & compte

- [ ] **Backend (à demander/valider avant ou en parallèle)** : `/api/auth/login` renvoie `{ user, token }` ; nouvel endpoint public `POST /api/auth/inscription` (§5.2-5.3 de `project.md`)
- [ ] Écrans : Splash, Onboarding léger, Login, Inscription, Mot de passe oublié, Reset password (branchés sur `/api/auth/*` réel)
- [ ] Mode invité explicite sur les écrans qui l'autorisent (inscription événement, RDV)
- [ ] Profil : infos, modif, mot de passe, préférences de notifications (mock tant que §5.1 backend n'existe pas), biométrie, thème, suppression de compte
- [ ] Revalidation du rôle à chaque lancement via `/api/auth/profile`, matrice de permissions répliquée depuis `Frontend/lib/permissions.ts`

**DoD** : inscription → connexion → déconnexion → mot de passe oublié fonctionnels contre l'API réelle ; rôle correctement résolu et testé pour les 3 rôles (admin/editeur/membre) + invité.

---

## Phase 2 — Contenus publics (100% API réelle)

> Pré-requis : Swagger `Backend/api-docs.json` à jour demandé (point ouvert `project.md` §9) pour figer les noms exacts de routes Agenda/Fichiers.

- [ ] **Événements** : liste (à venir/en cours/passés), détail, **formulaire dynamique** rendu depuis `champsPersonnalises` (Zod généré dynamiquement selon les types texte/email/tel/nombre/select/checkbox/date/textarea/fichier), gestion `estPayant`/`montant`/`devise`, inscription (`reponsesPersonnalisees`), "Mes inscriptions", statut de paiement affiché (lecture seule, suivi manuel admin)
- [ ] **Échos de Prière / Pensée du Jour / Méditation** : résolution des `idCategorie` via slugs fixes au démarrage, 3 écrans dédiés liste + détail, rendu image plein écran pour Méditation sans texte, **commentaires** (lecture + publication via `/api/commentaires`, statut `attente` affiché à l'auteur)
- [ ] **Fichiers publics** : `/api/fichiers/public`, détail par slug, téléchargement (`modeAcces`)
- [ ] **Newsletter** : abonnement/désabonnement (`/api/abonnes/subscribe`)
- [ ] **Contact** : formulaire (`/api/contacts` POST public), "Mes messages" avec statut + réponse reçue
- [ ] **Fiche d'identité** : formulaire complet (état civil, contact d'urgence, santé), `/api/identites/add`
- [ ] **Recherche globale** : `/api/recherche?q=`

**DoD** : tous les écrans consomment l'API réelle, aucun mock restant sur ce périmètre.

---

## Phase 3 — Membre : RDV, calendrier, anniversaires, notifications (mock uniquement pour push)

- [ ] **Rendez-vous** : consultation du coordinateur actif (`ParametreAgenda`), créneaux disponibles (`CreneauRdv`), réservation, "Mes rendez-vous" avec statuts (`en_attente/approuve/refuse/reprogramme`), suivi (branché sur `/api/agenda/*` réel)
- [ ] **Calendrier agrégé** : reproduire l'agrégation événements + RDV + anniversaires + entrées manuelles (côté client si pas d'endpoint unique dédié — à vérifier), export `.ics` / lien Google Agenda (`expo-calendar` ou lien direct, en portant la logique de `Frontend/lib/ics.ts`)
- [ ] **Anniversaires** : liste des prochains, alerte du jour (`/api/anniversaires` réel)
- [ ] **Centre de notifications** : UI complète mais **données mockées** (module §5.1 pas encore backend) — préparer la structure exacte des types pour un branchement direct dès disponibilité
- [ ] Scaffold `expo-notifications` : permission (pré-prompt), enregistrement device token (mock de `/api/dispositifs/enregistrer`)

**DoD** : RDV et calendrier 100% réels ; notifications mockées mais avec des types/contrats identiques à ceux proposés en `project.md` §5.1 (bascule triviale plus tard).

---

## Phase 4 — Admin : modules déjà réels

- [ ] **Dashboard admin** : réutilisation de `GET /api/dashboard` (KPIs, séries 6 mois) dans une version mobile condensée
- [ ] **CRUD Événements** : y compris constructeur de champs personnalisés, config paiement, liste des inscrits, suivi financier (`GET /:id/finances` + export PDF via lien), renvoi de ticket, doublons
- [ ] **CRUD Blog & Catégories & Commentaires** : rédaction/modération, y compris les 3 catégories fixes éditoriales
- [ ] **Correspondance** : boîte des `Contact` (statuts nouveau/lu/traite/archive), réponse (`ReponseContact`), boîte d'envoi `MessageEnvoye`
- [ ] **Newsletters** : rédaction, envoi (réutiliser le flux tâche de fond + `/progress` déjà existant côté web), stats, gestion abonnés
- [ ] **Dons** : liste des intentions, mise à jour de statut

**DoD** : branché sur l'API réelle, permissions vérifiées via `/api/auth/profile`, parité fonctionnelle avec les équivalents web déjà en production.

---

## Phase 5 — Admin : modules avancés déjà réels

- [ ] **Agenda (admin)** : gestion des créneaux, `ParametreAgenda` (coordinateur), file des demandes, approbation/refus/reprogrammation
- [ ] **Fichiers (admin)** : CRUD, upload multi-fichiers, `modeAcces`
- [ ] **Todos/Kanban** : vue Kanban (à_faire/en_cours/fait), création perso/communautaire (`assignes` JSON), récurrence (déjà auto-gérée backend), commentaires (`TacheCommentaire`)
- [ ] **Anniversaires (admin)** : CRUD
- [ ] **Pointage** : saisie manuelle de session (flux web actuel) **+ « pointer maintenant »** (nouveau flux natif horodaté — nécessite l'ajout backend `POST /api/pointages/pointer` + `POST /api/pointages/:id/cloturer`, cf. `project.md` §9, décidé), consultation stats, export PDF (lien)
- [ ] **Calendrier (admin)** : CRUD entrées manuelles
- [ ] **Utilisateurs** : gestion des comptes internes selon permissions

**DoD** : tous les écrans admin avancés branchés sur l'API réelle.

---

## Phase 6 — Notifications push (backend + mobile, seul module réellement neuf)

- [ ] Implémentation backend du contrat §5.1 de `project.md` (modèles `DispositifPush`/`Notification`/`PreferenceNotification`, endpoints, accroches dans `scheduler.js` + contrôleurs concernés)
- [ ] Intégration FCM (Android) + APNs (iOS) via EAS
- [ ] Branchement réel `/api/dispositifs/enregistrer`, remplacement du mock de Phase 3
- [ ] Centre de notifications, préférences par catégorie (9 catégories, toggle séparé) branchés en réel
- [ ] Deep linking : chaque notification ouvre l'écran concerné
- [ ] Test sur devices physiques iOS + Android

**DoD** : une notification push reçue (RDV, anniversaire, nouvel Écho/Pensée/Méditation...) ouvre le bon écran ; préférences respectées.

---

## Phase 7 — Durcissement

- [ ] Audit performance (FlashList, images, bundle)
- [ ] Audit accessibilité (VoiceOver/TalkBack, contrastes, cibles tactiles ≥ 44pt)
- [ ] Tests devices bas de gamme Android
- [ ] États vide/erreur/chargement exhaustifs sur chaque écran
- [ ] Revue orthographe/traduction FR
- [ ] Politique de confidentialité + CGU in-app
- [ ] Flux de suppression de compte testé de bout en bout
- [ ] Biométrie complète, purge sécurisée à la déconnexion

---

## Phase 8 — Publication

- [ ] Assets stores (icônes, splash, captures, description FR)
- [ ] Compte Apple Developer (à créer — bloquant TestFlight/App Store, cf. décision précédente)
- [ ] Google Play Console configuré
- [ ] Build EAS production iOS + Android
- [ ] TestFlight + test interne Android
- [ ] Corrections retours bêta
- [ ] Soumission App Store + Play Store

---

## Phase 9 — Post-lancement

- [ ] Monitoring Sentry, seuils d'alerte
- [ ] Suivi avis stores
- [ ] Backlog V2 : Équipes/Témoignages dans l'app, don natif, multi-langue, multi-agenda coordinateur, "pointer en direct" si validé, analytics avancés

---

## Suivi transverse

- Toute divergence entre `project.md` §4-5 et l'implémentation Swagger réelle doit être documentée immédiatement dans `project.md`.
- Chaque case cochée ici doit avoir une entrée correspondante dans `Mobile/walkthrough.md` (même convention que `/walkthrough.md` racine).
- Commits : mêmes règles que `/CLAUDE.md` racine (français, préfixés, branche `dev`, aucune trace d'outil d'assistance).
