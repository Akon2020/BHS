import { DataTypes } from "sequelize";
import db from "../database/db.js";

const ReponseContact = db.define(
  "ReponseContact",
  {
    idReponseContact: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idContact: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "contacts",
        key: "idContact",
      },
    },
    sujetReponse: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    messageReponse: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    emailDestinataire: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reponsescontacts",
    timestamps: false,
  },
);

export default ReponseContact;