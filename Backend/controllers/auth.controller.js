import { Utilisateur } from "../models/index.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  DEFAULT_PASSWD,
  EMAIL,
  FRONT_URL,
  JWT_SECRET,
} from "../config/env.js";
import transporter from "../config/nodemailer.js";
import {
  resetPasswordEmailTemplate,
  welcomeEmailTemplate,
} from "../utils/email.template.js";
import { valideEmail } from "../middlewares/email.middleware.js";
import {
  generateToken,
  getAuthCookieOptions,
  getUserWithoutPassword,
  strongPasswd,
} from "../utils/user.utils.js";

export const register = async (req, res, next) => {
  try {
    const { nomComplet, email, password, role } = req.body;
    const avatar = req.file ? req.file.path : null;

    if (!email || !password || !nomComplet) {
      return res
        .status(400)
        .json({ message: "Vous devez renseigner tout les champs!" });
    }

    if (!valideEmail(email)) {
      return res
        .status(401)
        .json({ message: "Entrez une adresse mail valide" });
    }

    if (!strongPasswd(password)) {
      return res.status(401).json({
        message:
          "Le mot de passe doit être de 6 caractères au mininum et doit contenir au moins:\n- 1 lettre\n-1 chiffre\n- 1 symbole",
      });
    }

    const userExists = await Utilisateur.findOne({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Cet utilisateur a déjà un compte" });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await Utilisateur.create({
      nomComplet,
      email,
      password: hashedPassword,
      avatar,
      role,
    });
    const mailOptions = {
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: email,
      subject: "Bienvenue dans BuringHeart IHS",
      html: welcomeEmailTemplate(nomComplet, email, FRONT_URL),
    };

    await transporter.sendMail(mailOptions);

    const userWithoutPassword = getUserWithoutPassword(newUser);

    // NB : /register est un endpoint admin (création de comptes). On ne pose
    // PAS de cookie ici pour ne pas écraser la session de l'admin appelant.
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

// Inscription PUBLIQUE (visiteurs mobiles/web) : crée un compte `membre`.
// Distinct de `register` (réservé admin) pour ne pas altérer son usage.
export const inscription = async (req, res, next) => {
  try {
    const { nomComplet, email, password } = req.body;

    if (!nomComplet || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nom complet, email et mot de passe sont requis." });
    }
    if (!valideEmail(email)) {
      return res.status(400).json({ message: "Entrez une adresse mail valide" });
    }
    if (!strongPasswd(password)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins 6 caractères, avec une lettre, un chiffre et un symbole.",
      });
    }

    const userExists = await Utilisateur.findOne({ where: { email } });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "Un compte existe déjà avec cet email." });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Rôle forcé à `membre` côté serveur — jamais transmis par le client.
    const newUser = await Utilisateur.create({
      nomComplet,
      email,
      password: hashedPassword,
      role: "membre",
    });

    // Email de bienvenue en arrière-plan (non bloquant).
    transporter
      .sendMail({
        from: `"BurningHeart IHS" <${EMAIL}>`,
        to: email,
        subject: "Bienvenue dans BurningHeart IHS",
        html: welcomeEmailTemplate(nomComplet, email, FRONT_URL),
      })
      .catch((e) => console.error("Erreur email inscription :", e.message));

    const token = generateToken(newUser);
    res.cookie("token", token, getAuthCookieOptions({ withMaxAge: true }));

    const userWithoutPassword = getUserWithoutPassword(newUser);
    return res.status(201).json({
      message: "Compte créé avec succès",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription publique :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Utilisateur.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const isDefaultPassword = await bcrypt.compare(
      DEFAULT_PASSWD,
      user.password
    );

    // if (isDefaultPassword) {
    //   return res.status(403).json({
    //     message:
    //       "Vous utilisez le mot de passe par défaut. Veuillez le modifier pour continuer.",
    //     requiresPasswordChange: true,
    //   });
    // }

    user.derniereConnexion = new Date();
    await user.save();

    const loginToken = generateToken(user);
    res.cookie("token", loginToken, getAuthCookieOptions({ withMaxAge: true }));

    const userWithoutPassword = getUserWithoutPassword(user);

    // Le cookie httpOnly reste posé pour le web. On ajoute `token` + `user` au
    // corps pour les clients sans cookie (mobile, flux Bearer) — ajout additif,
    // le web continue de lire `data.userInfo`.
    res.status(200).json({
      message: `Bienvenu ${userWithoutPassword.nomComplet} 👋`,
      token: loginToken,
      user: userWithoutPassword,
      data: { userInfo: userWithoutPassword },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'email est requis" });
    }

    const user = await Utilisateur.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message:
          "Cet email n'est attaché à aucun compte! Veuillez vérifier votre email",
      });
    }
    const resetToken = generateToken(user);
    const mailOptions = {
      from: `"BurningHeart IHS" <${EMAIL}>`,
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: resetPasswordEmailTemplate(
        user.nomComplet,
        email,
        FRONT_URL,
        resetToken
      ),
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message:
        "Un email de réinitialisation vous a été envoyé! Consultez votre boîte mail",
      dev: {
        resetUrl: `${FRONT_URL}/connexion/reset?token=${resetToken}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Erreur lors de l'envoi de l'email de réinitialisation! Réessayez plus tard",
    });
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token et nouveau mot de passe requis" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    const user = await Utilisateur.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Utilisateur.update(
      { password: hashedPassword },
      { where: { idUtilisateur: user.idUtilisateur } }
    );

    res.status(200).json({
      message:
        "Mot de passe réinitialisé avec succès! Connectez-vous maintenant",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation du mot de passe :",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la réinitialisation du mot de passe" });
    next(error);
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", getAuthCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion",
    });
  }
};
