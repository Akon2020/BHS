import { DataTypes } from "sequelize";
import db from "../database/db.js";

const CreneauRdv = db.define(
  "CreneauRdv",
  {
    idCreneau: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    heureDebut: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    heureFin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    capacite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "creneauxRdv",
    timestamps: true,
  },
);

export default CreneauRdv;
