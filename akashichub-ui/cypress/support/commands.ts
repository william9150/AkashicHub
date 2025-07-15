// Cypress 自定義命令

// 登入命令
Cypress.Commands.add('login', (username: string = 'admin', password: string = 'admin123') => {
  cy.visit('/login')
  cy.get('input[placeholder="請輸入登入帳號"]').type(username)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/login')
})

// 登出命令
Cypress.Commands.add('logout', () => {
  cy.get('.user-menu').click()
  cy.contains('登出').click()
  cy.url().should('include', '/login')
})

// 導航到指定頁面
Cypress.Commands.add('navigateTo', (path: string) => {
  cy.visit(path)
  cy.url().should('include', path)
})

// 等待 API 請求完成
Cypress.Commands.add('waitForApi', (alias: string) => {
  cy.wait(alias)
})

// 檢查元素是否可見
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible')
})

// 檢查元素是否包含文本
Cypress.Commands.add('shouldContainText', { prevSubject: 'element' }, (subject, text: string) => {
  cy.wrap(subject).should('contain.text', text)
})

// 填寫表單
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-cy="${field}"], input[name="${field}"], select[name="${field}"]`)
      .type(value)
  })
})

// 搜索功能
Cypress.Commands.add('search', (query: string) => {
  cy.get('input[placeholder*="搜索"]').type(query)
  cy.get('button[type="submit"], .search-button').click()
})

// 等待載入完成
Cypress.Commands.add('waitForLoad', () => {
  cy.get('.el-loading-mask', { timeout: 10000 }).should('not.exist')
})

// 檢查表格行數
Cypress.Commands.add('checkTableRows', (count: number) => {
  cy.get('.el-table__body tr').should('have.length', count)
})

// 點擊表格行的操作按鈕
Cypress.Commands.add('clickTableAction', (rowIndex: number, action: string) => {
  cy.get('.el-table__body tr').eq(rowIndex).within(() => {
    cy.contains(action).click()
  })
})

// 確認對話框
Cypress.Commands.add('confirmDialog', () => {
  cy.get('.el-message-box__btns .el-button--primary').click()
})

// 取消對話框
Cypress.Commands.add('cancelDialog', () => {
  cy.get('.el-message-box__btns .el-button:not(.el-button--primary)').click()
})

// 檢查消息提示
Cypress.Commands.add('checkMessage', (type: 'success' | 'error' | 'warning' | 'info', message?: string) => {
  cy.get(`.el-message--${type}`).should('be.visible')
  if (message) {
    cy.get(`.el-message--${type}`).should('contain.text', message)
  }
})

// 設置視窗大小
Cypress.Commands.add('setViewportSize', (width: number, height: number) => {
  cy.viewport(width, height)
})

// TypeScript 聲明
declare global {
  namespace Cypress {
    interface Chainable {
      login(username?: string, password?: string): Chainable<void>
      logout(): Chainable<void>
      navigateTo(path: string): Chainable<void>
      waitForApi(alias: string): Chainable<void>
      shouldBeVisible(): Chainable<JQuery<HTMLElement>>
      shouldContainText(text: string): Chainable<JQuery<HTMLElement>>
      fillForm(formData: Record<string, string>): Chainable<void>
      search(query: string): Chainable<void>
      waitForLoad(): Chainable<void>
      checkTableRows(count: number): Chainable<void>
      clickTableAction(rowIndex: number, action: string): Chainable<void>
      confirmDialog(): Chainable<void>
      cancelDialog(): Chainable<void>
      checkMessage(type: 'success' | 'error' | 'warning' | 'info', message?: string): Chainable<void>
      setViewportSize(width: number, height: number): Chainable<void>
    }
  }
}