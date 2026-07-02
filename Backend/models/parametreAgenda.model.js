import { DataTypes } from "sequelize";
import db from "../database/db.js";

// Paramètres de l'agenda (singleton, id = 1) : coordinateur unique configurable.
const ParametreAgenda = db.define(
  "ParametreAgenda",
  {
    idParametre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coordinateurNom: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "Père Coordinateur",
    },
    coordinateurFonction: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Message d'introduction affiché sur la page publique de RDV",
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "parametresAgenda",
    timestamps: true,
  },
);

export default ParametreAgenda;
