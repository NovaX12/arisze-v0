import { beforeEach, describe, it } from "node:test"

describe('Complete Arisze Application Test Suite', () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should run complete user journey', () => {
    // Step 1: Visit home page
    cy.visit('/')
    cy.get('h1').should('contain', 'Arisze')
    cy.get('a[href="/signup"]').should('be.visible')
    
    // Step 2: Register new user
    cy.get('a[href="/signup"]').click()
    cy.url().should('include', '/signup')
    
    cy.get('input[data-testid="signup-name"]').type('Cypress Test User')
    cy.get('input[data-testid="signup-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="signup-password"]').type('CypressTest123!')
    cy.get('input[data-testid="signup-confirm-password"]').type('CypressTest123!')
    cy.get('button[type="submit"]').click()
    
    // Wait for redirect to login
    cy.url().should('include', '/login')
    cy.get('.text-green-500').should('contain', 'Account created successfully')
    
    // Step 3: Login
    cy.get('input[data-testid="login-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="login-password"]').type('CypressTest123!')
    cy.get('button[data-testid="login-submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    
    // Step 4: Check dashboard
    cy.get('h1').should('contain', 'Dashboard')
    cy.get('[data-testid="user-profile"]').should('be.visible')
    
    // Step 5: Navigate to events
    cy.get('a[href="/events"]').click()
    cy.url().should('include', '/events')
    cy.get('h1').should('contain', 'Events')
    
    // Step 6: Book an event
    cy.get('[data-testid="book-event-button"]').first().click()
    cy.get('[data-testid="booking-modal"]').should('be.visible')
    cy.get('[data-testid="booking-name"]').type('Cypress Test User')
    cy.get('[data-testid="booking-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="booking-phone"]').type('1234567890')
    cy.get('[data-testid="submit-booking"]').click()
    cy.get('.text-green-500').should('contain', 'Booking successful')
    
    // Step 7: Go back to dashboard
    cy.get('a[href="/dashboard"]').click()
    cy.url().should('include', '/dashboard')
    
    // Step 8: Update profile
    cy.get('[data-testid="year-input"]').clear().type('2024')
    cy.get('[data-testid="major-input"]').clear().type('Computer Science')
    cy.get('[data-testid="profile-update-button"]').click()
    cy.get('.text-green-500').should('contain', 'Profile updated successfully')
    
    // Step 9: Test contact form
    cy.get('a[href="/contact"]').click()
    cy.url().should('include', '/contact')
    cy.get('[data-testid="contact-name"]').type('Cypress Test User')
    cy.get('[data-testid="contact-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="contact-subject"]').type('Test Subject')
    cy.get('[data-testid="contact-message"]').type('Test message from Cypress')
    cy.get('[data-testid="contact-submit"]').click()
    cy.get('.text-green-500').should('contain', 'Message sent successfully')
    
    // Step 10: Logout
    cy.get('[data-testid="logout-button"]').click()
    cy.url().should('include', '/login')
    
    // Step 11: Verify logout worked
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('should handle error scenarios gracefully', () => {
    // Test invalid login
    cy.visit('/login')
    cy.get('input[data-testid="login-email"]').type('invalid@example.com')
    cy.get('input[data-testid="login-password"]').type('wrongpassword')
    cy.get('button[data-testid="login-submit"]').click()
    cy.get('.text-red-500').should('contain', 'Invalid email or password')
    
    // Test form validation
    cy.visit('/signup')
    cy.get('button[type="submit"]').click()
    cy.get('.text-red-500').should('contain', 'Name is required')
    
    // Test protected route access
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('should be responsive across different screen sizes', () => {
    // Test mobile view
    cy.viewport(375, 667)
    cy.visit('/')
    cy.get('h1').should('be.visible')
    cy.get('nav').should('be.visible')
    
    // Test tablet view
    cy.viewport(768, 1024)
    cy.visit('/')
    cy.get('h1').should('be.visible')
    cy.get('nav').should('be.visible')
    
    // Test desktop view
    cy.viewport(1280, 720)
    cy.visit('/')
    cy.get('h1').should('be.visible')
    cy.get('nav').should('be.visible')
  })
})
