// cypress/e2e/debug-simple.cy.ts
describe('Simple Debug Test', () => {
  it('check homepage and auth URLs', () => {
    cy.visit('http://localhost:3000')
    cy.wait(3000)
    
    console.log('=== CURRENT URL ===')
    console.log('URL:', cy.url())
    
    // Try to visit common auth URLs directly
    const authUrls = [
      '/register',
      '/signup', 
      '/auth/register',
      '/login',
      '/signin',
      '/auth/login'
    ]
    
    authUrls.forEach(url => {
      cy.request({
        url: `http://localhost:3000${url}`,
        failOnStatusCode: false
      }).then((response) => {
        console.log(`${url}: Status ${response.status}`)
      })
    })
    
    // Take screenshot
    cy.screenshot('homepage-simple')
    
    // Show all clickable elements
    console.log('=== CLICKABLE ELEMENTS ===')
    cy.get('a, button').each(($el, index) => {
      const tag = $el.prop('tagName')
      const text = $el.text().trim().substring(0, 30)
      const href = $el.attr('href') || 'N/A'
      console.log(`${index}. ${tag}: "${text}" -> ${href}`)
    })
  })
})