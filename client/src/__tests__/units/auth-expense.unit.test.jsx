import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";

import AuthProvider from "../../components/Providers/AuthProvider";
import { AuthContext } from "../../context/AuthContext";
import ExpenseProvider from "../../components/Providers/ExpenseProvider";
import { ExpanseContext } from "../../context/ExpanseContext";

//
// ———————— AuthProvider ————————
//
describe("Unit – AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("init user à null si aucun user en localStorage", () => {
    let ctx;
    const Consumer = () => {
      ctx = React.useContext(AuthContext);
      return null;
    };
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(ctx.user).toBeNull();
  });

  test("signin met à jour user et persiste dans localStorage", () => {
    let ctx;
    const Consumer = () => {
      ctx = React.useContext(AuthContext);
      return null;
    };
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    act(() => {
      ctx.login({ username: "bob" });
    });

    expect(ctx.user).toEqual({ username: "bob" });
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({
      username: "bob",
    });
  });

  test("signout remet user à null et vide localStorage", () => {
    let ctx;
    const Consumer = () => {
      ctx = React.useContext(AuthContext);
      return null;
    };
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    act(() => {
      ctx.login({ foo: "bar" });
      ctx.logout();
    });

    expect(ctx.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

//
// ———————— ExpenseProvider ————————
//
describe("Unit – ExpenseProvider", () => {
  // petit composant de test pour exposer count, addExpense et deleteExpense
  const Setup = () => {
    const { expenses, addExpense, deleteExpense } =
      React.useContext(ExpanseContext);
    return (
      <div>
        <span data-testid="count">{expenses.length}</span>
        <button
          data-testid="add"
          onClick={() =>
            addExpense({
              id: 2,
              description: "Tennis",
              amount: 5,
              date: "2025-02-02",
            })
          }
        >
          Add
        </button>
        <button data-testid="del" onClick={() => deleteExpense(2)}>
          Del
        </button>
      </div>
    );
  };

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  test("ne fait pas de fetch si pas d’utilisateur", () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <ExpenseProvider>
          <Setup />
        </ExpenseProvider>
      </AuthContext.Provider>
    );
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  test("charge les dépenses quand user existe", async () => {
    const dummy = [
      { _id: 1, description: "X", amount: 10, date: "2025-01-01" },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => dummy,
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={{ user: { _id: "u1" } }}>
          <ExpenseProvider>
            <Setup />
          </ExpenseProvider>
        </AuthContext.Provider>
      );
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/expenses/u1"
    );
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  test("addExpense puis deleteExpense modifient bien le tableau", () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <ExpenseProvider>
          <Setup />
        </ExpenseProvider>
      </AuthContext.Provider>
    );

    // initial = 0
    expect(screen.getByTestId("count").textContent).toBe("0");
    // add
    fireEvent.click(screen.getByTestId("add"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    // delete
    fireEvent.click(screen.getByTestId("del"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});
