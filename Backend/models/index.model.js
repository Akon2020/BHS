import db from "../database/db.js";
import { DataTypes } from "sequelize";
import Utilisateur from "./utilisateur.model.js";
import Categorie from "./categorie.model.js";
import Blog from "./blog.model.js";
import Newsletter from "./newsletter.model.js";
import Evenement from "./evenement.model.js";
import Equipe from "./equipe.model.js";
import Abonne from "./abonne.model.js";
import Contact from "./contact.model.js";
import ReponseContact from "./reponseContact.model.js";
import FicheIdentite from "./ficheIdentite.model.js";
import InscriptionEvenement from "./inscriptionEvenement.model.js";
import NewsletterAbonne from "./newsletterAbonne.model.js";
import Commentaire from "./commentaire.model.js";
import Fichier from "./fichier.model.js";
import MessageEnvoye from "./messageEnvoye.model.js";
import ProfilPointage from "./profilPointage.model.js";
import Pointage from "./pointage.model.js";
import Temoignage from "./temoignage.model.js";
import Don from "./don.model.js";
import CreneauRdv from "./creneauRdv.model.js";
import RendezVous from "./rendezVous.model.js";
import ParametreAgenda from "./parametreAgenda.model.js";

// Blog associations
Blog.belongsTo(Utilisateur, { foreignKey: "idAuteur", as: "auteur" });
Utilisateur.hasMany(Blog, { foreignKey: "idAuteur", as: "blogs" });

Blog.belongsTo(Categorie, { foreignKey: "idCategorie", as: "categorie" });
Categorie.hasMany(Blog, { foreignKey: "idCategorie", as: "blogs" });

// Commentaire-Blog associations
Commentaire.belongsTo(Blog, {
  foreignKey: "idBlog",
  as: "blog",
  onDelete: "CASCADE",
  hooks: true,
});
Blog.hasMany(Commentaire, {
  foreignKey: "idBlog",
  as: "commentaires",
  onDelete: "CASCADE",
  hooks: true,
});

// Commentaire-Utilisateur associations (pour les utilisateurs connectés)
Commentaire.belongsTo(Utilisateur, {
  foreignKey: "idUtilisateur",
  as: "utilisateur",
});
Utilisateur.hasMany(Commentaire, {
  foreignKey: "idUtilisateur",
  as: "commentaires",
});

// Commentaire-Commentaire associations (pour les réponses)
Commentaire.belongsTo(Commentaire, {
  foreignKey: "idCommentaireParent",
  as: "commentaireParent",
});
Commentaire.hasMany(Commentaire, {
  foreignKey: "idCommentaireParent",
  as: "reponses",
});

// Modération des commentaires
Commentaire.belongsTo(Utilisateur, {
  foreignKey: "modereBy",
  as: "moderateur",
});
Utilisateur.hasMany(Commentaire, {
  foreignKey: "modereBy",
  as: "commentairesModeres",
});

// Newsletter associations
Newsletter.belongsTo(Utilisateur, { foreignKey: "writedBy", as: "redacteur" });
Utilisateur.hasMany(Newsletter, { foreignKey: "writedBy", as: "newsletters" });

// Événement associations
Evenement.belongsTo(Utilisateur, { foreignKey: "createdBy", as: "createur" });
Utilisateur.hasMany(Evenement, { foreignKey: "createdBy", as: "evenements" });

// Fichier associations
Fichier.belongsTo(Utilisateur, { foreignKey: "createdBy", as: "createur" });
Utilisateur.hasMany(Fichier, { foreignKey: "createdBy", as: "fichiers" });
Fichier.belongsTo(Categorie, { foreignKey: "idCategorie", as: "categorie" });
Categorie.hasMany(Fichier, { foreignKey: "idCategorie", as: "fichiers" });

// Inscription événement associations
InscriptionEvenement.belongsTo(Evenement, {
  foreignKey: "idEvenement",
  as: "evenement",
});
Evenement.hasMany(InscriptionEvenement, {
  foreignKey: "idEvenement",
  as: "inscriptions",
});

InscriptionEvenement.belongsTo(Utilisateur, {
  foreignKey: "idUtilisateur",
  as: "utilisateur",
});
Utilisateur.hasMany(InscriptionEvenement, {
  foreignKey: "idUtilisateur",
  as: "inscriptions",
});

// Newsletter-Abonné associations (Many-to-Many)
Newsletter.belongsToMany(Abonne, {
  through: NewsletterAbonne,
  foreignKey: "idNewsletter",
  otherKey: "idAbonne",
  as: "abonnes",
});
Abonne.belongsToMany(Newsletter, {
  through: NewsletterAbonne,
  foreignKey: "idAbonne",
  otherKey: "idNewsletter",
  as: "newsletters",
});

// Associations directes pour les statistiques
NewsletterAbonne.belongsTo(Newsletter, {
  foreignKey: "idNewsletter",
  as: "newsletter",
});
Newsletter.hasMany(NewsletterAbonne, {
  foreignKey: "idNewsletter",
  as: "envois",
});

NewsletterAbonne.belongsTo(Abonne, { foreignKey: "idAbonne", as: "abonne" });
Abonne.hasMany(NewsletterAbonne, { foreignKey: "idAbonne", as: "receptions" });

// Message envoyé (boîte d'envoi admin) associations
MessageEnvoye.belongsTo(Utilisateur, {
  foreignKey: "envoyePar",
  as: "expediteur",
});
Utilisateur.hasMany(MessageEnvoye, {
  foreignKey: "envoyePar",
  as: "messagesEnvoyes",
});

// Pointage associations
ProfilPointage.belongsTo(Utilisateur, {
  foreignKey: "idUtilisateur",
  as: "utilisateur",
});
Utilisateur.hasMany(ProfilPointage, {
  foreignKey: "idUtilisateur",
  as: "profilsPointage",
});

Pointage.belongsTo(ProfilPointage, {
  foreignKey: "idProfil",
  as: "profil",
  onDelete: "CASCADE",
  hooks: true,
});
ProfilPointage.hasMany(Pointage, {
  foreignKey: "idProfil",
  as: "pointages",
  onDelete: "CASCADE",
  hooks: true,
});

Pointage.belongsTo(Utilisateur, {
  foreignKey: "createdBy",
  as: "createur",
});

// Témoignage associations
Temoignage.belongsTo(Utilisateur, {
  foreignKey: "createdBy",
  as: "createur",
});

// Agenda / RDV associations
RendezVous.belongsTo(CreneauRdv, {
  foreignKey: "idCreneau",
  as: "creneau",
});
CreneauRdv.hasMany(RendezVous, {
  foreignKey: "idCreneau",
  as: "rendezVous",
});

// Contact-Réponse associations
ReponseContact.belongsTo(Contact, {
  foreignKey: "idContact",
  as: "contact",
  onDelete: "CASCADE",
  hooks: true,
});
Contact.hasMany(ReponseContact, {
  foreignKey: "idContact",
  as: "reponses",
  onDelete: "CASCADE",
  hooks: true,
});

// Synchronisation des modèles
const syncModels = async () => {
  try {
    await db.sync({ alter: false });

    // Backfill du schéma fichiers pour les bases déjà existantes
    const queryInterface = db.getQueryInterface();
    const fichiersTable = await queryInterface
      .describeTable("fichiers")
      .catch(() => null);

    if (fichiersTable) {
      if (!fichiersTable.idCategorie) {
        await queryInterface.addColumn("fichiers", "idCategorie", {
          type: DataTypes.INTEGER,
          allowNull: true,
        });
      }

      if (!fichiersTable.modeAcces) {
        await queryInterface.addColumn("fichiers", "modeAcces", {
          type: DataTypes.ENUM("lecture", "telechargement"),
          allowNull: false,
          defaultValue: "telechargement",
        });
      }
    }

    // Ajoute une colonne uniquement si elle est absente (non destructif).
    const addColumnIfMissing = async (table, column, definition) => {
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (desc && !desc[column]) {
        await queryInterface.addColumn(table, column, definition);
      }
    };

    // Backfill événements — paiement + champs personnalisés (Lot 3.7).
    await addColumnIfMissing("evenements", "estPayant", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await addColumnIfMissing("evenements", "montant", {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    });
    await addColumnIfMissing("evenements", "devise", {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "USD",
    });
    await addColumnIfMissing("evenements", "champsPersonnalises", {
      type: DataTypes.JSON,
      allowNull: true,
    });

    // Backfill inscriptions — statut de paiement + réponses personnalisées.
    await addColumnIfMissing("inscriptionsevenements", "statutPaiement", {
      type: DataTypes.ENUM("non_paye", "partiel", "paye", "accepte_non_paye"),
      allowNull: false,
      defaultValue: "paye",
    });
    await addColumnIfMissing("inscriptionsevenements", "montantPaye", {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await addColumnIfMissing("inscriptionsevenements", "reponsesPersonnalisees", {
      type: DataTypes.JSON,
      allowNull: true,
    });

    console.log("Modèles synchronisés avec succès");
  } catch (error) {
    console.error("Erreur lors de la synchronisation des modèles:", error);
    throw error;
  }
};

export {
  Utilisateur,
  Categorie,
  Blog,
  Newsletter,
  Evenement,
  Equipe,
  Abonne,
  Contact,
  ReponseContact,
  FicheIdentite,
  InscriptionEvenement,
  NewsletterAbonne,
  Commentaire,
  Fichier,
  MessageEnvoye,
  ProfilPointage,
  Pointage,
  Temoignage,
  Don,
  CreneauRdv,
  RendezVous,
  ParametreAgenda,
  syncModels,
};
