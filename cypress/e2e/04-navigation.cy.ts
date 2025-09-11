describe('Navigation and Routing', () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should navigate between pages correctly', () => {
    // Test home page
    cy.visit('/')
    cy.get('h1').should('contain', 'Arisze')
    cy.get('a[href="/events"]').should('be.visible')
    cy.get('a[href="/login"]').should('be.visible')
    cy.get('a[href="/signup"]').should('be.visible')
    
    // Navigate to events page
    cy.get('a[href="/events"]').first().click()
    cy.url().should('include', '/events')
    cy.get('h1').should('contain', 'Events')
    
    // Navigate to login page
    cy.get('a[href="/login"]').first().click()
    cy.url().should('include', '/login')
    cy.get('h1').should('contain', 'Arisze')
    
    // Navigate to signup page
    cy.get('a[href="/signup"]').first().click()
    cy.url().should('include', '/signup')
    cy.get('h1').should('contain', 'Arisze')
  })

  it('should handle protected routes correctly', () => {
    // Try to access dashboard without authentication
    cy.visit('/dashboard')
    
    // Should redirect to login page
    cy.url().should('include', '/login')
    cy.get('.text-red-500').should('contain', 'Please log in')
  })

  it('should maintain navigation state after login', () => {
    // Try to access dashboard
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
    
    // Login
    cy.get('input[data-testid="login-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="login-password"]').type('CypressTest123!')
    cy.get('button[data-testid="login-submit"]').click()
    
    // Should redirect to dashboard after login
    cy.url().should('include', '/dashboard')
  })

  it('should display correct navigation for authenticated users', () => {
    // Register and login
    cy.visit('/signup')
    cy.get('input[data-testid="signup-name"]').type('Cypress Test User')
    cy.get('input[data-testid="signup-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="signup-password"]').type('CypressTest123!')
    cy.get('input[data-testid="signup-confirm-password"]').type('CypressTest123!')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
    
    cy.visit('/login')
    cy.get('input[data-testid="login-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="login-password"]').type('CypressTest123!')
    cy.get('button[data-testid="login-submit"]').click()
    cy.wait(1000)
    
    // Check navigation elements for authenticated users
    cy.get('nav').should('be.visible')
    cy.get('a[href="/"]').should('contain', 'Home')
    cy.get('a[href="/events"]').should('contain', 'Events')
    cy.get('a[href="/dashboard"]').should('contain', 'Dashboard')
    cy.get('[data-testid="logout-button"]').should('be.visible')
  })

  it('should handle back and forward navigation', () => {
    cy.visit('/')
    cy.get('a[href="/events"]').click()
    cy.url().should('include', '/events')
    
    // Go back
    cy.go('back')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Go forward
    cy.go('forward')
    cy.url().should('include', '/events')
  })

  it('should handle direct URL access', () => {
    // Test direct access to various pages
    cy.visit('/events')
    cy.get('h1').should('contain', 'Events')
    
    cy.visit('/login')
    cy.get('h1').should('contain', 'Arisze')
    
    cy.visit('/signup')
    cy.get('h1').should('contain', 'Arisze')
  })

  it('should maintain responsive navigation on mobile', () => {
    cy.viewport(375, 667) // iPhone SE size
    
    cy.visit('/')
    cy.get('nav').should('be.visible')
    
    // Check if mobile menu works
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
    cy.get('[data-testid="mobile-menu-button"]').click()
    cy.get('[data-testid="mobile-menu"]').should('be.visible')
    
    // Test navigation in mobile menu
    cy.get('[data-testid="mobile-menu"]').within(() => {
      cy.get('a[href="/events"]').should('be.visible')
      cy.get('a[href="/login"]').should('be.visible')
    })
  })

  it('should handle 404 pages gracefully', () => {
    // Visit non-existent page
    cy.visit('/non-existent-page', { failOnStatusCode: false })
    
    // Should show 404 page or redirect
    cy.get('body').then(($body) => {
      if ($body.text().includes('404') || $body.text().includes('Not Found')) {
        cy.get('body').should('contain', '404')
      } else {
        cy.url().should('eq', 'http://localhost:3000/')
      }
    })
  })
})
