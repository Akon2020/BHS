import { Utilisateur, Abonne, Evenement, Blog } from "../models/index.model.js";
import { getUserWithoutPassword } from "../utils/user.utils.js";

export const dashboard = async (_, res, next) => {
  try {
    const users = await Utilisateur.findAll({ order: [["createdAt", "DESC"]] });
    const abonnes = await Abonne.findAll({ order: [["dateAbonnement", "DESC"]] });
    const evenements = await Evenement.findAll({
      order: [["createdAt", "DESC"]],
    });
    const blogs = await Blog.findAll({ order: [["createdAt", "DESC"]] });

    return res.status(200).json({
      users: {
        nombre: users.length,
        data: users.slice(0, 5)
        .map(getUserWithoutPassword),
      },
      abonnes: {
        nombre: abonnes.length,
        data: abonnes.slice(0, 5),
      },
      evenements: {
        nombre: evenements.length,
        data: evenements.slice(0, 5),
      },
      blogs: {
        nombre: blogs.length,
        data: blogs.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
