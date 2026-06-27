# CLAUDE.md — Burning Heart (BHS)

> Guide opérationnel pour travailler sur ce monorepo. Lis ce fichier **avant** toute tâche.
> Objectif produit : un site **premium, moderne, élégant et 100 % responsive**, avec un SEO solide, pour l'apostolat **Burning Heart – Pèlerins avec le Christ** (spiritualité ignatienne).

---

## 1. Contexte projet

- **Mission** : plateforme spirituelle & médiatique (blog, événements, ressources/fichiers, newsletter, fiches d'identité de pèlerins, dons).
- **Public** : francophone (RDC + diaspora). **Langue : FR uniquement** pour l'instant.
- **Roadmap & état d'avancement** : voir **[`plan.md`](plan.md)** — source de vérité des tâches. Mettre à jour les cases à cocher au fil de l'avancement et renseigner toutes les étapes dans un fichier **[`walkthrough.md`](walkthrough.md)** à la racine du projet. Chaque fois qu'une implementation est complète, faire un commit sur la branche **`dev`** sans y mettre les traces de Claude ni d'antropic.

---

## 2. Architecture

```
BHS/
├── Frontend/   → Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, TS
└── Backend/    → Express 5, Sequelize, MySQL, JWT, Nodemailer, Multer, Swagger
```

### Frontend (`Frontend/`)
- `app/` — routes App Router. `app/admin/*` = back-office, reste = public.
- `actions/` — **toute** la communication front↔back (axios). Une fonction par opération API.
- `types/` — typage TS partagé (`user.ts`, `dashboard.ts`, …).
- `lib/axios.ts` — instance axios (baseURL `NEXT_PUBLIC_API_URL`, `withCredentials`, bearer token).
- `lib/permissions.ts` + `proxy.ts` (ex-`middleware.ts`, convention Next.js 16) — contrôle d'accès admin par rôle (**doivent rester synchronisés**).
- `components/ui/` — primitives shadcn/ui (ne pas réinventer). `components/admin/`, `components/sections/`, `components/modals/` — composants métier.
- `contexts/theme-context.tsx` — thème clair/sombre.

### Backend (`Backend/`)
- `routes/ → controllers/ → models/` (Sequelize) — un fichier par domaine.
- `middlewares/` — `auth`, `error`, `upload` (Multer), `email`.
- `utils/` — PDF (`identity-pdf.js`, `event-pdf.js`), emails (`email.template.js`), stats.
- `swagger.js` — doc API (`/api-docs`). **Tenir à jour** quand on ajoute/modifie un endpoint.
- API montée sous `/api/*` ; uploads servis depuis `/uploads`.

---

## 3. Commandes

| Action | Frontend | Backend |
|---|---|---|
| Dev | `npm run dev` | `npm run dev` (nodemon) |
| Build | `npm run build` | — |
| Prod | `npm start` | `npm start` |
| Lint | `npm run lint` | `eslint .` |

> Shell par défaut : **PowerShell** (Windows). Pas d'opérateurs `&&`/`||`.

---

## 4. Conventions de code

### Général
- **Langue du domaine = français** : modèles, champs DB, routes et libellés UI sont en FR (`utilisateur`, `evenement`, `idFichier`…). **Respecter cette convention**, ne pas angliciser l'existant.
- Réutiliser les patterns en place avant d'en créer de nouveaux. Lire un fichier voisin pour le style.
- Pas de `console.log` résiduel ; gérer les erreurs (try/catch + message clair).

### Frontend
- **Appels API uniquement via `actions/`** — jamais d'axios brut dans un composant.
- **Server Components par défaut** ; `"use client"` seulement si interactivité réelle (state, effets, events). Les pages publiques doivent rester compatibles `generateMetadata` (SEO).
- **UI = shadcn/ui + Tailwind** ; couleurs **via les tokens** (`bg-primary`, `text-muted-foreground`…), **jamais** de hex en dur. Le thème (crimson + dark mode) est dans `app/globals.css`.
- Typographie : `font-serif` (Crimson Pro) pour les titres, `font-sans` (Inter) pour le corps.
- Icônes : `lucide-react`. Toasts : `sonner` / `use-toast`.
- Toujours mobile-first : tester 360 / 768 / 1024 / 1440 px.

### Backend
- Réponses JSON cohérentes ; codes HTTP corrects ; validation des entrées.
- Slugs via `slugify` ; mots de passe via `bcryptjs` ; jamais renvoyer le `password`.
- Toute nouvelle route → contrôleur dédié + entrée Swagger + (si besoin) action front + type.

---

## 5. Design system — viser le « premium »

Principes non négociables pour que le rendu soit **beau, moderne et cohérent** :

1. **Cohérence** : réutiliser tokens, espacements (`p-4 md:p-6`), rayons (`--radius`), ombres douces. Une seule échelle typographique.
2. **Respiration** : marges généreuses, sections aérées, largeur de lecture limitée (`max-w-7xl`, prose `max-w-2xl`).
3. **Hiérarchie** : un seul `h1` par page, titres serif, sous-titres `text-muted-foreground`.
4. **Micro-interactions** : transitions discrètes (`transition-colors`, hover/focus visibles), états `loading`/`disabled` soignés (skeletons).
5. **Accessibilité = qualité** : contrastes AA, focus visibles, `aria-*`, cibles tactiles ≥ 44 px, navigation clavier.
6. **États complets** : toujours prévoir vide / chargement / erreur / succès.
7. **Images** : `next/image`, ratios maîtrisés, `alt` pertinent, `priority` réservé au hero.

---

## 6. Skills à utiliser

> Invoquer le skill **avant** d'écrire le code concerné.

- **`ui-ux-pro-max`** — pour concevoir/améliorer/auditer toute UI (pages, composants, responsive, palettes, typographie, accessibilité). À utiliser systématiquement pour le design premium et les revues UI.
- **`vercel:shadcn`** — installation/composition de composants shadcn/ui, theming, patterns d'interface.
- **`vercel:nextjs`** — App Router, Server Components, Server Actions, métadonnées, rendu/cache, perf.
- **`vercel:react-best-practices`** — revue qualité après édition de plusieurs composants TSX (hooks, a11y, perf, types).
- **`vercel:performance-optimizer`** — Core Web Vitals, images, fonts, bundle (pour le lot SEO/perf).
- **`code-review`** — revue de diff (bugs + simplifications) avant de clore un lot.

---

## 7. SEO — checklist (pages publiques)

- `generateMetadata` (title unique, description, canonical, OpenGraph, Twitter) — modèle : `app/blog/[slug]/page.tsx`.
- `app/sitemap.ts`, `app/robots.ts` (bloquer `/admin`, `/connexion`), `app/manifest.ts`.
- `metadataBase` défini ; URLs OG absolues.
- JSON-LD : `Organization`/`NGO`, `Article`, `Event`, `BreadcrumbList`.
- Images optimisées, `alt` systématiques, hiérarchie de titres propre. Objectif Lighthouse ≥ 90.

---

## 8. Sécurité & garde-fous

- **`/admin` et `/connexion`** protégés par `proxy.ts` (ex-`middleware.ts`, rôle vérifié côté serveur). Ne pas exposer de données admin en public.
- Garder **`proxy.ts` et `lib/permissions.ts` synchronisés** (matrice de rôles unique). Matrice de référence :
  - **`admin`** : accès à tout l'espace admin.
  - **`editeur`** : contenu (blog, catégories, événements, fichiers, contacts, profil, équipe) + lecture limitée (dashboard).
  - **`membre`** : profil + équipe + lecture limitée (dashboard).
- Secrets via variables d'env (`NEXT_PUBLIC_API_URL`, DB, SMTP, JWT) — jamais commités.
- Ne pas activer `sync({ force/alter })` destructeur en production.
- Valider/limiter les uploads (type, taille) ; assainir les entrées des formulaires publics (contact, commentaires, don).

---

## 9. Definition of Done

Avant de considérer une tâche terminée :
1. Compile **sans** `typescript.ignoreBuildErrors` + `lint` propre.
2. **Responsive** (360→1440) et **accessible** (clavier + `aria`).
3. États chargement / vide / erreur gérés.
4. SEO OK si page publique (métadonnées).
5. Flux front↔back testé ; **Swagger à jour** si l'API change.
6. Case correspondante cochée dans **`plan.md`**.
7. **`walkthrough.md`** mis à jour.

---

## 10. Workflow attendu

1. Lire `plan.md` → identifier le lot/goal en cours.
2. Implémenter en respectant conventions + design system + skills.
3. Vérifier responsive + a11y + états + SEO.
4. Lancer `lint`/`build` ; passer `code-review` en fin de lot.
5. Cocher le goal dans `plan.md` et signaler ce qui reste.
6. **Commits** : A chaque fonctionnalité terminée. Messages en français, préfixés (`feat:`, `fix:`, `refactor:`…), sur la branche `dev` avec un commentaire pour le PR, pas de trace de Claude ni d'antropic dans les commentaires, les commits ni quoique ce soit.
