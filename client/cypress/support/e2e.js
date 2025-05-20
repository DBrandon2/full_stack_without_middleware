// cypress/support/e2e.js

// 1) Ajouter cet import pour avoir toutes les commandes Testing Library
import '@testing-library/cypress/add-commands'

// 2) Puis charger vos commandes perso (si vous en avez)
import './commands'

// ——————————————————————————————————————————————————————————
// Le reste de votre configuration globale Cypress…
// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
// …