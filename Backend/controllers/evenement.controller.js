import { Op, fn, col } from "sequelize";
import slugify from "slugify";
import {
  Abonne,
  Evenement,
  Utilisateur,
  InscriptionEvenement,
} from "../models/index.model.js";
import { EMAIL, FRONT_URL, HOST_URL } from "../config/env.js";
import transporter from "../config/nodemailer.js";
import { notifierTous } from "../utils/notification.service.js";
import {
  eventPublishedNotificationTemplate,
  eventRegistrationWithPDFTemplate,
  eventPaymentPendingTemplate,
  eventPaymentConfirmedTemplate,
} from "../utils/email.template.js";
import { valideEmail } from "../middlewares/email.middleware.js";
import { generateEventTicketPDF } from "../utils/event-pdf.js";
import { generateRecuPDF } from "../utils/recu-pdf.js";
import { generateEventFinancesPdf } from "../utils/event-finances-pdf.js";
import { deleteFile } from "../utils/deletefile.js";

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

// Parse la config des champs personnalisés (peut arriver en JSON string via FormData).
const parseChampsPersonnalises = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Parse les réponses personnalisées d'une inscription (JSON string via FormData).
const parseReponsesPersonnalisees = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

// Ajoute l'inscrit à la liste des abonnés s'il n'y est pas déjà (non bloquant).
const ensureAbonne = async (nomComplet, email) => {
  try {
    const deja = await Abonne.findOne({ where: { email } });
    if (!deja) {
      await Abonne.create({
        nomComplet,
        email,
        statut: "actif",
        dateAbonnement: new Date(),
        dateDesabonnement: null,
      });
    }
  } catch (e) {
    console.error("ensureAbonne :", e.message);
  }
};

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
            "statutPaiement",
            "montantPaye",
            "reponsesPersonnalisees",
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

    const estPayant =
      req.body.estPayant === "true" || req.body.estPayant === true;

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
      estPayant,
      montant: estPayant && req.body.montant ? Number(req.body.montant) : null,
      devise: req.body.devise || "USD",
      champsPersonnalises: parseChampsPersonnalises(req.body.champsPersonnalises),
      createdBy,
    });

    if (newEvent.statut === "publie") {
      // Push (additif) : nouvel événement grand public, à toute la communauté.
      notifierTous({
        titre: `Nouvel événement : ${newEvent.titre}`,
        corps: newEvent.lieu
          ? `${new Date(newEvent.dateEvenement).toLocaleDateString("fr-FR")} · ${newEvent.lieu}`
          : new Date(newEvent.dateEvenement).toLocaleDateString("fr-FR"),
        categorie: "evenement",
        donnees: { type: "evenement", slug: newEvent.slug },
      }).catch(() => {});

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
              `${FRONT_URL}/events/${newEvent.slug}`,
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

    // Champs paiement + config des champs personnalisés.
    if (req.body.estPayant !== undefined) {
      event.estPayant =
        req.body.estPayant === "true" || req.body.estPayant === true;
    }
    if (req.body.montant !== undefined) {
      event.montant =
        event.estPayant && req.body.montant ? Number(req.body.montant) : null;
    }
    if (req.body.devise !== undefined) {
      event.devise = req.body.devise || "USD";
    }
    if (req.body.champsPersonnalises !== undefined) {
      event.champsPersonnalises = parseChampsPersonnalises(
        req.body.champsPersonnalises,
      );
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
  let pdf = null;

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

    pdf = await generateEventTicketPDF({
      event,
      inscription,
    });

    await transporter.sendMail({
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: inscription.email,
      subject: `Confirmation d’inscription - ${event.titre}`,
      html: eventRegistrationWithPDFTemplate(
        inscription.nomComplet,
        event.titre,
        new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
        event.lieu,
        `${FRONT_URL}/events/${event.slug}`,
      ),
      attachments: [
        {
          filename: pdf.fileName,
          path: pdf.filePath,
          contentType: "application/pdf",
        },
      ],
    });

    const dejaAbonne = await Abonne.findOne({ where: { email } });
    if (dejaAbonne) {
      return res.status(201).json({
        message: "Inscription réussie 🎉",
        inscription,
        pdfUrl: `${HOST_URL}${pdf.url}`,
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
      pdfUrl: `${HOST_URL}${pdf.url}`,
    });
  } catch (error) {
    next(error);
  } finally {
    await deleteFile(pdf?.filePath);
  }
};

export const registerToEvent = async (req, res, next) => {
  let pdf = null;

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

    // Champs personnalisés : réponses texte (+ fichiers téléversés via upload.any).
    const reponses = parseReponsesPersonnalisees(
      req.body.reponsesPersonnalisees,
    );
    if (Array.isArray(req.files)) {
      for (const f of req.files) {
        reponses[f.fieldname] = f.path.replace(/\\/g, "/");
      }
    }
    dataInscription.reponsesPersonnalisees = reponses;
    dataInscription.statutPaiement = event.estPayant ? "non_paye" : "paye";

    const inscription = await InscriptionEvenement.create(dataInscription);
    event.nombreInscrits += 1;
    await event.save();

    // Événement payant : pas de billet immédiat, on invite à régler le montant.
    if (event.estPayant) {
      try {
        await transporter.sendMail({
          from: `"BurningHeart IHS" <${EMAIL}>`,
          to: inscription.email,
          subject: `Inscription enregistrée - ${event.titre}`,
          html: eventPaymentPendingTemplate(
            inscription.nomComplet,
            event.titre,
            new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
            event.lieu,
            event.montant != null ? `${event.montant} ${event.devise}` : "—",
          ),
        });
      } catch (mailError) {
        console.error(
          "Erreur email inscription payante :",
          mailError.message,
        );
      }

      await ensureAbonne(inscription.nomComplet, inscription.email);

      return res.status(201).json({
        message:
          "Inscription enregistrée. Un email vous invite à régler le montant dû.",
        inscription,
        aPayer: true,
      });
    }

    // Événement gratuit : billet immédiat + email.
    pdf = await generateEventTicketPDF({ event, inscription });

    await transporter.sendMail({
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: inscription.email,
      subject: `Confirmation d’inscription - ${event.titre}`,
      html: eventRegistrationWithPDFTemplate(
        inscription.nomComplet,
        event.titre,
        new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
        event.lieu,
        `${FRONT_URL}/events/${event.slug}`,
      ),
      attachments: [
        {
          filename: pdf.fileName,
          path: pdf.filePath,
          contentType: "application/pdf",
        },
      ],
    });

    await ensureAbonne(inscription.nomComplet, inscription.email);

    return res.status(201).json({
      message: "Inscription réussie 🎉",
      inscription,
      pdfUrl: `${HOST_URL}${pdf.url}`,
    });
  } catch (error) {
    next(error);
  } finally {
    await deleteFile(pdf?.filePath);
  }
};

export const inscrireVisiteurParAdmin = async (req, res, next) => {
  let pdf = null;

  try {
    const { id } = req.params;
    const { nomComplet, email, sexe, telephone } = req.body;

    if (!nomComplet || !email || !sexe || !telephone) {
      return res.status(400).json({
        message: "Nom, email, sexe et téléphone sont obligatoires.",
      });
    }

    if (!valideEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide" });
    }

    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement introuvable." });

    if (event.statut !== "publie") {
      return res
        .status(400)
        .json({ message: "Cet événement n'est pas ouvert aux inscriptions." });
    }

    const dejaInscrit = await InscriptionEvenement.findOne({
      where: {
        idEvenement: id,
        email,
      },
    });

    if (dejaInscrit) {
      return res
        .status(409)
        .json({ message: "Cet email est déjà inscrit à cet événement." });
    }

    const inscription = await InscriptionEvenement.create({
      idEvenement: id,
      idUtilisateur: null,
      nomComplet,
      email,
      sexe,
      telephone,
      typeInscription: "visiteur",
      statut: "confirme",
    });

    event.nombreInscrits += 1;
    await event.save();

    pdf = await generateEventTicketPDF({ event, inscription });

    await transporter.sendMail({
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: inscription.email,
      subject: `Confirmation d’inscription - ${event.titre}`,
      html: eventRegistrationWithPDFTemplate(
        inscription.nomComplet,
        event.titre,
        new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
        event.lieu,
        `${FRONT_URL}/events/${event.slug}`,
      ),
      attachments: [
        {
          filename: pdf.fileName,
          path: pdf.filePath,
          contentType: "application/pdf",
        },
      ],
    });

    return res.status(201).json({
      message: "Visiteur inscrit avec succès 🎉",
      inscription,
      pdfUrl: `${HOST_URL}${pdf.url}`,
    });
  } catch (error) {
    next(error);
  } finally {
    await deleteFile(pdf?.filePath);
  }
};

// Renvoi du billet seul (événement gratuit), en arrière-plan.
const renvoyerTicketSeul = async (event, inscription) => {
  let pdf = null;
  try {
    pdf = await generateEventTicketPDF({ event, inscription });
    await transporter.sendMail({
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: inscription.email,
      subject: `Renvoi du ticket - ${event.titre}`,
      html: eventRegistrationWithPDFTemplate(
        inscription.nomComplet,
        event.titre,
        new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
        event.lieu,
        `${FRONT_URL}/events/${event.slug}`,
      ),
      attachments: [
        {
          filename: pdf.fileName,
          path: pdf.filePath,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (e) {
    console.error("Erreur renvoi ticket :", e.message);
  } finally {
    await deleteFile(pdf?.filePath);
  }
};

export const renvoyerTicketInscription = async (req, res, next) => {
  try {
    const { id, inscriptionId } = req.params;

    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement introuvable." });

    const inscription = await InscriptionEvenement.findOne({
      where: { idInscription: inscriptionId, idEvenement: id },
    });
    if (!inscription) {
      return res
        .status(404)
        .json({ message: "Inscription introuvable pour cet événement." });
    }

    // Événement payant non réglé : aucun billet à renvoyer.
    if (event.estPayant && inscription.statutPaiement !== "paye") {
      return res.status(400).json({
        message:
          "Le paiement n'est pas confirmé : aucun billet à renvoyer pour cette inscription.",
      });
    }

    // Réponse immédiate ; l'envoi (billet, + reçu si payant réglé) part en arrière-plan.
    res
      .status(200)
      .json({ message: `Envoi en cours vers ${inscription.email}` });

    if (event.estPayant && inscription.statutPaiement === "paye") {
      envoyerBilletEtRecu(event, inscription).catch((e) =>
        console.error("Erreur renvoi billet+reçu :", e.message),
      );
    } else {
      renvoyerTicketSeul(event, inscription).catch((e) =>
        console.error("Erreur renvoi ticket :", e.message),
      );
    }
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const supprimerDoublonsInscriptions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement introuvable." });

    const inscriptions = await InscriptionEvenement.findAll({
      where: { idEvenement: id },
      order: [
        ["email", "ASC"],
        ["dateInscription", "ASC"],
        ["idInscription", "ASC"],
      ],
    });

    const seenEmails = new Set();
    const duplicateIds = [];

    for (const inscription of inscriptions) {
      const normalizedEmail = (inscription.email || "").trim().toLowerCase();
      if (!normalizedEmail) continue;

      if (seenEmails.has(normalizedEmail)) {
        duplicateIds.push(inscription.idInscription);
      } else {
        seenEmails.add(normalizedEmail);
      }
    }

    if (duplicateIds.length === 0) {
      return res.status(200).json({
        message: "Aucun doublon trouvé.",
        removedCount: 0,
      });
    }

    await InscriptionEvenement.destroy({
      where: { idInscription: duplicateIds },
    });

    event.nombreInscrits = Math.max(
      (event.nombreInscrits || 0) - duplicateIds.length,
      0,
    );
    await event.save();

    return res.status(200).json({
      message: `${duplicateIds.length} doublon(s) supprimé(s) avec succès.`,
      removedCount: duplicateIds.length,
    });
  } catch (error) {
    next(error);
  }
};

export const supprimerDoublonsSelectionnes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inscriptionIds } = req.body;

    if (!Array.isArray(inscriptionIds) || inscriptionIds.length === 0) {
      return res.status(400).json({
        message: "Veuillez fournir la liste des inscriptions à supprimer.",
      });
    }

    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement introuvable." });

    const inscriptions = await InscriptionEvenement.findAll({
      where: { idEvenement: id },
      order: [
        ["email", "ASC"],
        ["dateInscription", "ASC"],
        ["idInscription", "ASC"],
      ],
    });

    const duplicateSet = new Set();
    const seenEmails = new Set();

    for (const inscription of inscriptions) {
      const normalizedEmail = (inscription.email || "").trim().toLowerCase();
      if (!normalizedEmail) continue;

      if (seenEmails.has(normalizedEmail)) {
        duplicateSet.add(inscription.idInscription);
      } else {
        seenEmails.add(normalizedEmail);
      }
    }

    const requestedIds = inscriptionIds
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value));

    const idsToDelete = requestedIds.filter((idInscription) =>
      duplicateSet.has(idInscription),
    );

    if (idsToDelete.length === 0) {
      return res.status(400).json({
        message: "Aucune inscription sélectionnée n'est un doublon valide.",
        removedCount: 0,
      });
    }

    await InscriptionEvenement.destroy({
      where: { idInscription: idsToDelete },
    });

    event.nombreInscrits = Math.max(
      (event.nombreInscrits || 0) - idsToDelete.length,
      0,
    );
    await event.save();

    return res.status(200).json({
      message: `${idsToDelete.length} doublon(s) sélectionné(s) supprimé(s).`,
      removedCount: idsToDelete.length,
    });
  } catch (error) {
    next(error);
  }
};

// Génère billet + reçu et les envoie par email, puis nettoie les fichiers.
// Utilisé en arrière-plan (non bloquant) pour ne pas retarder la réponse HTTP.
export const envoyerBilletEtRecu = async (event, inscription) => {
  let ticketPdf = null;
  let recuPdf = null;
  try {
    ticketPdf = await generateEventTicketPDF({ event, inscription });
    recuPdf = await generateRecuPDF({ event, inscription });

    await transporter.sendMail({
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: inscription.email,
      subject: `Paiement confirmé - ${event.titre}`,
      html: eventPaymentConfirmedTemplate(
        inscription.nomComplet,
        event.titre,
        new Date(event.dateEvenement).toLocaleDateString("fr-FR"),
        event.lieu,
        `${inscription.montantPaye} ${event.devise}`,
      ),
      attachments: [
        {
          filename: ticketPdf.fileName,
          path: ticketPdf.filePath,
          contentType: "application/pdf",
        },
        {
          filename: recuPdf.fileName,
          path: recuPdf.filePath,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (mailError) {
    console.error("Erreur email billet + reçu :", mailError.message);
  } finally {
    await deleteFile(ticketPdf?.filePath);
    await deleteFile(recuPdf?.filePath);
  }
};

// Met à jour le statut de paiement d'une inscription (admin).
// Répond immédiatement ; si "paye", l'email (billet + reçu) part en arrière-plan.
export const mettreAJourPaiement = async (req, res, next) => {
  try {
    const { id, inscriptionId } = req.params;
    const { statutPaiement, montantPaye } = req.body;

    const valides = ["non_paye", "partiel", "paye", "accepte_non_paye"];
    if (statutPaiement && !valides.includes(statutPaiement)) {
      return res.status(400).json({ message: "Statut de paiement invalide." });
    }

    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé." });

    const inscription = await InscriptionEvenement.findOne({
      where: { idInscription: inscriptionId, idEvenement: id },
    });
    if (!inscription)
      return res.status(404).json({ message: "Inscription non trouvée." });

    if (montantPaye !== undefined)
      inscription.montantPaye = Number(montantPaye) || 0;
    if (statutPaiement) inscription.statutPaiement = statutPaiement;
    await inscription.save();

    // Réponse immédiate : l'admin peut continuer à travailler.
    res.status(200).json({ message: "Paiement mis à jour", data: inscription });

    // Envoi du billet + reçu en arrière-plan (non attendu).
    if (inscription.statutPaiement === "paye") {
      envoyerBilletEtRecu(event, inscription).catch((e) =>
        console.error("Erreur job billet+reçu :", e.message),
      );
    }
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Statistiques financières d'un événement (admin).
export const getStatsFinancieresEvenement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé." });

    const inscriptions = await InscriptionEvenement.findAll({
      where: { idEvenement: id },
    });

    const montant = Number(event.montant) || 0;
    const parStatut = {
      non_paye: 0,
      partiel: 0,
      paye: 0,
      accepte_non_paye: 0,
    };
    let encaisse = 0;

    for (const i of inscriptions) {
      parStatut[i.statutPaiement] = (parStatut[i.statutPaiement] || 0) + 1;
      encaisse += Number(i.montantPaye) || 0;
    }

    const nbInscrits = inscriptions.length;
    const attendu = event.estPayant ? montant * nbInscrits : 0;

    return res.status(200).json({
      evenement: {
        idEvenement: event.idEvenement,
        titre: event.titre,
        estPayant: event.estPayant,
        montant,
        devise: event.devise,
      },
      nbInscrits,
      parStatut,
      attendu,
      encaisse,
      reste: Math.max(attendu - encaisse, 0),
    });
  } catch (error) {
    next(error);
  }
};

// Export PDF du rapport financier d'un événement (admin).
export const exporterFinancesEvenement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Evenement.findByPk(id);
    if (!event)
      return res.status(404).json({ message: "Événement non trouvé." });

    const inscriptions = await InscriptionEvenement.findAll({
      where: { idEvenement: id },
      order: [["dateInscription", "ASC"]],
    });

    const montant = Number(event.montant) || 0;
    const parStatut = {
      non_paye: 0,
      partiel: 0,
      paye: 0,
      accepte_non_paye: 0,
    };
    let encaisse = 0;
    for (const i of inscriptions) {
      parStatut[i.statutPaiement] = (parStatut[i.statutPaiement] || 0) + 1;
      encaisse += Number(i.montantPaye) || 0;
    }
    const nbInscrits = inscriptions.length;
    const attendu = event.estPayant ? montant * nbInscrits : 0;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="finances-${event.slug}.pdf"`,
    );

    return generateEventFinancesPdf(res, {
      event: {
        titre: event.titre,
        dateEvenement: event.dateEvenement,
        lieu: event.lieu,
        montant,
        devise: event.devise,
      },
      finances: {
        attendu,
        encaisse,
        reste: Math.max(attendu - encaisse, 0),
        nbInscrits,
        parStatut,
      },
      inscriptions,
      generatedAt: new Date().toLocaleString("fr-FR"),
    });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
