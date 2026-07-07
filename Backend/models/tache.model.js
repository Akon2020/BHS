import { DataTypes } from "sequelize";
import db from "../database/db.js";

const Tache = db.define(
  "Tache",
  {
    idTache: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM("a_faire", "en_cours", "fait"),
      allowNull: false,
      defaultValue: "a_faire",
    },
    priorite: {
      type: DataTypes.ENUM("basse", "normale", "haute"),
      allowNull: false,
      defaultValue: "normale",
    },
    echeance: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    recurrence: {
      type: DataTypes.ENUM("aucune", "quotidien", "hebdo", "mensuel"),
      allowNull: false,
      defaultValue: "aucune",
    },
    // Liste d'identifiants d'utilisateurs (staff) assignés à la tâche.
    assignes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Tableau d'idUtilisateur assignés à la tâche",
      // La colonne JSON peut revenir sous forme de chaîne selon le driver.
      get() {
        const v = this.getDataValue("assignes");
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
    // Nombre de jours avant l'échéance pour déclencher un rappel (0 = jour J uniquement).
    rappelJoursAvant: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    // Dernière date (AAAA-MM-JJ) où un rappel a été envoyé — évite les doublons.
    dernierRappel: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utilisateurs",
        key: "idUtilisateur",
      },
    },
  },
  {
    tableName: "taches",
    timestamps: true,
  },
);

export default Tache;
