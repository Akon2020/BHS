import { Op } from "sequelize";
import {
  Blog,
  Evenement,
  Fichier,
  Categorie,
} from "../models/index.model.js";

const LIMIT = 8;

// Recherche globale publique : blogs publiés, événements publiés, fichiers publics.
export const rechercheGlobale = async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();

    if (q.length < 2) {
      return res.status(200).json({
        query: q,
        total: 0,
        blogs: [],
        evenements: [],
        fichiers: [],
      });
    }

    const like = { [Op.like]: `%${q}%` };

    const [blogs, evenements, fichiers] = await Promise.all([
      Blog.findAll({
        where: {
          statut: "publie",
          [Op.or]: [{ titre: like }, { extrait: like }, { tags: like }],
        },
        attributes: ["idBlog", "titre", "slug", "extrait", "imageUne"],
        limit: LIMIT,
        order: [["createdAt", "DESC"]],
      }),
      Evenement.findAll({
        where: {
          statut: "publie",
          [Op.or]: [{ titre: like }, { description: like }, { lieu: like }],
        },
        attributes: [
          "idEvenement",
          "titre",
          "slug",
          "lieu",
          "dateEvenement",
          "imageEvenement",
        ],
        limit: LIMIT,
        order: [["dateEvenement", "DESC"]],
      }),
      Fichier.findAll({
        where: {
          statut: "publie",
          [Op.or]: [{ nomReference: like }, { description: like }],
        },
        attributes: ["idFichier", "nomReference", "slug", "description"],
        include: [
          {
            model: Categorie,
            as: "categorie",
            attributes: ["nomCategorie"],
          },
        ],
        limit: LIMIT,
        order: [["createdAt", "DESC"]],
      }),
    ]);

    const total = blogs.length + evenements.length + fichiers.length;

    return res.status(200).json({
      query: q,
      total,
      blogs,
      evenements,
      fichiers,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche globale :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
