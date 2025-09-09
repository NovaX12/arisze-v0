describe('Contact Form Functionality', () => {
  it('should display contact page correctly', () => {
    cy.visit('/contact')
    
    // Check page elements
    cy.get('h1').should('contain', 'Contact')
    cy.get('[data-testid="contact-form"]').should('be.visible')
    cy.get('[data-testid="contact-name"]').should('be.visible')
    cy.get('[data-testid="contact-email"]').should('be.visible')
    cy.get('[data-testid="contact-subject"]').should('be.visible')
    cy.get('[data-testid="contact-message"]').should('be.visible')
    cy.get('[data-testid="contact-submit"]').should('be.visible')
  })

  it('should validate contact form fields', () => {
    cy.visit('/contact')
    
    // Test empty form validation
    cy.get('[data-testid="contact-submit"]').click()
    cy.get('.text-red-500').should('contain', 'required')
    
    // Test email validation
    cy.get('[data-testid="contact-name"]').type('Test User')
    cy.get('[data-testid="contact-email"]').type('invalid-email')
    cy.get('[data-testid="contact-subject"]').type('Test Subject')
    cy.get('[data-testid="contact-message"]').type('Test message')
    cy.get('[data-testid="contact-submit"]').click()
    cy.get('.text-red-500').should('contain', 'valid email')
  })

  it('should successfully submit contact form', () => {
    cy.visit('/contact')
    
    // Fill out the form
    cy.get('[data-testid="contact-name"]').type('Cypress Test User')
    cy.get('[data-testid="contact-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="contact-subject"]').type('Test Subject')
    cy.get('[data-testid="contact-message"]').type('This is a test message from Cypress')
    
    // Submit the form
    cy.get('[data-testid="contact-submit"]').click()
    
    // Check for success message
    cy.get('.text-green-500').should('contain', 'Message sent successfully')
  })

  it('should handle form submission errors gracefully', () => {
    cy.visit('/contact')
    
    // Fill out the form
    cy.get('[data-testid="contact-name"]').type('Cypress Test User')
    cy.get('[data-testid="contact-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="contact-subject"]').type('Test Subject')
    cy.get('[data-testid="contact-message"]').type('This is a test message from Cypress')
    
    // Mock API error
    cy.intercept('POST', '/api/contact', { statusCode: 500, body: { error: 'Server error' } })
    
    // Submit the form
    cy.get('[data-testid="contact-submit"]').click()
    
    // Check for error message
    cy.get('.text-red-500').should('contain', 'error')
  })

  it('should clear form after successful submission', () => {
    cy.visit('/contact')
    
    // Fill out the form
    cy.get('[data-testid="contact-name"]').type('Cypress Test User')
    cy.get('[data-testid="contact-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="contact-subject"]').type('Test Subject')
    cy.get('[data-testid="contact-message"]').type('This is a test message from Cypress')
    
    // Submit the form
    cy.get('[data-testid="contact-submit"]').click()
    
    // Wait for success message
    cy.get('.text-green-500').should('contain', 'Message sent successfully')
    
    // Check if form is cleared
    cy.get('[data-testid="contact-name"]').should('have.value', '')
    cy.get('[data-testid="contact-email"]').should('have.value', '')
    cy.get('[data-testid="contact-subject"]').should('have.value', '')
    cy.get('[data-testid="contact-message"]').should('have.value', '')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport(375, 667) // iPhone SE size
    cy.visit('/contact')
    
    // Check if contact form is still functional on mobile
    cy.get('h1').should('be.visible')
    cy.get('[data-testid="contact-form"]').should('be.visible')
    cy.get('[data-testid="contact-name"]').should('be.visible')
    cy.get('[data-testid="contact-email"]').should('be.visible')
    cy.get('[data-testid="contact-subject"]').should('be.visible')
    cy.get('[data-testid="contact-message"]').should('be.visible')
    cy.get('[data-testid="contact-submit"]').should('be.visible')
  })

  it('should handle long messages correctly', () => {
    cy.visit('/contact')
    
    // Fill out the form with a long message
    cy.get('[data-testid="contact-name"]').type('Cypress Test User')
    cy.get('[data-testid="contact-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="contact-subject"]').type('Test Subject')
    cy.get('[data-testid="contact-message"]').type('This is a very long test message that should test the form handling of long text content. '.repeat(10))
    
    // Submit the form
    cy.get('[data-testid="contact-submit"]').click()
    
    // Check for success message
    cy.get('.text-green-500').should('contain', 'Message sent successfully')
  })
})
