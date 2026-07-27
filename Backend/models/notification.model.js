import { DataTypes } from "sequelize";
import db from "../database/db.js";
import { CATEGORIES_NOTIFICATION } from "../utils/notification.constants.js";

// Notification persistée pour le centre in-app (en plus du push éventuel).
const Notification = db.define(
  "Notification",
  {
    idNotification: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idUtilisateur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    corps: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    categorie: {
      type: DataTypes.ENUM(...CATEGORIES_NOTIFICATION),
      allowNull: false,
    },
    // Données de navigation (deep link), ex. { type: 'rendezvous', id: 12 }.
    donnees: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    lu: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  },
);

export default Notification;
