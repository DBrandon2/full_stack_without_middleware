// cypress/e2e/auth-expense.spec.js

describe("E2E – Auth & Expense", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept(
      { method: "POST", url: "**/user/login" },
      {
        statusCode: 200,
        body: { _id: "u1", username: "toto" },
      }
    ).as("apiLogin");
    cy.intercept("GET", "/expenses/u1", { statusCode: 200, body: [] }).as(
      "apiGet"
    );
    cy.intercept("POST", "/expenses", (req) => {
      req.reply({ statusCode: 200, body: { ...req.body, _id: 99 } });
    }).as("apiPost");
  });

  it("se connecte, voit liste vide, ajoute une dépense et la voit", () => {
    // 1) On va sur la page /login
    cy.visit("/login");

    // 2) On remplit le formulaire AVEC “Pseudo” et “Mot de passe”
    cy.findByLabelText(/Email/i).type("toto@example.com");
    cy.findByLabelText(/Mot de passe/i).type("pass123");
    // le bouton s’appelle "Submit" dans votre code
    cy.findByRole("button", { name: /Se connecter/i }).click();

    // 3) On attend la réponse du login et la redirection
    cy.wait("@apiLogin");
    // Puis on vérifie qu’on est bien redirigé sur "/"
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // 4) On attend le GET initial (liste vide)
    cy.wait("@apiGet");
    cy.findByText(/Aucune dépense à afficher\./i).should("be.visible");

    // 5) On ajoute une dépense
    cy.findByPlaceholderText(/Description de la dépense/i).type("E2E Test");
    cy.findByPlaceholderText(/Montant/i).type("50");
    cy.get('input[name="date"]').type("2025-04-24");
    cy.findByRole("button", { name: /Ajouter Dépense/i }).click();
    cy.wait("@apiPost");

    // 6) On vérifie qu’elle est bien affichée
    cy.findByText(/E2E Test/i).should("be.visible");
    cy.findByText(/50 €/i).should("be.visible");
  });
});
