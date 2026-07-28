import { DataTypes } from "sequelize";
import db from "../database/db.js";

// Entrée de calendrier saisie manuellement (rappel, note, RDV interne, etc.).
const EntreeCalendrier = db.define(
  "EntreeCalendrier",
  {
    idEntree: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    heureDebut: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    heureFin: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    lieu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    journeeEntiere: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
  },
  {
    tableName: "entreescalendrier",
    timestamps: true,
  },
);

export default EntreeCalendrier;
