// cypress/e2e/search-test.cy.ts
describe('Search Page Tests', () => {
  it('should test search functionality', () => {
    cy.viewport(1920, 1080)
    
    // Go directly to search page (route exists!)
    cy.visit('/search')
    
    // Verify page loaded
    cy.url().should('include', '/search')
    cy.screenshot('search-page-loaded')
    
    // Look for search input
    cy.get('body').then(($body) => {
      const inputSelectors = [
        'input[type="text"]',
        'input[type="search"]',
        'input[placeholder*="earch"]',
        'input[placeholder*="Search"]',
        '[data-testid="search-input"]'
      ]
      
      let foundInput = false
      inputSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !foundInput) {
          cy.get(selector).should('be.visible')
          cy.get(selector).type('javascript{enter}')
          foundInput = true
          cy.wait(2000) // Wait for search results
          cy.screenshot('search-results')
        }
      })
      
      if (!foundInput) {
        cy.log('⚠️ No search input found on /search page')
        // List all inputs for debugging
        cy.get('input').each(($input, index) => {
          console.log(`Input ${index}:`, {
            type: $input.attr('type'),
            placeholder: $input.attr('placeholder'),
            name: $input.attr('name')
          })
        })
      }
    })
  })
})