import { Router } from "express";
import {
  getParametreAgenda,
  updateParametreAgenda,
  getCreneaux,
  getCreneauxDisponibles,
  createCreneau,
  updateCreneau,
  deleteCreneau,
  reserverRdv,
  getRendezVous,
  suiviRdv,
  updateStatutRdv,
  deleteRdv,
} from "../controllers/agenda.controller.js";
import {
  authenticationJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Agenda
 *   description: Agenda et rendez-vous avec le Père Coordinateur
 */

const agendaRouter = Router();
const admin = [authenticationJWT, authorizeRoles("admin", "editeur")];

/**
 * @swagger
 * /api/agenda/parametre:
 *   get:
 *     summary: Paramètres publics de l'agenda (coordinateur)
 *     tags: [Agenda]
 *     responses:
 *       200: { description: Paramètres }
 */
agendaRouter.get("/parametre", getParametreAgenda);
agendaRouter.put("/parametre", ...admin, updateParametreAgenda);

/**
 * @swagger
 * /api/agenda/creneaux/disponibles:
 *   get:
 *     summary: Créneaux disponibles (public)
 *     tags: [Agenda]
 *     responses:
 *       200: { description: Liste des créneaux disponibles }
 */
agendaRouter.get("/creneaux/disponibles", getCreneauxDisponibles);
agendaRouter.get("/creneaux", ...admin, getCreneaux);
agendaRouter.post("/creneaux", ...admin, createCreneau);
agendaRouter.put("/creneaux/:id", ...admin, updateCreneau);
agendaRouter.delete("/creneaux/:id", ...admin, deleteCreneau);

/**
 * @swagger
 * /api/agenda/rendez-vous:
 *   post:
 *     summary: Réserver un créneau (public)
 *     tags: [Agenda]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idCreneau, nom, email, telephone]
 *             properties:
 *               idCreneau: { type: integer }
 *               nom: { type: string }
 *               email: { type: string, format: email }
 *               telephone: { type: string }
 *               motif: { type: string }
 *     responses:
 *       201: { description: Demande enregistrée }
 *   get:
 *     summary: Lister les rendez-vous (admin)
 *     tags: [Agenda]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des RDV }
 */
agendaRouter.post("/rendez-vous", reserverRdv);
agendaRouter.get("/rendez-vous/suivi", suiviRdv);
agendaRouter.get("/rendez-vous", ...admin, getRendezVous);

/**
 * @swagger
 * /api/agenda/rendez-vous/{id}:
 *   patch:
 *     summary: Mettre à jour le statut d'un RDV (approuver/refuser/reprogrammer)
 *     tags: [Agenda]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: RDV mis à jour }
 *   delete:
 *     summary: Supprimer un RDV (admin)
 *     tags: [Agenda]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: RDV supprimé }
 */
agendaRouter.patch("/rendez-vous/:id", ...admin, updateStatutRdv);
agendaRouter.delete("/rendez-vous/:id", ...admin, deleteRdv);

export default agendaRouter;
