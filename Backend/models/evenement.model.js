import { DataTypes } from "sequelize";
import db from "../database/db.js";

const Evenement = db.define(
  "Evenement",
  {
    idEvenement: {
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
      allowNull: false,
    },
    dateEvenement: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    heureDebut: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    heureFin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    lieu: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombrePlaces: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nombreInscrits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imageEvenement: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM("brouillon", "publie", "annule", "termine"),
      defaultValue: "brouillon",
    },
    estPayant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    montant: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: "Montant d'inscription si l'événement est payant",
    },
    devise: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "USD",
    },
    champsPersonnalises: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment:
        "Config des champs additionnels : [{ id, type, label, requis, options? }]",
      // Certains drivers renvoient la colonne JSON comme chaîne : on garantit un tableau.
      get() {
        const v = this.getDataValue("champsPersonnalises");
        if (Array.isArray(v)) return v;
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return v ?? [];
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "evenements",
    timestamps: true,
  },
);

export default Evenement;
