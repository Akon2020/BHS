import { DataTypes } from "sequelize";
import db from "../database/db.js";

const RendezVous = db.define(
  "RendezVous",
  {
    idRendezVous: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idCreneau: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "creneauxRdv",
        key: "idCreneau",
      },
    },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { isEmail: true },
    },
    telephone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Date/heure dénormalisées (permettent la reprogrammation indépendamment du créneau).
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
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM("en_attente", "approuve", "refuse", "reprogramme"),
      allowNull: false,
      defaultValue: "en_attente",
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "rendezVous",
    timestamps: true,
  },
);

export default RendezVous;
