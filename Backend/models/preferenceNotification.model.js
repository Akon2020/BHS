import { DataTypes } from "sequelize";
import db from "../database/db.js";
import { CATEGORIES_NOTIFICATION } from "../utils/notification.constants.js";

// Préférence d'activation par catégorie et par utilisateur.
const PreferenceNotification = db.define(
  "PreferenceNotification",
  {
    idPreference: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idUtilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
    categorie: {
      type: DataTypes.ENUM(...CATEGORIES_NOTIFICATION),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "preferencesnotification",
    timestamps: true,
    indexes: [{ unique: true, fields: ["idUtilisateur", "categorie"] }],
  },
);

export default PreferenceNotification;
