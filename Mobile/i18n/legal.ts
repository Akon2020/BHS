import type { LegalSection } from "@/components/features/legal/legal-screen";

// Modèle de textes légaux (français) — à faire relire par le responsable / un juriste
// avant publication. Contact et coordonnées à confirmer.
const CONTACT = "contact@burningheartihs.org";
const MAJ = "Dernière mise à jour : 27 juillet 2026";

export const confidentialite: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
} = {
  title: "Politique de confidentialité",
  updated: MAJ,
  intro:
    "Burning Heart – Pèlerins avec le Christ (« l'apostolat », « nous ») attache une grande importance à la protection de vos données personnelles. Cette politique explique quelles données l'application mobile collecte, pourquoi, et quels sont vos droits.",
  sections: [
    {
      heading: "1. Données que nous collectons",
      body: [
        "Données de compte : nom complet et adresse email, lorsque vous créez un compte ou vous connectez.",
        "Données d'usage liées à votre participation : inscriptions à des événements, demandes de rendez-vous, et — pour les membres de l'équipe — pointage du temps et tâches.",
        "Données techniques : un jeton de notification (token push) associé à votre appareil si vous activez les notifications, ainsi que des données de diagnostic anonymisées en cas d'erreur.",
      ],
    },
    {
      heading: "2. Finalités",
      body: [
        "Fournir les fonctionnalités de l'application (compte, contenus spirituels, événements, rendez-vous).",
        "Vous envoyer des notifications que vous avez choisi de recevoir (chaque catégorie est activable/désactivable).",
        "Assurer la sécurité, prévenir les abus et améliorer la stabilité de l'application.",
      ],
    },
    {
      heading: "3. Base légale",
      body: [
        "Le traitement repose sur l'exécution du service que vous demandez (votre compte et vos participations) et sur votre consentement pour les notifications push, que vous pouvez retirer à tout moment.",
      ],
    },
    {
      heading: "4. Notifications push",
      body: [
        "Si vous activez les notifications, un identifiant d'appareil est enregistré afin de vous adresser des messages. Vous pouvez désactiver chaque catégorie dans les préférences, ou couper entièrement les notifications depuis les réglages de votre téléphone.",
      ],
    },
    {
      heading: "5. Partage des données",
      body: [
        "Nous ne vendons jamais vos données. Elles peuvent être traitées par des prestataires strictement nécessaires au fonctionnement : hébergeur de l'API, service d'envoi d'emails, service de notifications push (Expo) et outil de diagnostic (Sentry).",
        "Aucune donnée n'est transmise à des fins publicitaires.",
      ],
    },
    {
      heading: "6. Conservation",
      body: [
        "Vos données sont conservées tant que votre compte est actif. Elles sont supprimées lorsque vous supprimez votre compte, sauf obligation légale de conservation.",
      ],
    },
    {
      heading: "7. Vos droits",
      body: [
        "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.",
        "La suppression de votre compte est disponible directement dans l'application (écran Profil) et efface vos données personnelles. Pour toute autre demande, contactez-nous.",
      ],
    },
    {
      heading: "8. Sécurité",
      body: [
        "Le jeton d'authentification est stocké dans le coffre sécurisé du système d'exploitation. Les échanges avec le serveur sont chiffrés (HTTPS).",
      ],
    },
    {
      heading: "9. Contact",
      body: [`Pour toute question relative à vos données : ${CONTACT}.`],
    },
    {
      heading: "10. Modifications",
      body: [
        "Cette politique peut être mise à jour. La date de dernière mise à jour figure en haut de cette page.",
      ],
    },
  ],
};

export const conditions: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
} = {
  title: "Conditions d'utilisation",
  updated: MAJ,
  intro:
    "En utilisant l'application Burning Heart – Pèlerins avec le Christ, vous acceptez les présentes conditions d'utilisation.",
  sections: [
    {
      heading: "1. Objet",
      body: [
        "L'application donne accès aux contenus et services de l'apostolat : contenus spirituels, événements, ressources, prise de rendez-vous, et outils de coordination pour les membres de l'équipe.",
      ],
    },
    {
      heading: "2. Compte",
      body: [
        "Vous êtes responsable de l'exactitude des informations fournies et de la confidentialité de vos identifiants. Prévenez-nous en cas d'utilisation non autorisée.",
      ],
    },
    {
      heading: "3. Usage acceptable",
      body: [
        "Vous vous engagez à utiliser l'application dans le respect des lois et de la vocation spirituelle de l'apostolat, sans propos injurieux, illégaux ou portant atteinte à autrui.",
        "Les commentaires publiés sont soumis à modération avant publication.",
      ],
    },
    {
      heading: "4. Propriété intellectuelle",
      body: [
        "Les contenus (textes, images, ressources) restent la propriété de l'apostolat ou de leurs auteurs et ne peuvent être réutilisés sans autorisation.",
      ],
    },
    {
      heading: "5. Dons",
      body: [
        "Les dons éventuels s'effectuent via le site web et les moyens indiqués par l'apostolat. L'application ne traite pas de paiement.",
      ],
    },
    {
      heading: "6. Disponibilité et responsabilité",
      body: [
        "L'application est fournie « en l'état ». Nous nous efforçons d'assurer sa disponibilité mais ne pouvons garantir une absence totale d'interruption ou d'erreur.",
      ],
    },
    {
      heading: "7. Résiliation",
      body: [
        "Vous pouvez cesser d'utiliser l'application et supprimer votre compte à tout moment depuis l'écran Profil.",
      ],
    },
    {
      heading: "8. Droit applicable",
      body: [
        "Les présentes conditions sont régies par le droit applicable en République Démocratique du Congo, sauf disposition impérative contraire.",
      ],
    },
    {
      heading: "9. Contact",
      body: [`Pour toute question : ${CONTACT}.`],
    },
  ],
};
