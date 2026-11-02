import { DataTypes } from "sequelize";
import db from "../database/db.js";

const PhotoGalerie = db.define(
  "PhotoGalerie",
  {
    idPhoto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idGalerie: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "galeries",
        key: "idGalerie",
      },
      onDelete: "CASCADE",
    },
    chemin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    legende: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "photos_galerie",
    timestamps: true,
  },
);

export default PhotoGalerie;
