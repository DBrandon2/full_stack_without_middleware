import React, { useContext, useEffect, useState } from "react";
import { ExpanseContext } from "../../context/ExpanseContext";
import { AuthContext } from "../../context/AuthContext";
import { deleteAnExpense, getExpensesByUser } from "../../apis/expense";

export default function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const getExpenses = async () => {
      try {
        const allExpenses = await getExpensesByUser(user._id);
        setExpenses(allExpenses);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      getExpenses();
    }
  }, [user]);

  const addExpense = (expense) => {
    console.log(expense);
    setExpenses([...expenses, expense]);
  };

  const deleteExpense = async (id) => {
    setExpenses(expenses.filter((exp) => exp._id !== id));
    const expenseToDelete = expenses.find((exp) => exp._id === id);
    await deleteAnExpense(expenseToDelete._id);
  };
  return (
    <ExpanseContext.Provider
      value={{
        expenses,
        addExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpanseContext.Provider>
  );
}
