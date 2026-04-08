import { DataTypes } from "sequelize";
import db from "../database/db.js";

const FicheIdentite = db.define(
  "FicheIdentite",
  {
    idFicheIdentite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pieceType: {
      type: DataTypes.ENUM(
        "carte d'électeur",
        "carte d'étudiant",
        "carte d'élève",
        "passeport",
        "carte de baptême",
      ),
      allowNull: false,
    },
    pieceNumero: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postnom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    naissance: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    sexe: {
      type: DataTypes.ENUM("Masculin", "Feminin"),
      allowNull: false,
    },
    etatCivil: {
      type: DataTypes.ENUM("Célibataire", "Marié(e)", "Veuf(ve)"),
      allowNull: false,
      defaultValue: "Célibataire",
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tel: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    paroisse: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    urgenceNom: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    urgenceLien: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    urgenceTelPrincipal: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    urgenceTelSecondaire: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    urgenceEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    allergiesHas: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    allergiesDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmptyIfEnabled(value) {
          if (this.allergiesHas && !value?.trim()) {
            throw new Error(
              "Les détails des allergies sont requis si le champ est activé.",
            );
          }
        },
      },
    },
    traitementHas: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    traitementDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmptyIfEnabled(value) {
          if (this.traitementHas && !value?.trim()) {
            throw new Error(
              "Les détails du traitement sont requis si le champ est activé.",
            );
          }
        },
      },
    },
    maladieHas: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    maladieDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmptyIfEnabled(value) {
          if (this.maladieHas && !value?.trim()) {
            throw new Error(
              "Les détails de la maladie sont requis si le champ est activé.",
            );
          }
        },
      },
    },
    regimeHas: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    regimeDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmptyIfEnabled(value) {
          if (this.regimeHas && !value?.trim()) {
            throw new Error(
              "Les détails du régime sont requis si le champ est activé.",
            );
          }
        },
      },
    },
    autres: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dateSoumission: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lu: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    approuve: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "fichesIdentite",
    timestamps: false,
  },
);

export default FicheIdentite;
