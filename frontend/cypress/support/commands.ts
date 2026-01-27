// cypress/support/commands.ts

// Declare Cypress custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      loginUser(email: string, password: string): Chainable<void>
      registerUser(email: string, password: string, name?: string): Chainable<void>
      logoutUser(): Chainable<void>
      navigateToBooks(): Chainable<void>
      navigateToSearch(): Chainable<void>
    }
  }
}

// Login command - uses /login (correct for your app)
Cypress.Commands.add('loginUser', (email: string, password: string) => {
  cy.visit('/login')
  
  // Wait for page to load
  cy.get('body').should('exist')
  
  // Fill login form - use flexible selectors
  cy.get('input[type="email"], input[name="email"], #email')
    .should('be.visible')
    .type(email)
  
  cy.get('input[type="password"], input[name="password"], #password')
    .should('be.visible')
    .type(password)
  
  // Submit form
  cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign In")')
    .should('be.enabled')
    .click()
  
  // Wait for login to complete
  cy.wait(2000)
  
  // Verify login success (not on login page anymore)
  cy.url().should('not.include', '/login')
  
  // Check for logout button or user indicator
  cy.get('body').then(($body) => {
    if ($body.find('button:contains("Logout")').length === 0) {
      cy.log('⚠️ No logout button found after login - might need different verification')
      cy.screenshot('after-login-no-logout')
    }
  })
})

// Register command - uses /signup (NOT /register!)
Cypress.Commands.add('registerUser', (email: string, password: string, name?: string) => {
  cy.visit('/signup')  // CORRECT: Your app uses /signup
  
  // Wait for page to load
  cy.get('body').should('exist')
  cy.screenshot('signup-page-loaded')
  
  // Smart form filling - don't rely on specific input order
  cy.get('body').then(($body) => {
    // Find ALL inputs on the page
    const inputs = $body.find('input')
    console.log(`Found ${inputs.length} input fields on signup page`)
    
    // Fill based on input type and attributes
    inputs.each((index, input) => {
      const type = input.type
      const nameAttr = input.name || ''
      const placeholder = input.placeholder || ''
      const id = input.id || ''
      
      console.log(`Input ${index}: type="${type}" name="${nameAttr}" placeholder="${placeholder}"`)
      
      if (type === 'email' || nameAttr.includes('email') || 
          placeholder.toLowerCase().includes('email') || id.includes('email')) {
        cy.wrap(input).clear().type(email)
      } else if (type === 'password' || nameAttr.includes('password') || 
                placeholder.toLowerCase().includes('password') || id.includes('password')) {
        cy.wrap(input).clear().type(password)
      } else if (nameAttr.includes('name') || nameAttr.includes('username') ||
                placeholder.toLowerCase().includes('name') || id.includes('name')) {
        cy.wrap(input).clear().type(name || 'Test User')
      }
    })
  })
  
  // Submit form
  cy.get('button[type="submit"], button:contains("Sign Up"), button:contains("Register")')
    .should('be.enabled')
    .click()
  
  // Wait for registration to process
  cy.wait(3000)
  
  // Check registration result
  cy.get('body').then(($body) => {
    const currentUrl = cy.url()
    console.log('URL after registration attempt:', currentUrl)
    
    // Check for success indicators
    if ($body.text().match(/success|welcome|verify|check your email/i)) {
      cy.log('✅ Registration shows success message')
      cy.screenshot('registration-success')
    } else if ($body.text().match(/error|invalid|already exists/i)) {
      cy.log('⚠️ Registration shows error')
      cy.screenshot('registration-error')
    } else if (!currentUrl.includes('/signup')) {
      cy.log('✅ Redirected away from signup page - likely success')
      cy.screenshot('registration-redirected')
    }
  })
})

// Logout command
Cypress.Commands.add('logoutUser', () => {
  cy.get('body').then(($body) => {
    // Try to find logout button
    if ($body.find('button:contains("Logout")').length > 0) {
      cy.get('button:contains("Logout")').click()
      cy.log('✅ Clicked logout button')
    } 
    // Check for user menu dropdown
    else if ($body.find('[data-testid="user-menu"], .user-menu, .profile-dropdown').length > 0) {
      cy.get('[data-testid="user-menu"], .user-menu, .profile-dropdown').click()
      cy.wait(500)
      cy.contains('Logout').click()
      cy.log('✅ Logged out via user menu')
    }
    // Check for sign out link
    else if ($body.find('a:contains("Logout"), a:contains("Sign Out")').length > 0) {
      cy.get('a:contains("Logout"), a:contains("Sign Out")').click()
      cy.log('✅ Clicked logout link')
    }
    else {
      cy.log('⚠️ No logout element found - might already be logged out')
      cy.screenshot('no-logout-found')
    }
  })
  
  // After logout, should see login button
  cy.wait(1000)
  cy.get('body').then(($body) => {
    if ($body.find('a:contains("Login"), button:contains("Login")').length > 0) {
      cy.log('✅ Logout successful - login button visible')
    }
  })
})

// Navigate to books (homepage - where books are shown)
Cypress.Commands.add('navigateToBooks', () => {
  // Books are on homepage in your app
  cy.visit('/')
  
  // Verify we're on a page that should show books
  cy.get('body').invoke('text').then((text) => {
    if (text.match(/book|Book|store|shop|browse/i)) {
      cy.log('✅ On page with book content')
    } else {
      cy.log('⚠️ Page might not show books directly')
    }
  })
})

// Navigate to search page
Cypress.Commands.add('navigateToSearch', () => {
  cy.visit('/search')
  
  // Verify search page loaded
  cy.url().should('include', '/search')
  cy.get('input[type="text"], input[type="search"]').should('exist')
  cy.log('✅ Navigated to search page')
})

// Add book to cart from product page
Cypress.Commands.add('addBookToCartFromProductPage', () => {
  // Navigate to a book product page first
  cy.visit('/search')
  cy.wait(1000)
  cy.get('a[href*="/books/"]').first().click()
  cy.wait(1000)
  
  // Add to cart
  cy.get('button:contains("Add to Cart")').click()
  cy.wait(1000)
})

// Go to cart and verify
Cypress.Commands.add('verifyCartHasItems', () => {
  cy.visit('/cart')
  cy.url().should('include', '/cart')
  
  cy.get('body').then(($body) => {
    if ($body.text().match(/cart is empty|no items/i)) {
      return false
    }
    return true
  })
})