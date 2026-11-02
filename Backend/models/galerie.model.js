import { DataTypes } from "sequelize";
import db from "../database/db.js";

// Galerie : un album par activité (photos + texte descriptif).
const Galerie = db.define(
  "Galerie",
  {
    idGalerie: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dateActivite: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    lieu: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    imageCouverture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM("brouillon", "publie"),
      allowNull: false,
      defaultValue: "brouillon",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
  },
  {
    tableName: "galeries",
    timestamps: true,
  },
);

export default Galerie;
