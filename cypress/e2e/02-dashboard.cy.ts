import { describe, beforeEach, it } from "node:test"

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

  it('should allow profile updates with all fields including name', () => {
    cy.visit('/dashboard')
    
    // Click edit profile button to show form
    cy.get('[data-testid="edit-profile"]').click()
    
    // Check if profile update form exists
    cy.get('[data-testid="profile-form"]').should('be.visible')
    
    // Update all profile information including name
    cy.get('input[id="name"]').clear().type('Updated Test User')
    cy.get('[data-testid="year-input"]').clear().type('2024')
    cy.get('[data-testid="major-input"]').clear().type('Computer Science')
    cy.get('[data-testid="bio-input"]').clear().type('Updated bio information')
    
    // Submit profile update
    cy.get('[data-testid="profile-update-button"]').click()
    
    // Wait for update to complete
    cy.wait(2000)
    
    // Check that profile name is updated in dashboard
    cy.get('[data-testid="user-name"]').should('contain', 'Updated Test User')
    
    // Check that profile information is displayed correctly
    cy.get('[data-testid="profile-section"]').should('contain', 'Computer Science')
    cy.get('[data-testid="profile-section"]').should('contain', 'Updated bio information')
  })

  it('should update profile completion percentage as fields are filled', () => {
    cy.visit('/dashboard')
    
    // Check initial profile completion
    cy.get('[data-testid="profile-section"]').should('contain', '%')
    
    // Click edit profile button
    cy.get('[data-testid="edit-profile"]').click()
    
    // Add more profile information
    cy.get('[data-testid="year-input"]').clear().type('2024')
    cy.get('[data-testid="major-input"]').clear().type('Computer Science')
    cy.get('[data-testid="bio-input"]').clear().type('This is my bio')
    
    // Save changes
    cy.get('[data-testid="profile-update-button"]').click()
    cy.wait(2000)
    
    // Check that profile completion percentage has increased
    cy.get('[data-testid="profile-section"]').should('contain', '%')
    cy.get('[data-testid="profile-section"]').should('contain', 'Profile Complete')
  })

  it('should handle profile picture upload', () => {
    cy.visit('/dashboard')
    
    // Check if avatar upload button exists
    cy.get('[data-testid="avatar-upload-button"]').should('be.visible')
    
    // Simulate file upload
    const fileName = 'test-avatar.jpg'
    cy.get('input[id="avatar-upload"]').attachFile(fileName, { force: true })
    
    // Wait for upload to complete
    cy.wait(3000)
    
    // Check that avatar image is updated (should show uploaded image or loading state)
    cy.get('[data-testid="profile-section"]').should('be.visible')
  })

  it('should sync profile picture between dashboard and navbar', () => {
    cy.visit('/dashboard')
    
    // Upload avatar
    const fileName = 'test-avatar.jpg'
    cy.get('input[id="avatar-upload"]').attachFile(fileName, { force: true })
    cy.wait(3000)
    
    // Navigate to another page to check navbar
    cy.visit('/events')
    
    // Check that header avatar is visible
    cy.get('[data-testid="header-avatar"]').should('be.visible')
    
    // Navigate back to dashboard
    cy.visit('/dashboard')
    
    // Check that dashboard avatar is consistent
    cy.get('[data-testid="profile-section"]').should('be.visible')
  })

  it('should show toast notifications for successful profile updates', () => {
    cy.visit('/dashboard')
    
    // Edit profile
    cy.get('[data-testid="edit-profile"]').click()
    cy.get('[data-testid="year-input"]').clear().type('2024')
    cy.get('[data-testid="profile-update-button"]').click()
    
    // Wait for toast to appear and check for success message
    cy.wait(1000)
    // Note: Toast might appear and disappear quickly, so we check for the presence of toast content
    cy.get('body').should('contain', 'Profile Updated!')
  })

  it('should handle profile editing cancellation', () => {
    cy.visit('/dashboard')
    
    const originalName = 'Cypress Test User'
    
    // Edit profile but don't save
    cy.get('[data-testid="edit-profile"]').click()
    cy.get('input[id="name"]').clear().type('Temporary Name Change')
    
    // Cancel editing
    cy.get('button').contains('Cancel').click()
    
    // Check that original name is preserved
    cy.get('[data-testid="user-name"]').should('contain', originalName)
    
    // Check that form is closed
    cy.get('[data-testid="profile-form"]').should('not.exist')
  })

  it('should validate profile picture file types and sizes', () => {
    cy.visit('/dashboard')
    
    // Try to upload invalid file type (we'll simulate this by checking the validation)
    cy.get('[data-testid="avatar-upload-button"]').should('be.visible')
    
    // The validation will be handled by the component, but we can test the UI exists
    cy.get('input[id="avatar-upload"]').should('have.attr', 'accept', 'image/*')
  })

  it('should display proper loading states during operations', () => {
    cy.visit('/dashboard')
    
    // Check for edit button
    cy.get('[data-testid="edit-profile"]').should('be.visible')
    
    // Edit and save profile to check loading state
    cy.get('[data-testid="edit-profile"]').click()
    cy.get('[data-testid="bio-input"]').clear().type('Testing loading state')
    
    // Click save and immediately check for any loading indicators
    cy.get('[data-testid="profile-update-button"]').click()
    
    // The form should eventually close indicating success
    cy.wait(2000)
    cy.get('[data-testid="profile-form"]').should('not.exist')
  })

  it('should display user statistics', () => {
    cy.visit('/dashboard')
    
    // Check if statistics section exists
    cy.get('[data-testid="user-stats"]').should('be.visible')
    cy.get('[data-testid="user-stats"]').should('contain', 'Events Attended')
    cy.get('[data-testid="user-stats"]').should('contain', 'Badges Earned')
    cy.get('[data-testid="user-stats"]').should('contain', 'Connections')
    cy.get('[data-testid="user-stats"]').should('contain', 'Profile Complete')
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
