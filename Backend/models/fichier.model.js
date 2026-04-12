import { DataTypes } from "sequelize";
import db from "../database/db.js";

const Fichier = db.define(
  "Fichier",
  {
    idFichier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomReference: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM("brouillon", "publie", "programme", "archive"),
      allowNull: false,
      defaultValue: "brouillon",
    },
    datePublication: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fichiers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    nombreFichiers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tailleTotale: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
  },
  {
    tableName: "fichiers",
    timestamps: true,
  },
);

export default Fichier;
