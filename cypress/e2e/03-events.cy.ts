describe('Events Functionality', () => {
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

  it('should display events page correctly', () => {
    cy.visit('/events')
    
    // Check page elements
    cy.get('h1').should('contain', 'Events')
    cy.get('[data-testid="events-list"]').should('be.visible')
    cy.get('[data-testid="search-input"]').should('be.visible')
    cy.get('[data-testid="filter-dropdown"]').should('be.visible')
  })

  it('should display event cards with proper information', () => {
    cy.visit('/events')
    
    // Check if event cards are displayed
    cy.get('[data-testid="event-card"]').should('have.length.greaterThan', 0)
    
    // Check event card content
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.get('[data-testid="event-title"]').should('be.visible')
      cy.get('[data-testid="event-date"]').should('be.visible')
      cy.get('[data-testid="event-location"]').should('be.visible')
      cy.get('[data-testid="event-description"]').should('be.visible')
      cy.get('[data-testid="book-event-button"]').should('be.visible')
    })
  })

  it('should allow event booking', () => {
    cy.visit('/events')
    
    // Click on first event's book button
    cy.get('[data-testid="book-event-button"]').first().click()
    
    // Check if booking modal or page opens
    cy.get('[data-testid="booking-modal"]').should('be.visible')
    
    // Fill booking form
    cy.get('[data-testid="booking-name"]').type('Cypress Test User')
    cy.get('[data-testid="booking-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="booking-phone"]').type('1234567890')
    cy.get('[data-testid="booking-notes"]').type('Test booking from Cypress')
    
    // Submit booking
    cy.get('[data-testid="submit-booking"]').click()
    
    // Check for success message
    cy.get('.text-green-500').should('contain', 'Booking successful')
  })

  it('should filter events by category', () => {
    cy.visit('/events')
    
    // Check if filter dropdown exists
    cy.get('[data-testid="filter-dropdown"]').should('be.visible')
    
    // Select a category filter
    cy.get('[data-testid="filter-dropdown"]').click()
    cy.get('[data-testid="filter-option"]').first().click()
    
    // Check if events are filtered
    cy.get('[data-testid="event-card"]').should('have.length.greaterThan', 0)
  })

  it('should search events by title', () => {
    cy.visit('/events')
    
    // Type in search input
    cy.get('[data-testid="search-input"]').type('test event')
    
    // Check if search results are displayed
    cy.get('[data-testid="event-card"]').should('have.length.greaterThan', 0)
  })

  it('should display event details page', () => {
    cy.visit('/events')
    
    // Click on first event
    cy.get('[data-testid="event-card"]').first().click()
    
    // Check if event details page loads
    cy.url().should('include', '/events/')
    cy.get('[data-testid="event-details"]').should('be.visible')
    cy.get('[data-testid="event-title"]').should('be.visible')
    cy.get('[data-testid="event-description"]').should('be.visible')
    cy.get('[data-testid="event-date"]').should('be.visible')
    cy.get('[data-testid="event-location"]').should('be.visible')
  })

  it('should handle event booking cancellation', () => {
    cy.visit('/events')
    
    // Book an event first
    cy.get('[data-testid="book-event-button"]').first().click()
    cy.get('[data-testid="booking-modal"]').should('be.visible')
    cy.get('[data-testid="booking-name"]').type('Cypress Test User')
    cy.get('[data-testid="booking-email"]').type('cypress@arisze.com')
    cy.get('[data-testid="submit-booking"]').click()
    cy.wait(1000)
    
    // Go to dashboard to check bookings
    cy.visit('/dashboard')
    cy.get('[data-testid="my-bookings"]').click()
    
    // Cancel the booking
    cy.get('[data-testid="cancel-booking"]').first().click()
    cy.get('[data-testid="confirm-cancel"]').click()
    
    // Check for success message
    cy.get('.text-green-500').should('contain', 'Booking cancelled')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport(375, 667) // iPhone SE size
    cy.visit('/events')
    
    // Check if events page is still functional on mobile
    cy.get('h1').should('be.visible')
    cy.get('[data-testid="events-list"]').should('be.visible')
    cy.get('[data-testid="event-card"]').should('be.visible')
  })
})
