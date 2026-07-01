import { DataTypes } from "sequelize";
import db from "../database/db.js";

const Don = db.define(
  "Don",
  {
    idDon: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    montant: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    devise: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "USD",
    },
    moyen: {
      type: DataTypes.ENUM("carte", "virement", "mobile"),
      allowNull: false,
      defaultValue: "mobile",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM("annonce", "confirme"),
      allowNull: false,
      defaultValue: "annonce",
    },
  },
  {
    tableName: "dons",
    timestamps: true,
  },
);

export default Don;
