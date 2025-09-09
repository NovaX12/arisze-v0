// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands for authentication
Cypress.Commands.add('loginUser', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy=email-input]').type(email)
  cy.get('[data-cy=password-input]').type(password)
  cy.get('[data-cy=login-button]').click()
})

Cypress.Commands.add('createTestUser', () => {
  const testUser = {
    name: 'Test User Cypress',
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123'
  }
  
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: testUser
  }).then((response) => {
    expect(response.status).to.eq(201)
    return testUser
  })
})

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      loginUser(email: string, password: string): Chainable<void>
      createTestUser(): Chainable<{name: string, email: string, password: string}>
    }
  }
}

