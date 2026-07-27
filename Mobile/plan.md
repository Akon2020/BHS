# PLAN.md — Mobile — Séquencement du développement

> Stratégie : **API réelle dès le départ**. La quasi-totalité du backend nécessaire existe déjà et est en production (`/info.md`). Seul le module Notifications push est mocké en attendant son implémentation backend (§5.1 de `project.md`). Chaque phase se termine par une checklist "Definition of Done" (DoD) — reprend les mêmes exigences que `/plan.md` racine (responsive, accessible, états complets), adaptées au mobile.

---

## Phase 0 — Fondations

- [x] Init `Mobile/` (Expo, TypeScript strict) dans le monorepo, sans toucher à `Frontend/`/`Backend/`
- [x] EAS configuré (`eas.json` : profils development/preview/production + channels)
- [x] NativeWind + tokens extraits de `Frontend/app/globals.css` (crimson, OKLCH→sRGB clair/sombre en canaux RGB pour les opacités, `--chart-*`, `--radius`) → `global.css` + `theme/colors.ts`
- [x] Polices `Crimson Pro` + `Inter` via `@expo-google-fonts`
- [x] `expo-router` : groupes (public), (auth), (member), (admin) créés — (member) et (admin) gardés (redirection selon session/rôle) ; écrans de gestion admin remplis en Phase 4/5
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

- [x] **Backend** : `/api/auth/login` renvoie `{ user, token }` (additif) ; nouvel endpoint public `POST /api/auth/inscription` (compte `membre`, rôle forcé serveur) — Swagger 104 chemins.
- [x] Écrans : **Login, Inscription, Mot de passe oublié, Onboarding léger** faits (RHF + Zod, API réelle) ; Splash géré (expo-splash-screen). *(Écran Reset via deep-link : à brancher plus tard, la demande de réinitialisation par email fonctionne.)*
- [x] Mode invité explicite (bouton « Continuer sans compte » + accueil public accessible à tous).
- [x] Profil : infos + **édition du nom**, **changement de mot de passe**, **thème** (système/clair/sombre persisté), **biométrie** (expo-local-authentication), notifications (placeholder mock §5.1), **déconnexion**, **suppression de compte** (endpoint `DELETE /api/auth/compte` ajouté, additif). Espace `(member)` gardé.
- [x] Revalidation du rôle à chaque lancement via `/api/auth/profile` (`bootstrap`), matrice de permissions répliquée depuis `Frontend/lib/permissions.ts`.

**DoD** : inscription → connexion → déconnexion → mot de passe oublié fonctionnels contre l'API réelle ; rôle correctement résolu et testé pour les 3 rôles (admin/editeur/membre) + invité.

---

## Phase 2 — Contenus publics (100% API réelle)

> Pré-requis : Swagger `Backend/api-docs.json` à jour demandé (point ouvert `project.md` §9) pour figer les noms exacts de routes Agenda/Fichiers.

- [~] **Événements** : **liste** (FlashList) + **détail** (image, infos, places, `estPayant`/`montant`/`devise`) + **inscription dynamique** faits — champs de base + `champsPersonnalises` rendus **par type** (texte/email/tel/nombre/select/checkbox/date/textarea/**fichier** via expo-document-picker), envoi multipart `reponsesPersonnalisees` + fichiers. **Navigation par onglets** (Accueil/Événements/Compte) ajoutée. *Reste : « Mes inscriptions » (nécessite un endpoint backend, cf. `project.md` §9) et l'affichage du statut de paiement d'une inscription.*
- [x] **Échos de Prière / Pensée du Jour / Méditation** : onglet **Spiritualité** avec sélecteur segmenté (3 sections), résolution des `idCategorie` via slugs fixes (`echos-de-priere`/`pensee-du-jour`/`meditation`), liste + détail, rendu **image plein écran** pour Méditation sans texte, **commentaires** (lecture des approuvés + publication → statut `attente`, message de modération). *Dépendance : les 3 catégories doivent exister avec ces slugs côté web.*
- [x] **Fichiers publics** : `/api/fichiers/public`, liste + détail par slug, ouverture/**téléchargement** par index (`WebBrowser`).
- [x] **Newsletter** : abonnement (`/api/abonnes/subscribe`). *(Désabonnement : via le lien email, non exposé en app.)*
- [x] **Contact** : formulaire (`/api/contacts/add` public). *(« Mes messages » : nécessiterait un endpoint de suivi par email, cf. `project.md §9`.)*
- [x] **Fiche d'identité** : formulaire complet (pièce, état civil, coordonnées, contact d'urgence, santé conditionnelle), payload imbriqué → `/api/identites/add`.
- [x] **Recherche globale** : onglet dédié, `/api/recherche?q=` (anti-rebond), résultats groupés (articles/événements/ressources).

**DoD** : tous les écrans consomment l'API réelle, aucun mock restant sur ce périmètre.

---

## Phase 3 — Membre : RDV, calendrier, anniversaires, notifications (mock uniquement pour push)

- [x] **Rendez-vous** : coordinateur actif (`ParametreAgenda`), créneaux disponibles (`CreneauRdv`), **réservation**, **« Suivre mes demandes »** par email avec statuts (`en_attente/approuve/refuse/reprogramme`) — 100 % API réelle (`/api/agenda/*` public).
- [x] **Calendrier agrégé** : navigation mensuelle + liste chronologique agrégeant **événements** (public) + **ses propres RDV** (via suivi email), **ajout à Google Agenda** par item (`lib/calendar-link.ts` porté de `lib/ics.ts`). *(Anniversaires + entrées manuelles = admin-only → non agrégés côté membre, cf. §9.)*
- [~] **Anniversaires** : **différé** — pas d'endpoint accessible aux membres (`/api/anniversaires` = admin/éditeur). Point ouvert `project.md §9` (décision confidentialité + endpoint à ajouter). L'alerte jour J passe déjà par email/cron.
- [x] **Centre de notifications** : UI complète, **données mockées** via le pattern `mock.ts`/`real.ts`/`index.ts` (bascule `EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS`), types alignés sur `project.md §5.1` — bascule triviale dès le backend prêt.
- [x] Amorce `expo-notifications` : `lib/push.ts` (permission + token best-effort ; enregistrement device token mocké tant que `/api/dispositifs` n'existe pas).

**DoD** : RDV et calendrier 100% réels ; notifications mockées mais avec des types/contrats identiques à ceux proposés en `project.md` §5.1 (bascule triviale plus tard).

---

## Phase 4 — Admin : modules déjà réels

- [x] **Dashboard admin** : hub `(admin)` gardé (éditeur/admin) + `GET /api/dashboard` (KPIs utilisateurs/articles/événements/abonnés + RDV en attente, tâches actives, heures, inscriptions). Accès depuis l'onglet Compte.
- [x] **Événements (gestion)** : liste admin (`/api/evenements/admin`), détail avec **inscrits**, **suivi de paiement** (non payé/partiel[+montant]/payé/accepté-non-payé via feuille), **finances** (`/:id/finances`), **renvoi de billet**. *(Création/édition d'événement + constructeur de champs perso = authoring lourd, laissé au web ; export PDF finances = lien à ajouter.)*
- [x] **Commentaires (modération)** : liste filtrable (en attente/approuvés/rejetés/tous), **approuver/rejeter/supprimer** (`/api/commentaires/moderate` + delete). *(Rédaction Blog + catégories = authoring, laissé au web pour l'instant.)*
- [x] **Correspondance** : boîte de réception des `Contact` (statuts + « répondu »), **détail + réponse** (`/repondre/:id`), **boîte d'envoi** (composer/envoyer via `/api/messages`).
- [x] **Newsletters** : liste + rédaction (`POST /api/newsletters`), envoi (flux tâche de fond `/:id/send`) avec **barre de progression** (polling `/:id/progress`), suppression ; **Abonnés** (liste + statut actif/inactif/désabonné via `/api/abonnes`).
- [x] **Dons** : liste des intentions + **bascule de statut** (annoncé/confirmé), total confirmé par devise.

**DoD** : branché sur l'API réelle, permissions vérifiées via `/api/auth/profile`, parité fonctionnelle avec les équivalents web déjà en production.

---

## Phase 5 — Admin : modules avancés déjà réels

- [x] **Agenda (admin)** : gestion des créneaux (création/suppression, places restantes), `ParametreAgenda` (coordinateur), file des demandes filtrable, approbation/refus/reprogrammation/suppression.
- [x] **Fichiers (admin)** : liste (statut/catégorie), création avec upload multi-fichiers (`document-picker` → multipart), `modeAcces`, suppression.
- [x] **Todos/Kanban** : board (à_faire/en_cours/fait) avec compteurs + déplacement de statut, création (priorité, échéance, récurrence, `assignes`), détail avec commentaires (`TacheCommentaire`) et suppression.
- [x] **Anniversaires (admin)** : CRUD (liste, création/édition via feuille, suppression).
- [x] **Pointage** : saisie manuelle de session **+ « pointer maintenant »** (nouveaux endpoints backend `POST /api/pointages/pointer` + `POST /api/pointages/:id/cloturer`, horodatage UTC+2 serveur), stats par période, clôture d'une session ouverte, suppression. *(Export PDF laissé au web : l'endpoint exige une auth Bearer que le navigateur mobile ne transmet pas — cf. `project.md` §9.)*
- [x] **Calendrier (admin)** : CRUD entrées manuelles (journée entière ou plage horaire, lieu).
- [x] **Utilisateurs** : liste (rôle/avatar), changement de rôle, création (email + rôle), suppression — réservés aux admins (page gardée).

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
