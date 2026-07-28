# Publication — Burning Heart (mobile)

> Checklist de mise en production sur l'App Store (iOS) et Google Play (Android).
> Les étapes marquées **(propriétaire)** nécessitent des comptes payants et des
> credentials qui ne peuvent pas être automatisés ici.

## 0. Prérequis (propriétaire)

- [ ] Compte **Apple Developer** (99 $/an) + accès à App Store Connect.
- [ ] Compte **Google Play Console** (25 $ une fois).
- [ ] Compte **Expo** (EAS) : `npx eas login`.
- [ ] Appareils physiques iOS + Android pour tester le build et les **notifications push**.

## 1. Configuration EAS

- [ ] `npx eas init` → renseigne automatiquement `extra.eas.projectId` dans `app.json`
      (remplace le placeholder `REMPLACER_PAR_EAS_INIT`). **Indispensable** pour les tokens push.
- [ ] `npx eas credentials` → générer/associer les certificats iOS (APNs) et la clé de
      signature Android (FCM configuré côté Expo pour Android).
- [ ] Renseigner `eas.json > submit.production` : `appleId`, `ascAppId`, `appleTeamId`,
      et `google-service-account.json` (clé de service Play Console, **non commitée**).

## 1 bis. Sentry (source maps)

Par défaut, l'upload des source maps est **désactivé pendant la build**
(`SENTRY_DISABLE_AUTO_UPLOAD=true` dans `eas.json`), sinon la tâche Gradle
`...SentryUpload` fait **échouer la build** faute d'organisation/token. Le reporting
Sentry runtime (via `EXPO_PUBLIC_SENTRY_DSN`) fonctionne quand même.

Pour **réactiver** l'upload (stack traces symboliquées dans Sentry) :

- [ ] Définir les secrets EAS : `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
      (`eas env:create ... --visibility sensitive`).
- [ ] Retirer `SENTRY_DISABLE_AUTO_UPLOAD` des profils `eas.json`.

## 2. Identité de l'app

- [ ] Vérifier `app.json` : `ios.bundleIdentifier` / `android.package` = `org.burningheartihs.mobile`.
- [ ] Icône (`assets/images/icon.png`) et splash conformes à la charte crimson.
- [ ] Version marketing `expo.version` (1.0.0) ; les numéros de build sont gérés par EAS
      (`appVersionSource: remote`).

## 3. Backend (rappel)

- [ ] **Redéployer le backend** : nouvelles routes push (`/api/dispositifs`, `/api/notifications`),
      `/api/pointages/pointer|:id/cloturer`, `/api/anniversaires/a-venir`, `/api/auth/compte`.
- [ ] Les tables `dispositifspush`, `notifications`, `preferencesnotification` sont créées
      automatiquement par `db.sync` (additif, non destructif).

## 4. Builds

- [ ] `eas build --profile preview --platform android` → APK de test interne.
- [ ] `eas build --profile production --platform android`
- [ ] `eas build --profile production --platform ios`
- [ ] Tester sur appareils : connexion, inscription, push (réception + tap → deep link),
      préférences de notification, suppression de compte.

## 5. Fiches stores

- [ ] Remplir les fiches à partir de [`store-listing-fr.md`](store-listing-fr.md).
- [ ] Captures d'écran (voir la checklist dans le même fichier).
- [ ] URL **politique de confidentialité** (hébergée publiquement — reprendre le texte de
      `Mobile/i18n/legal.ts`, à faire relire).
- [ ] Questionnaire **confidentialité des données** (Apple) / **Data safety** (Google) :
      compte (nom, email), identifiant d'appareil (push), diagnostics (Sentry) — aucune vente,
      aucune publicité.
- [ ] Déclarer la **suppression de compte** in-app (écran Profil) — exigée par Apple/Google.

## 6. Soumission (propriétaire)

- [ ] `eas submit --profile production --platform android`
- [ ] `eas submit --profile production --platform ios`
- [ ] Renseigner les informations de review (compte de test membre + éventuellement staff).

## 7. Après approbation

- [ ] Vérifier l'ouverture depuis une notification (deep link) en production.
- [ ] Surveiller Sentry (erreurs de démarrage, crashs).
