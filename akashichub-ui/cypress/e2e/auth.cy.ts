describe('認證功能測試', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('應該顯示登入頁面', () => {
    cy.contains('阿卡西 IT 資源管理系統')
    cy.contains('統一管理您的 IT 基礎設施資源')
    cy.get('input[placeholder="請輸入登入帳號"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('應該能夠成功登入', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            loginAccount: 'admin',
            displayName: '系統管理員',
            role: 'Admin'
          }
        }
      }
    }).as('login')

    cy.get('input[placeholder="請輸入登入帳號"]').type('admin')
    cy.get('input[type="password"]').type('admin123')
    cy.get('button[type="submit"]').click()

    cy.wait('@login')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.checkMessage('success', '登入成功')
  })

  it('應該處理登入失敗', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '帳號或密碼錯誤'
        }
      }
    }).as('loginFailed')

    cy.get('input[placeholder="請輸入登入帳號"]').type('admin')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginFailed')
    cy.url().should('include', '/login')
    cy.checkMessage('error', '帳號或密碼錯誤')
  })

  it('應該驗證必填欄位', () => {
    cy.get('button[type="submit"]').click()
    
    // 檢查表單驗證
    cy.get('.el-form-item__error').should('be.visible')
  })

  it('應該能夠切換密碼顯示', () => {
    cy.get('input[type="password"]').should('be.visible')
    
    // 假設有顯示密碼的按鈕
    cy.get('.password-toggle').click()
    cy.get('input[type="text"]').should('be.visible')
  })

  it('應該能夠使用訪客登入', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'guest-token',
          user: {
            id: 2,
            loginAccount: 'guest',
            displayName: '訪客用戶',
            role: 'User'
          }
        }
      }
    }).as('guestLogin')

    cy.contains('訪客登入').click()

    cy.wait('@guestLogin')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('應該在已登入狀態下重定向到首頁', () => {
    // 模擬已登入狀態
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token')
    })

    cy.visit('/login')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})

describe('登出功能測試', () => {
  beforeEach(() => {
    cy.login()
  })

  it('應該能夠成功登出', () => {
    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: { success: true }
    }).as('logout')

    cy.logout()

    cy.wait('@logout')
    cy.url().should('include', '/login')
    cy.checkMessage('success', '登出成功')
  })

  it('應該清除本地存儲', () => {
    cy.logout()

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null
    })
  })
})