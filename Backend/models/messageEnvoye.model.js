import { DataTypes } from "sequelize";
import db from "../database/db.js";

const MessageEnvoye = db.define(
  "MessageEnvoye",
  {
    idMessage: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    destinataireEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    destinataireNom: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    sujet: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM("envoye", "echec"),
      allowNull: false,
      defaultValue: "envoye",
    },
    erreur: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    envoyePar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
  },
  {
    tableName: "messagesEnvoyes",
    timestamps: true,
  },
);

export default MessageEnvoye;
