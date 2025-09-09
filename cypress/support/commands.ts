/// <reference types="cypress" />

// Custom commands for Arisze application testing

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    
    // Wait for successful login - should redirect to dashboard
    cy.url().should('include', '/dashboard', { timeout: 15000 })
    
    // Verify session is established
    cy.request('/api/auth/session').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('user')
    })
  })
})

// Create test user command
Cypress.Commands.add('createTestUser', (email: string, password: string, name: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name,
      email,
      password,
      confirmPassword: password
    }
  }).then((response) => {
    expect(response.status).to.eq(201)
  })
})

// Clean up test data command
Cypress.Commands.add('cleanupTestData', () => {
  // This would connect to the database and clean up test data
  // For now, we'll just log it
  cy.log('Cleaning up test data...')
})

// Wait for API response command
Cypress.Commands.add('waitForApi', (alias: string, timeout = 10000) => {
  cy.wait(alias, { timeout })
})

// Intercept common API calls
Cypress.Commands.add('interceptCommonApis', () => {
  cy.intercept('GET', '/api/auth/session').as('getSession')
  cy.intercept('GET', '/api/users/profile').as('getProfile')
  cy.intercept('PUT', '/api/users/profile').as('updateProfile')
  cy.intercept('POST', '/api/users/avatar-upload').as('uploadAvatar')
  cy.intercept('GET', '/api/bookings').as('getBookings')
  cy.intercept('POST', '/api/bookings').as('createBooking')
  cy.intercept('DELETE', '/api/bookings').as('cancelBooking')
  cy.intercept('POST', '/api/universities/verify').as('verifyStudent')
  cy.intercept('GET', '/api/universities').as('getUniversities')
  cy.intercept('GET', '/api/cafes').as('getCafes')
  cy.intercept('POST', '/api/contact').as('submitContact')
  cy.intercept('POST', '/api/auth/register').as('register')
  cy.intercept('POST', '/api/auth/callback/credentials').as('login')
  cy.intercept('POST', '/api/auth/signout').as('signout')
})

// Setup test user command
Cypress.Commands.add('setupTestUser', () => {
  const testEmail = Cypress.env('TEST_EMAIL')
  const testPassword = Cypress.env('TEST_PASSWORD')
  const testName = Cypress.env('TEST_NAME')
  
  // Try to create test user (will fail if already exists, which is fine)
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name: testName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    },
    failOnStatusCode: false
  })
})

// Reset test data command
Cypress.Commands.add('resetTestData', () => {
  // This would ideally clean up test data from the database
  // For now, we'll just clear browser storage
  cy.clearAllCookies()
  cy.clearAllLocalStorage()
  cy.clearAllSessionStorage()
})

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to create a test user
       */
      createTestUser(email: string, password: string, name: string): Chainable<void>
      
      /**
       * Custom command to clean up test data
       */
      cleanupTestData(): Chainable<void>
      
      /**
       * Custom command to wait for API response
       */
      waitForApi(alias: string, timeout?: number): Chainable<void>
      
      /**
       * Custom command to intercept common API calls
       */
      interceptCommonApis(): Chainable<void>
      
      /**
       * Custom command to setup test user
       */
      setupTestUser(): Chainable<void>
      
      /**
       * Custom command to reset test data
       */
      resetTestData(): Chainable<void>
    }
  }
}