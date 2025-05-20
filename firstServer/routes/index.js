const router = require("express").Router();

const apiUsers = require("./user.route");
const apiExpenses = require("./expense.route");

router.use("/user", apiUsers);
router.use("/expenses", apiExpenses);

module.exports = router;

// localhost:3000
