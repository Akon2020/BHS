import { DataTypes } from "sequelize";
import db from "../database/db.js";

const Temoignage = db.define(
  "Temoignage",
  {
    idTemoignage: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    auteur: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    fonction: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "Rôle ou ancienneté, ex. « Membre depuis 2018 »",
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM("brouillon", "publie"),
      allowNull: false,
      defaultValue: "brouillon",
    },
    ordre: {
      type: DataTypes.INTEGER,
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
    tableName: "temoignages",
    timestamps: true,
  },
);

export default Temoignage;
