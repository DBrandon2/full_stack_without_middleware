import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";

import * as authApi from "../../apis/auth";
import Register from "../../pages/Forms/Register";
import AuthProvider from "../../components/Providers/AuthProvider";
import ExpenseProvider from "../../components/Providers/ExpenseProvider";
import ExpenseForm from "../../pages/expenses/ExpenseForm";
import ExpenseList from "../../pages/expenses/ExpenseList";

describe("Integration – Auth & Expenses", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("flux d’inscription → redirection login", async () => {
    vi.spyOn(authApi, "signup").mockResolvedValue({
      status: "OK",
      message: "Inscription réussie ! Veuillez vous connecter",
    });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<div>Page Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/Pseudo/i), "testuser");
    await userEvent.type(screen.getByLabelText(/Email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^Mot de passe$/i), "pass123");
    await userEvent.type(
      screen.getByLabelText(/Confirmation du mot de passe/i),
      "pass123"
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: /En soumettant ce formulaire/i })
    );
    await userEvent.click(screen.getByRole("button", { name: /S'inscrire/i }));

    expect(await screen.findByText(/Page Login/i)).toBeInTheDocument();
  });

  it("soumission d’une dépense met à jour la liste", async () => {
    // 1) Simule un utilisateur déjà connecté
    localStorage.setItem("user", JSON.stringify({ _id: "1" }));

    // 2) Mock des appels fetch :
    //    - Premier fetch (GET) renvoie []
    //    - Deuxième fetch (POST) renvoie la nouvelle dépense
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: 5,
          description: "Yoga",
          amount: "20",
          date: "2025-04-01",
        }),
      });

    // 3) Monte les providers dans un MemoryRouter
    render(
      <MemoryRouter>
        <AuthProvider>
          <ExpenseProvider>
            <ExpenseForm />
            <ExpenseList />
          </ExpenseProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // 4) ATTENDRE que le GET initial ait peuplé la liste vide
    //    (le composant ExpenseList affiche alors "Aucune dépense à afficher.")
    await screen.findByText(/Aucune dépense à afficher\./i);

    // 5) Remplissage du formulaire
    await userEvent.type(
      screen.getByPlaceholderText(/Description de la dépense/i),
      "Test"
    );
    await userEvent.type(screen.getByPlaceholderText(/Montant/i), "20");

    // On récupère directement l'input date par son attribut name
    const dateInput = document.querySelector('input[name="date"]');
    await userEvent.type(dateInput, "2025-04-01");

    // 6) Soumission
    await userEvent.click(
      screen.getByRole("button", { name: /Ajouter Dépense/i })
    );

    // 7) Assertions : le nouvel item apparaît bien
    expect(await screen.findByText(/Yoga/)).toBeInTheDocument();
    expect(screen.getByText(/20 €/i)).toBeInTheDocument();
  });
});
