import { DataTypes } from "sequelize";
import db from "../database/db.js";
import { PLATEFORMES_PUSH } from "../utils/notification.constants.js";

// Dispositif mobile enregistré pour recevoir des notifications push (Expo).
const DispositifPush = db.define(
  "DispositifPush",
  {
    idDispositif: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Nullable : un visiteur non connecté peut recevoir des push (RDV, inscriptions).
    idUtilisateur: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
    // ExpoPushToken (ExponentPushToken[...]).
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    plateforme: {
      type: DataTypes.ENUM(...PLATEFORMES_PUSH),
      allowNull: false,
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "dispositifspush",
    timestamps: true,
  },
);

export default DispositifPush;
