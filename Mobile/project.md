# PROJECT.md — Burning Heart Mobile (BHS/Mobile)

> Source de vérité fonctionnelle et technique du workspace `Mobile/` du monorepo BHS.
> Complète [`/info.md`](../info.md) (racine) qui documente `Frontend/` et `Backend/`. En cas de doute sur un comportement métier déjà couvert par le web, `/info.md` fait autorité — ce document ne le duplique pas, il y renvoie et documente uniquement ce qui est spécifique au mobile.

---

## 1. Contexte

**Burning Heart – Pèlerins avec le Christ** a déjà un site web premium (`Frontend/` Next.js) et une API mature (`Backend/` Express, **26 modèles, ~103 routes**, voir `/info.md`). `Mobile/` est un **troisième workspace** du même monorepo : une application React Native (Android + iOS) qui **consomme la même API Backend**, sans la dupliquer.

**Principe directeur** : l'app mobile n'est **pas** un back-office complet — la plus grande partie de l'administration continue de se faire sur le site web. Elle **simplifie des tâches mobiles à forte valeur** pour le grand public (consultation, inscriptions, RDV, rappels) et pour la coordination (approbations rapides, todos, pointage, notifications).

**Découverte clé (à retenir)** : au moment de concevoir ce document, une première itération avait proposé de "réinventer" des modules (Rendez-vous, Todos, Anniversaires, Calendrier, Fichiers) en supposant qu'ils n'existaient pas côté backend. **C'était faux** — `/info.md` confirme qu'ils existent déjà et sont **fonctionnels en production** (Lot 3 et Lot 5 du plan web, marqués 🟢/fait). Le seul module réellement absent est **les notifications push** (le web utilise des emails via cron, logique pour un site). Ce document reflète donc une stratégie **"API réelle dès le départ"**, pas du mock-first généralisé.

---

## 2. Architecture monorepo

```
BHS/
├── Frontend/   → Next.js 16 (existant, inchangé par ce projet)
├── Backend/    → Express 5 / Sequelize / MySQL (existant, quelques additions listées en §5)
└── Mobile/     → Expo (React Native) — NOUVEAU, objet de ce document
```

Le Backend reste la **seule source de données**. Le Mobile ne parle jamais directement à MySQL, uniquement à `/api/*`.

---

## 3. Rôles & authentification

### 3.1 Rôles (référence : `/info.md` §3.1, table `utilisateurs`)

| Rôle | Accès mobile |
|---|---|
| **Visiteur** (non connecté) | Consultation publique (événements, Échos/Pensées/Méditations, fichiers publics), inscription événement en invité, réservation RDV en invité, abonnement newsletter, formulaire de contact, remplissage fiche d'identité. |
| **membre** | Tout ce que fait le visiteur + compte (créé via le nouvel endpoint public, §5.3) + suivi de ses inscriptions/RDV/messages, notifications, calendrier personnel, commentaires sur Échos/Pensées/Méditations, accès `/admin` → `taches` et `profile` uniquement (comme sur le web, cf. matrice `lib/permissions.ts`). |
| **editeur** | Contenu : blog/catégories/commentaires, événements, fichiers, contacts, équipe, pointage, dons, agenda, anniversaires, todos, calendrier, profil (lecture dashboard limitée) — reprend exactement la matrice web. |
| **admin** | Accès total, y compris gestion des utilisateurs. |

> **Règle stricte** : le mobile ne code **jamais** cette matrice en dur de façon indépendante. Elle doit être **partagée ou dérivée** de la même logique que `Frontend/lib/permissions.ts` (au minimum, répliquée à l'identique et commentée comme telle ; idéalement extraite dans un package partagé plus tard).

### 3.2 Authentification côté mobile

Le web utilise un **cookie httpOnly** (`token`) pour transporter le JWT, avec un fallback `Authorization: Bearer` déjà supporté par `authenticationJWT` (voir `/info.md` §3.4). **React Native ne gère pas les cookies httpOnly de façon fiable** (pas de navigateur, gestion cross-domain fragile) → le mobile utilise **exclusivement le flux Bearer**.

- `POST /api/auth/login` et `POST /api/auth/register` (public, §5.3) doivent renvoyer le JWT **dans le corps JSON** (`{ user, token }`), **en plus** du cookie existant. C'est un **ajout additif, non destructif** pour le web (qui ignore simplement ce nouveau champ).
- Le mobile stocke `token` dans `expo-secure-store`, l'attache via un intercepteur (`Authorization: Bearer <token>`) sur chaque requête.
- `GET /api/auth/profile` reste la source de vérité du rôle courant à chaque lancement de l'app (jamais de rôle mis en cache sans revalidation).

---

## 4. API réelle disponible (résumé mobile-pertinent)

Référence exhaustive : Swagger `Backend/api-docs.json` (103 chemins) — **demander une version à jour** avant de démarrer la Phase 2 (`Mobile/plan.md`), celle fournie initialement était partielle/obsolète.

| Domaine | Endpoints (base) | Modèle(s) clé(s) | Notes mobiles |
|---|---|---|---|
| Auth | `/api/auth/*` | `Utilisateur` (role: admin/editeur/membre) | Voir §3.2 pour les ajouts nécessaires |
| Événements | `/api/evenements/*` | `Evenement`, `InscriptionEvenement` | **Déjà dynamique** : `champsPersonnalises` (JSON, types texte/email/tel/nombre/select/checkbox/date/textarea/fichier), `estPayant/montant/devise`. Inscription : `reponsesPersonnalisees` JSON, `statutPaiement` (non_paye/partiel/paye/accepte_non_paye — **suivi manuel**, pas de passerelle de paiement en ligne). |
| Blog / Catégories | `/api/blogs/*`, `/api/categories/*` | `Blog`, `Categorie` (slug unique) | Porte les 3 sections éditoriales mobiles (§6). |
| Commentaires | `/api/commentaires/*` | `Commentaire` (fils de discussion, modération) | Utilisé pour les commentaires sur Échos/Pensées/Méditations (§6). |
| Fichiers | `/api/fichiers/*` (`/public`, `/slug/:slug`, `/slug/:slug/download/:index`) | `Fichier` (fichiers JSON list, `modeAcces` lecture/téléchargement, `statut`) | Le filtrage public/admin se fait via routes séparées (`/public` vs CRUD admin), pas via un champ "visibilité" — à confirmer dans le Swagger à jour. |
| Contacts | `/api/contacts/*` | `Contact` (statut nouveau/lu/traite/archive), `ReponseContact` | Correspondance déjà avec statuts — exactement ce qu'il fallait. |
| Abonnés / Newsletter | `/api/abonnes/*`, `/api/newsletters/*` | `Abonne`, `Newsletter`, `NewsletterAbonne` | Envoi en tâche de fond + `/progress` (polling) déjà géré côté web — le mobile admin peut réutiliser le même flux. |
| Dons | `/api/dons/*` | `Don` | Formulaire d'intention uniquement (paiement hors-ligne) — mobile redirige vers le site pour l'instant (déjà décidé). |
| Identités | `/api/identites/*` | `FicheIdentite` | Formulaire pèlerin complet, PDF, approbation admin. |
| Agenda / RDV | `/api/agenda/*` | `ParametreAgenda` (coordinateur unique, singleton), `CreneauRdv`, `RendezVous` | **Déjà tout ce qui a été discuté** : créneaux fixes, réservation publique, statuts `en_attente/approuve/refuse/reprogramme`, emails automatiques. |
| Anniversaires | `/api/anniversaires/*` | `Anniversaire` (délai de rappel configurable) | Cron 07:00 (Africa/Lubumbashi) → email. Mobile ajoute le push (§5). |
| Todos / Kanban | `/api/taches/*` | `Tache` (statut a_faire/en_cours/fait, priorité, récurrence, assignés JSON), `TacheCommentaire` | Cron 07:30 rappels. **Récurrence auto** déjà gérée (une tâche récurrente "Fait" engendre l'occurrence suivante) — le mobile n'a rien à réimplémenter, juste consommer. |
| Calendrier | `/api/calendrier/*` | `EntreeCalendrier` | Vue agrégée (événements + RDV + anniversaires + entrées manuelles) déjà côté web — le mobile doit reproduire cette agrégation (recomposer côté client si pas d'endpoint unique dédié, à vérifier) + export `.ics`/Google Agenda (logique dans `lib/ics.ts`, à porter en RN via `expo-calendar`/lien `.ics`). |
| Pointage | `/api/pointages/*` | `ProfilPointage`, `Pointage` | Accès mobile **admin/editeur uniquement** (garde déjà au niveau routeur). Saisie manuelle de session (pas de "pointer en direct" côté web actuellement — voir §8 point ouvert). |
| Dashboard | `/api/dashboard` | agrégats | KPIs + séries 6 mois déjà prêts, réutilisables pour un dashboard admin mobile simplifié. |
| Recherche | `/api/recherche?q=` | agrège blogs+événements+fichiers | À exploiter pour une recherche globale mobile. |
| Équipes / Témoignages | `/api/equipes/*`, `/api/temoignages/*` | — | **Hors périmètre mobile V1** (déjà décidé). |

---

## 5. Ce qui doit être ajouté côté Backend pour le mobile

Contrairement à l'itération précédente de ce document, la liste est courte — la majorité du travail mobile est de la **consommation**, pas de la **conception** d'API.

### 5.1 Notifications push (nouveau module)

Le web déclenche déjà des emails automatiques via `scheduler.js` (cron, `Africa/Lubumbashi`) et dans plusieurs contrôleurs (agenda, anniversaires, taches). Le mobile a besoin d'un **canal push en plus**, pas d'une nouvelle logique métier — il faut **brancher un émetteur push sur les mêmes déclencheurs**.

```
Nouveau modèle: DispositifPush (ts)
  idUtilisateur (nullable, invité possible pour RDV/inscriptions), token, plateforme ('ios'|'android'), actif

Nouveau modèle: Notification (ts)         // pour le centre in-app
  idUtilisateur (nullable), titre, corps, categorie, donnees (JSON, ex. { type: 'rendezvous', id }), lu (bool)

Nouveau modèle: PreferenceNotification (ts)
  idUtilisateur, categorie, active (bool)
```

```
POST   /api/dispositifs/enregistrer       { token, plateforme }
DELETE /api/dispositifs/desenregistrer    { token }

GET    /api/notifications/mes-notifications?lu=&page=
PATCH  /api/notifications/:id/lue
PATCH  /api/notifications/lues-toutes
GET    /api/notifications/preferences
PATCH  /api/notifications/preferences     { categorie, active }

POST   /api/notifications/diffuser (admin)  { titre, corps, segment: 'tous'|'membres'|'abonnes', donnees? }
```

**Catégories** : `evenement`, `rendezvous`, `anniversaire`, `newsletter`, `correspondance`, `echo_priere`, `pensee_du_jour`, `meditation`, `systeme`. Préférence **activable/désactivable séparément** par catégorie (déjà décidé).

**Points d'accroche à ajouter dans le code existant** (additif, ne modifie pas la logique email actuelle) :
- `scheduler.js` → après `verifierAnniversaires()` et `verifierRappelsTaches()`, émettre aussi un push.
- Contrôleur `agenda` → à l'approbation/refus/reprogrammation d'un RDV, et au rappel J-1 (nouveau cron ou extension de `scheduler.js`).
- Contrôleur `blog` → à la publication (`statut: 'publie'`) d'un article dans l'une des 3 catégories fixes (§6).
- Contrôleur `evenements` → à la publication d'un nouvel événement grand public.
- Contrôleur `commentaires` → en réponse à un commentaire (notifier l'auteur du commentaire parent).
- Contrôleur `contacts` → à l'envoi d'une `ReponseContact`.

### 5.2 Auth — token dans le corps JSON

`POST /api/auth/login` : réponse enrichie `{ user, token }` en plus du cookie httpOnly déjà posé (voir §3.2). Décision prise : **oui, à demander**, c'est un ajout non-cassant.

### 5.3 Auth — inscription publique

Actuellement `POST /api/auth/register` est réservé admin (`/info.md` §3.3). Il faut un **nouvel endpoint public**, distinct, pour que les visiteurs mobiles (et potentiellement web plus tard) créent un compte `membre` eux-mêmes :

```
POST /api/auth/inscription   (public)
  { nomComplet, email, password }
  → 201 { user, token }   // role = 'membre' forcé côté serveur, jamais transmis par le client
```
Ne pas réutiliser `/register` (garder son usage admin actuel intact — routes distinctes, pas de risque de régression).

### 5.4 Fichiers — confirmer le filtrage public

Le modèle `Fichier` a un `statut` et un `modeAcces`, mais `/info.md` ne précise pas explicitement le champ qui distingue "visible publiquement" de "réservé admin" au-delà de la séparation par route (`/public` vs CRUD admin). **À vérifier dans le Swagger à jour avant Phase 2** — pas de changement de schéma anticipé, juste une clarification de lecture.

### 5.5 Auth — suppression de son propre compte ✅ (fait)

Conformité stores (RGPD / Apple / Google) : l'utilisateur doit pouvoir supprimer son compte depuis l'app. L'endpoint admin `DELETE /api/users/delete/:id` ne convient pas (réservé admin). Ajout d'un endpoint **self-service** :

```
DELETE /api/auth/compte   (authentifié)
  → 200 { message }   // supprime l'utilisateur courant + efface le cookie
```
Additif et non destructif pour l'existant. Utilisé par l'écran Profil (Phase 1).

---

## 6. Échos de Prière / Pensée du Jour / Méditation

Confirmé : 3 catégories fixes du module `Blog` existant, chacune avec son propre onglet/écran mobile — **pas de "blog générique"** à côté.

- **Mapping robuste** : `Categorie` a désormais un champ `slug` (unique) — utiliser des slugs fixes et stables (`echos-de-priere`, `pensee-du-jour`, `meditation`) plutôt que le libellé, pour résoudre `idCategorie` au démarrage via `GET /api/categories`. **Plus fiable** que l'approche par nom envisagée dans l'itération précédente de ce document.
- **Méditation** : `contenu` parfois vide, `imageUne` alors obligatoire → rendu image plein écran zoomable si pas de texte.
- **Commentaires** : activés (décidé), via `/api/commentaires` (fils de discussion, modération déjà en place — un commentaire posté par un visiteur/membre mobile passe par le statut `attente` avant publication, exactement comme sur le web).
- **Notifications** : push dédié à la publication (`statut: publie`) dans chacune des 3 catégories, préférence séparée par catégorie (§5.1).

---

## 7. Identité visuelle

**Correction majeure** par rapport à l'itération précédente : le fichier `globals.css` initialement partagé était un thème shadcn neutre par défaut, **pas** la charte réellement en production. `/info.md` confirme la vraie identité : **primaire crimson** (`~#a42223`, couleur de marque utilisée jusque dans les PDF), tokens **OKLCH**, `--chart-1..5`, typographie **Crimson Pro** (serif, titres) / **Inter** (sans, corps), dark mode via contexte (classe `.dark`).

**Décision** : le mobile **s'aligne sur ce crimson** pour une cohérence de marque totale (pas de palette "braise/or" distincte).

- Palette : reprendre les tokens OKLCH réels de `Frontend/app/globals.css` (à extraire tels quels dans `Mobile/theme/colors.ts`, valeurs claires **et** sombres) plutôt que de redéfinir des couleurs approximatives.
- Typographie : `Crimson Pro` (titres) + `Inter` (corps) via `expo-font` / `@expo-google-fonts`.
- Dark mode : toggle clair/sombre, par défaut aligné sur le thème système (amélioration recommandée par rapport au web qui persiste en `localStorage` — sur mobile, respecter `Appearance` natif au premier lancement, puis mémoriser le choix explicite de l'utilisateur si modifié).
- Rayons, ombres, espacements : mêmes proportions que le web (`--radius`) pour une cohérence visuelle immédiate entre les deux plateformes.

---

## 8. Exigences non-fonctionnelles

(Reprises et confirmées de l'itération précédente, inchangées)

- Compatibilité iOS 15.1+ / Android 8+ (API 26+), smartphone uniquement en V1.
- Français uniquement, chaînes centralisées.
- Mode hors-ligne : lecture seule du cache déjà chargé.
- Sécurité : `expo-secure-store` pour le token, jamais `AsyncStorage`. Purge à la déconnexion.
- Accessibilité AA, `accessibilityLabel` systématiques.
- Conformité stores : politique de confidentialité in-app, suppression de compte, permissions notifications avec pré-prompt.
- Observabilité : Sentry.

---

## 9. Points ouverts

- **Pointage mobile** — **DÉCIDÉ** : en plus de la saisie manuelle a posteriori (flux web actuel), le mobile propose un vrai **« pointer maintenant »** (bouton unique horodaté). C'est une **évolution backend à ajouter** (non présente sur le web), planifiée en Phase 5 :
  - `POST /api/pointages/pointer` (admin/editeur) → ouvre une session pour le profil courant à l'heure serveur (UTC+2), sans `heureFin`.
  - `POST /api/pointages/:id/cloturer` → renseigne `heureFin` = maintenant (réutilise la logique de clôture a posteriori existante).
  - Additif et non destructif : la saisie manuelle reste inchangée.
- **Swagger à jour** : le fichier `api-docs.json` fourni initialement est partiel — en demander une régénération (`npm run swagger:gen` côté `Backend/`) avant la Phase 2 de `Mobile/plan.md`, pour figer les noms de routes exacts (Agenda, Todos, Calendrier, Fichiers) avant de coder les adaptateurs.
- **Fichiers publics vs privés** : confirmer le champ/la logique exacte de filtrage (§5.4).
- **`COOKIE_DOMAIN`** : sans impact direct sur le mobile (qui n'utilise pas les cookies), mais à garder en tête si un jour un WebView est utilisé (ex. pour le don, redirigé vers le site).
