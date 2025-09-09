describe('Dashboard Functionality', () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Register and login before each test
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
  })

  it('should display dashboard correctly', () => {
    cy.visit('/dashboard')
    
    // Check dashboard elements
    cy.get('h1').should('contain', 'Dashboard')
    cy.get('nav').should('be.visible')
    cy.get('a[href="/"]').should('contain', 'Home')
    cy.get('a[href="/events"]').should('contain', 'Events')
    cy.get('a[href="/dashboard"]').should('contain', 'Dashboard')
  })

  it('should display user profile information', () => {
    cy.visit('/dashboard')
    
    // Check if user profile section exists
    cy.get('[data-testid="user-profile"]').should('be.visible')
    cy.get('[data-testid="user-name"]').should('contain', 'Cypress Test User')
    cy.get('[data-testid="user-email"]').should('contain', 'cypress@arisze.com')
  })

  it('should allow profile updates', () => {
    cy.visit('/dashboard')
    
    // Check if profile update form exists
    cy.get('[data-testid="profile-form"]').should('be.visible')
    
    // Update profile information
    cy.get('[data-testid="university-input"]').clear().type('Updated University')
    cy.get('[data-testid="year-input"]').clear().type('2024')
    cy.get('[data-testid="major-input"]').clear().type('Computer Science')
    cy.get('[data-testid="bio-input"]').clear().type('Updated bio information')
    
    // Submit profile update
    cy.get('[data-testid="profile-update-button"]').click()
    
    // Check for success message
    cy.get('.text-green-500').should('contain', 'Profile updated successfully')
  })

  it('should display user statistics', () => {
    cy.visit('/dashboard')
    
    // Check if statistics section exists
    cy.get('[data-testid="user-stats"]').should('be.visible')
    cy.get('[data-testid="events-attended"]').should('be.visible')
    cy.get('[data-testid="badges-earned"]').should('be.visible')
    cy.get('[data-testid="profile-completion"]').should('be.visible')
  })

  it('should handle logout functionality', () => {
    cy.visit('/dashboard')
    
    // Check if logout button exists
    cy.get('[data-testid="logout-button"]').should('be.visible')
    
    // Click logout
    cy.get('[data-testid="logout-button"]').click()
    
    // Should redirect to login page
    cy.url().should('include', '/login')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport(375, 667) // iPhone SE size
    cy.visit('/dashboard')
    
    // Check if dashboard is still functional on mobile
    cy.get('h1').should('be.visible')
    cy.get('nav').should('be.visible')
    cy.get('[data-testid="user-profile"]').should('be.visible')
  })
})
