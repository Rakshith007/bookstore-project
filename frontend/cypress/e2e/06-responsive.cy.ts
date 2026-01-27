// cypress/e2e/06-responsive.cy.ts
import testData from '../fixtures/test-data.json'

describe('Responsive Design Tests', () => {
  // ✅ TEST 10: Responsive design (mobile view)
  it('should be responsive on mobile devices', () => {
    // Test iPhone view
    cy.viewport('iphone-x')
    cy.visit('http://localhost:3000')
    
    // Check hamburger menu exists (mobile navigation)
    cy.get('[data-testid="hamburger-menu"], .menu-toggle, button[aria-label*="menu"]')
      .should('be.visible')
      .click()
    
    // Check mobile menu opens
    cy.get('[data-testid="mobile-menu"], .mobile-nav')
      .should('be.visible')
      .within(() => {
        cy.contains('Home').should('be.visible')
        cy.contains('Books').should('be.visible')
        cy.contains('Login').should('be.visible')
      })
    
    // Close menu
    cy.get('button[aria-label*="close"], .close-menu').click().or(() => {
      cy.get('body').click(10, 10) // Click outside
    })
    
    // Check content fits mobile screen
    cy.get('body').should(($body) => {
      const bodyWidth = $body.width() || 0
      const windowWidth = Cypress.config('viewportWidth')
      expect(bodyWidth).to.be.lte(windowWidth) // No horizontal scroll
    })
    
    // Test tablet view
    cy.viewport('ipad-2')
    cy.reload()
    
    // Check layout adjusts
    cy.get('[data-testid="book-card"]').should('be.visible')
    cy.get('img').should('be.visible')
    
    // Test landscape mode
    cy.viewport('iphone-x', 'landscape')
    cy.reload()
    
    // Take screenshots for documentation
    cy.screenshot('mobile-portrait')
    cy.viewport('iphone-x', 'landscape')
    cy.screenshot('mobile-landscape')
    cy.viewport('ipad-2')
    cy.screenshot('tablet-view')
  })
})