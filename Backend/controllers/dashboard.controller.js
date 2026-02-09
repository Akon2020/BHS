import {
  Utilisateur,
  Abonne,
  Evenement,
  Blog,
  Categorie,
} from "../models/index.model.js";
import { getUserWithoutPassword } from "../utils/user.utils.js";
import {
  calculateMonthlyStat,
  getMonthlyDateRange,
} from "../utils/stats.utils.js";
import { Op } from "sequelize";

export const dashboard = async (_, res, next) => {
  try {
    const {
      startOfCurrentMonth,
      endOfCurrentMonth,
      startOfLastMonth,
      endOfLastMonth,
    } = getMonthlyDateRange();

    // Utilisateurs
    const users = await Utilisateur.findAll({ order: [["createdAt", "DESC"]] });
    const usersThisMonth = await Utilisateur.count({
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
    });
    const usersLastMonth = await Utilisateur.count({
      where: {
        createdAt: {
          [Op.between]: [startOfLastMonth, endOfLastMonth],
        },
      },
    });
    const usersStat = calculateMonthlyStat(usersThisMonth, usersLastMonth);

    // Abonnés
    const abonnes = await Abonne.findAll({
      order: [["dateAbonnement", "DESC"]],
    });
    const abonnesThisMonth = await Abonne.count({
      where: {
        dateAbonnement: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
    });
    const abonnesLastMonth = await Abonne.count({
      where: {
        dateAbonnement: {
          [Op.between]: [startOfLastMonth, endOfLastMonth],
        },
      },
    });
    const abonnesStat = calculateMonthlyStat(
      abonnesThisMonth,
      abonnesLastMonth,
    );

    // Événements
    const evenements = await Evenement.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["nomComplet", "email", "avatar"],
        },
      ],
    });
    const evenementsThisMonth = await Evenement.count({
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
    });
    const evenementsLastMonth = await Evenement.count({
      where: {
        createdAt: {
          [Op.between]: [startOfLastMonth, endOfLastMonth],
        },
      },
    });
    const evenementsStat = calculateMonthlyStat(
      evenementsThisMonth,
      evenementsLastMonth,
    );

    // Blogs
    const blogs = await Blog.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Utilisateur,
          as: "auteur",
          attributes: ["nomComplet", "email", "avatar"],
        },
        {
          model: Categorie,
          as: "categorie",
        },
      ],
    });
    const blogsThisMonth = await Blog.count({
      where: {
        createdAt: {
          [Op.between]: [startOfCurrentMonth, endOfCurrentMonth],
        },
      },
    });
    const blogsLastMonth = await Blog.count({
      where: {
        createdAt: {
          [Op.between]: [startOfLastMonth, endOfLastMonth],
        },
      },
    });
    const blogsStat = calculateMonthlyStat(blogsThisMonth, blogsLastMonth);

    return res.status(200).json({
      users: {
        nombre: users.length,
        stat: usersStat,
        data: users.slice(0, 5).map(getUserWithoutPassword),
      },
      abonnes: {
        nombre: abonnes.length,
        stat: abonnesStat,
        data: abonnes.slice(0, 5),
      },
      evenements: {
        nombre: evenements.length,
        stat: evenementsStat,
        data: evenements.slice(0, 5),
      },
      blogs: {
        nombre: blogs.length,
        stat: blogsStat,
        data: blogs.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
