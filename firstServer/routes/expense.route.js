const router = require("express").Router();
const {
  addExpense,
  getExpenseByUser,
  deleteAnExpense,
} = require("../controllers/expense.controller");

router.post("/", addExpense);

router.get("/:id", getExpenseByUser);

router.delete("/:id", deleteAnExpense);

module.exports = router;

// localhot:3000/expenses
