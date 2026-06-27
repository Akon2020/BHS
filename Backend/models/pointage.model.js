import { DataTypes } from "sequelize";
import db from "../database/db.js";

const toMinutes = (time) => {
  if (!time) return null;
  const [h, m] = String(time).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const Pointage = db.define(
  "Pointage",
  {
    idPointage: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idProfil: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "profilsPointage",
        key: "idProfil",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    heureDebut: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    heureFin: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    // Durée en minutes, calculée uniquement pour les sessions complétées (début + fin).
    dureeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "pointages",
    timestamps: true,
    hooks: {
      beforeSave: (pointage) => {
        const debut = toMinutes(pointage.heureDebut);
        const fin = toMinutes(pointage.heureFin);
        // Session simple (sans heure de fin) → durée non comptée.
        pointage.dureeMinutes =
          debut !== null && fin !== null && fin > debut ? fin - debut : null;
      },
    },
  },
);

export default Pointage;
