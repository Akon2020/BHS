import { Router } from "express";
import {
  getProfils,
  createProfil,
  updateProfil,
  deleteProfil,
  getPointages,
  createPointage,
  updatePointage,
  deletePointage,
  getStats,
  exportPdf,
} from "../controllers/pointage.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Pointage
 *   description: Gestion du temps passé au bureau (profils, présences, statistiques, export PDF)
 */

const pointageRouter = Router();

// Accès réservé aux rôles admin et editeur.
pointageRouter.use(authenticationJWT, authorizeRoles("admin", "editeur"));

/**
 * @swagger
 * /api/pointages/profils:
 *   get:
 *     summary: Lister les profils de pointage
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des profils }
 *   post:
 *     summary: Créer un profil (manuel ou depuis un utilisateur système)
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Profil créé }
 */
pointageRouter.get("/profils", getProfils);
pointageRouter.post("/profils", createProfil);

/**
 * @swagger
 * /api/pointages/profils/{id}:
 *   put:
 *     summary: Mettre à jour un profil
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Profil mis à jour }
 *   delete:
 *     summary: Supprimer un profil (et ses pointages)
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Profil supprimé }
 */
pointageRouter.put("/profils/:id", updateProfil);
pointageRouter.delete("/profils/:id", deleteProfil);

/**
 * @swagger
 * /api/pointages/stats:
 *   get:
 *     summary: Statistiques de pointage (filtre hebdo/mensuel/annuel)
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema: { type: string, enum: [hebdo, mensuel, annuel] }
 *     responses:
 *       200: { description: Statistiques calculées }
 */
pointageRouter.get("/stats", getStats);

/**
 * @swagger
 * /api/pointages/export:
 *   get:
 *     summary: Exporter le pointage en PDF (global ou individuel)
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema: { type: string, enum: [hebdo, mensuel, annuel] }
 *       - in: query
 *         name: scope
 *         schema: { type: string, enum: [global, individuel] }
 *       - in: query
 *         name: idProfil
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Fichier PDF }
 */
pointageRouter.get("/export", exportPdf);

/**
 * @swagger
 * /api/pointages:
 *   get:
 *     summary: Lister les pointages (filtres profil/période/dates)
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des pointages }
 *   post:
 *     summary: Enregistrer une présence (saisie manuelle)
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idProfil, date, heureDebut]
 *             properties:
 *               idProfil: { type: integer }
 *               date: { type: string, format: date }
 *               heureDebut: { type: string, example: "08:00" }
 *               heureFin: { type: string, example: "12:00" }
 *               note: { type: string }
 *     responses:
 *       201: { description: Pointage enregistré }
 */
pointageRouter.get("/", getPointages);
pointageRouter.post("/", createPointage);

/**
 * @swagger
 * /api/pointages/{id}:
 *   put:
 *     summary: Mettre à jour un pointage (clôture a posteriori possible)
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Pointage mis à jour }
 *   delete:
 *     summary: Supprimer un pointage
 *     tags: [Pointage]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: Pointage supprimé }
 */
pointageRouter.put("/:id", updatePointage);
pointageRouter.delete("/:id", deletePointage);

export default pointageRouter;
