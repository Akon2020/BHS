import { EMAIL, FRONT_URL } from "../config/env.js";
import transporter from "../config/nodemailer.js";
import { FicheIdentite } from "../models/index.model.js";
import { identitySubmissionConfirmationTemplate } from "../utils/email.template.js";
import { formatDateForUser } from "../utils/user.utils.js";
import { valideEmail } from "../middlewares/email.middleware.js";

const allowedPieceTypes = [
  "carte d'électeur",
  "carte d'étudiant",
  "carte d'élève",
  "passeport",
  "carte de baptême",
];

const allowedSexes = ["Masculin", "Feminin"];
const allowedEtatsCivils = ["Célibataire", "Marié(e)", "Veuf(ve)"];

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeKey = (value) =>
  normalizeText(value)
    ?.toLowerCase()
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizePieceType = (value) => {
  const normalized = normalizeKey(value);

  if (!normalized) return null;

  const mapping = {
    "carte d'electeur": "carte d'électeur",
    "carte d'etudiant": "carte d'étudiant",
    "carte d'eleve": "carte d'élève",
    passeport: "passeport",
    "carte de bapteme": "carte de baptême",
  };

  return mapping[normalized] || null;
};

const normalizeEtatCivil = (value) => {
  const normalized = normalizeKey(value);

  if (!normalized) return null;

  const mapping = {
    celibataire: "Célibataire",
    "marie(e)": "Marié(e)",
    "veuf(ve)": "Veuf(ve)",
  };

  return mapping[normalized] || null;
};

const buildFicheIdentitePayload = (body) => {
  const identite = body?.identite || {};
  const urgence = body?.urgence || {};
  const medical = body?.medical || {};

  const allergiesHas = Boolean(medical?.allergies?.has);
  const traitementHas = Boolean(medical?.traitement?.has);
  const maladieHas = Boolean(medical?.maladie?.has);
  const regimeHas = Boolean(medical?.regime?.has);

  return {
    pieceType: normalizePieceType(identite?.piece?.type),
    pieceNumero: normalizeText(identite?.piece?.numero),
    nom: normalizeText(identite?.nom),
    postnom: normalizeText(identite?.postnom),
    prenom: normalizeText(identite?.prenom),
    naissance: normalizeText(identite?.naissance),
    sexe: allowedSexes.includes(normalizeText(identite?.sexe))
      ? normalizeText(identite?.sexe)
      : null,
    etatCivil: normalizeEtatCivil(identite?.etatCivil) || "Célibataire",
    adresse: normalizeText(identite?.adresse),
    tel: normalizeText(identite?.tel),
    email: normalizeText(identite?.email),
    paroisse: normalizeText(identite?.paroisse),
    urgenceNom: normalizeText(urgence?.nom),
    urgenceLien: normalizeText(urgence?.lien),
    urgenceTelPrincipal: normalizeText(urgence?.tel?.principal),
    urgenceTelSecondaire: normalizeText(urgence?.tel?.secondaire) || null,
    urgenceEmail: normalizeText(urgence?.email),
    allergiesHas,
    allergiesDetails: normalizeText(medical?.allergies?.details) || null,
    traitementHas,
    traitementDetails: normalizeText(medical?.traitement?.details) || null,
    maladieHas,
    maladieDetails: normalizeText(medical?.maladie?.details) || null,
    regimeHas,
    regimeDetails: normalizeText(medical?.regime?.details) || null,
    autres: normalizeText(medical?.autres) || null,
    approuve: false,
  };
};

const buildFicheIdentiteUpdatePayload = (body) => {
  const identite = body?.identite || {};
  const urgence = body?.urgence || {};
  const medical = body?.medical || {};
  const payload = {};

  const setIfProvided = (key, value) => {
    if (value !== undefined) {
      payload[key] = value;
    }
  };

  if (identite?.piece?.type !== undefined) {
    setIfProvided("pieceType", normalizePieceType(identite.piece.type));
  }
  if (identite?.piece?.numero !== undefined) {
    setIfProvided("pieceNumero", normalizeText(identite.piece.numero));
  }

  setIfProvided("nom", normalizeText(identite?.nom));
  setIfProvided("postnom", normalizeText(identite?.postnom));
  setIfProvided("prenom", normalizeText(identite?.prenom));
  setIfProvided("naissance", normalizeText(identite?.naissance));

  if (identite?.sexe !== undefined) {
    setIfProvided(
      "sexe",
      allowedSexes.includes(normalizeText(identite.sexe))
        ? normalizeText(identite.sexe)
        : null,
    );
  }

  if (identite?.etatCivil !== undefined) {
    setIfProvided("etatCivil", normalizeEtatCivil(identite.etatCivil));
  }

  setIfProvided("adresse", normalizeText(identite?.adresse));
  setIfProvided("tel", normalizeText(identite?.tel));
  setIfProvided("email", normalizeText(identite?.email));
  setIfProvided("paroisse", normalizeText(identite?.paroisse));

  setIfProvided("urgenceNom", normalizeText(urgence?.nom));
  setIfProvided("urgenceLien", normalizeText(urgence?.lien));
  setIfProvided("urgenceTelPrincipal", normalizeText(urgence?.tel?.principal));
  if (urgence?.tel?.secondaire !== undefined) {
    setIfProvided(
      "urgenceTelSecondaire",
      normalizeText(urgence.tel.secondaire) || null,
    );
  }
  setIfProvided("urgenceEmail", normalizeText(urgence?.email));

  if (medical?.allergies?.has !== undefined) {
    setIfProvided("allergiesHas", Boolean(medical.allergies.has));
  }
  if (medical?.allergies?.details !== undefined) {
    setIfProvided(
      "allergiesDetails",
      normalizeText(medical.allergies.details) || null,
    );
  }

  if (medical?.traitement?.has !== undefined) {
    setIfProvided("traitementHas", Boolean(medical.traitement.has));
  }
  if (medical?.traitement?.details !== undefined) {
    setIfProvided(
      "traitementDetails",
      normalizeText(medical.traitement.details) || null,
    );
  }

  if (medical?.maladie?.has !== undefined) {
    setIfProvided("maladieHas", Boolean(medical.maladie.has));
  }
  if (medical?.maladie?.details !== undefined) {
    setIfProvided(
      "maladieDetails",
      normalizeText(medical.maladie.details) || null,
    );
  }

  if (medical?.regime?.has !== undefined) {
    setIfProvided("regimeHas", Boolean(medical.regime.has));
  }
  if (medical?.regime?.details !== undefined) {
    setIfProvided(
      "regimeDetails",
      normalizeText(medical.regime.details) || null,
    );
  }

  setIfProvided("autres", normalizeText(medical?.autres) || null);

  return payload;
};

const validateFicheIdentitePayload = (payload) => {
  const requiredFields = [
    ["pieceType", "Le type de pièce est requis."],
    ["pieceNumero", "Le numéro de pièce est requis."],
    ["nom", "Le nom est requis."],
    ["postnom", "Le postnom est requis."],
    ["prenom", "Le prénom est requis."],
    ["naissance", "La date de naissance est requise."],
    ["sexe", "Le sexe est requis."],
    ["adresse", "L'adresse est requise."],
    ["tel", "Le numéro de téléphone est requis."],
    ["email", "L'adresse email est requise."],
    ["paroisse", "La paroisse est requise."],
    ["urgenceNom", "Le nom du contact d'urgence est requis."],
    ["urgenceLien", "Le lien avec le contact d'urgence est requis."],
    ["urgenceTelPrincipal", "Le téléphone principal d'urgence est requis."],
    ["urgenceEmail", "L'email du contact d'urgence est requis."],
  ];

  for (const [field, message] of requiredFields) {
    if (!payload[field]) {
      return message;
    }
  }

  if (!allowedPieceTypes.includes(payload.pieceType)) {
    return "Type de pièce invalide.";
  }

  if (!allowedSexes.includes(payload.sexe)) {
    return "Sexe invalide.";
  }

  if (!allowedEtatsCivils.includes(payload.etatCivil)) {
    return "État civil invalide.";
  }

  if (!valideEmail(payload.email)) {
    return "Adresse email invalide.";
  }

  if (!valideEmail(payload.urgenceEmail)) {
    return "Adresse email du contact d'urgence invalide.";
  }

  if (payload.allergiesHas && !payload.allergiesDetails) {
    return "Les détails des allergies sont requis lorsque le champ allergies est activé.";
  }

  if (payload.traitementHas && !payload.traitementDetails) {
    return "Les détails du traitement sont requis lorsque le champ traitement est activé.";
  }

  if (payload.maladieHas && !payload.maladieDetails) {
    return "Les détails de la maladie sont requis lorsque le champ maladie est activé.";
  }

  if (payload.regimeHas && !payload.regimeDetails) {
    return "Les détails du régime sont requis lorsque le champ régime est activé.";
  }

  return null;
};

export const getAllFichesIdentites = async (req, res, next) => {
  try {
    const fichesIdentites = await FicheIdentite.findAll({
      order: [["dateSoumission", "DESC"]],
    });

    return res.status(200).json({
      nombre: fichesIdentites.length,
      fichesIdentites,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const getFicheIdentiteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ficheIdentite = await FicheIdentite.findByPk(id);

    if (!ficheIdentite) {
      return res.status(404).json({ message: "Fiche d'identité introuvable" });
    }

    return res.status(200).json({ ficheIdentiteInfo: ficheIdentite });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const createFicheIdentite = async (req, res, next) => {
  try {
    console.log(
      "Requête reçue - Body complet:",
      JSON.stringify(req.body, null, 2),
    );

    const payload = buildFicheIdentitePayload(req.body);
    console.log(
      "Payload buildFicheIdentitePayload:",
      JSON.stringify(payload, null, 2),
    );

    const validationMessage = validateFicheIdentitePayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const ficheIdentite = await FicheIdentite.create(payload);

    let mailEnvoye = true;
    try {
      const mailOptions = {
        from: `"BurningHeart IHS" <${EMAIL}>`,
        to: ficheIdentite.email,
        subject: "Soumission de votre identité reçue avec succès",
        html: identitySubmissionConfirmationTemplate(
          `${ficheIdentite.nom} ${ficheIdentite.postnom} ${ficheIdentite.prenom}`,
          formatDateForUser(ficheIdentite.dateSoumission),
          FRONT_URL,
        ),
      };

      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error(
        "Erreur lors de l'envoi du mail de soumission d'identité :",
        mailError.message,
      );
      mailEnvoye = false;
    }

    return res.status(201).json({
      message: "Votre identité a été soumise avec succès",
      emailStatus: mailEnvoye
        ? "E-mail de confirmation envoyé"
        : "L'identité a été enregistrée, mais le mail de confirmation n'a pas pu être envoyé",
      data: ficheIdentite,
    });
  } catch (error) {
    console.error("Erreur lors de la création de ficheIdentite:", {
      errorMessage: error.message,
      errorName: error.name,
      errorOriginal: error.original,
      errorSQL: error.sql,
    });
    res.status(500).json({ message: "Erreur serveur", error: error.message });
    next(error);
  }
};

export const updateFicheIdentite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ficheIdentite = await FicheIdentite.findByPk(id);

    if (!ficheIdentite) {
      return res.status(404).json({ message: "Fiche d'identité introuvable" });
    }

    const patchPayload = buildFicheIdentiteUpdatePayload(req.body);
    const mergedPayload = {
      ...ficheIdentite.get({ plain: true }),
      ...patchPayload,
      lu: ficheIdentite.lu,
      approuve: ficheIdentite.approuve,
    };

    const validationMessage = validateFicheIdentitePayload(mergedPayload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    await ficheIdentite.update(patchPayload);

    return res.status(200).json({
      message: "Fiche d'identité mise à jour avec succès",
      data: ficheIdentite,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const approuveFicheIdentite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ficheIdentite = await FicheIdentite.findByPk(id);

    if (!ficheIdentite) {
      return res.status(404).json({ message: "Fiche d'identité introuvable" });
    }

    ficheIdentite.lu = true;
    ficheIdentite.approuve = true;
    await ficheIdentite.save();

    return res.status(200).json({
      message: "Fiche d'identité approuvée avec succès",
      data: ficheIdentite,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const deleteFicheIdentite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ficheIdentite = await FicheIdentite.findByPk(id);

    if (!ficheIdentite) {
      return res.status(404).json({ message: "Fiche d'identité introuvable" });
    }

    await ficheIdentite.destroy();

    return res.status(200).json({
      message: "Fiche d'identité supprimée avec succès",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const approuverFicheIdentite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ficheIdentite = await FicheIdentite.findByPk(id);

    if (!ficheIdentite) {
      return res.status(404).json({ message: "Fiche d'identité introuvable" });
    }

    await ficheIdentite.update({ approuve: true, lu: true });

    return res.status(200).json({
      message: "Fiche d'identité approuvée avec succès",
      data: ficheIdentite,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};
