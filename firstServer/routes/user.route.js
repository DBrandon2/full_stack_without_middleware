const {
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
} = require("../controllers/user.controller");

const router = require("express").Router();

router.get("/", getAllUsers);

router.get("/verifyMail/:token", verifyMail);

router.post("/", signUp);

router.post("/login", signIn);

router.post("/forgot", forgotPassword);

router.post("/reset", resetPassword);

router.post("/change", changePassword);

router.put("/", updateUser);

router.put("/avatar", updateAvatar);

router.get("/current", currentUser);

router.delete("/deleteToken", logoutUser);

module.exports = router;

// localhost:3000/user
