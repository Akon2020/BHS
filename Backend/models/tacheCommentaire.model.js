import { DataTypes } from "sequelize";
import db from "../database/db.js";

const TacheCommentaire = db.define(
  "TacheCommentaire",
  {
    idCommentaireTache: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idTache: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "taches",
        key: "idTache",
      },
    },
    idUtilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "tachecommentaires",
    timestamps: true,
  },
);

export default TacheCommentaire;
