import { DataTypes } from "sequelize";
import db from "../database/db.js";

const Anniversaire = db.define(
  "Anniversaire",
  {
    idAnniversaire: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    jour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 31 },
    },
    mois: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    annee: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Nombre de jours avant la date pour le rappel des admins.
    delaiRappelJours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "anniversaires",
    timestamps: true,
  },
);

export default Anniversaire;
