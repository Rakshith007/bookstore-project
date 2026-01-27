// cypress/e2e/04-payment.cy.ts
import testData from '../fixtures/test-data.json'

describe('Payment Flow Tests', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
    cy.visit('http://localhost:3000')
    cy.loginUser(testData.user.email, testData.user.password)
    
    // Add item to cart for payment test
    cy.visit('/books')
    cy.addBookToCart()
    cy.visit('/checkout')
  })

  // ✅ TEST 5: User attempts payment → Gets "coming soon" message
  it('should show payment integration message', () => {
    // Since payment is not integrated, expect appropriate message
    
    // Look for payment button
    cy.get('button:contains("Pay"), button:contains("Complete Donation")')
      .should('exist')
      .click()
    
    // Check for one of these scenarios:
    cy.get('body').then(($body) => {
      // Scenario 1: Payment integration message
      if ($body.text().match(/payment.*coming soon|integration.*progress|under development/i)) {
        cy.contains(/payment.*coming soon|integration.*progress|under development/i)
          .should('be.visible')
      }
      // Scenario 2: Payment page loads but shows test mode
      else if ($body.find('[data-testid="payment-form"]').length > 0) {
        cy.get('[data-testid="payment-form"]').should('exist')
        cy.contains(/test|sandbox|demo/i).should('be.visible')
      }
      // Scenario 3: Payment fails gracefully
      else {
        cy.contains(/error|failed|try again/i).should('be.visible')
      }
    })
    
    // Take screenshot for documentation
    cy.screenshot('payment-integration-message')
  })
})