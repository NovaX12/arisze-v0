describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should display login page correctly', () => {
    cy.visit('/login')
    
    // Check page elements
    cy.get('h1').should('contain', 'Arisze')
    cy.get('input[data-testid="login-email"]').should('be.visible')
    cy.get('input[data-testid="login-password"]').should('be.visible')
    cy.get('button[data-testid="login-submit"]').should('be.visible')
    cy.get('a[href="/signup"]').should('contain', 'Sign up here')
    
    // Verify no Google auth button
    cy.get('button').should('not.contain', 'Google')
  })

  it('should display signup page correctly', () => {
    cy.visit('/signup')
    
    // Check page elements
    cy.get('h1').should('contain', 'Arisze')
    cy.get('input[data-testid="signup-name"]').should('be.visible')
    cy.get('input[data-testid="signup-email"]').should('be.visible')
    cy.get('input[data-testid="signup-password"]').should('be.visible')
    cy.get('input[data-testid="signup-confirm-password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Create Account')
    cy.get('a[href="/login"]').should('contain', 'Sign in here')
  })

  it('should validate signup form', () => {
    cy.visit('/signup')
    
    // Test empty form validation
    cy.get('button[type="submit"]').click()
    cy.get('.text-red-500').should('contain', 'Name is required')
    
    // Test email validation
    cy.get('input[data-testid="signup-name"]').type('Test User')
    cy.get('input[data-testid="signup-email"]').type('invalid-email')
    cy.get('button[type="submit"]').click()
    cy.get('.text-red-500').should('contain', 'valid email address')
    
    // Test password validation
    cy.get('input[data-testid="signup-email"]').clear().type('test@example.com')
    cy.get('input[data-testid="signup-password"]').type('123')
    cy.get('button[type="submit"]').click()
    cy.get('.text-red-500').should('contain', 'at least 8 characters')
    
    // Test password confirmation
    cy.get('input[data-testid="signup-password"]').clear().type('password123')
    cy.get('input[data-testid="signup-confirm-password"]').type('different123')
    cy.get('button[type="submit"]').click()
    cy.get('.text-red-500').should('contain', 'Passwords do not match')
  })

  it('should successfully register a new user', () => {
    cy.visit('/signup')
    
    // Fill out the form
    cy.get('input[data-testid="signup-name"]').type('Cypress Test User')
    cy.get('input[data-testid="signup-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="signup-password"]').type('CypressTest123!')
    cy.get('input[data-testid="signup-confirm-password"]').type('CypressTest123!')
    cy.get('input[data-testid="signup-university"]').type('Test University')
    
    // Submit the form
    cy.get('button[type="submit"]').click()
    
    // Check for success message
    cy.get('.text-green-500').should('contain', 'Account created successfully')
    
    // Should redirect to login page
    cy.url().should('include', '/login')
  })

  it('should successfully login with valid credentials', () => {
    // First register a user
    cy.visit('/signup')
    cy.get('input[data-testid="signup-name"]').type('Cypress Test User')
    cy.get('input[data-testid="signup-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="signup-password"]').type('CypressTest123!')
    cy.get('input[data-testid="signup-confirm-password"]').type('CypressTest123!')
    cy.get('button[type="submit"]').click()
    cy.wait(2000) // Wait for redirect
    
    // Now test login
    cy.visit('/login')
    cy.get('input[data-testid="login-email"]').type('cypress@arisze.com')
    cy.get('input[data-testid="login-password"]').type('CypressTest123!')
    cy.get('button[data-testid="login-submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should show error for invalid login credentials', () => {
    cy.visit('/login')
    cy.get('input[data-testid="login-email"]').type('nonexistent@example.com')
    cy.get('input[data-testid="login-password"]').type('wrongpassword')
    cy.get('button[data-testid="login-submit"]').click()
    
    // Should show error message
    cy.get('.text-red-500').should('contain', 'Invalid email or password')
  })

  it('should toggle password visibility', () => {
    cy.visit('/login')
    
    // Test password visibility toggle
    cy.get('input[data-testid="login-password"]').type('testpassword')
    cy.get('input[data-testid="login-password"]').should('have.attr', 'type', 'password')
    
    // Click toggle button
    cy.get('button[type="button"]').click()
    cy.get('input[data-testid="login-password"]').should('have.attr', 'type', 'text')
    
    // Click again to hide
    cy.get('button[type="button"]').click()
    cy.get('input[data-testid="login-password"]').should('have.attr', 'type', 'password')
  })
})
