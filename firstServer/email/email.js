const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConfirmationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmation d'inscription",
    html: `<p>Merci de vous êtes inscrit ! Cliquez sur le lien suivant pour confirmer l'inscription : <a href="${process.env.API_URL}/user/verifyMail/${token}">Confirmer l'inscription</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendValidationAccount = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Inscription validée",
    html: `<p>Bienvenue sur notre site ! Cliquez sur le lien suivant pour vous connecter : <a href="${process.env.CLIENT_URL}/login">Page de connexion</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendInvalidEmailToken = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Problème lors de la validation",
    html: `<p>Le temps a expiré ! Cliquez sur le lien suivant pour vous inscrire à nouveau : <a href="${process.env.CLIENT_URL}/register">Page d'inscription'</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendForgotPassword = async (email, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Réinitialisation de mot de passe",
    html: `<p>Cliquez ici pour réinitialiser : <a href="${resetLink}">Lien sécurisé</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendModifyPassword = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mot de passe modifié",
    html: `<p>Votre nouveau mot de passe a bien été modifié ! Retour sur notre site : <a href="${process.env.CLIENT_URL}">Expense Track</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendConfirmationEmail,
  sendValidationAccount,
  sendInvalidEmailToken,
  sendForgotPassword,
  sendModifyPassword,
};
