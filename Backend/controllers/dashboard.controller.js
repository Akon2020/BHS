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
  ProfilPointage,
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

    // Répartition complète des tâches (pour le donut).
    const tachesFait = await Tache.count({ where: { statut: "fait" } });

    // Séries des 6 derniers mois (croissance + sparklines KPI).
    const MOIS_COURTS = [
      "janv.", "févr.", "mars", "avr.", "mai", "juin",
      "juil.", "août", "sept.", "oct.", "nov.", "déc.",
    ];
    const buckets = [];
    const serieMois = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ y: d.getFullYear(), m: d.getMonth() });
      serieMois.push(MOIS_COURTS[d.getMonth()]);
    }
    const countByMonth = (rows, field) =>
      buckets.map(
        (b) =>
          rows.filter((r) => {
            const v = r[field];
            if (!v) return false;
            const dt = new Date(v);
            return dt.getFullYear() === b.y && dt.getMonth() === b.m;
          }).length,
      );
    const serie = {
      mois: serieMois,
      utilisateurs: countByMonth(users, "createdAt"),
      abonnes: countByMonth(abonnes, "dateAbonnement"),
      evenements: countByMonth(evenements, "createdAt"),
      articles: countByMonth(blogs, "createdAt"),
    };

    // Pointage : heures par mois (6 mois) + tendance + top contributeurs.
    const debutSerie = `${buckets[0].y}-${String(buckets[0].m + 1).padStart(2, "0")}-01`;
    const pointages6 = await Pointage.findAll({
      where: { date: { [Op.gte]: debutSerie } },
      attributes: ["date", "dureeMinutes"],
    });
    const heuresParMois = buckets.map((b) => {
      const min = pointages6
        .filter((p) => {
          const dt = new Date(p.date);
          return dt.getFullYear() === b.y && dt.getMonth() === b.m;
        })
        .reduce((a, p) => a + (p.dureeMinutes || 0), 0);
      return Math.round((min / 60) * 10) / 10;
    });
    serie.heures = heuresParMois;
    const pointageStat = calculateMonthlyStat(
      heuresParMois[5] || 0,
      heuresParMois[4] || 0,
    );

    const pointagesMoisDetail = await Pointage.findAll({
      where: {
        date: { [Op.between]: [startOfCurrentMonth, endOfCurrentMonth] },
      },
      attributes: ["dureeMinutes"],
      include: [
        { model: ProfilPointage, as: "profil", attributes: ["nomComplet"] },
      ],
    });
    const parProfil = {};
    for (const p of pointagesMoisDetail) {
      const nom = p.profil?.nomComplet || "—";
      parProfil[nom] = (parProfil[nom] || 0) + (p.dureeMinutes || 0);
    }
    const topContributeurs = Object.entries(parProfil)
      .map(([nom, min]) => ({ nom, heures: Math.round((min / 60) * 10) / 10 }))
      .filter((c) => c.heures > 0)
      .sort((a, b) => b.heures - a.heures)
      .slice(0, 5);

    // Événements : à venir / passés + taux de remplissage global.
    let evAVenir = 0;
    let placesTotales = 0;
    let placesInscrites = 0;
    for (const e of evenements) {
      if (e.dateEvenement && String(e.dateEvenement) >= todayStr) evAVenir += 1;
      placesTotales += e.nombrePlaces || 0;
      placesInscrites += e.nombreInscrits || 0;
    }
    const evPasses = evenements.length - evAVenir;
    const tauxRemplissage =
      placesTotales > 0
        ? Math.round((placesInscrites / placesTotales) * 100)
        : 0;

    // Articles par catégorie.
    const catCount = {};
    for (const b of blogs) {
      const nom = b.categorie?.nomCategorie || "Sans catégorie";
      catCount[nom] = (catCount[nom] || 0) + 1;
    }
    const articlesParCategorie = Object.entries(catCount)
      .map(([categorie, count]) => ({ categorie, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Abonnés par statut.
    const abonnesParStatut = { actif: 0, inactif: 0, desabonne: 0 };
    for (const a of abonnes) {
      if (abonnesParStatut[a.statut] !== undefined) abonnesParStatut[a.statut] += 1;
    }

    // Dons confirmés : périmètre mois courant et année courante.
    const donsConfirmesDates = await Don.findAll({
      where: { statut: "confirme" },
      attributes: ["montant", "devise", "createdAt"],
    });
    const donsMoisParDevise = {};
    const donsAnneeParDevise = {};
    let donsMoisCount = 0;
    let donsAnneeCount = 0;
    for (const d of donsConfirmesDates) {
      const dt = new Date(d.createdAt);
      const m = Number(d.montant) || 0;
      const dev = d.devise || "USD";
      if (dt.getFullYear() === now.getFullYear()) {
        donsAnneeCount += 1;
        if (m) donsAnneeParDevise[dev] = (donsAnneeParDevise[dev] || 0) + m;
        if (dt.getMonth() === now.getMonth()) {
          donsMoisCount += 1;
          if (m) donsMoisParDevise[dev] = (donsMoisParDevise[dev] || 0) + m;
        }
      }
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
        parStatut: abonnesParStatut,
        data: abonnes.slice(0, 5),
      },
      evenements: {
        nombre: evenements.length,
        stat: evenementsStat,
        aVenir: evAVenir,
        passes: evPasses,
        tauxRemplissage,
        data: evenements.slice(0, 5),
      },
      blogs: {
        nombre: blogs.length,
        stat: blogsStat,
        parCategorie: articlesParCategorie,
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
        fait: tachesFait,
        data: prochainesTaches,
      },
      pointage: {
        sessionsMois: pointagesMois.length,
        minutesMois,
        heuresMois: Math.round((minutesMois / 60) * 10) / 10,
        stat: pointageStat,
        topContributeurs,
      },
      dons: {
        totalParDevise: donsTotalParDevise,
        moisParDevise: donsMoisParDevise,
        anneeParDevise: donsAnneeParDevise,
        moisCount: donsMoisCount,
        anneeCount: donsAnneeCount,
        data: donsRecents,
      },
      finances: {
        nbInscrits: inscriptions.length,
        encaisseParDevise,
      },
      serie,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
