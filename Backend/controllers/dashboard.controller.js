import {
  Utilisateur,
  Abonne,
  Evenement,
  Blog,
  Categorie,
  RendezVous,
  Anniversaire,
  Tache,
  Pointage,
  Don,
  InscriptionEvenement,
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

    /* ------------------------- Agrégats Lot 5.5 ------------------------- */

    // Date du jour (UTC+2) au format AAAA-MM-JJ.
    const now = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const todayStr = now.toISOString().slice(0, 10);

    // Prochains rendez-vous (à venir, en attente ou approuvés).
    const rdvData = await RendezVous.findAll({
      where: {
        date: { [Op.gte]: todayStr },
        statut: { [Op.in]: ["en_attente", "approuve"] },
      },
      order: [
        ["date", "ASC"],
        ["heureDebut", "ASC"],
      ],
      limit: 5,
      attributes: ["idRendezVous", "nom", "date", "heureDebut", "statut", "motif"],
    });
    const rdvEnAttente = await RendezVous.count({
      where: { statut: "en_attente" },
    });

    // Anniversaires à venir (prochaine occurrence relative à aujourd'hui).
    const anniversairesActifs = await Anniversaire.findAll({
      where: { actif: true },
      attributes: ["idAnniversaire", "nom", "jour", "mois"],
    });
    const debutJour = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const anniversairesAVenir = anniversairesActifs
      .map((a) => {
        let annee = now.getUTCFullYear();
        let cible = new Date(Date.UTC(annee, a.mois - 1, a.jour));
        if (cible < debutJour) {
          cible = new Date(Date.UTC(annee + 1, a.mois - 1, a.jour));
        }
        const dansJours = Math.round((cible - debutJour) / (1000 * 60 * 60 * 24));
        return {
          idAnniversaire: a.idAnniversaire,
          nom: a.nom,
          jour: a.jour,
          mois: a.mois,
          dansJours,
        };
      })
      .sort((x, y) => x.dansJours - y.dansJours)
      .slice(0, 5);

    // Tâches : compteurs par statut + prochaines échéances.
    const tachesAFaire = await Tache.count({ where: { statut: "a_faire" } });
    const tachesEnCours = await Tache.count({ where: { statut: "en_cours" } });
    const prochainesTaches = await Tache.findAll({
      where: { statut: { [Op.ne]: "fait" }, echeance: { [Op.ne]: null } },
      order: [["echeance", "ASC"]],
      limit: 5,
      attributes: ["idTache", "titre", "statut", "priorite", "echeance"],
    });

    // Pointage : sessions et heures du mois en cours.
    const pointagesMois = await Pointage.findAll({
      where: {
        date: { [Op.between]: [startOfCurrentMonth, endOfCurrentMonth] },
      },
      attributes: ["dureeMinutes"],
    });
    const minutesMois = pointagesMois.reduce(
      (acc, p) => acc + (p.dureeMinutes || 0),
      0,
    );

    // Dons : récents + total confirmé par devise.
    const donsRecents = await Don.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["idDon", "nom", "montant", "devise", "statut", "createdAt"],
    });
    const donsConfirmes = await Don.findAll({
      where: { statut: "confirme" },
      attributes: ["montant", "devise"],
    });
    const donsTotalParDevise = {};
    for (const d of donsConfirmes) {
      const m = Number(d.montant) || 0;
      if (!m) continue;
      donsTotalParDevise[d.devise] = (donsTotalParDevise[d.devise] || 0) + m;
    }

    // Finances événements : inscriptions + encaissé par devise.
    const inscriptions = await InscriptionEvenement.findAll({
      attributes: ["montantPaye"],
      include: [
        { model: Evenement, as: "evenement", attributes: ["devise", "estPayant"] },
      ],
    });
    const encaisseParDevise = {};
    for (const ins of inscriptions) {
      const m = Number(ins.montantPaye) || 0;
      if (!m || !ins.evenement) continue;
      const dev = ins.evenement.devise || "USD";
      encaisseParDevise[dev] = (encaisseParDevise[dev] || 0) + m;
    }

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
      rendezVous: {
        enAttente: rdvEnAttente,
        data: rdvData,
      },
      anniversaires: {
        data: anniversairesAVenir,
      },
      taches: {
        aFaire: tachesAFaire,
        enCours: tachesEnCours,
        data: prochainesTaches,
      },
      pointage: {
        sessionsMois: pointagesMois.length,
        minutesMois,
        heuresMois: Math.round((minutesMois / 60) * 10) / 10,
      },
      dons: {
        totalParDevise: donsTotalParDevise,
        data: donsRecents,
      },
      finances: {
        nbInscrits: inscriptions.length,
        encaisseParDevise,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
