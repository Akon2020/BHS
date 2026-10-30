# 🚀 Guide de mise en production — Burning Heart

> Architecture cible :
>
> | Brique | URL | Rôle |
> |---|---|---|
> | Frontend (Next.js 16) | `https://burningheartihs.org` | Site public + back-office `/admin` |
> | Backend (Express 5) | `https://api.burningheartihs.org` | API `/api/*`, fichiers `/uploads`, doc `/api-docs` |
> | Mobile (Expo) | stores | consomme l'API en `Bearer` |
> | MySQL | serveur | base `burningh_burning` |

---

## 1. Comment fonctionne la connexion (à comprendre une fois)

1. Le formulaire `/connexion` appelle `POST https://api.burningheartihs.org/api/auth/login`.
2. L'API répond et pose un cookie **httpOnly** `token`.
3. Le front fait `router.push("/admin")`. Avant d'afficher la page, **`Frontend/proxy.ts`** (côté serveur Next.js, sur `burningheartihs.org`) lit ce cookie et vérifie le rôle via `GET /api/auth/profile`.

⚠️ L'API et le front sont sur **deux hôtes différents**. Un cookie posé par `api.burningheartihs.org` **sans `Domain`** n'est envoyé qu'à `api.…` : le proxy ne le voit pas et vous renvoie sur `/connexion` alors que la connexion a réussi.
➡️ C'est pour cela que le cookie doit être posé avec **`Domain=.burningheartihs.org`** (variable `COOKIE_DOMAIN`). C'était la cause du bug « je reste sur la page de connexion ».

> En local tout fonctionnait car `localhost:3000` et `localhost:5500` partagent les cookies (les cookies ignorent le port).

---

## 2. Backend (`Backend/`)

### 2.1 Variables d'environnement

Créer **`Backend/.env.production.local`** sur le serveur (modèle : `Backend/.env.example`) :

```dotenv
NODE_ENV="production"
PORT=5500
DB_HOST=localhost
DB_USER=...
DB_PASS=...
DB_NAME=...
JWT_SECRET=...            # longue chaîne aléatoire, différente du dev
JWT_EXPIRES_IN="1d"
EMAIL_HOST=mail.burningheartihs.org
EMAIL=no-reply@burningheartihs.org
EMAIL_PASSWORD=...
CONTACT_EMAIL=contact@burningheartihs.org
HOST_URL="https://api.burningheartihs.org"
FRONT_URL="https://burningheartihs.org"
COOKIE_DOMAIN=".burningheartihs.org"   # ← INDISPENSABLE (voir §1)
DEFAULT_PASSWD=...
```

- `config/env.js` charge `.env.${NODE_ENV}.local` → `npm start` force `NODE_ENV=production`, donc c'est **bien `.env.production.local`** qui est lu.
- Si `COOKIE_DOMAIN` est oublié, le backend le déduit désormais de `FRONT_URL` en production (`https://burningheartihs.org` → `.burningheartihs.org`). Le définir explicitement reste recommandé.
- Le front doit être en **HTTPS** : en production le cookie est `Secure`, il est ignoré sur une page en `http://`.

### 2.2 Installation & lancement

```bash
cd Backend
npm ci --omit=dev
npm start
```

Sur cPanel (« Setup Node.js App ») : *Application root* = `Backend`, *Startup file* = `app.js`, *Mode* = Production, puis **Run NPM Install** et **Restart**. Vérifier que le dossier `uploads/` existe et est inscriptible.

### 2.3 CORS

Les origines autorisées sont codées dans `Backend/app.js` (`https://burningheartihs.org`, `https://api.burningheartihs.org`, localhost). Si le site est aussi servi sur **`https://www.burningheartihs.org`**, ajouter cette origine **ou** rediriger `www` → domaine nu (recommandé).

### 2.4 Contrôle

- `https://api.burningheartihs.org/` → JSON « Checking BurningHeart API ».
- `https://api.burningheartihs.org/api-docs/` → Swagger.

---

## 3. Frontend (`Frontend/`)

### 3.1 Variables d'environnement

| Fichier | Utilisé par | Contenu |
|---|---|---|
| `.env` | `npm run dev` | `NEXT_PUBLIC_API_URL="http://localhost:5500"` |
| `.env.production` | `npm run build` / `npm start` | `NEXT_PUBLIC_API_URL="https://api.burningheartihs.org"` |

⚠️ `NEXT_PUBLIC_API_URL` est **figée au moment du `build`** (dans le navigateur **et** dans `proxy.ts`). Plus besoin de commenter/décommenter `.env` : `next build` lit automatiquement `.env.production`. Après tout changement d'URL → **rebuild**.

### 3.2 Build & lancement

```bash
cd Frontend
npm ci
npm run build
npm start
```

- Le site **doit tourner avec un serveur Node** (`next start`) : `proxy.ts` (protection de `/admin`) ne fonctionne pas en export statique.
- Si vous buildez en local puis envoyez sur le serveur, envoyer : `.next/`, `public/`, `package.json`, `package-lock.json`, `next.config.mjs`, `.env.production`, puis `npm ci --omit=dev` et `npm start` sur le serveur.

---

## 4. Mobile (`Mobile/`)

Aucune action liée au cookie : l'app envoie le jeton en `Authorization: Bearer`. L'URL d'API vient de `eas.json` (`EXPO_PUBLIC_API_URL=https://api.burningheartihs.org` pour tous les profils).

```bash
cd Mobile
eas build --profile production --platform all
```

---

## 5. Checklist après déploiement

1. Ouvrir `https://burningheartihs.org/connexion` en **navigation privée** (évite les anciens cookies).
2. Se connecter → on doit arriver sur **`/admin`**.
3. DevTools → *Application* → *Cookies* : le cookie `token` doit avoir **Domain = `.burningheartihs.org`**, `HttpOnly`, `Secure`, `SameSite=Lax`.
4. Rafraîchir `/admin/blog` (F5) → on reste connecté.
5. Se déconnecter → accéder à `/admin` renvoie bien vers `/connexion`.
6. Tester l'app mobile (connexion + une action authentifiée).

### Dépannage

| Symptôme | Cause probable | Correctif |
|---|---|---|
| Connexion réussie mais retour sur `/connexion` | cookie sans `Domain` partagé | `COOKIE_DOMAIN=".burningheartihs.org"` + redémarrer l'API, puis se reconnecter |
| Cookie absent après login | site ouvert en `http://` | forcer HTTPS sur le front |
| Erreur CORS dans la console | origine non listée (ex. `www.`) | ajouter l'origine dans `Backend/app.js` ou rediriger `www` |
| Login appelle `localhost:5500` | build fait avec la mauvaise URL | vérifier `.env.production` puis **rebuild** |
| `/admin` renvoie toujours vers `/connexion` alors que le cookie est bon | le serveur Next n'atteint pas l'API (DNS/pare-feu sortant) | depuis le serveur front : `curl https://api.burningheartihs.org/` |
| Encore bloqué après correctif | ancien cookie restant | supprimer les cookies du site, ou navigation privée |
