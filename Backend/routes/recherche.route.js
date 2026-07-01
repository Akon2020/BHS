import { Router } from "express";
import { rechercheGlobale } from "../controllers/recherche.controller.js";

/**
 * @swagger
 * tags:
 *   name: Recherche
 *   description: Recherche globale publique (blogs, événements, fichiers)
 */

const rechercheRouter = Router();

/**
 * @swagger
 * /api/recherche:
 *   get:
 *     summary: Recherche globale (blogs publiés, événements publiés, fichiers publics)
 *     tags: [Recherche]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Terme de recherche (min. 2 caractères)
 *     responses:
 *       200:
 *         description: Résultats groupés (blogs, evenements, fichiers)
 */
rechercheRouter.get("/", rechercheGlobale);

export default rechercheRouter;
