import { DataTypes } from "sequelize";
import db from "../database/db.js";

const ProfilPointage = db.define(
  "ProfilPointage",
  {
    idProfil: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomComplet: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    fonction: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM("systeme", "manuel"),
      allowNull: false,
      defaultValue: "manuel",
    },
    idUtilisateur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "profilsPointage",
    timestamps: true,
  },
);

export default ProfilPointage;
