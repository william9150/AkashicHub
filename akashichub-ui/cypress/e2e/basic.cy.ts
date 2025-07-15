describe('基本功能測試', () => {
  it('應該能夠訪問應用首頁', () => {
    cy.visit('/')
    
    // 如果沒有登入，應該重定向到登入頁面
    cy.url().should('include', '/login')
    cy.contains('阿卡西')
  })

  it('應該顯示登入表單', () => {
    cy.visit('/login')
    
    cy.get('input[placeholder*="登入帳號"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button').contains('登入').should('be.visible')
  })

  it('應該能夠填寫登入表單', () => {
    cy.visit('/login')
    
    cy.get('input[placeholder*="登入帳號"]').type('testuser')
    cy.get('input[type="password"]').type('password123')
    
    cy.get('input[placeholder*="登入帳號"]').should('have.value', 'testuser')
    cy.get('input[type="password"]').should('have.value', 'password123')
  })
})