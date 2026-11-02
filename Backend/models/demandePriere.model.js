import { DataTypes } from "sequelize";
import db from "../database/db.js";

// Table de prière : demandes déposées par les visiteurs (ou intentions
// ajoutées par l'équipe), planifiées par l'admin à une date de prière.
const DemandePriere = db.define(
  "DemandePriere",
  {
    idDemandePriere: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    intention: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Texte original déposé (jamais affiché si partagePublic = false)",
    },
    intentionPublique: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Reformulation éventuelle par l'équipe pour l'affichage public",
    },
    partagePublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Accord du demandeur pour afficher son intention sur le site",
    },
    statut: {
      type: DataTypes.ENUM("nouvelle", "validee", "archivee"),
      allowNull: false,
      defaultValue: "nouvelle",
    },
    datePriere: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM("visiteur", "equipe"),
      allowNull: false,
      defaultValue: "visiteur",
    },
    traitePar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
  },
  {
    tableName: "demandes_priere",
    timestamps: true,
  },
);

export default DemandePriere;
