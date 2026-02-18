import { Op, fn, col } from "sequelize";
import slugify from "slugify";
import {
  Abonne,
  Evenement,
  Utilisateur,
  InscriptionEvenement,
} from "../models/index.model.js";
import { EMAIL, FRONT_URL } from "../config/env.js";
import transporter from "../config/nodemailer.js";
import { eventPublishedNotificationTemplate } from "../utils/email.template.js";
import { valideEmail } from "../middlewares/email.middleware.js";

const requiredFields = [
  "titre",
  "description",
  "dateEvenement",
  "heureDebut",
  "heureFin",
  "lieu",
];

const hasMissingFields = (obj) =>
  requiredFields.some(
    (field) => !obj[field] || obj[field].toString().trim() === "",
  );

export const getAllEvents = async (req, res, next) => {
  try {
    const limit = +req.query.limit || 10;
    const page = +req.query.page || 1;

    const { count, rows: events } = await Evenement.findAndCountAll({
      where: { statut: "publie" },
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
        },
        {
          model: InscriptionEvenement,
          as: "inscriptions",
          attributes: ["idInscription"],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        ["dateEvenement", "ASC"],
        ["heureDebut", "ASC"],
      ],
      distinct: true,
      limit,
      offset: (page - 1) * limit,
    });

    const eventsWithCount = events.map((event) => {
      const data = event.toJSON();
      data.nombreInscrits = data.inscriptions?.length || 0;
      delete data.inscriptions;
      return data;
    });

    res.status(200).json({
      total: count,
      page,
      pageSize: limit,
      events: eventsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEventsAdmin = async (req, res, next) => {
  try {
    const { statut, q, startDate, endDate, limit = 20, page = 1 } = req.query;

    const filters = {};
    if (statut) filters.statut = statut;
    if (startDate || endDate)
      filters.dateEvenement = {
        ...(startDate && { [Op.gte]: startDate }),
        ...(endDate && { [Op.lte]: endDate }),
      };
    if (q)
      filters[Op.or] = [
        { titre: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { lieu: { [Op.iLike]: `%${q}%` } },
      ];

    const { count, rows: events } = await Evenement.findAndCountAll({
      where: filters,
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: +limit,
      offset: (+page - 1) * +limit,
    });

    res
      .status(200)
      .json({ total: count, page: +page, pageSize: +limit, events });
  } catch (error) {
    next(error);
  }
};

export const getSingleEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Evenement.findByPk(id, {
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
        },
        {
          model: InscriptionEvenement,
          as: "inscriptions",
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [fn("COUNT", col("inscriptions.idInscription")), "nombreInscrits"],
        ],
      },
      distinct: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    res.status(200).json({ event });
  } catch (error) {
    next(error);
  }
};

export const getEventsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const events = await Evenement.findAll({
      where: { dateEvenement: date, statut: "publie" },
      order: [["heureDebut", "ASC"]],
    });

    res.status(200).json({ total: events.length, events });
  } catch (error) {
    next(error);
  }
};

export const getEventBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const event = await Evenement.findOne({
      where: { slug, statut: "publie" },
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
        },
        {
          model: InscriptionEvenement,
          as: "inscriptions",
          attributes: ["idInscription"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    const data = event.toJSON();
    data.nombreInscrits = data.inscriptions?.length || 0;
    delete data.inscriptions;

    res.status(200).json({ event: data });
  } catch (error) {
    next(error);
  }
};

export const getSingleEventAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Evenement.findByPk(id, {
      include: [
        {
          model: Utilisateur,
          as: "createur",
          attributes: ["idUtilisateur", "nomComplet", "email"],
        },
        {
          model: InscriptionEvenement,
          as: "inscriptions",
          attributes: [
            "idInscription",
            "nomComplet",
            "email",
            "sexe",
            "telephone",
            "statut",
            "typeInscription",
            "dateInscription",
          ],
          include: [
            {
              model: Utilisateur,
              as: "utilisateur",
              attributes: ["idUtilisateur", "nomComplet", "email"],
              required: false,
            },
          ],
        },
      ],
      order: [
        [
          { model: InscriptionEvenement, as: "inscriptions" },
          "dateInscription",
          "DESC",
        ],
      ],
      distinct: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    const data = event.toJSON();
    data.nombreInscrits = data.inscriptions?.length || 0;

    res.status(200).json({ event: data });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    if (hasMissingFields(req.body))
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis.",
      });

    const {
      titre,
      slug,
      description,
      dateEvenement,
      heureDebut,
      heureFin,
      lieu,
      nombrePlaces,
      statut,
    } = req.body;

    const generatedSlug = slugify(titre, { lower: true, strict: true });
    const finalSlug = slug || generatedSlug;

    const existing = await Evenement.findOne({
      where: {
        [Op.or]: [{ slug: finalSlug }, { titre, dateEvenement, lieu }],
      },
    });
    if (existing)
      return res.status(409).json({ message: "Événement déjà existant." });

    const imageEvenement = req.file
      ? req.file.path
      : "https://placehold.co/600x400?text=Image+Evenement";
    const createdBy = req.user?.idUtilisateur;

    const newEvent = await Evenement.create({
      titre,
      slug: finalSlug,
      description,
      dateEvenement,
      heureDebut,
      heureFin,
      lieu,
      nombrePlaces: nombrePlaces || 100,
      imageEvenement,
      statut: statut || "brouillon",
      createdBy,
    });

    if (newEvent.statut === "publie") {
      const abonnes = await Abonne.findAll({
        where: { statut: "actif" },
        attributes: ["email", "nomComplet"],
      });

      for (const abonne of abonnes) {
        let mailEnvoye = true;
        try {
          const mailOptions = {
            from: `"BurningHeart IHS" <${EMAIL}>`,
            to: abonne.email,
            subject: `📢 Nouvel événement publié : ${newEvent.titre}`,
            html: eventPublishedNotificationTemplate(
              abonne.nomComplet,
              newEvent.titre,
              newEvent.dateEvenement,
              newEvent.lieu,
              `${FRONT_URL}/evenements/${newEvent.idEvenement}`,
            ),
          };

          await transporter.sendMail(mailOptions);
        } catch (mailError) {
          console.error(
            `Erreur d'envoi email à ${abonne.email} →`,
            mailError.message,
          );
          mailEnvoye = false;
        }

        if (!mailEnvoye) {
          return res.status(201).json({
            mailSend: "La notification n'a pas été envoyé aux abonnées",
            message: `L'événement “${newEvent.titre}” a été créé avec succès.`,
            data: newEvent,
          });
        }
      }
    }

    res.status(201).json({
      mailSend: "La notification a été envoyé aux abonnées",
      message: `L'événement “${newEvent.titre}” a été créé avec succès.`,
      data: newEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé." });

    const updatableFields = [
      "titre",
      "slug",
      "description",
      "dateEvenement",
      "heureDebut",
      "heureFin",
      "lieu",
      "nombrePlaces",
      "statut",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    if (req.body.titre && !req.body.slug) {
      event.slug = slugify(req.body.titre, { lower: true, strict: true });
    }

    if (req.file) event.imageEvenement = req.file.path;

    await event.save();

    res.status(200).json({
      message: `Événement “${event.titre}” mis à jour avec succès.`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé." });

    event.statut = "annule";
    await event.save();

    res.status(200).json({
      message: `Événement “${event.titre}” annulé/supprimé avec succès.`,
    });
  } catch (error) {
    next(error);
  }
};

export const inscrireAUnEvenement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nomComplet, email, sexe, telephone } = req.body;

    const userId = req.user?.idUtilisateur || null;

    if (!valideEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }

    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement introuvable." });

    if (event.statut !== "publie")
      return res
        .status(400)
        .json({ message: "Cet événement n'est pas ouvert aux inscriptions." });

    const eventDate = new Date(event.dateEvenement);
    const now = new Date();
    if (eventDate < now)
      return res.status(400).json({
        message: "Impossible de s'inscrire à un événement déjà passé.",
      });

    if (event.nombreInscrits >= event.nombrePlaces)
      return res
        .status(400)
        .json({ message: "Toutes les places sont déjà prises." });

    if (userId) {
      const dejaInscrit = await InscriptionEvenement.findOne({
        where: {
          idEvenement: id,
          idUtilisateur: userId,
        },
      });

      if (dejaInscrit)
        return res
          .status(409)
          .json({ message: "Vous êtes déjà inscrit à cet événement." });
    } else {
      const dejaInscrit = await InscriptionEvenement.findOne({
        where: {
          idEvenement: id,
          email,
        },
      });

      if (dejaInscrit)
        return res
          .status(409)
          .json({ message: "Cet email est déjà inscrit à cet événement." });
    }

    let dataInscription = {};

    if (userId) {
      const user = await Utilisateur.findByPk(userId, {
        attributes: ["idUtilisateur", "nomComplet", "email"],
      });
      console.log("User found:", user);

      if (!user)
        return res.status(404).json({ message: "Utilisateur introuvable." });

      dataInscription = {
        idEvenement: id,
        idUtilisateur: user.idUtilisateur,
        nomComplet: user.nomComplet,
        email: user.email,
        sexe: sexe,
        telephone: telephone,
        typeInscription: "utilisateur",
      };
    } else {
      if (!nomComplet || !email || !sexe || !telephone)
        return res.status(400).json({
          message: "Nom, email, sexe et téléphone sont obligatoires.",
        });

      dataInscription = {
        idEvenement: id,
        nomComplet,
        email,
        sexe,
        telephone,
        typeInscription: "visiteur",
      };
    }

    const inscription = await InscriptionEvenement.create(dataInscription);

    event.nombreInscrits += 1;
    await event.save();

    const dejaAbonne = await Abonne.findOne({ where: { email } });
    if (dejaAbonne) next();

    await Abonne.create({
      nomComplet,
      email,
      statut: "actif",
      dateAbonnement: new Date(),
      dateDesabonnement: null,
    });

    return res.status(201).json({
      message: "Inscription réussie 🎉",
      inscription,
    });
  } catch (error) {
    next(error);
  }
};

export const registerToEvent = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { nomComplet, email, sexe, telephone } = req.body;

    const userId = req.user?.idUtilisateur || null;

    if (!valideEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }

    const event = await Evenement.findOne({
      where: { slug, statut: "publie" },
    });

    if (!event)
      return res.status(404).json({ message: "Événement introuvable." });

    if (event.statut !== "publie")
      return res
        .status(400)
        .json({ message: "Cet événement n'est pas ouvert aux inscriptions." });

    const eventDate = new Date(event.dateEvenement);
    const now = new Date();
    if (eventDate < now)
      return res.status(400).json({
        message: "Impossible de s'inscrire à un événement déjà passé.",
      });

    if (event.nombreInscrits >= event.nombrePlaces)
      return res
        .status(400)
        .json({ message: "Toutes les places sont déjà prises." });

    if (userId) {
      const dejaInscrit = await InscriptionEvenement.findOne({
        where: {
          idEvenement: event.idEvenement,
          idUtilisateur: userId,
        },
      });

      if (dejaInscrit)
        return res
          .status(409)
          .json({ message: "Vous êtes déjà inscrit à cet événement." });
    } else {
      const dejaInscrit = await InscriptionEvenement.findOne({
        where: {
          idEvenement: event.idEvenement,
          email,
        },
      });

      if (dejaInscrit)
        return res
          .status(409)
          .json({ message: "Cet email est déjà inscrit à cet événement." });
    }

    let dataInscription = {};

    if (userId) {
      const user = await Utilisateur.findByPk(userId, {
        attributes: ["idUtilisateur", "nomComplet", "email"],
      });

      if (!user)
        return res.status(404).json({ message: "Utilisateur introuvable." });

      dataInscription = {
        idEvenement: event.idEvenement,
        idUtilisateur: user.idUtilisateur,
        nomComplet: user.nomComplet,
        email: user.email,
        sexe: sexe,
        telephone: telephone,
        typeInscription: "utilisateur",
      };
    } else {
      if (!nomComplet || !email || !sexe || !telephone)
        return res.status(400).json({
          message: "Nom, email, sexe et téléphone sont obligatoires.",
        });

      dataInscription = {
        idEvenement: event.idEvenement,
        nomComplet,
        email,
        sexe,
        telephone,
        typeInscription: "visiteur",
      };
    }

    const inscription = await InscriptionEvenement.create(dataInscription);
    event.nombreInscrits += 1;
    await event.save();

    const dejaAbonne = await Abonne.findOne({ where: { email } });
    if (dejaAbonne) {
      return res.status(201).json({
        message: "Inscription réussie 🎉",
        inscription,
      });
    }

    await Abonne.create({
      nomComplet,
      email,
      statut: "actif",
      dateAbonnement: new Date(),
      dateDesabonnement: null,
    });

    return res.status(201).json({
      message: "Inscription réussie 🎉",
      inscription,
    });
  } catch (error) {
    next(error);
  }
};
