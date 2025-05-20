import React from "react";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";

export default function Expenses() {
  return (
    <div className="w-[500px]">
      <ExpenseForm />
      <ExpenseList />
    </div>
  );
}
