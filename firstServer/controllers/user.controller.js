const User = require("../models/user.schema");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const {
  sendConfirmationEmail,
  sendValidationAccount,
  sendInvalidEmailToken,
  sendForgotPassword,
  sendModifyPassword,
} = require("../email/email");
const TempUser = require("../models/tempuser.schema");

const SECRET_KEY = process.env.SECRET_KEY;

const createTokenEmail = (email) => {
  return jsonwebtoken.sign({ email }, process.env.SECRET_KEY, {
    expiresIn: "60s",
  });
};

const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    const existingTemp = await TempUser.findOne({ email });
    if (existingUser || existingTemp) {
      return res.status(400).json({ message: "Déjà inscrit" });
    }
    const token = createTokenEmail(email);
    await sendConfirmationEmail(email, token);
    const tempUser = new TempUser({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      token,
    });
    await tempUser.save();
    res.status(201).json({
      messageOk:
        "Veuillez confirmer votre inscription en consultant votre boite mail",
    });
  } catch (error) {
    console.log(error);
  }
};

const verifyMail = async (req, res) => {
  const token = req.params.token;

  try {
    const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    const tempUser = await TempUser.findOne({ email: decoded.email, token });
    if (!tempUser) {
      return res.redirect(`${process.env.CLIENT_URL}/register?message=error`);
    }
    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password, // déjà hashé
      avatar: tempUser.avatar || null,
    });
    await newUser.save();
    await TempUser.deleteOne({ email: tempUser.email });
    await sendValidationAccount(newUser.email);
    res.redirect(`${process.env.CLIENT_URL}/login?message=success`);
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      const tempUser = await TempUser.findOne({ token: req.params.token });

      if (tempUser) {
        await TempUser.deleteOne({ token: req.params.token });
        await sendInvalidEmailToken(tempUser.email);
      }

      return res.redirect(`${process.env.CLIENT_URL}/register?message=error`);
    }
    console.error(error);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const token = createTokenEmail(email);
  console.log(email);

  try {
    const user = await User.findOne({ email });
    if (user) {
      await User.updateOne(
        { email },
        {
          resetToken: token,
          resetTokenExpires: Date.now() + 1000 * 2 * 60,
        }
      );
      await sendForgotPassword(email, token);
      res.json({
        messageOk:
          "Si un compte est associé à cet email, vous recevrez un email",
      });
    } else {
      res.status(400).json({
        messageOk:
          "Si un compte est associé à cet email, vous recevrez un email",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  console.log(req.body);
  try {
    const { token, password } = req.body;
    const hashPassWord = await bcrypt.hash(password, 10);
    // Étape 1 : Vérification du token JWT
    let decoded;
    try {
      decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          message:
            "Le lien de réinitialisation a expiré. Veuillez refaire la demande.",
        });
      }
      return res.status(400).json({
        message: "Lien de réinitialisation invalide.",
      });
    }
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });
    user.password = hashPassWord;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.status(200).json({ messageOk: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email et/ou mot de passe incorrect" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const { password: _, ...userWithoutPassword } = user.toObject();
      const token = jsonwebtoken.sign({}, SECRET_KEY, {
        subject: user._id.toString(),
        expiresIn: "7d",
        algorithm: "HS256",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // ou true en production avec HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });
      res.status(200).json(userWithoutPassword);
    } else {
      res.status(400).json({ message: "Email et/ou mot de passe incorrect" });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  console.log(req.body);
  try {
    const { _id, username, email } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Missing user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { username, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
  }
};

const updateAvatar = async (req, res) => {
  console.log(req.body);
  try {
    const { _id, avatar } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Missing user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { avatar },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
  }
};

const currentUser = async (req, res) => {
  const { token } = req.cookies;
  console.log(token);

  if (token) {
    try {
      // Vérifie et décode le token avec la clé secrète
      const decodedToken = jsonwebtoken.verify(token, SECRET_KEY);

      // Récupère l'utilisateur depuis l'ID dans le token
      const currentUser = await User.findById(decodedToken.sub);

      if (currentUser) {
        res.status(200).json(currentUser);
      } else {
        res.json(null);
      }
    } catch (error) {
      res.json(null); // Token invalide
    }
  } else {
    res.json(null); // Aucun token fourni
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // ou true en production avec HTTPS
  });
  res.status(200).json({ message: "Déconnexion réussie" });
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}, { password: 0 });
    res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
  }
};

const changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // vérification de champs manquants et de mot de passe et confirmartion déjà faites côté front

    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas" });
    }

    // vérification si l'utlisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // vérification du mot de passe actuel avec celui en BDD

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Votre mot de passe actuel incorrect" });
    }

    // Vérification si le nouveau mot de passe est différent de l'ancien

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit être différent de l'ancien",
      });
    }

    // hash du nouveau mot de passe et modification en BDD

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // envoi mail confirmation

    await sendModifyPassword(user.email);

    return res
      .status(200)
      .json({ messageOk: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getAllUsers,
  signUp,
  signIn,
  updateUser,
  updateAvatar,
  currentUser,
  logoutUser,
  verifyMail,
  forgotPassword,
  resetPassword,
  changePassword,
};
