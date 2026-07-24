# CLAUDE.md — Mobile (BHS)

> Guide opérationnel pour travailler sur `Mobile/`. Lis ce fichier **avant** toute tâche, ainsi que [`Mobile/project.md`](project.md) (quoi construire) et [`Mobile/plan.md`](plan.md) (dans quel ordre). Ce workspace fait partie du monorepo BHS — le [`CLAUDE.md`](../CLAUDE.md) racine et [`/info.md`](../info.md) documentent `Frontend/`/`Backend/` et font autorité sur tout comportement métier déjà en production côté web.
>
> Objectif produit : une app **premium, moderne, fluide**, cohérente avec l'identité déjà établie du site (crimson, Crimson Pro/Inter), pour l'apostolat **Burning Heart – Pèlerins avec le Christ**.

---

## 1. Contexte

- Troisième workspace du monorepo BHS, aux côtés de `Frontend/` (Next.js) et `Backend/` (Express). Consomme la **même API**, ne la duplique jamais.
- Public : francophone (RDC + diaspora). **Langue : FR uniquement.**
- Roadmap & état d'avancement : **[`Mobile/plan.md`](plan.md)** — source de vérité des tâches. Mettre à jour les cases au fil de l'avancement et journaliser chaque étape dans **[`Mobile/walkthrough.md`](walkthrough.md)**. Commit sur `dev` à chaque implémentation complète, **sans trace de Claude ni d'Anthropic**.

---

## 2. Architecture

```
Mobile/
  app/                    # expo-router : routes (groupes: (public), (auth), (member), (admin))
  components/
    ui/                   # design system générique (Button, Card, Badge, Input, EmptyState...)
    features/<module>/    # composants spécifiques à un module (ex: features/evenements/)
  services/
    api/
      client.ts           # instance HTTP unique, baseURL EXPO_PUBLIC_API_URL, intercepteur Bearer
      <module>/
        types.ts           # typage TS (aligné sur les modèles Sequelize documentés dans /info.md)
        mock.ts             # implémentation mock — UNIQUEMENT pour le module notifications (§5.1 project.md) tant qu'il n'existe pas côté backend
        real.ts              # implémentation réelle
        index.ts              # exporte l'implémentation active
  stores/                  # Zustand (session, préférences UI)
  hooks/
  theme/                   # tokens NativeWind extraits de Frontend/app/globals.css (crimson, OKLCH)
  utils/
  i18n/                    # chaînes centralisées FR
```

**Toute la communication front↔back passe par `services/api/`** — jamais d'appel HTTP direct dans un composant (même règle que `Frontend/actions/`, voir `/CLAUDE.md` racine §4).

### Modules et statut mock/réel

Tous les modules sont branchés sur l'API réelle **sauf** `notifications` (et `dispositifs`), mockés jusqu'à l'implémentation backend décrite dans `Mobile/project.md` §5.1. Bascule via variable d'environnement :

```
EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS=true
```

Aucun autre module ne doit avoir de flag mock — si un endpoint attendu n'existe pas encore côté backend au moment de coder un écran, **le signaler** plutôt que de mocker silencieusement (cf. `Mobile/project.md` §9, points ouverts).

---

## 3. Commandes

| Action | Mobile |
|---|---|
| Dev | `npx expo start` |
| Build (EAS) | `eas build --profile <dev\|preview\|production> --platform <ios\|android>` |
| Submit | `eas submit --platform <ios\|android>` |
| Lint | `npm run lint` |
| Tests | `npm run test` |

> Shell par défaut : **PowerShell** (Windows). Pas d'opérateurs `&&`/`||`.

---

## 4. Conventions de code

### Général
- **Domaine métier en français**, aligné sur les modèles Sequelize existants (`utilisateur`, `evenement`, `idFichier`, `champsPersonnalises`…) — ne jamais angliciser ni renommer un concept déjà nommé côté backend.
- Réutiliser les patterns déjà en place dans `Frontend/` pour la logique métier (ex. calcul de statut de paiement, agrégation calendrier) plutôt que de réinventer — porter, pas redéfinir.
- Pas de `console.log` résiduel ; logger conditionnel (`__DEV__`) ou Sentry breadcrumbs.

### Stack technique (figée)
- **Expo (managed)** + **EAS Build/Submit**
- **TypeScript strict**
- **expo-router** (navigation file-based)
- **NativeWind** pour tout le style — jamais de hex en dur, toujours via les tokens `theme/` (même règle que le web : "couleurs via les tokens, jamais de hex")
- **TanStack Query** (data serveur, cache persistant hors-ligne) + **Zustand** (état non-serveur)
- **React Hook Form + Zod** — schémas Zod générés dynamiquement pour les formulaires pilotés par `champsPersonnalises`
- **expo-notifications**, **expo-secure-store**, **expo-local-authentication**, **expo-calendar**
- **Sentry**, **FlashList** (pas `FlatList`) pour toute liste longue

### Composants & formulaires
- Un composant = un fichier ; extraire en sous-composants dans `features/<module>/` au-delà de ~150 lignes.
- Props typées explicitement, pas de `React.FC`.
- Chaque écran consommant une query gère explicitement `isLoading` (Skeleton), `isError` (retry), vide (EmptyState parlant).
- Formulaires : validation Zod, erreurs FR claires, désactivation pendant l'envoi, toast de succès.
- Accessibilité : `accessibilityLabel` sur tout élément interactif, jamais d'info encodée uniquement par la couleur (ex. statut de RDV = couleur + texte/icône).

---

## 5. Design system — cohérence avec le web

Le mobile **reprend l'identité déjà établie**, il ne la réinvente pas :

1. **Couleur** : crimson (`~#a42223`) comme primaire, tokens OKLCH clairs/sombres extraits de `Frontend/app/globals.css` — jamais de couleur inventée.
2. **Typographie** : `Crimson Pro` (titres) / `Inter` (corps), même hiérarchie que le web.
3. **Cohérence** : mêmes proportions de rayons/espacements que le web pour une continuité visuelle immédiate entre plateformes.
4. **Respiration** : marges généreuses, un seul niveau de titre principal par écran.
5. **Micro-interactions** : transitions discrètes, retours visuels sur pression/chargement.
6. **États complets** : vide / chargement / erreur / succès partout, sans exception.
7. **Respect des plateformes** : Human Interface Guidelines (iOS) / Material 3 (Android) pour les patterns natifs (gestes, safe areas, tailles de touch target ≥ 44pt) — ne pas forcer un pattern web dans un contexte natif.

---

## 6. Sécurité & données

- Token JWT : `expo-secure-store` uniquement, jamais `AsyncStorage`.
- Purge complète (cache TanStack Query + store auth Zustand) à la déconnexion et à la suppression de compte.
- Jamais de mot de passe/token loggé, même en dev.
- Toute vue admin revérifie le rôle via `/api/auth/profile` — jamais de confiance aveugle en un état local potentiellement périmé.
- Alignement obligatoire avec la matrice de rôles de `Frontend/lib/permissions.ts` (admin/editeur/membre) — toute divergence est un bug.

---

## 7. Definition of Done

Avant de considérer une tâche terminée :
1. Compile sans erreur TypeScript, lint propre.
2. États chargement/vide/erreur/succès gérés.
3. Accessible (labels, contrastes AA, cibles tactiles).
4. Testé sur le flux front↔back réel (sauf module `notifications`, mocké — cf. §2).
5. Aucun hex en dur, aucun appel HTTP hors `services/api/`.
6. Case correspondante cochée dans `Mobile/plan.md`.
7. `Mobile/walkthrough.md` mis à jour.

---

## 8. Workflow attendu

1. Lire `Mobile/plan.md` → identifier la phase/tâche en cours.
2. Vérifier dans `Mobile/project.md` §4 si l'endpoint existe déjà réellement (cas général) ou s'il s'agit du module notifications (mock, §5.1).
3. Implémenter en respectant les conventions + design system ci-dessus.
4. Vérifier accessibilité + états + cohérence visuelle avec le web.
5. Lint/tests ; revue de la tâche avant de la clore.
6. Cocher la case dans `Mobile/plan.md`, journaliser dans `Mobile/walkthrough.md`.
7. **Commits** : à chaque fonctionnalité terminée, en français, préfixés (`feat:`, `fix:`, `refactor:`…), sur `dev`, **sans aucune trace d'outil d'assistance** (ni dans le code, ni dans les messages de commit).

---

## 9. Ce que Claude ne doit jamais faire sur ce workspace

- Recréer côté mobile une logique métier qui existe déjà côté `Backend/` (Agenda, Todos, Anniversaires, Calendrier, Fichiers, paiement événement) — **toujours consommer**, jamais dupliquer.
- Mocker un module autre que `notifications`/`dispositifs` sans en discuter — un endpoint manquant est un point ouvert à signaler (`project.md` §9), pas une raison de mocker silencieusement.
- Inventer une couleur ou une police hors des tokens `theme/` alignés sur `Frontend/app/globals.css`.
- Modifier `Frontend/` ou `Backend/` sans que ce soit explicitement l'objet de la tâche (les évolutions backend nécessaires sont listées et scoées dans `Mobile/project.md` §5).
- Construire un écran de paiement de don ou les modules Équipes/Témoignages dans l'app (hors périmètre V1, décidé).
- Laisser une trace d'outil d'assistance dans un commit, un commentaire de code, ou `walkthrough.md`.
