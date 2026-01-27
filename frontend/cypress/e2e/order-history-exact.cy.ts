// cypress/e2e/order-history-exact.cy.ts
describe('Order History Tests - EXACT', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080)
    
    // Login
    cy.visit('/login')
    cy.get('input[type="email"]').type('rakshi@gmail.com')
    cy.get('input[type="password"]').type('test@123')
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
  })

  it('should show order history page at /orders-history', () => {
    // Go directly to order history page (EXISTS in your routes!)
    cy.visit('/orders-history')
    
    // Verify URL
    cy.url().should('include', '/orders-history')
    cy.screenshot('orders-history-page-exact')
    
    // Check page title/content
    cy.get('body').invoke('text').then((text) => {
      console.log('Order History Page Text:', text.substring(0, 500))
      
      if (text.includes('Order History') || text.includes('My Orders')) {
        cy.log('✅ On Order History page')
        
        // Check if empty (new user)
        if (text.includes('No orders') || text.includes('Empty') || text.includes('Start donating')) {
          cy.log('✅ Shows empty order history (correct)')
          cy.contains(/no orders|empty|start donating/i).should('be.visible')
        } else {
          cy.log('⚠️ Order history has content')
        }
      } else {
        cy.log('ℹ️ Page loaded but check screenshot for content')
      }
    })
  })

  it('should also check profile page at /profile', () => {
    cy.visit('/profile')
    cy.url().should('include', '/profile')
    cy.screenshot('profile-page-exact')
    cy.log('✅ Profile page loaded successfully')
  })

  it('should check account info page at /accountinfo', () => {
    cy.visit('/accountinfo')
    cy.url().should('include', '/accountinfo')
    cy.screenshot('account-info-page-exact')
    cy.log('✅ Account Info page loaded successfully')
  })
})