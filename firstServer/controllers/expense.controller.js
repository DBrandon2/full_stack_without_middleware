const Expense = require("../models/expense.schema");
const User = require("../models/user.schema");

const addExpense = async (req, res) => {
  try {
    const { user } = req.body;
    const author = await User.findById(user);
    if (!author) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    console.log(error);
  }
};

const getExpenseByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    const expenses = await Expense.find({ user: id });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAnExpense = async (req, res) => {
  const { id } = req.params;
  await Expense.findByIdAndDelete({ _id: id });
};

module.exports = { addExpense, getExpenseByUser, deleteAnExpense };
