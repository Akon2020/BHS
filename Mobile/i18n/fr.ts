/** Chaînes centralisées (FR uniquement). */
export const fr = {
  app: {
    name: "Burning Heart",
    tagline: "Pèlerins avec le Christ",
  },
  common: {
    retry: "Réessayer",
    loading: "Chargement…",
    error: "Une erreur est survenue.",
    offline: "Vous êtes hors ligne. Certaines données peuvent être datées.",
  },
  home: {
    welcome: "Bienvenue",
    testimonialsTitle: "Témoignages",
    testimonialsEmpty: "Aucun témoignage pour le moment.",
  },
  auth: {
    loginTitle: "Connexion",
    loginSubtitle: "Content de vous revoir 🙏",
    registerTitle: "Créer un compte",
    registerSubtitle: "Rejoignez la communauté Burning Heart",
    forgotTitle: "Mot de passe oublié",
    forgotSubtitle:
      "Entrez votre email : un lien de réinitialisation vous sera envoyé.",
    nomComplet: "Nom complet",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    sendLink: "Envoyer le lien",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Déjà un compte ?",
    forgot: "Mot de passe oublié ?",
    continueGuest: "Continuer sans compte",
    loginSuccess: "Connexion réussie",
    registerSuccess: "Compte créé, bienvenue !",
    resetSent: "Si un compte existe, un email a été envoyé.",
    invalidEmail: "Email invalide",
    passwordTooShort: "Au moins 6 caractères",
    required: "Ce champ est requis",
  },
  onboarding: {
    subtitle: "Pèlerins avec le Christ",
    points: [
      {
        title: "Vivez la communauté",
        body: "Événements, rendez-vous et ressources de l'apostolat, où que vous soyez.",
      },
      {
        title: "Nourrissez votre foi",
        body: "Échos de prière, pensée du jour et méditations, chaque jour à portée de main.",
      },
      {
        title: "Restez proche",
        body: "Rappels, actualités et suivi de vos demandes, en toute simplicité.",
      },
    ],
    start: "Commencer",
    haveAccount: "J'ai déjà un compte",
  },
} as const;
